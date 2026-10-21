import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { SESSION_COOKIE } from './constants/session.constants.js';
import { SessionGuard } from './guards/session.guard.js';
import type { AuthenticatedRequest } from './types/authenticated-request.type.js';

// Explicit expectedType also works in test transpilers without decorator metadata.
const validate = (expectedType: typeof SignInDto | typeof SignUpDto) =>
  new ValidationPipe({
    expectedType,
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    };
  }

  @Post('sign-up')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  signUp(@Body(validate(SignUpDto)) dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async signIn(
    @Body(validate(SignInDto)) dto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, expiresAt, user } = await this.authService.signIn(dto);
    response.cookie(SESSION_COOKIE, token, {
      ...this.cookieOptions(),
      expires: expiresAt,
    });
    return { user, expiresAt };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() request: AuthenticatedRequest) {
    return { user: request.auth.user };
  }

  @Get('application')
  @UseGuards(SessionGuard)
  application() {
    return { message: 'Welcome to the application.' };
  }

  @Post('sign-out')
  @HttpCode(204)
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    await this.authService.signOut(cookies?.[SESSION_COOKIE]);
    response.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }
}
