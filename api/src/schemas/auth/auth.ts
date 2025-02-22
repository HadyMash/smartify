import { Request } from 'express';
import { UserWithId } from './user';

export interface AuthenticatedRequest extends Request {
  user?: UserWithId | undefined;
}
