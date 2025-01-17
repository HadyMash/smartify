/* Schema for User information */
import { Request } from 'express';
import { z } from 'zod';

export const userSchema = z.object({
  body: z.object({
    id: z.number(),
    email: z
      .string({ required_error: 'An email is required' })
      .email({ message: 'Invalid email address' }),
    /*Dates are in YYYY-MM-DD format */
    password: z
      .string({ required_error: 'A password is reuiquired' })
      .min(8, 'Password is too short. Needs to be at least 8 characters'),
    dob: z
      .date()
      .refine(
        (dob) => {
          //Ensures the date is in the past
          const dateOfBirth = new Date(dob);
          const today = new Date();
          return dateOfBirth < today;
        },
        { message: 'Date of birth must be in the past' },
      )
      .optional(),
    gender: z.enum(['m', 'f']).optional(),
  }),
});
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'An email is required' })
      .email({ message: 'Invalid email address' }),
  }),
});
export type UserType = z.infer<typeof userSchema>['body'];

export interface AuthenticatedRequest extends Request {
  user: UserType | undefined;
}
