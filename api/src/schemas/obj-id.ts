import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const objectIdSchema = z.coerce
  .string()
  .refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectID',
  });
