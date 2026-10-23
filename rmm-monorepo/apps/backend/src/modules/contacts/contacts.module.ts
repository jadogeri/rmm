import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContactEntity } from '@repo/database';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [MikroOrmModule.forFeature([ContactEntity]), HelpdeskClientModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
