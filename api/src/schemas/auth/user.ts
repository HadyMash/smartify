import { objectIdOrStringSchema } from '../obj-id';
import { z } from 'zod';

/** Email address */
export const emailSchema = z.string().email();
/** Email address */
export type Email = z.infer<typeof emailSchema>;

/** Date of birth */
export const dobSchema = z.coerce.date();
/** Date of birth */
export type DOB = z.infer<typeof dobSchema>;

/** The user's sex/gender */
export const sexSchema = z.enum(['m', 'f']);
/** The user's sex/gender */
export type Sex = z.infer<typeof sexSchema>;

/** THe user schema */
export const userSchema = z.object({
  /** The user's id */
  _id: objectIdOrStringSchema.optional(),
  /** The user's email */
  email: z.string().email(),
  /** The user's date of birth */
  dob: dobSchema.optional(),
  /** The user's sex/gender */
  sex: sexSchema.optional(),
});

/** User and their information */
export type User = z.infer<typeof userSchema>;

/** The user schema but with an id guaranteed not to be undefined */
export const userWithIdSchema = userSchema.extend({
  /** The user's id */
  _id: objectIdOrStringSchema,
});

/** The user schema but with an id guaranteed not to be undefined */
export type UserWithId = z.infer<typeof userWithIdSchema>;

/** Invalid user types */
export enum InvalidUserType {
  INVALID_ID = 'Invalid ID',
  INVALID_EMAIL = 'Invalid Email',
  DOES_NOT_EXIST = 'Does Not Exist',
  OTHER = 'Other',
}

/** Error for invalid users */
export class InvalidUserError extends Error {
  constructor(details?: { type?: InvalidUserType; message?: string }) {
    super(`Invalid User${details?.message ? `: ${details.message}` : ''}`);
    this.name = 'InvalidUserError';
    Object.setPrototypeOf(this, InvalidUserError.prototype);
  }
}

/* Request schemas */

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  dob: dobSchema.optional(),
  sex: sexSchema.optional(),
});
export type CreateUserData = z.infer<typeof createUserSchema>;
