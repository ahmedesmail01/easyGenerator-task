import type { Request } from 'express';
import type { AuthService } from '../auth.service.js';

export type AuthenticatedRequest = Request & {
  auth: Awaited<ReturnType<AuthService['authenticate']>>;
};
