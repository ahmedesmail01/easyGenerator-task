import { Schema, Types } from 'mongoose';

export const USER_MODEL = 'User';

export interface UserRecord {
  _id: Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<UserRecord>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false },
);
UserSchema.index({ email: 1 }, { unique: true });
