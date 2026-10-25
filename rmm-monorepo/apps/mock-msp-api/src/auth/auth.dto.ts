import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'admin@example.test', description: 'Administrator email used to bootstrap the local MSP API.' })
  email!: string;

  @ApiProperty({ description: 'Bootstrap administrator password.', writeOnly: true })
  password!: string;
}

export class LoginUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin@example.test' })
  email!: string;

  @ApiProperty({ enum: ['admin', 'user'] })
  role!: 'admin' | 'user';

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  lastLogin!: string | null;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Copy this value into Swagger Authorize; send it as the X-API-Key header.' })
  apiKey!: string;

  @ApiProperty({ example: 'X-API-Key' })
  headerName!: string;

  @ApiProperty({ format: 'date-time' })
  expiresAt!: string;

  @ApiProperty({ type: LoginUserResponseDto })
  user!: LoginUserResponseDto;
}
