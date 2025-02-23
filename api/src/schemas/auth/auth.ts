import { Request } from 'express';
import { z } from 'zod';
import { AccessTokenUser } from './tokens';

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenUser | undefined;
  deviceId?: string | undefined;
}

const mfaFormattedKeySchema = z.string();
export type MFAFormattedKey = z.infer<typeof mfaFormattedKeySchema>;

/** The MFA Code */
export const mfaCodeSchema = z.coerce
  .string()
  .min(6)
  .max(6)
  .regex(/^\d+$/, 'Must contain only numeric characters');

/** The MFA Code */
export type MFACode = z.infer<typeof mfaCodeSchema>;

export const mfaSchema = z.object({
  formattedKey: mfaFormattedKeySchema,
  confirmed: z.boolean(),
});
export type MFA = z.infer<typeof mfaSchema>;

export class IncorrectMFACodeError extends Error {
  constructor() {
    super(`Incorrect MFA code`);
    this.name = 'IncorrectMFACode';
  }
}
