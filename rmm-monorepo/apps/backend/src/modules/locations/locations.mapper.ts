import { CompanyEntity, CustomersEntity, LocationsEntity } from '@repo/database';
import { IMapper } from '../../common/interfaces/mapper.interface';
import { LocationResponseDto } from './dto/location-response.dto';

export class LocationsMapper implements IMapper<LocationsEntity, LocationResponseDto> {
  
  /**
   * Transforms your strict database entity structure smoothly into a 
   * response wrapper layer for the client UI layer matching the implemented contract interface.
   */
  toDomain(entity: LocationsEntity): LocationResponseDto {
    const dto = new LocationResponseDto();
    dto.locationId = entity.locationId;
    dto.locationName = entity.locationName;
    
    // Safely reads the unique customerId from the attached customer entity link relation
    dto.customerId = entity.customer?.customerId ?? '';
    return dto;
  }

  /**
   * Re-maps incoming domain payload values into atomic MikroORM database entity models.
   * Satisfies the IMapper contract using standard type literal references.
   */
  toEntity(domain: LocationResponseDto): LocationsEntity {
    const entity = new LocationsEntity();
    entity.locationId = domain.locationId;
    entity.locationName = domain.locationName;
    
    // Satisfies TypeScript by casting a standard identifier object reference placeholder
    entity.customer = domain.customerId 
      ? ({ customerId: domain.customerId } as CustomersEntity)
      : (null as any);

    return entity;
  }
}
