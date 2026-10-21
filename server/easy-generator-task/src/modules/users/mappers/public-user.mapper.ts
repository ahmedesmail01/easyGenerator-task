import type { UserRecord } from '../schemas/user.schema.js';

export function publicUser(user: UserRecord) {
  return {
    id: user._id.toHexString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
