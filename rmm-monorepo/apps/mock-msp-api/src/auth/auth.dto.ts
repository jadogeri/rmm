import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ type: String, example: 'admin@example.test', description: 'Administrator email used to bootstrap the local MSP API.' })
  email!: string;

  @ApiProperty({ type: String, description: 'Bootstrap administrator password.', writeOnly: true })
  password!: string;
}

export class LoginUserResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, example: 'admin@example.test' })
  email!: string;

  @ApiProperty({ type: String, enum: ['admin', 'user'] })
  role!: 'admin' | 'user';

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastLogin!: string | null;
}

export class LoginResponseDto {
  @ApiProperty({ type: String, description: 'Copy this value into Swagger Authorize; send it as the X-API-Key header.' })
  apiKey!: string;

  @ApiProperty({ type: String, example: 'X-API-Key' })
  headerName!: string;

  @ApiProperty({ format: 'date-time' })
  expiresAt!: string;

  @ApiProperty({ type: LoginUserResponseDto })
  user!: LoginUserResponseDto;
}
