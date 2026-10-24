import { readODataField, readRequiredODataField } from '../../common/utils/read-odata-field';
// apps/backend/src/modules/service-items/service-items.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ServiceItemsEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { ServiceItemsMapper } from './service-items.mapper';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { ServiceItemResponseDto } from './dto/service-items-response.dto';
@Injectable()
export class ServiceItemsService implements IMspSyncer {
  private readonly logger = new Logger(ServiceItemsService.name);
  private readonly mapper = new ServiceItemsMapper();

  constructor(
    @InjectRepository(ServiceItemsEntity)
    private readonly serviceItemRepository: EntityRepository<ServiceItemsEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  async getServiceItems(): Promise<ServiceItemResponseDto[]> {
    const entities = await this.serviceItemRepository.findAll();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async syncAllServiceItemsFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full Service Items cache synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: any[] }>('ServiceItems');
      
      if (!response || !response.value) {
        this.logger.warn('⚠️ Received empty or malformed Service Items batch from external API.');
        return { imported: 0 };
      }

      const fork = this.serviceItemRepository.getEntityManager().fork();
      const payload = response.value;

      for (const item of payload) {
        await fork.upsert(ServiceItemsEntity, {
          serviceItemId: readRequiredODataField<string>(item, 'serviceItemId'),
          serviceItemName: readODataField<string | null>(item, 'serviceItemName') ?? 'Unnamed Service Item',
          serviceItemTypeCode: readRequiredODataField<number>(item, 'serviceItemTypeCode'),
          customer: readRequiredODataField<string>(item, 'customerId'),
        } as any);
      }

      await fork.flush();
      this.logger.log(`🎉 Sync Complete! Successfully unified [${payload.length}] service items in Docker.`);
      
      return { imported: payload.length };
    } catch (error) {
      this.logger.error('❌ Failed processing flat Service Item structures.', error);
      throw error;
    }
  }

  async syncFromMsp(): Promise<void> {
    await this.syncAllServiceItemsFromMsp();
  }
}
