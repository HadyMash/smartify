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

export enum MFAErrorType {
  INCORRECT_CODE = 'INCORRECT_CODE',
  MFA_ALREADY_CONFIRMED = 'MFA_ALREADY_CONFIRMED',
  MFA_NOT_CONFIRMED = 'MFA_NOT_CONFIRMED',
}

export class MFAError extends Error {
  public readonly type: MFAErrorType;
  constructor(type: MFAErrorType) {
    super(`MFA ERROR: ${type}`);
    this.name = 'MFAError';
    Object.setPrototypeOf(this, MFAError.prototype);
    this.type = type;
  }
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super('Incorrect Password');
    this.name = 'IncorrectPasswordError';
    Object.setPrototypeOf(this, IncorrectPasswordError.prototype);
  }
}
