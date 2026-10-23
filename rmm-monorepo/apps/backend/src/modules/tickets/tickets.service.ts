import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { 
  ContactEntity, 
  LocationsEntity, 
  IssueTypesEntity, 
  CustomersEntity // Assuming ServiceItemEntity lives inside your database exports too
} from '@repo/database';
import { ITicket } from '@repo/types';
import { API_ENDPOINTS } from '@repo/constants';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable() // 🟢 Standardized back to your NestJS core provider initialization decorator
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @Inject(HelpdeskClientService) 
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Injected Local Docker Repositories for relational reference verification checks
    @InjectRepository(ContactEntity)
    private readonly contactRepo: EntityRepository<ContactEntity>,

    @InjectRepository(LocationsEntity)
    private readonly locationRepo: EntityRepository<LocationsEntity>,

    @InjectRepository(IssueTypesEntity)
    private readonly issueTypeRepo: EntityRepository<IssueTypesEntity>
  ) {}

  /**
   * Transactional Gatekeeper: Validates relation identifiers locally inside Docker, 
   * maps them to the expected OData PascalCase contract format, then posts upstream.
   */
// apps/backend/src/modules/tickets/tickets.service.ts

// apps/backend/src/modules/tickets/tickets.service.ts

  async create(createTicketDto: CreateTicketDto): Promise<ITicket> {
    this.logger.log(`🔍 Validating relational references for new ticket title: "${createTicketDto.title}"`);

    // 🟢 1. Extract inputs with safety fallbacks for both frontend camelCase and uppercase OData schemas
    const rawDto = createTicketDto as any;
    const contactId = createTicketDto.contactId || rawDto.ContactId;
    const locationId = createTicketDto.locationId || rawDto.LocationId;
    const issueTypeId = createTicketDto.issueTypeId || rawDto.IssueTypeId;
    const serviceItemId = createTicketDto.serviceItemId || rawDto.ServiceItemId;
    const projectId = createTicketDto.projectId || rawDto.ProjectId;
    const title = createTicketDto.title || rawDto.Title;
    const description = createTicketDto.description || rawDto.Description;
    const dueDate = createTicketDto.dueDate || rawDto.DueDate;
    const priorityCode = createTicketDto.ticketPriorityCode || rawDto.ticketPriorityCode || 1;

    // 2. Run local reference validation checks inside your fast Docker container
    const [contactExists, locationExists] = await Promise.all([
      this.contactRepo.findOne({ contactId }),
      this.locationRepo.findOne({ locationId })
    ]);

    // 3. Reject immediately if mandatory parent constraints are missing
    if (!contactExists)   throw new BadRequestException(`Target Contact ID [${contactId}] is completely invalid.`);
    if (!locationExists)  throw new BadRequestException(`Target Location ID [${locationId}] is completely invalid.`);

    // 4. Optional Field Guard: Only query database if issueTypeId is provided
    if (issueTypeId) {
      const issueTypeExists = await this.issueTypeRepo.findOne({ issueTypeId });
      if (!issueTypeExists) {
        throw new BadRequestException(`Target Issue Type ID [${issueTypeId}] does not exist.`);
      }
    }

    // 5. Map fields over to the raw OData payload schema required upstream
    const odataPayload = {
      Title: title,
      Description: description || 'No description provided.',
      DueDate: dueDate || null,
      
      // 🟢 ContractId mapping assignment with full string variable resolution
      ServiceItemId: serviceItemId, 
      
      ContactId: contactId,
      LocationId: locationId,
      IssueTypeId: issueTypeId || null,
      ProjectId: projectId || null,
      TicketPriorityCode: priorityCode,
      IsBillable: true,
      IsTaxable: false,
    };

    this.logger.log(`🚀 Final payload structure validation: ${JSON.stringify(odataPayload)}`);
    this.logger.log('🚀 Pushing verified ticket structure payload downstream to MSP Manager API...');
    
    const response = await this.helpdeskClient.post<any>(API_ENDPOINTS.TICKETS.BASE, odataPayload as any);
    this.logger.log(`🚀 Received response from MSP Manager API: ${JSON.stringify(response)}`);
    return response;
  }



  async findAll(): Promise<ITicket[]> {
    this.logger.log(`Fetching active tickets tree: ${API_ENDPOINTS.TICKETS.ALL_FILTERED}`);
    return await this.helpdeskClient.get<ITicket[]>(API_ENDPOINTS.TICKETS.ALL_FILTERED);
  }

  async findOne(id: string): Promise<ITicket> {
    return await this.helpdeskClient.get<ITicket>(API_ENDPOINTS.TICKETS.BY_ID(id));
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<ITicket> {
    this.logger.log(`Updating ticket ID [${id}] structure payload...`);
    return await this.helpdeskClient.patch<ITicket>(API_ENDPOINTS.TICKETS.BY_ID(id), updateTicketDto);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing remote ticket entry pointer ID [${id}]...`);
    return await this.helpdeskClient.delete(API_ENDPOINTS.TICKETS.BY_ID(id));
  }

  test(): string {
    return 'Test successful';
  }
}
