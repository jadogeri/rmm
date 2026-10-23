import { IsUUID, IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ICustomer } from '@repo/types';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto implements ICustomer {
  @ApiProperty({ name: 'id', example: '8f3b2c1a-4d5e-6f7a-8b9c-0d1e2f3a4b5c', description: 'Unique identifier of the customer' })
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ name: 'name', example: 'Orleans Parish Assessors Office', description: 'Name of the customer enterprise' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ name: 'referenceCode', example: 'REF-10042', nullable: true, description: 'Optional upstream reference layout identifier' })
  @IsString()
  @IsOptional()
  referenceId!: string | null;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Assigned service level program identifier string' })
  @IsUUID()
  @IsNotEmpty()
  programLevelId!: string;

  @ApiProperty({ name: 'status', example: 1, description: 'Numeric state tracking account health parameters' })
  @IsInt()
  @IsNotEmpty()
  customerStatusId!: number;

  @ApiProperty({ name: 'companyId', example: 'f0d84a58-e742-ef11-86c3-002248306854', nullable: true, description: 'Parent MSP organization configuration context identifier reference link' })
  @IsUUID()
  @IsOptional()
  companyId?: string | null;
}
