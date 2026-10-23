import { IsString, IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCustomStatus } from '@repo/types';
import { IsUUIDProperty } from '../../../common/decorators/dto-properties.decorators';

export class TicketCustomStatusResponseDto implements TicketCustomStatus {
  // 🟢 Reused UUID primary key stack with a documentation name override
  @IsUUIDProperty(
    'The unique UUID identifier of the custom status',
    '5eab8a5e-e742-ef11-86c3-002248306854',
    { name: 'id' }
  )
  TicketCustomStatusId!: string;

  @ApiProperty({
    name: 'name',
    description: 'The display name of the ticket custom status',
    example: 'In Progress',
  })
  @IsString()
  @IsNotEmpty()
  Name!: string;

  @ApiProperty({
    name: 'description',
    description: 'Detailed description explaining the usage of this status',
    example: 'The ticket is open and is being actively worked',
    required: false,
  })
  @IsString()
  @IsOptional()
  Description!: string;

  @ApiProperty({
    name: 'isDefault',
    description: 'Flags whether this status is applied to new tickets by default',
    example: true,
  })
  @IsBoolean()
  IsDefault!: boolean;

  @ApiProperty({
    name: 'statusCode',
    description: 'The internal state code integer associated with the status indicator group',
    example: 5,
  })
  @IsInt()
  TicketStatusCode!: number;

  // 🟢 Reused UUID foreign key stack pointing to your company master configuration context block
  @IsUUIDProperty(
    'The unique UUID identifier of the tenant organization company mapping record',
    'f0d84a58-e742-ef11-86c3-002248306854',
    { name: 'companyId' }
  )
  CompanyId!: string;
}
