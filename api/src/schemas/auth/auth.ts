import { Request } from 'express';
import { z } from 'zod';
import { AccessTokenUser } from './tokens';
import { objectIdOrStringSchema, objectIdStringSchema } from '../obj-id';
import { emailSchema } from './user';

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
  /** The user's id */
  userId: objectIdOrStringSchema,
  /** The user's email */
  email: emailSchema,
  /** The user's salt */
  salt: z.string(),
  /** the user's verifier */
  verifier: bigIntTransormed,
  /** Server private key */
  b: bigIntTransormed,
  /** Server public key */
  B: bigIntTransormed,
  /** MFA formatted key */
  mfaFormattedKey: mfaFormattedKeySchema,
  /** Whether the user's mfa has been setup and confirmed */
  mfaConfirmed: z.boolean(),
});

export type SRPSession = z.infer<typeof srpSessionSchema>;

export const SRPJSONSessionSchema = z.object({
  /** the user's id */
  userId: objectIdStringSchema,
  /** The user's email */
  email: emailSchema,
  /** The datetime the session was created */
  createdAt: z.coerce.date().transform((val) => val.toISOString()),
  /** The user's salt */
  salt: z.string(),
  /** the user's verifier */
  verifier: bigIntTransormed.transform((val) => `0x${val.toString(16)}`),
  /** Server private key */
  b: bigIntTransormed.transform((val) => `0x${val.toString(16)}`),
  /** Server public key */
  B: bigIntTransormed.transform((val) => `0x${val.toString(16)}`),
  /** MFA formatted key */
  mfaFormattedKey: mfaFormattedKeySchema,
  /** Whether the user's mfa has been setup and confirmed */
  mfaConfirmed: z.boolean(),
});

export type SRPJSONSession = z.infer<typeof SRPJSONSessionSchema>;

export const SRPMongoSessionSchema = SRPJSONSessionSchema.extend({
  createdAt: z.coerce.date(),
});

export type SRPMongoSession = z.infer<typeof SRPMongoSessionSchema>;

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

export class AuthSessionError extends Error {
  constructor() {
    super('Authentication Session Error');
    this.name = 'AuthSessionError';
    Object.setPrototypeOf(this, AuthSessionError.prototype);
  }
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super('Incorrect Password');
    this.name = 'IncorrectPasswordError';
    Object.setPrototypeOf(this, IncorrectPasswordError.prototype);
  }
}
