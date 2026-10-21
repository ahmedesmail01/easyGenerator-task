import { Schema, Types } from 'mongoose';
import { USER_MODEL } from '../../users/schemas/user.schema.js';

export const SESSION_MODEL = 'Session';

export interface SessionRecord {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

export const SessionSchema = new Schema<SessionRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: USER_MODEL, required: true },
    tokenHash: { type: String, required: true, select: false },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { versionKey: false },
);
SessionSchema.index({ tokenHash: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
