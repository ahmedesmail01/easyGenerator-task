import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { USER_MODEL } from './schemas/user.schema.js';
import type { UserRecord } from './schemas/user.schema.js';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(USER_MODEL) private readonly users: Model<UserRecord>,
  ) {}

  async onModuleInit() {
    // Enforce email uniqueness before accepting sign-ups.
    await this.users.createIndexes();
  }

  create(input: Pick<UserRecord, 'email' | 'name' | 'passwordHash'>) {
    return this.users.create(input);
  }

  findByEmailWithPassword(email: string) {
    return this.users.findOne({ email }).select('+passwordHash').exec();
  }

  findById(id: Types.ObjectId) {
    return this.users.findById(id).exec();
  }
}
