import { Migration } from '@mikro-orm/migrations';

export class Migration20261022153052 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "company" ("CompanyId" uuid not null, "CompanyName" varchar(255) not null, "LastTicketNumber" int not null, "BusinessType" int not null, constraint "company_pkey" primary key ("CompanyId"));`);
    this.addSql(`create table "customers" ("CustomerId" uuid not null, "CustomerName" varchar(255) not null, "ReferenceId" varchar(255) null, "ProgramLevelId" uuid not null, "CustomerStatusId" int not null, "CompanyId" uuid null, constraint "customers_pkey" primary key ("CustomerId"));`);
    this.addSql(`create table "locations" ("LocationId" uuid not null, "LocationName" varchar(255) not null, "CustomerId" uuid not null, constraint "locations_pkey" primary key ("LocationId"));`);
    this.addSql(`create table "service_items" ("ServiceItemId" uuid not null, "ServiceItemName" varchar(255) not null, "ServiceItemTypeCode" int not null, "CustomerId" uuid null, constraint "service_items_pkey" primary key ("ServiceItemId"));`);
    this.addSql(`create table "ticket_custom_statuses" ("TicketCustomStatusId" uuid not null, "Name" text not null, "Description" text null, "IsDefault" boolean not null default false, "TicketStatusCode" int not null, "CompanyId" uuid null, constraint "ticket_custom_statuses_pkey" primary key ("TicketCustomStatusId"));`);
    this.addSql(`create table "contacts" ("ContactId" uuid not null, "FirstName" varchar(255) not null, "LastName" varchar(255) not null, "EmailAddress" varchar(255) not null, "PhoneMobile" varchar(255) null, "CompanyId" uuid null, "LocationId" uuid null, constraint "contacts_pkey" primary key ("ContactId"));`);
    this.addSql(`create table "users" ("UserId" uuid not null, "EmailAddress" varchar(255) not null, "FirstName" varchar(255) not null, "LastName" varchar(255) not null, "Status" varchar(255) not null, "Enabled" boolean not null, "LastLogin" varchar(255) null, "PhoneMobile" varchar(255) null, "CompanyId" uuid null, constraint "users_pkey" primary key ("UserId"));`);

    this.addSql(`alter table "customers" add constraint "customers_CompanyId_foreign" foreign key ("CompanyId") references "company" ("CompanyId") on update cascade on delete set null;`);
    this.addSql(`alter table "issue_types" add constraint "issue_types_CompanyId_foreign" foreign key ("CompanyId") references "company" ("CompanyId") on update cascade on delete set null;`);
    this.addSql(`alter table "locations" add constraint "locations_CustomerId_foreign" foreign key ("CustomerId") references "customers" ("CustomerId") on update cascade on delete cascade;`);
    this.addSql(`alter table "service_items" add constraint "service_items_CustomerId_foreign" foreign key ("CustomerId") references "customers" ("CustomerId") on update cascade on delete set null;`);
    this.addSql(`alter table "ticket_custom_statuses" add constraint "ticket_custom_statuses_CompanyId_foreign" foreign key ("CompanyId") references "company" ("CompanyId") on update cascade on delete set null;`);
    this.addSql(`alter table "contacts" add constraint "contacts_CompanyId_foreign" foreign key ("CompanyId") references "company" ("CompanyId") on update cascade on delete set null;`);
    this.addSql(`alter table "contacts" add constraint "contacts_LocationId_foreign" foreign key ("LocationId") references "locations" ("LocationId") on update cascade on delete set null;`);
    this.addSql(`alter table "users" add constraint "users_CompanyId_foreign" foreign key ("CompanyId") references "company" ("CompanyId") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
    this.addSql(`drop table if exists "contacts" cascade;`);
    this.addSql(`drop table if exists "ticket_custom_statuses" cascade;`);
    this.addSql(`drop table if exists "service_items" cascade;`);
    this.addSql(`drop table if exists "locations" cascade;`);
    this.addSql(`drop table if exists "customers" cascade;`);
    this.addSql(`drop table if exists "company" cascade;`);
  }
}
