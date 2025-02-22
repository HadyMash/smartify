import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const userSchema = z.object({
  /** MongoDB ObjectID */
  _id: z.coerce.string().refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectID',
  }),
  email: z.string().email(),
  dob: z.coerce.date(),
  sex: z.enum(['m', 'f']),
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
