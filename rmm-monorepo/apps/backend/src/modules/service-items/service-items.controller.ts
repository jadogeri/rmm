// apps/backend/src/modules/service-items/service-items.controller.ts
import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ServiceItemsService } from './service-items.service';
import { ServiceItemResponseDto } from './dto/service-items-response.dto';

@ApiTags('Service Items')
@Controller('service-items')
export class ServiceItemsController {
  constructor(private readonly serviceItemsService: ServiceItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cached service items' })
  @ApiOkResponse({ type: [ServiceItemResponseDto] })
  async getServiceItems(): Promise<ServiceItemResponseDto[]> {
    return await this.serviceItemsService.getServiceItems();
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger sync from MSP Manager' })
  async triggerManualSync() {
    return await this.serviceItemsService.syncAllServiceItemsFromMsp();
  }
}
