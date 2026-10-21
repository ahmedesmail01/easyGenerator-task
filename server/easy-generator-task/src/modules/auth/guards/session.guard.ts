import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SESSION_COOKIE } from '../constants/session.constants.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.type.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = request.cookies as Record<string, unknown> | undefined;
    request.auth = await this.authService.authenticate(
      cookies?.[SESSION_COOKIE],
    );
    return true;
  }
}
