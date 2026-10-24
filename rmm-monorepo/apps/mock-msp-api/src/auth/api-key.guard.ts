import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type AuthPrincipal } from './auth.service';

export type AuthenticatedRequest = Request & { authUser: AuthPrincipal };

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const key = request.header('X-API-Key');
    if (!key) throw new UnauthorizedException('A valid X-API-Key is required.');
    request.authUser = this.authService.authenticate(key);
    return true;
  }
}
