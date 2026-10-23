import { CompanyEntity, CustomersEntity } from "@repo/database";
import { IMapper } from "../../common/interfaces/mapper.interface";
import { CustomerResponseDto } from "./dto/customer-response.dto";

export class CustomersMapper implements IMapper<CustomersEntity, CustomerResponseDto> {
  
  /**
   * Transforms your strict database entity structure smoothly into a 
   * response wrapper layer for the client UI layer matching the implemented interface.
   */
  toDomain(entity: CustomersEntity): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.customerId = entity.customerId;
    dto.customerName = entity.customerName;
    dto.referenceId = entity.referenceId;
    dto.programLevelId = entity.programLevelId;
    dto.customerStatusId = entity.customerStatusId;
    dto.companyId = entity.companyId ?? null; 
    return dto;
  }

  /**
   * Re-maps incoming domain payload values into atomic MikroORM database entity models.
   * Satisfies the IMapper contract using standard type literal references.
   */
  toEntity(domain: CustomerResponseDto): CustomersEntity {
    const entity = new CustomersEntity();
    entity.customerId = domain.customerId;
    entity.customerName = domain.customerName;
    entity.referenceId = domain.referenceId;
    entity.programLevelId = domain.programLevelId;
    entity.customerStatusId = domain.customerStatusId;
    
    // Satisfies TypeScript by casting a standard identifier object reference placeholder
    entity.company = domain.companyId 
      ? ({ companyId: domain.companyId } as CompanyEntity)
      : null;

    return entity;
  }
}
