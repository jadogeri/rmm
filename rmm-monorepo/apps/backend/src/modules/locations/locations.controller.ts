// apps/backend/src/modules/locations/locations.controller.ts
import { Controller, Get, Post, Query, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /**
   * 🟢 HTTP GET: Used by frontend dropdown fields to fetch locations instantly from Docker
   * Route: GET /locations?customerId=bc2351a5-...
   */
  @Get('customer')
  async getLocationsByCustomer(@Query('customerId', new ParseUUIDPipe()) customerId: string) {
    return await this.locationsService.getLocationsByCustomer(customerId);
  }

    /**
   * 🟢 HTTP GET: Used by frontend dropdown fields to fetch locations instantly from Docker
   * Route: GET /locations/all
   */
  @Get('')
  async getLocations() {
    return await this.locationsService.getLocations();
  }

  /**
   * 🔴 HTTP POST: Maintenance trigger used by cron tasks or administrators to refresh cache
   * Route: POST /locations/sync
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerManualSync() {
    return await this.locationsService.syncAllLocationsFromMsp();
  }
}
