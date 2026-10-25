import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContactEntity, LocationsEntity, IssueTypesEntity, ServiceItemsEntity } from '@repo/database';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([ContactEntity, LocationsEntity, IssueTypesEntity, ServiceItemsEntity]),
    HelpdeskClientModule
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
