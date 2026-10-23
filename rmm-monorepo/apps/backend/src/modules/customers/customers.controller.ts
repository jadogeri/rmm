import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersEntity } from '@repo/database';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getAllCustomers(): Promise<CustomerResponseDto[]> {
    return this.customersService.findAll();
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerManualSync() {
    await this.customersService.syncFromMsp();
    return {
      statusCode: HttpStatus.OK,
      message: 'Manual customer synchronization pipeline executed successfully.',
    };
  }
}
