import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { IUser } from '@repo/types';
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmailProperty, 
  IsUUIDProperty, 
  IsFirstNameProperty, 
  IsLastNameProperty 
} from '../../../common/decorators/dto-properties.decorators';

export class UserResponseDto implements IUser {
  // 🟢 Reused UUID primary key stack with an OpenAPI name override
  @IsUUIDProperty(
    'Unique identifier of the user application profile record context footprint',
    '30daff50-f442-ef11-86c3-002248306854',
    { name: 'id' }
  )
  UserId!: string;

  // 🟢 Reused Email property composition stack
  @IsEmailProperty({ name: 'emailAddress' })
  EmailAddress!: string;

  // 🟢 Reused First Name property composition stack
  @IsFirstNameProperty({ name: 'firstName' })
  FirstName!: string;

  // 🟢 Reused Last Name property composition stack
  @IsLastNameProperty({ name: 'lastName' })
  LastName!: string;

  @ApiProperty({
    name: 'status',
    example: 'Active',
    description: 'Current status state of the user account profile'
  })
  @IsString()
  @IsNotEmpty()
  Status!: string;

  @ApiProperty({
    name: 'enabled',
    example: true,
    description: 'Flag tracking whether the user account is active and enabled'
  })
  @IsBoolean()
  @IsNotEmpty()
  Enabled!: boolean;

  @ApiProperty({
    name: 'lastLogin',
    example: '2026-10-23T10:00:00Z',
    nullable: true,
    description: 'ISO timestamp of the last active login session footprint context',
    required: false
  })
  @IsString()
  @IsOptional()
  LastLogin!: string | null;

  @ApiProperty({
    name: 'phoneMobile',
    example: '+15045550199',
    nullable: true,
    description: 'Mobile operator contact cell number',
    required: false
  })
  @IsString()
  @IsOptional()
  PhoneMobile!: string | null;

  // 🟢 Reused UUID foreign key stack pointing to your company master configuration context block
  @IsUUIDProperty(
    'Foreign key pointer tracking parent enterprise organization blueprint configuration context reference link',
    'f0d84a58-e742-ef11-86c3-002248306854',
    { name: 'companyId' }
  )
  CompanyId!: string;
}
