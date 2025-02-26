import { Request } from 'express';
import { z } from 'zod';
import { AccessTokenUser } from './tokens';

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenUser | undefined;
  deviceId?: string | undefined;
}

export const mfaFormattedKeySchema = z.string();
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

const bigIntTransormed = z
  .union([z.string(), z.bigint()])
  .transform((val) => (typeof val === 'string' ? BigInt(val) : val));

export const srpSessionSchema = z.object({
  /** the session id */
  sessionId: z.string(),
  /** The user's salt */
  salt: z.string(),
  /** The user's verifier */
  verifier: z.string(),
  // TODO: add bigint validation in schema
  /* Server private key */
  b: bigIntTransormed,
  /* Server public key */
  B: bigIntTransormed,
  /* Client public key */
  A: bigIntTransormed.optional(),
});

export type SRPSession = z.infer<typeof srpSessionSchema>;

export const srpSessionJSONSchema = srpSessionSchema.extend({
  b: bigIntTransormed.transform((val) => `0x${val.toString(16)}`),
  B: bigIntTransormed.transform((val) => `0x${val.toString(16)}`),
  A: bigIntTransormed.transform((val) => `0x${val.toString(16)}`).optional(),
  createdAt: z.coerce.date(),
});
export type SRPJSONSession = z.infer<typeof srpSessionJSONSchema>;

/* Error types */

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
