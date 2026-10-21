import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import { Model } from 'mongoose';
import { PasswordService } from './services/password.service.js';
import { SESSION_MODEL } from './schemas/session.schema.js';
import { publicUser } from '../users/mappers/public-user.mapper.js';
import { UsersService } from '../users/users.service.js';
import { hashToken } from './utils/hash-token.js';
import type { SessionRecord } from './schemas/session.schema.js';
import type { SignInDto } from './dto/sign-in.dto.js';
import type { SignUpDto } from './dto/sign-up.dto.js';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(UsersService) private readonly users: UsersService,
    @InjectModel(SESSION_MODEL) private readonly sessions: Model<SessionRecord>,
    @Inject(PasswordService) private readonly passwords: PasswordService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.sessions.createIndexes();
  }

  async signUp(dto: SignUpDto) {
    const passwordHash = await this.passwords.hash(dto.password);
    try {
      const user = await this.users.create({
        email: dto.email,
        name: dto.name,
        passwordHash,
      });
      return { user: publicUser(user) };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }
  }

  async signIn(dto: SignInDto) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    const valid = await this.passwords.verify(dto.password, user?.passwordHash);
    if (!user || !valid)
      throw new UnauthorizedException('Invalid email or password');
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      Date.now() + this.config.getOrThrow<number>('SESSION_TTL_SECONDS') * 1000,
    );
    await this.sessions.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt,
    });
    return { token, expiresAt, user: publicUser(user) };
  }

  async authenticate(token: unknown) {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token))
      throw new UnauthorizedException('Authentication required');
    const session = await this.sessions
      .findOne({
        tokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();
    if (!session)
      throw new UnauthorizedException('Session is invalid or expired');
    const user = await this.users.findById(session.userId);
    if (!user) throw new UnauthorizedException('Session is invalid or expired');
    return { user: publicUser(user), sessionId: session._id };
  }

  async signOut(token: unknown) {
    if (typeof token === 'string') {
      await this.sessions
        .updateOne(
          { tokenHash: hashToken(token), revokedAt: null },
          { $set: { revokedAt: new Date() } },
        )
        .exec();
    }
  }
}
