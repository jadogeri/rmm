import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, HttpCode, HttpStatus, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreatePortalTicketDto } from './dto/create-portal-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor( @Inject(TicketsService) private readonly ticketsService: TicketsService) {}

  @Post('portal')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiBody({ type: CreatePortalTicketDto })
  @ApiCreatedResponse({ description: 'Ticket created; response includes its MSP ticket number.' })
  @ApiOperation({ summary: 'Create a customer ticket using an email and one issue type' })
  async createPortalTicket(@Body() dto: CreatePortalTicketDto) {
    return this.ticketsService.createPortalTicket(dto);
  }

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
   
    return await this.ticketsService.create(createTicketDto);
  }

  @Get()
  async findAll() {
    return await this.ticketsService.findAll();
  }

  // 1️⃣ Move the static route HERE so NestJS matches "/tickets/test" first
  @Get('test')
  async test() {
    return await this.ticketsService.test();
  }

  // 2️⃣ Keep the dynamic route BELOW static routes
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ticketsService.findOne(id); 
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return await this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ticketsService.remove(id);
  }
}
