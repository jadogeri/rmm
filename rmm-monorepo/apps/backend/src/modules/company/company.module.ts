import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CompanyEntity } from '@repo/database';
import { CompanyService } from './company.service';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [MikroOrmModule.forFeature([CompanyEntity]), HelpdeskClientModule],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
