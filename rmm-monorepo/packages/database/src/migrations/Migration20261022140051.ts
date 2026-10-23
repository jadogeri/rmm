import { Migration } from '@mikro-orm/migrations';

export class Migration20261022140051 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "issue_types" ("IssueTypeId" uuid not null, "Name" varchar(255) not null, "Description" text null, "RmReferenceId" varchar(255) null, "CompanyId" uuid null, "ParentIssueTypeId" uuid null, constraint "issue_types_pkey" primary key ("IssueTypeId"));`);

    this.addSql(`alter table "issue_types" add constraint "issue_types_ParentIssueTypeId_foreign" foreign key ("ParentIssueTypeId") references "issue_types" ("IssueTypeId") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "issue_types" drop constraint "issue_types_ParentIssueTypeId_foreign";`);

    this.addSql(`drop table if exists "issue_types" cascade;`);
  }

}
