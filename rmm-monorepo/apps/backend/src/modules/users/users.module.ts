import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersEntity } from '@repo/database';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([UsersEntity]), 
    HelpdeskClientModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 🚨 Exported for injection by SyncCronService inside SyncModule
})
export class UsersModule {}
