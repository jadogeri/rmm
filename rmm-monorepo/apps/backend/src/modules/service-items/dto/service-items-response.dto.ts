import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { IServiceItem } from '@repo/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUIDProperty } from '../../../common/decorators/dto-properties.decorators';

export class ServiceItemResponseDto implements IServiceItem {
  // 🟢 Primary Key ID Property composition
  @IsUUIDProperty(
    'Unique identifier of the service item configuration record context footprint', 
    '8f3b2c1a-4d5e-6f7a-8b9c-0d1e2f3a4b5c', 
    { name: 'id' }
  )
  serviceItemId!: string;

  @ApiProperty({ 
    name: 'name',
    example: 'Managed Services SLA', 
    description: 'The descriptive contract name of the service agreement item' 
  })
  @IsString()
  @IsNotEmpty()
  serviceItemName!: string;

  @ApiProperty({ 
    name: 'typeCode',
    example: 2, 
    description: 'Upstream type code routing classification parameter for the billing rules identifier engine' 
  })
  @IsInt()
  @IsNotEmpty()
  serviceItemTypeCode!: number;

  // 🟢 Foreign Key Customer ID Property composition
  @IsUUIDProperty(
    'Foreign key tracking the parent customer account mapping configuration profile context block', 
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
    { name: 'customerId' }
  )
  customerId!: string;
}
