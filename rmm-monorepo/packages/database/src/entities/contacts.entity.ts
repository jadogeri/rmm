import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { IContact } from '@repo/types';
import { CompanyEntity } from './Company.entity';
import { LocationsEntity } from './locations.entity';

@Entity({ tableName: 'contacts' })
export class ContactEntity implements IContact {
  @PrimaryKey({ type: 'uuid', fieldName: 'ContactId' })
  contactId!: string;

  @Property({ type: 'string', fieldName: 'FirstName' })
  firstName!: string;

  @Property({ type: 'string', fieldName: 'LastName' })
  lastName!: string;

  @Property({ type: 'string', fieldName: 'EmailAddress' })
  emailAddress!: string;

  @Property({ type: 'string', fieldName: 'PhoneMobile', nullable: true })
  phoneMobile!: string;

  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: Rel<CompanyEntity> | null;

  @ManyToOne(() => LocationsEntity, {
    fieldName: 'LocationId',
    nullable: true,
    deleteRule: 'set null',
  })
  location?: Rel<LocationsEntity> | null;

  // Primitives getters ensuring type-compliance with your strict shared structural type contract
  get companyId(): string {
    return this.company?.companyId ?? '';
  }

  get locationId(): string {
    return this.location?.locationId ?? '';
  }
}
