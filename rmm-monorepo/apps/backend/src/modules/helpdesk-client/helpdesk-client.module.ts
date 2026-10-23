import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HelpdeskClientService } from './helpdesk-client.service';
import { axiosConfigFactory } from './helpdesk-client.config';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: axiosConfigFactory,
    }),
  ],
  providers: [HelpdeskClientService],
  exports: [HelpdeskClientService], // Enforces component access boundaries
})
export class HelpdeskClientModule {}
