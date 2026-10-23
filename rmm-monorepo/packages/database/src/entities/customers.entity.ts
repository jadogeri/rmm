import { Entity, PrimaryKey, Property, OneToMany, ManyToOne, Collection } from '@mikro-orm/core'; // 🟢 Added ManyToOne
import { ICustomer } from '@repo/types';
import { LocationsEntity } from './locations.entity'; 
import { CompanyEntity } from './Company.entity'; // 🟢 Import your Company Entity

@Entity({ tableName: 'customers' })
export class CustomersEntity implements ICustomer {
  @PrimaryKey({ type: 'uuid', fieldName: 'CustomerId' })
  customerId!: string;

  @Property({ type: 'string', fieldName: 'CustomerName' })
  customerName!: string;

  @Property({ type: 'string', nullable: true, fieldName: 'ReferenceId' })
  referenceId!: string | null;

  @Property({ type: 'uuid', fieldName: 'ProgramLevelId' })
  programLevelId!: string;

  @Property({ type: 'number', fieldName: 'CustomerStatusId' })
  customerStatusId!: number;

  // 🟢 CHANGED: Instead of a generic string column, map it as a ManyToOne relation
  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',     // Tracks the actual underlying DB column name
    nullable: true,             // Keeps compatibility with your ICustomer fallback rules
    deleteRule: 'set null',     // Keeps records safe if a company config row shifts
  })
  company?: CompanyEntity | null;

  // This getter maintains type compliance with your primitive shared ICustomer interface contract
  get companyId(): string | null | undefined {
    return this.company?.companyId ?? null;
  }

  // 🟢 Bidirectional link tracking the locations array cache context
  @OneToMany(() => LocationsEntity, (loc: LocationsEntity) => loc.customer)
  locations = new Collection<LocationsEntity>(this);
}
