import { readODataField } from '../../common/utils/read-odata-field';
// apps/backend/src/modules/ticket-custom-statuses/ticket-custom-statuses.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { TicketCustomStatus } from '@repo/types';
import { TicketCustomStatusesEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { TicketCustomStatusesMapper } from './ticket-custom-statuses.mapper';
import { TicketCustomStatusResponseDto } from './dto/ticket-custom-status.dto';

@Injectable()
export class TicketCustomStatusesService implements IMspSyncer {
  private readonly logger = new Logger(TicketCustomStatusesService.name);
  private readonly mapper = new TicketCustomStatusesMapper();

  constructor(
    @InjectRepository(TicketCustomStatusesEntity)
    private readonly statusRepository: EntityRepository<TicketCustomStatusesEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  /**
   * Reads flat list cache strictly out of Docker (Fast cascading dropdowns)
   */
  async getCustomStatuses(): Promise<TicketCustomStatusResponseDto[]> {
    const entities = await this.statusRepository.findAll();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  /**
   * The "God Sync" engine - Fetches live MSP OData records, guards FKs, and updates Docker
   */
  async syncAllCustomStatusesFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full Location cache synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: any[] }>('TicketCustomStatuses');
      
      if (!response || !response.value) {
        this.logger.warn('⚠️ Received empty or malformed location batch from external API.');
        return { imported: 0 };
      }

      const fork = this.statusRepository.getEntityManager().fork();
      const payload = response.value;

      // Map raw OData properties cleanly over to strict camelCase interface schema contract keys
      const externalStatuses: TicketCustomStatus[] = payload.map((item) => ({
        TicketCustomStatusId: readODataField(item, 'ticketCustomStatusId'),
        Name: readODataField(item, 'name'),
        Description: readODataField(item, 'description') || null,
        IsDefault: readODataField(item, 'isDefault') ?? false,
        TicketStatusCode: readODataField(item, 'ticketStatusCode'),
        CompanyId: readODataField(item, 'companyId') || null,
      }));

      // 🛠️ PHASE 1: Parse and commit flat custom statuses securely using the entity manager fork context block
      for (const status of externalStatuses) {
        await fork.upsert(TicketCustomStatusesEntity, {
          ticketCustomStatusId: status.TicketCustomStatusId,
          name: status.Name || 'Unnamed Status',
          description: status.Description,
          isDefault: status.IsDefault,
          ticketStatusCode: status.TicketStatusCode,
          // 🟢 FIXED: Map to 'company' object key instead of property 'companyId'
          company: status.CompanyId || null,
        } as any);
      }
      
      await fork.flush();
      this.logger.log(`🎉 God Sync Complete! Successfully unified [${externalStatuses.length}] custom statuses in Docker.`);
      
      return { imported: externalStatuses.length };
    } catch (error) {
      this.logger.error('❌ Failed processing flat Ticket Custom Status structures.', error);
      throw error;
    }
  }

  /**
   * Implements the IMspSyncer interface method execution contract hook.
   */
  async syncFromMsp(): Promise<void> {
    await this.syncAllCustomStatusesFromMsp();
  }
}
