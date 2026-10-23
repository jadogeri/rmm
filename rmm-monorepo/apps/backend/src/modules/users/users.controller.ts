import { Controller, Get, Post, HttpCode, HttpStatus, NotFoundException, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all synchronized user application profiles from local cache storage' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  async getUsers(): Promise<UserResponseDto[]> {
    return await this.usersService.getUsers();
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force trigger a manual background synchronization pass pulling fresh user structures from MSP Manager' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User synchronization completed successfully.' })
  async triggerManualSync() {
    await this.usersService.syncFromMsp();
    return { 
      statusCode: HttpStatus.OK, 
      message: 'User records database sync pipeline executed successfully.' 
    };
  }

   /**
   * 🟢 HTTP GET: Retrieve a single user profile by their primary email address
   * Route: GET /users/search?email=joseph.adogeri@company.com
   */
  @Get('search')
  @ApiOperation({ summary: 'Retrieve a single user application profile by their primary email address' })
  @ApiQuery({ name: 'email', example: 'joseph.adogeri@company.com', description: 'The exact email address of the target profile' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No synchronized profile found matching that address.' })
  async getUserByEmail(@Query('email') email: string): Promise<UserResponseDto> {
    if (!email) {
      throw new NotFoundException('An email query parameter string is required.');
    }

    const user = await this.usersService.getUserByEmail(email);
    
    if (!user) {
      throw new NotFoundException(`User with email address "${email}" could not be located inside cache.`);
    }

    return user;
  }
}
