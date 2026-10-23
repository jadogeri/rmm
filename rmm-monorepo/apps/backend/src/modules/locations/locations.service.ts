import { Injectable, Inject, Logger } from '@nestjs/common';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { LocationsEntity, CustomersEntity } from '@repo/database';  

@Injectable()
export class LocationsService implements IMspSyncer {
  private readonly logger = new Logger(LocationsService.name);

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
  async getLocationsByCustomer(customerId: string): Promise<LocationsEntity[]> {
    return await this.locationRepo.find({ customer: { customerId: customerId } });
  }

  /**
   * Reads locations for a customer strictly out of Docker (Fast dropdowns)
   */
  async getLocations(): Promise<LocationsEntity[]> {
    return await this.locationRepo.findAll();
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
      if (!item.CustomerId || !item.LocationId) continue;

      // 🔍 Relational Guard: Ensure parent Customer exists in Docker before linking FK constraints
      const parentCustomerExists = await fork.findOne(CustomersEntity, { customerId: item.CustomerId });
      
      if (!parentCustomerExists) {
        this.logger.warn(`⚠️ Parent Customer ID [${item.CustomerId}] missing during Location sync pass. Stubbing placeholder record.`);
        
        // 🟢 FIXED: Atomic upsert pushes parent stub record immediately down to PostgreSQL disk
        await fork.upsert(CustomersEntity, {
          customerId: item.CustomerId,
          customerName: `Pending Sync Customer (${item.CustomerId.slice(0, 8)})`,
          programLevelId: '00000000-0000-0000-0000-000000000000',
          customerStatusId: 1,
          company: null, // Fully matches your newly updated schema constraints contract rules
        } as any);
      }

      // 🛢️ Native Upsert: Safely inserts child rows because the parent ID is guaranteed to exist on disk now
      await fork.upsert(LocationsEntity, {
        locationId: item.LocationId,
        locationName: item.LocationName || 'Unnamed Location',
        customer: item.CustomerId, // MikroORM resolves reference links implicitly via object keys
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
