import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TicketCustomStatusesEntity } from '@repo/database';
import { TicketCustomStatusesService } from './ticket-custom-statuses.service';

import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';
import { TicketCustomStatusesController } from './ticket-custom-statuses.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([TicketCustomStatusesEntity, ]),
    HelpdeskClientModule, // Grants access to HelpdeskClientService HTTP client engine
  ],
  controllers: [TicketCustomStatusesController],
  providers: [TicketCustomStatusesService],
  exports: [TicketCustomStatusesService], // 🚨 Mandatory: Exports provider so your sync cron module can access it
})
export class TicketCustomStatusesModule {}
