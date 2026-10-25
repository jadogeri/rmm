import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard, type AuthenticatedRequest } from './api-key.guard';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify credentials and issue an X-API-Key' })
  login(@Body() body: { email?: unknown; password?: unknown }) {
    return this.authService.login(body?.email, body?.password);
  }

  @Get('me')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get the authenticated account' })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.currentUser(request.authUser);
  }

  @Patch('password')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change the current password and rotate the API key' })
  changePassword(@Req() request: AuthenticatedRequest, @Body() body: { currentPassword?: unknown; newPassword?: unknown }) {
    return this.authService.changePassword(request.authUser, body?.currentPassword, body?.newPassword);
  }

  @Get('users')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'List auth accounts (administrator only)' })
  listUsers(@Req() request: AuthenticatedRequest) {
    return this.authService.listUsers(request.authUser);
  }

  @Post('users')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an auth account (administrator only)' })
  addUser(@Req() request: AuthenticatedRequest, @Body() body: { email?: unknown; password?: unknown; role?: unknown }) {
    return this.authService.addUser(request.authUser, body || {});
  }

  @Delete('users/:id')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an auth account and revoke its keys (administrator only)' })
  deleteUser(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    if (!this.authService.deleteUser(request.authUser, id)) return;
  }
}
