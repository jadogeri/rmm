import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { IUser } from '@repo/types';
import { CompanyEntity } from './Company.entity';

@Entity({ tableName: 'users' })
export class UsersEntity implements IUser {
  @PrimaryKey({ type: 'uuid', fieldName: 'UserId' })
  UserId!: string;

  @Property({ type: 'string', fieldName: 'EmailAddress' })
  EmailAddress!: string;

  @Property({ type: 'string', fieldName: 'FirstName' })
  FirstName!: string;

  @Property({ type: 'string', fieldName: 'LastName' })
  LastName!: string;

  @Property({ type: 'string', fieldName: 'Status' })
  Status!: string;

  @Property({ type: 'boolean', fieldName: 'Enabled' })
  Enabled!: boolean;

  @Property({ type: 'string', nullable: true, fieldName: 'LastLogin' })
  LastLogin!: string | null;

  @Property({ type: 'string', nullable: true, fieldName: 'PhoneMobile' })
  PhoneMobile!: string | null;

  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: Rel<CompanyEntity> | null;

  // Primitive getter ensuring strict compliance with your type contract signature
  get CompanyId(): string {
    return this.company?.companyId ?? '';
  }
}
