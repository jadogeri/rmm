import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ApiKeyGuard } from './api-key.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({ imports: [DatabaseModule], controllers: [AuthController], providers: [AuthService, ApiKeyGuard], exports: [AuthService, ApiKeyGuard] })
export class AuthModule {}
