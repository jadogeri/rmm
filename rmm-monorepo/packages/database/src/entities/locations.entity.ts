// packages/database/src/entities/Location.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'; // 🟢 Added ManyToOne
import { ILocation } from '@repo/types';
import { CustomersEntity } from './customers.entity'; // 🟢 Import your target customer entity

@Entity({ tableName: 'locations' })
export class LocationsEntity implements Omit<ILocation, 'customerId'> {
  @PrimaryKey({ type: 'uuid', fieldName: 'LocationId' })
  locationId!: string;

  @Property({ type: 'string', fieldName: 'LocationName' })
  locationName!: string;

  // 🟢 Maps the customer relationship directly as a foreign key on CustomerId column
  @ManyToOne(() => CustomersEntity, { 
    fieldName: 'CustomerId', 
    deleteRule: 'cascade', // Cascades down automatically if a customer is wiped
    nullable: false 
  })
  customer!: CustomersEntity;
}
