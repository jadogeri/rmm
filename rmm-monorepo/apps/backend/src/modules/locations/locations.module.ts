// apps/backend/src/modules/locations/locations.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LocationsEntity, CustomersEntity } from '@repo/database';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module'; // Adjust path if necessary

@Module({
  imports: [
    // 🔒 Binds operation scope exclusively to these tables for this module context
    MikroOrmModule.forFeature([LocationsEntity, CustomersEntity]),
    HelpdeskClientModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
