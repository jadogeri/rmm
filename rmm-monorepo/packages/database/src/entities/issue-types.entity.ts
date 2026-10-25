import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { IIssueType } from '@repo/types'; 
import { CompanyEntity } from './company.entity'; // 🟢 1. Import your Company Entity

@Entity({ tableName: 'issue_types' })
export class IssueTypesEntity implements IIssueType { 
  @PrimaryKey({ type: 'uuid', fieldName: 'IssueTypeId' })
  issueTypeId!: string;

  @Property({ type: 'string', fieldName: 'Name' })
  name!: string;

  @Property({ type: 'text', nullable: true, fieldName: 'Description' })
  description!: string | null;

  @Property({ type: 'string', nullable: true, fieldName: 'RmReferenceId' })
  rmReferenceId!: string | null;

  // 🟢 2. CHANGED: Map CompanyId as a type-safe ManyToOne relationship linking tables
  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: CompanyEntity | null;

  // 🟢 3. Getter ensures strict compliance with your primitive shared IIssueType interface contract
  get companyId(): string | null {
    return this.company?.companyId ?? null;
  }

  // 🌲 SELF-REFERENCING RELATIONSHIP LINKS:

  // 3. Many children point back to an optional single Parent row
  @ManyToOne(() => IssueTypesEntity, {
    fieldName: 'ParentIssueTypeId', 
    nullable: true,
    deleteRule: 'cascade', 
  })
  parent?: IssueTypesEntity | null;

  // 4. One Parent automatically tracks a collection array of its local Children
  @OneToMany(() => IssueTypesEntity, (child: IssueTypesEntity) => child.parent)
  children = new Collection<IssueTypesEntity>(this);
}
