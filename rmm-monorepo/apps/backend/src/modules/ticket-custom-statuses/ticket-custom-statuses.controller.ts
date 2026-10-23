// apps/backend/src/modules/ticket-custom-statuses/ticket-custom-statuses.controller.ts
import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { TicketCustomStatusResponseDto } from './dto/ticket-custom-status.dto';
import { TicketCustomStatusesService } from './ticket-custom-statuses.service';


@Controller('ticket-custom-statuses')
export class TicketCustomStatusesController {
  constructor(private readonly customStatusesService: TicketCustomStatusesService) {}

  /**
   * 🟢 HTTP GET: Returns your fully pre-structured flat status array out of database cache storage
   * Route: GET /ticket-custom-statuses
   */
  @Get()
  async getCustomStatuses(): Promise<TicketCustomStatusResponseDto[]> {
    return await this.customStatusesService.getCustomStatuses();
  }

  /**
   * 🔵 HTTP POST: Forces an asynchronous extraction layer sync pipeline cycle from remote MSP Manager servers
   * Route: POST /ticket-custom-statuses/sync
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerManualSync() {
    return await this.customStatusesService.syncAllCustomStatusesFromMsp();
  }
}
