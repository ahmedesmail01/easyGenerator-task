import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;
    // Reject missing/foreign origins too, including login CSRF and form posts.
    if (
      request.get('origin') !== this.config.getOrThrow<string>('CLIENT_ORIGIN')
    ) {
      throw new ForbiddenException('Request origin is not allowed');
    }
    return true;
  }
}
