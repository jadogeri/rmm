import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { ContactResponseDto } from './dto/contact-response.dto';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * 🟢 HTTP GET: Retrieve all synchronized contact application profiles from local cache storage
   * Route: GET /contacts
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all synchronized contact application profiles from local cache storage' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Array of cached contact profiles fetched successfully.',
    type: [ContactResponseDto] 
  })
  async getContacts(): Promise<ContactResponseDto[]> {
    return await this.contactsService.getContacts();
  }

  /**
   * 🔴 HTTP POST: Force trigger a manual background synchronization pass pulling fresh contact structures from MSP Manager
   * Route: POST /contacts/sync
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force trigger a manual background synchronization pass pulling fresh contact structures from MSP Manager' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Manual contact synchronization pipeline executed successfully.' 
  })
  async triggerManualSync() {
    await this.contactsService.syncFromMsp();
    return { 
      statusCode: HttpStatus.OK, 
      message: 'Contacts database synced successfully.' 
    };
  }
}
