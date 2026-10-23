// apps/backend/src/modules/tickets/dto/create-ticket.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTicketPayload } from '@repo/types';

export class CreateTicketDto implements CreateTicketPayload {
  @ApiProperty({
    description: 'The display title of the support request',
    example: 'System login failure',
  })
  title!: string;

  @ApiProperty({
    description: 'The ISO standard target deadline string',
    example: '2026-12-31T23:59:59.000Z',
  })
  dueDate!: string;

  @ApiProperty({ description: 'Associated system service item UUID' })
  serviceItemId!: string;

  @ApiProperty({ description: 'Unique contact registration key' })
  contactId!: string;

  @ApiProperty({ description: 'Target business location profile identifier' })
  locationId!: string;

  @ApiProperty({ description: 'Helpdesk categorization taxonomy key' })
  issueTypeId!: string;

  @ApiProperty({ description: 'Associated organization project identifier' })
  projectId!: string;

  @ApiPropertyOptional({ description: 'Detailed technical logging context' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Numerical processing triage weight',
    example: 1,
  })
  ticketPriorityCode?: number;
}
