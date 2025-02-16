import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const requestUserSchema = z.object({
  // TODO: replace with srp
  email: z.string().email(),
  gender: z.string().optional(),
  dob: z.coerce.date().optional(),
  password: z.string().min(8),
});

export type RequestUser = z.infer<typeof requestUserSchema>;

export interface AuthenticatedRequest extends Request {
  user?: RequestUser | undefined;
}

export const userSchema = requestUserSchema.extend({
  /** MongoDB ObjectID */
  _id: z.coerce.string().refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectID',
  }),
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

export const changePasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  newPassword: z.string().min(8),
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type DeleteAccount = z.infer<typeof deleteAccountSchema>;

export const requestResetPasswordSchema = z.object({
  email: z.string().email(),
});
export type RequestResetPassword = z.infer<typeof requestResetPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
