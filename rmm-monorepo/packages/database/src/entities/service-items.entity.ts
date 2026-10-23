// packages/database/src/entities/service-items.entity.ts
import { Entity, Property, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { CustomersEntity } from './customers.entity';
import { IServiceItem } from '@repo/types';

@Entity({ tableName: 'service_items' })
export class ServiceItemsEntity implements IServiceItem {
  @PrimaryKey({ type: 'uuid', fieldName: 'ServiceItemId' })
  serviceItemId!: string;

  @Property({ type: 'string', fieldName: 'ServiceItemName' })
  serviceItemName!: string;

  @Property({ type: 'integer', fieldName: 'ServiceItemTypeCode' })
  serviceItemTypeCode!: number;

  @ManyToOne(() => CustomersEntity, {
    fieldName: 'CustomerId',
    nullable: true,
    deleteRule: 'set null',
  })
  customer?: CustomersEntity | null;

  // Maintains contract compliance with your shared interface primitive key
  get customerId(): string {
    return this.customer?.customerId ?? '';
  }
}
