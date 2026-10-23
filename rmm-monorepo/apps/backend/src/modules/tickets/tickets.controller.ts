import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor( @Inject(TicketsService) private readonly ticketsService: TicketsService) {}

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
