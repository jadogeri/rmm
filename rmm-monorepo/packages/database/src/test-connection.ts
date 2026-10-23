// packages/database/src/test-connection.ts
import { MikroORM } from '@mikro-orm/postgresql';
import databaseConfig from './mikro-orm.config';

async function testDatabaseConnection() {
  console.log('🔄 Attemping to initialize MikroORM database client connection...');
  let orm: MikroORM | null = null;

  try {
    // 1. Initialize the ORM engine instance configuration
    orm = await MikroORM.init(databaseConfig);
    
    // 2. ✅ v7 Best Practice: Execute a live query ping to force open a connection pool socket
    await orm.em.getConnection().execute('SELECT 1');
    
    console.log('====================================================');
    console.log('🎉 CONNECTION SUCCESSFUL! Database is online and reachable.');
    console.log(`📡 Linked to DB Name: "${orm.config.get('dbName')}"`);
    console.log('====================================================');

  } catch (error: any) {
    console.error('====================================================');
    console.error('❌ CONNECTION FAILED! Unable to connect to the database container.');
    console.error(`Reason: ${error.message}`);
    console.error('👉 Ensure your Docker container is running and your .env credentials are correct.');
    console.error('====================================================');
  } finally {
    // Gracefully shut down the connection pool context if it opened
    if (orm) {
      await orm.close(true);
    }
  }
}

// Fire the tester execution
testDatabaseConnection();
