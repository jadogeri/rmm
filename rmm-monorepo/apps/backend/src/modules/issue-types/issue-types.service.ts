import { readODataField } from '../../common/utils/read-odata-field';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { IIssueType } from '@repo/types';
import { IssueTypesEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IssueTypesMapper } from './issue-types.mapper';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { IssueTypeResponseDto } from './dto/issue-types-response.dto';

@Injectable()
export class IssueTypesService implements IMspSyncer {
  private readonly logger = new Logger(IssueTypesService.name);
  private readonly mapper = new IssueTypesMapper();

  constructor(
    @InjectRepository(IssueTypesEntity)
    private readonly issueTypeRepository: EntityRepository<IssueTypesEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  /**
   * Reads tree hierarchy cache strictly out of Docker (Fast cascading dropdowns)
   */
  async getIssueTypes(): Promise<IssueTypeResponseDto[]> {
    const rootEntities = await this.issueTypeRepository.find(
      { parent: null },
      { populate: ['children'] }
    );

    return rootEntities.map((entity) => this.mapper.toDomain(entity));
  }

  /**
   * The "God Sync" engine - Fetches live MSP OData hierarchies, guards FKs, and updates Docker
   */
  async syncAllIssueTypesFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full Location cache synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: any[] }>('IssueTypes');
      
      if (!response || !response.value) {
        this.logger.warn('⚠️ Received empty or malformed location batch from external API.');
        return { imported: 0 };
      }

      const fork = this.issueTypeRepository.getEntityManager().fork();
      const payload = response.value;

      // Map raw OData properties cleanly over to strict camelCase interface schema contract keys
      const externalIssues: IIssueType[] = payload.map((item) => ({
        issueTypeId: readODataField(item, 'issueTypeId'),
        name: readODataField(item, 'name'),
        description: readODataField(item, 'description') || null,
        rmReferenceId: readODataField(item, 'rmReferenceId') || null,
        companyId: readODataField(item, 'companyId') || null,
        parentIssueTypeId: readODataField(item, 'parentIssueTypeId') || null,
      }));

      // 🛠️ PHASE 1: Parse and commit top-level parent headers first (No Parent constraint blocks)
      const parents = externalIssues.filter((item) => !item.parentIssueTypeId);
      for (const parent of parents) {
        await fork.upsert(IssueTypesEntity, {
          issueTypeId: parent.issueTypeId,
          name: parent.name || 'Unnamed Category',
          description: parent.description,
          rmReferenceId: parent.rmReferenceId,
          // 🟢 FIXED: Map to 'company' object key instead of property 'companyId'
          company: parent.companyId || null,
          parent: null,
        } as any);
      }
      
      // Flush database steps down immediately so children can validate parent foreign identifiers
      await fork.flush();

      // 🛠️ PHASE 2: Ingest sub-category children
      const children = externalIssues.filter((item) => item.parentIssueTypeId);
      for (const child of children) {
        let parentRecord = await fork.findOne(IssueTypesEntity, { issueTypeId: child.parentIssueTypeId! });

        if (!parentRecord) {
          parentRecord = fork.create(IssueTypesEntity, {
            issueTypeId: child.parentIssueTypeId!,
            name: `Stubbed Parent Category (${child.parentIssueTypeId!.slice(0, 8)})`,
            parent: null,
          });
          fork.persist(parentRecord);
        }

        await fork.upsert(IssueTypesEntity, {
          issueTypeId: child.issueTypeId,
          name: child.name || 'Unnamed Issue Subtype',
          description: child.description,
          rmReferenceId: child.rmReferenceId,
          // 🟢 FIXED: Map to 'company' object key instead of property 'companyId'
          company: child.companyId || null,
          parent: child.parentIssueTypeId ? parentRecord : null,
        } as any);
      }

      await fork.flush();
      this.logger.log(`🎉 God Sync Complete! Successfully unified [${externalIssues.length}] issue types in Docker.`);
      
      return { imported: externalIssues.length };
    } catch (error) {
      this.logger.error('❌ Failed processing recursive Issue Type tree structures.', error);
      throw error;
    }
  }

  /**
   * Implements the IMspSyncer interface method execution contract hook.
   */
  async syncFromMsp(): Promise<void> {
    await this.syncAllIssueTypesFromMsp();
  }
}
