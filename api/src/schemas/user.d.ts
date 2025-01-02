import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const UserSchema = z.object({
  /** MongoDB ObjectID */
  _id: z.coerce.string().refine((val) => ObjectIdisValid(val), {
    message: 'Invalid ObjectID',
  }),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

export class InvalidUserError extends Error {
  constructor(string?: message) {
    super(`Invalid User${message ? `: ${message}` : ''}`);
    this.name = 'InvalidUserError';
    Object.setPrototypeOf(this, InvalidUserError.prototype);
  }
}
