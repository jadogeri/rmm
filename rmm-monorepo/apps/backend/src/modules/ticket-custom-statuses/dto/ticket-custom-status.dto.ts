// apps/backend/src/modules/helpdesk-lookups/dto/ticket-custom-status-response.dto.ts
import { IsUUID, IsString, IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCustomStatus } from '@repo/types';

export class TicketCustomStatusResponseDto implements TicketCustomStatus {
  @ApiProperty({
    description: 'The unique UUID identifier of the custom status',
    example: '5eab8a5e-e742-ef11-86c3-002248306854',
  })
  @IsUUID()
  @IsNotEmpty()
  TicketCustomStatusId!: string; // 👈 Added ! operator

  @ApiProperty({
    description: 'The display name of the ticket custom status',
    example: 'In Progress',
  })
  @IsString()
  @IsNotEmpty()
  Name!: string; // 👈 Added ! operator

  @ApiProperty({
    description: 'Detailed description explaining the usage of this status',
    example: 'The ticket is open and is being actively worked',
  })
  @IsString()
  @IsOptional()
  Description!: string; // 👈 Added ! operator

  @ApiProperty({
    description: 'Flags whether this status is applied to new tickets by default',
    example: true,
  })
  @IsBoolean()
  IsDefault!: boolean; // 👈 Added ! operator

  @ApiProperty({
    description: 'The internal state code integer associated with the status indicator group',
    example: 5,
  })
  @IsInt()
  TicketStatusCode!: number; // 👈 Added ! operator

  @ApiProperty({
    description: 'The unique UUID identifier of the tenant organization company mapping record',
    example: 'f0d84a58-e742-ef11-86c3-002248306854',
  })
  @IsUUID()
  @IsNotEmpty()
  CompanyId!: string; // 👈 Added ! operator
}
