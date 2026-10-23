// apps/backend/src/modules/ticket-custom-statuses/ticket-custom-statuses.mapper.ts
import { TicketCustomStatusesEntity } from '@repo/database';
import { IMapper } from '../../common/interfaces/mapper.interface';
import { TicketCustomStatusResponseDto } from './dto/ticket-custom-status.dto';

export class TicketCustomStatusesMapper implements IMapper<TicketCustomStatusesEntity, TicketCustomStatusResponseDto> {
  
  /**
   * Transforms a database entity row into a flat domain status DTO block.
   */
  toDomain(entity: TicketCustomStatusesEntity): TicketCustomStatusResponseDto {
    const dto = new TicketCustomStatusResponseDto();
    
    // 🟢 FIXED: Map using the explicit PascalCase contract defined in TicketCustomStatusResponseDto
    dto.TicketCustomStatusId = entity.ticketCustomStatusId;
    dto.Name = entity.name;
    dto.Description = entity.description ?? '';
    dto.IsDefault = entity.isDefault;
    dto.TicketStatusCode = entity.ticketStatusCode;
    dto.CompanyId = entity.companyId ?? '';

    return dto;
  }

  /**
   * Re-maps incoming domain payload values into database entity models.
   */
  toEntity(domain: TicketCustomStatusResponseDto): TicketCustomStatusesEntity {
    const entity = new TicketCustomStatusesEntity() as any; 
    
    // 🟢 FIXED: Extract values using the active PascalCase parameters from the domain input
    entity.ticketCustomStatusId = domain.TicketCustomStatusId;
    entity.name = domain.Name;
    entity.description = domain.Description || null;
    entity.isDefault = domain.IsDefault;
    entity.ticketStatusCode = domain.TicketStatusCode;
    
    // Relationship is safely mapped via primary keys during upsert forks inside the sync engine
    entity.company = domain.CompanyId || null;

    return entity as TicketCustomStatusesEntity;
  }
}
