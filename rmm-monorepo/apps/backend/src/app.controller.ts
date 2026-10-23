import { Controller, Get } from '@nestjs/common';
import { HelpdeskClientService } from './modules/helpdesk-client/helpdesk-client.service';

@Controller()
export class AppController {
  constructor(private readonly helpdeskClientService: HelpdeskClientService) {}

  @Get()
  getHello(): string {
    return 'Hello World';
  }

  @Get("company")
  getCompany(): any {
    return this.helpdeskClientService.get('company');
  }

  @Get("ticket-priorities")
  getTicketPriorities(): any {
    return this.helpdeskClientService.get('ticketpriority');
  }

}
