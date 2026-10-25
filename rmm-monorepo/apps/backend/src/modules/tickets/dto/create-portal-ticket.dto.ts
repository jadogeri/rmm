import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePortalTicketDto {
  @ApiProperty({ example: 'requester@example.test', description: 'Email address of a contact already synced from the service desk.' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ maxLength: 160, example: 'Cannot connect to VPN' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ApiProperty({ maxLength: 4000, example: 'The VPN client reports a connection timeout.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  description!: string;

  @ApiProperty({ format: 'uuid', description: 'Selected leaf issue type; select a child when the parent has sub-issues.' })
  @IsUUID()
  issueTypeId!: string;
}
