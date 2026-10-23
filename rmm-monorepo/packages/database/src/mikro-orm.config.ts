// packages/database/mikro-orm.config.ts
import { ContactEntity } from './entities/contacts.entity';
import { UsersEntity } from './entities/users.entity';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

import { CustomersEntity } from './entities/customers.entity';
import { LocationsEntity } from './entities/locations.entity';
import { IssueTypesEntity } from './entities/issue-types.entity';
import { CompanyEntity } from './entities/company.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { TicketCustomStatusesEntity } from './entities/ticket-custom-status.entity';
import { ServiceItemsEntity } from './entities/service-items.entity';

// Force load the environment file from your monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const databaseConfig = defineConfig({
  host: '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME,  
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: [CustomersEntity, LocationsEntity, IssueTypesEntity, CompanyEntity, 
    TicketCustomStatusesEntity, ServiceItemsEntity, ContactEntity, UsersEntity], 
  debug: process.env.NODE_ENV === 'development',
  extensions: [Migrator],
  migrations: {
    path: './src/migrations', 
    pathTs: './src/migrations',
  },
});

export default databaseConfig;
