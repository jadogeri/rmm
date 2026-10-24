import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({ imports: [AuthModule, DatabaseModule], controllers: [ResourcesController], providers: [ResourcesService] })
export class ResourcesModule {}
