import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/api-key.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';
import type { ODataRecord } from './resource-types';
import { ResourcesService } from './resources.service';

@ApiTags('MSP OData resources')
@ApiSecurity('msp-api-key')
@UseGuards(ApiKeyGuard)
@Controller('odata')
export class ResourcesController {
  constructor(@Inject(ResourcesService) private readonly resources: ResourcesService) {}

  @Get(':resource')
  list(@Param('resource') resource: string, @Query() query: Record<string, unknown>, @Req() request: AuthenticatedRequest) {
    const origin = request.protocol + '://' + request.get('host');
    return this.resources.list(resource, query, origin);
  }

  @Get(':resource/:id')
  getOne(@Param('resource') resource: string, @Param('id') id: string) {
    return this.resources.getOne(resource, id);
  }

  @Post('tickets')
  @HttpCode(HttpStatus.OK)
  createTicket(@Body() body: ODataRecord) {
    return this.resources.createTicket(body || {});
  }

  @Patch('tickets/:id')
  updateTicket(@Param('id') id: string, @Body() body: ODataRecord) {
    return this.resources.updateTicket(id, body || {});
  }

  @Delete('tickets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTicket(@Param('id') id: string) {
    this.resources.deleteTicket(id);
  }
}
