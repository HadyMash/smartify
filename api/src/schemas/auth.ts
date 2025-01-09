import { Request } from 'express';
import { z } from 'zod';

export const requestUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  // ...
});

type RequestUser = z.infer<typeof requestUserSchema>;

// TODO: replace with actual user object
export interface AuthenticatedRequest extends Request {
  user?: RequestUser | undefined;
}
