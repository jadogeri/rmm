import { readODataField } from '../../common/utils/read-odata-field';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ICustomer } from '@repo/types';
import { CustomersEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CustomersMapper } from './customers.mapper'; 

@Injectable()
export class CustomersService implements IMspSyncer {
  private readonly logger = new Logger(CustomersService.name);
  private readonly mapper = new CustomersMapper(); 

  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customerRepository: EntityRepository<CustomersEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  /**
   * Universal execution pass pulling external records and updating local storage safely.
   */
  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Triggering full Customer cache synchronization from MSP Manager...');
    
    try {
      const externalCustomers: ICustomer[] = await this.fetchFromMspODataApi();
      this.logger.log(`📥 Received ${externalCustomers.length} customer records from MSP Manager API.`);

      if (externalCustomers.length === 0) {
        this.logger.warn('⚠️ No customer records retrieved. Skipping database transaction.');
        return;
      }

      const fork = this.customerRepository.getEntityManager().fork();

      const sanitizedRecords = externalCustomers.map((cust) => ({
        customerId: cust.customerId,
        customerName: cust.customerName || 'Unnamed Customer',
        referenceId: cust.referenceId || null,
        programLevelId: cust.programLevelId,
        customerStatusId: cust.customerStatusId ?? 1,
        // 🟢 FIXED: Map to 'company' object key instead of property 'companyId'
        company: cust.companyId || null, 
      }));

      // 3. This array will now upsert safely into your PostgreSQL container permanently
      await fork.upsertMany(CustomersEntity, sanitizedRecords as any);
      await fork.flush();

      this.logger.log('✅ Customer database persistence layer synchronized successfully.');
    } catch (error) {
      this.logger.error('❌ Critical failure occurred within Customer synchronization execution loop.', error);
      throw error;
    }
  }

  private async fetchFromMspODataApi(): Promise<ICustomer[]> {
    const response = await this.helpdeskClient.get<{ value: any[] }>('Customers');

    if (!response || !response.value) {
      this.logger.warn('⚠️ Helpdesk OData engine returned an empty or completely malformed customer array payload.');
      return [];
    }

    return response.value.map((item) => ({
      customerId: readODataField(item, 'customerId'),
      customerName: readODataField(item, 'customerName'),
      referenceId: readODataField(item, 'referenceId'),
      programLevelId: readODataField(item, 'programLevelId'),
      customerStatusId: Number(readODataField(item, 'customerStatusId')),
      companyId: readODataField(item, 'companyId'),
    }));
  }

  /**
   * Safely returns a cleanly transformed domain model array to your controller endpoints
   */
  async findAll(): Promise<CustomerResponseDto[]> {
    const entities = await this.customerRepository.findAll();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }
}
