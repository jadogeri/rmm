import { readODataField, readRequiredODataField } from '../../common/utils/read-odata-field';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { IContact } from '@repo/types';
import { ContactEntity, LocationsEntity, CompanyEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { ContactResponseDto } from './dto/contact-response.dto';
import { ContactsMapper } from './contacts.mapper';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';

@Injectable()
export class ContactsService implements IMspSyncer {
  private readonly logger = new Logger(ContactsService.name);
  private readonly mapper = new ContactsMapper();

  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: EntityRepository<ContactEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
  ) {}

  async getContacts(): Promise<ContactResponseDto[]> {
    const entities = await this.contactRepository.findAll();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  /**
   * Continuous integration synchronizer module method pass logic
   */
  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Triggering full Contact cache synchronization from MSP Manager...');
    
    try {
      const response = await this.helpdeskClient.get<{ value: any[] }>('Contacts');
      if (!response || !response.value) {
        this.logger.warn('⚠️ Received empty or malformed contact data from external endpoint.');
        return;
      }

      const fork = this.contactRepository.getEntityManager().fork();

      // Transcribe OData capital casing down to internal primitive field contracts
      const externalContacts: IContact[] = response.value.map((item) => ({
        contactId: readRequiredODataField<string>(item, 'contactId'),
        firstName: readODataField<string>(item, 'firstName') ?? '',
        lastName: readODataField<string>(item, 'lastName') ?? '',
        emailAddress: readODataField<string>(item, 'emailAddress') ?? '',
        phoneMobile: readODataField<string>(item, 'phoneMobile') ?? '',
        companyId: readODataField<string>(item, 'companyId') ?? '',
        locationId: readODataField<string>(item, 'locationId') ?? '',
      }));

      for (const contact of externalContacts) {
        // Relational Guard: Ensure parent Location exists before applying child rows
        const locationExists = await fork.findOne(LocationsEntity, { locationId: contact.locationId });
        if (!locationExists && contact.locationId) {
          await fork.upsert(LocationsEntity, {
            locationId: contact.locationId,
            locationName: `Stubbed Location Parent (${contact.locationId.slice(0, 8)})`,
            customer: null,
          } as any);
        }

        await fork.upsert(ContactEntity, {
          contactId: contact.contactId,
          firstName: contact.firstName,
          lastName: contact.lastName,
          emailAddress: contact.emailAddress,
          phoneMobile: contact.phoneMobile,
          company: contact.companyId || null,
          location: contact.locationId || null,
        } as any);
      }

      await fork.flush();
      this.logger.log(`🎉 Ingestion complete! Successfully cached [${externalContacts.length}] contacts.`);
    } catch (error) {
      this.logger.error('❌ Critical crash caught within the target Contacts processing lifecycle block.', error);
      throw error;
    }
  }
}
