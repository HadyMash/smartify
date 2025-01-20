import { ObjectId } from 'mongodb';
import { Request } from 'express';
import { z } from 'zod';
import { objectIdStringSchema } from '../obj-id';

export const userSchema = z.object({
  /** MongoDB Object Id*/
  _id: objectIdStringSchema,
  /** Email address */
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;

export enum InvalidUseType {
  INVALID_ID = 'Invalid ID',
  INVALID_EMAIL = 'Invalid Email',
  DOES_NOT_EXIST = 'Does Not Exist',
  OTHER = 'Other',
}

export class InvalidUserError extends Error {
  constructor(details?: { type?: InvalidUseType; message?: string }) {
    super(`Invalid User${details?.message ? `: ${details.message}` : ''}`);
    this.name = 'InvalidUserError';
    Object.setPrototypeOf(this, InvalidUserError.prototype);
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User | undefined;
}
