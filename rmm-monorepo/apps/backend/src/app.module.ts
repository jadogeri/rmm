import { Module } from '@nestjs/common';
import { IssueTypesModule } from './modules/issue-types/issue-types.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // 👈 1. Added Schedule Import
import { databaseConfig } from '@repo/database';
import { AppController } from './app.controller';
import { TicketsModule } from './modules/tickets/tickets.module';
import { HelpdeskClientModule } from './modules/helpdesk-client/helpdesk-client.module';
import { LocationsModule } from './modules/locations/locations.module';
import { SyncModule } from './infrastructure/cron/sync-cron.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TicketCustomStatusesModule } from './modules/ticket-custom-statuses/ticket-custom-statuses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // 👈 3. Initialized Scheduling Engine globally
    MikroOrmModule.forRoot(databaseConfig),
    HelpdeskClientModule,
    CustomersModule,
    TicketsModule,
    LocationsModule,
    IssueTypesModule,
    TicketCustomStatusesModule,
    SyncModule, // 👈 4. Added to process your SyncCronService providers
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
