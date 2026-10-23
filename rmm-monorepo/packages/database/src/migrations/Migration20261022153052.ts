import { Migration } from '@mikro-orm/migrations';

export class Migration20261022153052 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "company" ("CompanyId" uuid not null, "CompanyName" varchar(255) not null, "LastTicketNumber" int not null, "BusinessType" int not null, constraint "company_pkey" primary key ("CompanyId"));`);

    this.addSql(`alter table "customers" add constraint "customers_CompanyId_foreign" foreign key ("CompanyId") references "company" ("CompanyId") on update cascade on delete set null;`);

    this.addSql(`alter table "issue_types" add constraint "issue_types_CompanyId_foreign" foreign key ("CompanyId") references "company" ("CompanyId") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "customers" drop constraint "customers_CompanyId_foreign";`);

    this.addSql(`alter table "issue_types" drop constraint "issue_types_CompanyId_foreign";`);

    this.addSql(`drop table if exists "company" cascade;`);
  }

}
