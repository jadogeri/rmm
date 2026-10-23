import { ContactEntity } from '@repo/database';
import { IMapper } from '../../common/interfaces/mapper.interface';
import { ContactResponseDto } from './dto/contact-response.dto';

export class ContactsMapper implements IMapper<ContactEntity, ContactResponseDto> {
  toDomain(entity: ContactEntity): ContactResponseDto {
    const dto = new ContactResponseDto();
    dto.contactId = entity.contactId;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.emailAddress = entity.emailAddress;
    dto.phoneMobile = entity.phoneMobile || '';
    dto.companyId = entity.companyId;
    dto.locationId = entity.locationId;
    return dto;
  }

  toEntity(domain: ContactResponseDto): ContactEntity {
    const entity = new ContactEntity();
    entity.contactId = domain.contactId;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.emailAddress = domain.emailAddress;
    entity.phoneMobile = domain.phoneMobile;
    return entity;
  }
}
