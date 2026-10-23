import { IsString, IsOptional } from 'class-validator';
import { IContact } from '@repo/types';
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsFirstNameProperty, 
  IsLastNameProperty, 
  IsEmailProperty, 
  IsUUIDProperty 
} from '../../../common/decorators/dto-properties.decorators';

export class ContactResponseDto implements IContact {
  // 🟢 Primary Key ID Override Pass
  @IsUUIDProperty('Unique identifier of the contact record context footprint', 'bc2351a5-eeee-ef11-90c9-000d3a5700a6', { name: 'id' })
  contactId!: string;

  @IsFirstNameProperty({ name: 'firstName' })
  firstName!: string;

  @IsLastNameProperty({ name: 'lastName' })
  lastName!: string;

  @IsEmailProperty({ name: 'emailAddress' })
  emailAddress!: string;

  @ApiProperty({ 
    name: 'phoneMobile',
    example: '+15045550199', 
    description: 'Mobile contact number',
    required: false
  })
  @IsString()
  @IsOptional()
  phoneMobile!: string;

  // 🟢 Foreign Key Company ID Override Pass
  @IsUUIDProperty('Foreign key tracking the parent company master configuration record', 'f0d84a58-e742-ef11-86c3-002248306854', { name: 'companyId' })
  companyId!: string;

  // 🟢 Foreign Key Location ID Override Pass
  @IsUUIDProperty('Foreign key tracking the assigned regional location context block', '7b98f5a3-1842-f011-8f7d-000d3a14ccbd', { name: 'locationId' })
  locationId!: string;
}
