import { UsersEntity } from '@repo/database';
import { IMapper } from '../../common/interfaces/mapper.interface';
import { UserResponseDto } from './dto/user-response.dto';

export class UsersMapper implements IMapper<UsersEntity, UserResponseDto> {
  toDomain(entity: UsersEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.UserId = entity.UserId;
    dto.EmailAddress = entity.EmailAddress;
    dto.FirstName = entity.FirstName;
    dto.LastName = entity.LastName;
    dto.Status = entity.Status;
    dto.Enabled = entity.Enabled;
    dto.LastLogin = entity.LastLogin;
    dto.PhoneMobile = entity.PhoneMobile;
    dto.CompanyId = entity.CompanyId; // Pulls from entity relation getter cleanly
    return dto;
  }

  toEntity(domain: UserResponseDto): UsersEntity {
    const entity = new UsersEntity();
    entity.UserId = domain.UserId;
    entity.EmailAddress = domain.EmailAddress;
    entity.FirstName = domain.FirstName;
    entity.LastName = domain.LastName;
    entity.Status = domain.Status;
    entity.Enabled = domain.Enabled;
    entity.LastLogin = domain.LastLogin;
    entity.PhoneMobile = domain.PhoneMobile;
    return entity;
  }
}
