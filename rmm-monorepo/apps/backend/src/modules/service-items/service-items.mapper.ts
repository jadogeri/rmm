// apps/backend/src/modules/service-items/service-items.mapper.ts
import { ServiceItemsEntity } from '@repo/database';
import { IMapper } from '../../common/interfaces/mapper.interface';
import { ServiceItemResponseDto } from './dto/service-items-response.dto';

export class ServiceItemsMapper implements IMapper<ServiceItemsEntity, ServiceItemResponseDto> {
  
  toDomain(entity: ServiceItemsEntity): ServiceItemResponseDto {
    const dto = new ServiceItemResponseDto();
    dto.serviceItemId = entity.serviceItemId;
    dto.serviceItemName = entity.serviceItemName;
    dto.serviceItemTypeCode = entity.serviceItemTypeCode;
    dto.customerId = entity.customerId;
    return dto;
  }

  toEntity(domain: ServiceItemResponseDto): ServiceItemsEntity {
    const entity = new ServiceItemsEntity() as any;
    entity.serviceItemId = domain.serviceItemId;
    entity.serviceItemName = domain.serviceItemName;
    entity.serviceItemTypeCode = domain.serviceItemTypeCode;
    entity.customer = domain.customerId || null;
    return entity as ServiceItemsEntity;
  }
}
