import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './services/password.service.js';
import { SessionGuard } from './guards/session.guard.js';
import { SESSION_MODEL, SessionSchema } from './schemas/session.schema.js';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: SESSION_MODEL, schema: SessionSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, SessionGuard],
})
export class AuthModule {}
