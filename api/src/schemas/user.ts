import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const UserSchema = z.object({
  /** MongoDB ObjectID */
  _id: z.coerce.string().refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectID',
  }),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

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
