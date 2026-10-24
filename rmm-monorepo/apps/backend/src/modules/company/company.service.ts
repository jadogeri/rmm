import { readODataField, readRequiredODataField } from '../../common/utils/read-odata-field';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ICompany} from '@repo/types';
import { CompanyEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';

@Injectable()
export class CompanyService implements IMspSyncer {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: EntityRepository<CompanyEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  /**
   * Reads from your live OData endpoint and upserts your company settings mapping.
   */
  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Syncing primary MSP Company configuration footprint...');

    try {
      // 📡 Request hits the raw Singleton endpoint directly
      const response = await this.helpdeskClient.get<any>('Company');

      if (!response) {
        this.logger.warn('⚠️ Received invalid or empty Singleton payload from Company API.');
        return;
      }

      const companyConfig: ICompany = {
        companyId: readRequiredODataField<string>(response, 'companyId'),
        companyName: readODataField<string | null>(response, 'companyName') ?? 'Orleans Assessors Office',
        lastTicketNumber: readODataField<number>(response, 'lastTicketNumber') ?? 0,
        businessType: readODataField<number>(response, 'businessType') ?? 0,
      };

      const fork = this.companyRepository.getEntityManager().fork();
      
      // Perform atomic upsert matching on the core primary configuration row key
      await fork.upsert(CompanyEntity, companyConfig);
      await fork.flush();

      this.logger.log(`✅ Company Config Synchronized successfully: ${companyConfig.companyName}`);
    } catch (error) {
      this.logger.error('❌ Critical failure within Company config cache loop.', error);
      throw error;
    }
  }

  async getCompanyConfig(): Promise<CompanyEntity | null> {
    return this.companyRepository.findOne({});
  }
}
