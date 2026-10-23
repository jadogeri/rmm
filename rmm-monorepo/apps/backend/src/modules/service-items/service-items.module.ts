// apps/backend/src/modules/service-items/service-items.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ServiceItemsEntity } from '@repo/database';
import { ServiceItemsService } from './service-items.service';
import { ServiceItemsController } from './service-items.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([ServiceItemsEntity]),
    HelpdeskClientModule,
  ],
  controllers: [ServiceItemsController],
  providers: [ServiceItemsService],
  exports: [ServiceItemsService],
})
export class ServiceItemsModule {}
