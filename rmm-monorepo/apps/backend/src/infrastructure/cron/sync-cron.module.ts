import { Module } from '@nestjs/common';
import { SyncCronService } from './sync-cron.service';
import { LocationsModule } from '../../modules/locations/locations.module';
import { CustomersModule } from '../../modules/customers/customers.module';
import { IssueTypesModule } from '../../modules/issue-types/issue-types.module';
import { CompanyModule } from '../../modules/company/company.module';
import { TicketCustomStatusesModule } from '../../modules/ticket-custom-statuses/ticket-custom-statuses.module';
@Module({
  imports: [LocationsModule, CustomersModule, IssueTypesModule, CompanyModule, TicketCustomStatusesModule], // Allows injection of LocationsService, CustomersService, IssueTypesService, CompanyService, and TicketCustomStatusesService
  providers: [SyncCronService], // Instantiates the cron loop orchestrator
})
export class SyncModule {}
