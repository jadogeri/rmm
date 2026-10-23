import { Module } from '@nestjs/common';
import { SyncCronService } from './sync-cron.service';
import { LocationsModule } from '../../modules/locations/locations.module';
import { CustomersModule } from '../../modules/customers/customers.module';
import { IssueTypesModule } from '../../modules/issue-types/issue-types.module';
import { CompanyModule } from '../../modules/company/company.module';
import { TicketCustomStatusesModule } from '../../modules/ticket-custom-statuses/ticket-custom-statuses.module';
import { ServiceItemsModule } from '../../modules/service-items/service-items.module';
import { ContactsModule } from '../../modules/contacts/contacts.module';
import { UsersModule } from '../../modules/users/users.module';
@Module({
  imports: [
    LocationsModule, 
    CustomersModule, 
    IssueTypesModule, 
    CompanyModule, 
    TicketCustomStatusesModule, 
    ServiceItemsModule,
    ContactsModule,
    UsersModule,
  ],
  providers: [SyncCronService], 
})
export class SyncCronModule {}
