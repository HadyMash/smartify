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
  ALREADY_EXISTS = 'Already Exists',
  OTHER = 'Other',
}

/** Error for invalid users */
export class InvalidUserError extends Error {
  public readonly type: InvalidUserType = InvalidUserType.OTHER;
  constructor(details?: { type?: InvalidUserType; message?: string }) {
    super(`Invalid User${details?.message ? `: ${details.message}` : ''}`);
    this.name = 'InvalidUserError';
    Object.setPrototypeOf(this, InvalidUserError.prototype);
    if (details?.type) {
      this.type = details.type;
    }
  }
}

/* Request schemas */

const bigIntTransformed = z
  .union([z.string(), z.bigint()])
  .refine(
    (val) => {
      if (typeof val === 'string') {
        try {
          BigInt(val);
          return true;
        } catch (_) {
          return false;
        }
      }
      return true;
    },
    { message: 'Value must be a string or a BigInt' },
  )
  .transform((val) => (typeof val === 'string' ? BigInt(val) : val));

//export const initUserDataSchema = z.object({
//  email: emailSchema,
//});

export const registerDataSchema = z.object({
  email: emailSchema,
  dob: dobSchema.optional(),
  sex: sexSchema.optional(),
  salt: z.string(),
  verifier: bigIntTransformed,
});

export type RegisterData = z.infer<typeof registerDataSchema>;

export const loginDataSchema = z.object({
  /** The user's email */
  email: emailSchema,
  /** The client's public key */
  A: bigIntTransformed,
  /** The client's proof */
  Mc: bigIntTransformed,
});
export type LoginData = z.infer<typeof loginDataSchema>;
