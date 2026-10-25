import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/api-key.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { resourceNames, type ODataRecord } from './resource-types';
import { ResourcesService } from './resources.service';

@ApiTags('MSP OData resources')
@ApiSecurity('msp-api-key')
@UseGuards(ApiKeyGuard)
@Controller('odata')
export class ResourcesController {
  constructor(@Inject(ResourcesService) private readonly resources: ResourcesService) {}

  @ApiParam({ name: 'resource', required: true, enum: [...resourceNames], description: 'OData resource to query. Use one of the listed resource names.' })
  @Get(':resource')
  list(@Param('resource') resource: string, @Query() query: Record<string, unknown>, @Req() request: AuthenticatedRequest) {
    const origin = request.protocol + '://' + request.get('host');
    return this.resources.list(resource, query, origin);
  }

  @ApiParam({ name: 'resource', required: true, enum: [...resourceNames], description: 'OData resource to query. Use one of the listed resource names.' })
  @ApiParam({ name: 'id', required: true, description: 'Identifier of a record in the selected resource.' })
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
