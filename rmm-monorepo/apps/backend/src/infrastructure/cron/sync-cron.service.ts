// apps/backend/src/modules/sync/sync-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { CustomersService } from '../../modules/customers/customers.service';
import { ContactsService } from '../../modules/contacts/contacts.service';
import { UsersService } from '../../modules/users/users.service';
import { LocationsService } from '../../modules/locations/locations.service';
import { ServiceItemsService } from '../../modules/service-items/service-items.service';
import { IssueTypesService } from '../../modules/issue-types/issue-types.service';
import { CompanyService } from '../../modules/company/company.service';
import { TicketCustomStatusesService } from '../../modules/ticket-custom-statuses/ticket-custom-statuses.service';

@Injectable()
export class SyncCronService {
  private readonly logger = new Logger(SyncCronService.name);

  constructor(
    private readonly companyService: CompanyService,
    private readonly customersService: CustomersService,
    private readonly locationsService: LocationsService,
    private readonly issueTypesService: IssueTypesService,
    private readonly ticketCustomStatusesService: TicketCustomStatusesService,  
    private readonly serviceItemsService: ServiceItemsService,
    private readonly contactsService: ContactsService,
    private readonly usersService: UsersService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runNightlySync() {
    this.logger.log('🚀 Starting global type-safe synchronization pipeline pass...');
    console.log('Starting nightly sync...');

    // 🧱 Strongly typed dependency array! Order matters for Foreign Key constraints
    const sequentialSyncers: IMspSyncer[] = [
      this.companyService,
      this.customersService,
      this.locationsService,
      this.issueTypesService,
      this.ticketCustomStatusesService,
      this.serviceItemsService,
      this.contactsService,
      this.usersService
    ];

    for (const syncer of sequentialSyncers) {
      try {
        // Guaranteed to exist and return a Promise<void> by the IMspSyncer interface contract
        await syncer.syncFromMsp();
      } catch (error) {
        this.logger.error(`❌ Sync pass step failed for provider: ${syncer.constructor.name}`, error);
        // Continue or throw depending on how strictly you want errors to halt the remaining sync stack
      }
    }

    this.logger.log('✅ Global sync loop complete.');
  }
}
