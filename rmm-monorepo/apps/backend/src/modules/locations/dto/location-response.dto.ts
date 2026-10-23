import { IsString, IsNotEmpty } from 'class-validator';
import { ILocation } from '@repo/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUIDProperty } from '../../../common/decorators/dto-properties.decorators';

export class LocationResponseDto implements ILocation {
  // 🟢 Reused UUID primary key composition with a JSON name override
  @IsUUIDProperty(
    'Unique identifier of the location record context footprint',
    'bc2351a5-eeee-ef11-90c9-000d3a5700a6',
    { name: 'id' }
  )
  locationId!: string;

  @ApiProperty({
    name: 'name',
    example: 'Laptops/WinTablets',
    description: 'The descriptive name of the physical or logical regional branch location'
  })
  @IsString()
  @IsNotEmpty()
  locationName!: string;

  // 🟢 Reused UUID foreign key composition tracking the parent customer
  @IsUUIDProperty(
    'Foreign key tracking the parent customer account mapping configuration profile context block',
    '30daff50-f442-ef11-86c3-002248306854',
    { name: 'customerId' }
  )
  customerId!: string;
}
