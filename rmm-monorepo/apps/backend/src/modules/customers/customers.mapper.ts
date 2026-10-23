import { CompanyEntity, CustomersEntity } from "@repo/database";
import { IMapper } from "../../common/interfaces/mapper.interface";
import { CustomerResponseDto } from "./dto/customer-response.dto";

export class CustomersMapper implements IMapper<CustomersEntity, CustomerResponseDto> {
  
  /**
   * Transforms your strict database entity structure smoothly into a 
   * class-transformer response wrapper layer for the client UI layer.
   */
  toDomain(entity: CustomersEntity): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = entity.customerId;
    dto.name = entity.customerName;
    dto.referenceCode = entity.referenceId;
    dto.programLevelId = entity.programLevelId;
    dto.status = entity.customerStatusId;
    dto.companyId = entity.companyId ?? null; 
    return dto;
  }

  /**
   * Re-maps incoming domain payload values into atomic MikroORM database entity models.
   * Satisfies the IMapper contract using standard type literal references.
   */
  toEntity(domain: CustomerResponseDto): CustomersEntity {
    const entity = new CustomersEntity();
    entity.customerId = domain.id;
    entity.customerName = domain.name;
    entity.referenceId = domain.referenceCode;
    entity.programLevelId = domain.programLevelId;
    entity.customerStatusId = domain.status;
    
    // 🟢 FIXED: Satisfies TypeScript by casting a standard identifier object reference placeholder
    entity.company = domain.companyId 
      ? ({ companyId: domain.companyId } as CompanyEntity)
      : null;

    return entity;
  }
}
