import { Reference } from '@mikro-orm/core';
import { CompanyEntity, IssueTypesEntity } from '@repo/database';
import { IMapper } from '../../common/interfaces/mapper.interface';
import { IssueTypeResponseDto } from './dto/issue-types-response.dto';

export class IssueTypesMapper implements IMapper<IssueTypesEntity, IssueTypeResponseDto> {
  
  /**
   * Transforms a database entity row into a hierarchical domain DTO tree block.
   * Recursively parses child collections if loaded in the active memory context.
   */
  toDomain(entity: IssueTypesEntity): IssueTypeResponseDto {
    const dto = new IssueTypeResponseDto();
    dto.issueTypeId = entity.issueTypeId;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.rmReferenceId = entity.rmReferenceId;
    dto.companyId = entity.companyId; // Reads smoothly from the entity getter contract layout
    dto.parentIssueTypeId = entity.parent?.issueTypeId ?? null;

    // Recursively parse downstream branch elements if active in memory
    if (entity.children && entity.children.isInitialized()) {
      dto.children = entity.children.getItems().map((child) => this.toDomain(child));
    } else {
      dto.children = [];
    }

    return dto;
  }

  /**
   * Re-maps incoming domain payload values into database entity models.
   */
  toEntity(domain: IssueTypeResponseDto): IssueTypesEntity {
    const entity = new IssueTypesEntity() as any; 
    entity.issueTypeId = domain.issueTypeId;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.rmReferenceId = domain.rmReferenceId;
    
    // 🟢 FIXED: Reference.create accepts the direct entity reference model mapping signature contract
    entity.company = domain.companyId 
      ? Reference.create(entity.customerRepository?.getEntityManager().getReference(CompanyEntity, domain.companyId))
      : null;

    return entity as IssueTypesEntity;
  }
}
