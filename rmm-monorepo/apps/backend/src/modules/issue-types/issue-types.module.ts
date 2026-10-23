import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IssueTypesEntity } from '@repo/database';
import { IssueTypesService } from './issue-types.service';
import { IssueTypesController } from './issue-types.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([IssueTypesEntity]),
    HelpdeskClientModule, // Grants access to HelpdeskClientService HTTP client engine
  ],
  controllers: [IssueTypesController],
  providers: [IssueTypesService],
  exports: [IssueTypesService], // 🚨 Mandatory: Exports provider so your sync cron module can access it
})
export class IssueTypesModule {}
