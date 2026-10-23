// packages/database/src/entities/ticket-custom-statuses.entity.ts
import { Entity, Property, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { CompanyEntity } from './company.entity';
import { TicketCustomStatus } from '@repo/types';

@Entity({ tableName: 'ticket_custom_statuses' })
export class TicketCustomStatusesEntity implements TicketCustomStatus {
  @PrimaryKey({ type: 'uuid', fieldName: 'TicketCustomStatusId' })
  ticketCustomStatusId!: string;

  @Property({ type: 'text', fieldName: 'Name' })
  name!: string;

  @Property({ type: 'text', nullable: true, fieldName: 'Description' })
  description?: string;

  @Property({ type: 'boolean', default: false, fieldName: 'IsDefault' })
  isDefault: boolean = false;

  @Property({ type: 'integer', fieldName: 'TicketStatusCode' })
  ticketStatusCode!: number;

  // 🟢 Matches your working CustomersEntity / IssueTypesEntity pattern exactly
  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: CompanyEntity | null;

  // 🟢 Safe, non-blocking getter string resolution matching CustomersEntity
  get companyId(): string | null {
    return this.company?.companyId ?? null;
  }

  // ==========================================
  // 🟢 IMPLEMENTING THE ODATA INTERFACE CONTRACT
  // ==========================================

  get TicketCustomStatusId(): string {
    return this.ticketCustomStatusId;
  }
  set TicketCustomStatusId(value: string) {
    this.ticketCustomStatusId = value;
  }

  get Name(): string {
    return this.name;
  }
  set Name(value: string) {
    this.name = value;
  }

  get Description(): string {
    return this.description ?? '';
  }
  set Description(value: string) {
    this.description = value || undefined;
  }

  get IsDefault(): boolean {
    return this.isDefault;
  }
  set IsDefault(value: boolean) {
    this.isDefault = value;
  }

  get TicketStatusCode(): number {
    return this.ticketStatusCode;
  }
  set TicketStatusCode(value: number) {
    this.ticketStatusCode = value;
  }

  // 🟢 FIXED: Kept as an implicit layout property interface target mapping
  get CompanyId(): string {
    return this.companyId ?? '';
  }
  set CompanyId(value: string) {
    // Left empty intentionally to prevent raw string assignment crashes.
    // The relationship is instead safely mapped inside the Service sync loop.
  }
}
