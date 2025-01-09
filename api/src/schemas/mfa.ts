import { z } from 'zod';

export const mfaTokenSchema = z
  .string()
  .min(6)
  .max(6)
  .regex(/^\d+$/, 'Must contain only numeric characters');

export type MFAToken = z.infer<typeof mfaTokenSchema>;
