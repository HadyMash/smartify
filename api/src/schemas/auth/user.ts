import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const emailSchema = z.string().email();
export type Email = z.infer<typeof emailSchema>;

export const dobSchema = z.coerce.date();
export type DOB = z.infer<typeof dobSchema>;

/** The user's sex/gender */
export const sexSchema = z.enum(['m', 'f']);
/** The user's sex/gender */
export type Sex = z.infer<typeof sexSchema>;

export const userSchema = z.object({
  /** MongoDB ObjectID */
  _id: z.coerce
    .string()
    .refine((val) => ObjectId.isValid(val), {
      message: 'Invalid ObjectID',
    })
    .optional(),
  /** The user's email */
  email: z.string().email(),
  /** The user's date of birth */
  dob: dobSchema.optional(),
  /** The user's sex/gender */
  sex: sexSchema.optional(),
});

export type User = z.infer<typeof userSchema>;

//export enum InvalidUseType {
//  INVALID_ID = 'Invalid ID',
//  INVALID_EMAIL = 'Invalid Email',
//  DOES_NOT_EXIST = 'Does Not Exist',
//  OTHER = 'Other',
//}
//
//export class InvalidUserError extends Error {
//  constructor(details?: { type?: InvalidUseType; message?: string }) {
//    super(`Invalid User${details?.message ? `: ${details.message}` : ''}`);
//    this.name = 'InvalidUserError';
//    Object.setPrototypeOf(this, InvalidUserError.prototype);
//  }
//}
//
//export const requestUserSchema = z.object({
//  id: z.string(),
//  email: z.string().email(),
//  // ...
//});
//
//type RequestUser = z.infer<typeof requestUserSchema>;
//
//// TODO: replace with actual user object
//export interface AuthenticatedRequest extends Request {
//  user?: RequestUser | undefined;
//}

// Request schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  dob: dobSchema.optional(),
  sex: sexSchema.optional(),
});
export type CreateUserData = z.infer<typeof createUserSchema>;
