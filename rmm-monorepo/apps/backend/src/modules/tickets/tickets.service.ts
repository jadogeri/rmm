import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service'; // Adjust import path
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ITicket } from '@repo/types';
import { API_ENDPOINTS } from '@repo/constants';
import { Inject } from '@nestjs/common';
import { Service } from '../../common/decorators';


@Service()
export class TicketsService {
  // Inject the global authenticated generic client wrapper instance helper
  constructor(
    @Inject(HelpdeskClientService) private readonly helpdeskClient: HelpdeskClientService) { }

  async create(createTicketDto: CreateTicketDto): Promise<ITicket> {
    // Fixed: Removed leading slash to protect your baseURL odata segment context path
    return await this.helpdeskClient.post<ITicket>(API_ENDPOINTS.TICKETS.BASE, createTicketDto);
  }

  async findAll(): Promise<ITicket[]> {
    // Fixed: Clean relative path structure including top=10 selection and descending CreatedDate sorting parameters
    console.log('API endpoint being called:', API_ENDPOINTS.TICKETS.ALL_FILTERED);
    return await this.helpdeskClient.get<ITicket[]>(
      API_ENDPOINTS.TICKETS.ALL_FILTERED
    );
  }

  async findOne(id: string): Promise<ITicket> {
    // Fixed: Removed leading slash to build a perfect absolute path matching 'tickets/:id'
    return await this.helpdeskClient.get<ITicket>(API_ENDPOINTS.TICKETS.BY_ID(id));
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<ITicket> {
    // Fixed: Cleaned relative route path interpolation
    return await this.helpdeskClient.patch<ITicket>(API_ENDPOINTS.TICKETS.BY_ID(id), updateTicketDto);
  }

  async remove(id: string): Promise<void> {
    // Fixed: Cleaned relative route path deletion target
    return await this.helpdeskClient.delete(API_ENDPOINTS.TICKETS.BY_ID(id));
  }

  test() : string {
    return 'Test successful';
  }
}
