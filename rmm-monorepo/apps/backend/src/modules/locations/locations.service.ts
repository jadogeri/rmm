import { readODataField } from '../../common/utils/read-odata-field';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { LocationsEntity, CustomersEntity } from '@repo/database';  
import { LocationResponseDto } from './dto/location-response.dto';
import { LocationsMapper } from './locations.mapper';

@Injectable()
export class LocationsService implements IMspSyncer {
  private readonly logger = new Logger(LocationsService.name);
  private readonly mapper = new LocationsMapper(); // 🟢 Instantiated mapper context cleanly

  constructor(
    @InjectRepository(LocationsEntity)
    private readonly locationRepo: EntityRepository<LocationsEntity>,
    
    @InjectRepository(CustomersEntity)
    private readonly customerRepo: EntityRepository<CustomersEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  /**
   * Reads locations for a customer strictly out of Docker (Fast dropdowns)
   */
  async getLocationsByCustomer(customerId: string): Promise<LocationResponseDto[]> {
    const entities = await this.locationRepo.find({ customer: { customerId: customerId } });
    // 🟢 FIXED: Maps each database row systematically through the domain DTO contract rules
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  /**
   * Reads locations strictly out of Docker (Fast dropdowns)
   */
  async getLocations(): Promise<LocationResponseDto[]> {
    const entities = await this.locationRepo.findAll();
    // 🟢 FIXED: Maps each database row systematically through the domain DTO contract rules
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  /**
   * The "God Sync" engine - Fetches live MSP data, parses relationships, and updates Docker
   */
  async syncAllLocationsFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full Location cache synchronization from MSP Manager...');
    
    // 📡 Pull raw data payload from your external HTTP gateway module
    const response = await this.helpdeskClient.get<{ value: any[] }>('Locations');
    
    if (!response || !response.value) {
      this.logger.warn('⚠️ Received empty or malformed location batch from external API.');
      return { imported: 0 };
    }

    // 🍴 Establish an isolated fork transaction to protect parallel query lifecycles
    const fork = this.locationRepo.getEntityManager().fork();
    let importCount = 0;

    for (const item of response.value) {
      if (!readODataField(item, 'customerId') || !readODataField(item, 'locationId')) continue;

      // 🔍 Relational Guard: Ensure parent Customer exists in Docker before linking FK constraints
      const parentCustomerExists = await fork.findOne(CustomersEntity, { customerId: readODataField(item, 'customerId') });
      
      if (!parentCustomerExists) {
        this.logger.warn(`⚠️ Parent Customer ID [${readODataField(item, 'customerId')}] missing during Location sync pass. Stubbing placeholder record.`);
        
        // Atomic upsert pushes parent stub record immediately down to PostgreSQL disk
        await fork.upsert(CustomersEntity, {
          customerId: readODataField(item, 'customerId'),
          customerName: `Pending Sync Customer (${readODataField(item, 'customerId').slice(0, 8)})`,
          programLevelId: '00000000-0000-0000-0000-000000000000',
          customerStatusId: 1,
          company: null, // Fully matches your newly updated schema constraints contract rules
        } as any);
      }

      // 🛢️ Native Upsert: Safely inserts child rows because the parent ID is guaranteed to exist on disk now
      await fork.upsert(LocationsEntity, {
        locationId: readODataField(item, 'locationId'),
        locationName: readODataField(item, 'locationName') || 'Unnamed Location',
        customer: readODataField(item, 'customerId'), // MikroORM resolves reference links implicitly via object keys
      } as any);

      importCount++;
    }

    // Flush batch transactions down to your local PostgreSQL container permanently
    await fork.flush();
    this.logger.log(`🎉 God Sync Complete! Successfully unified [${importCount}] locations in Docker.`);
    
    return { imported: importCount };
  }

  /**
   * Implements the IMspSyncer interface method to trigger full MSP sync for locations.
   */
  async syncFromMsp(): Promise<void> {
    await this.syncAllLocationsFromMsp();
  }
}
