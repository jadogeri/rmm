import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CustomersEntity } from '@repo/database';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [
    // Binds the entity mapping metadata context into the scope of this engine block
    MikroOrmModule.forFeature([CustomersEntity]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService], // 🚨 Mandatory: Exports provider so SyncCronService can parse it
})
export class CustomersModule {}
