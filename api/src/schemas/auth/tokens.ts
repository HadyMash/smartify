import { z } from 'zod';
import { userWithIdSchema } from './user';
import { mfaFormattedKeySchema } from './auth';
import { memberSchema } from '../household';

export const jwtSecretSchema = z.object({
  /** The secret to sign the JWT with */
  secret: z.string(),
  /** The ID of the secret */
  secretId: z.string(),
});

export type JWTSecret = z.infer<typeof jwtSecretSchema>;

export const tokenTypeSchema = z.enum(['ACCESS', 'REFRESH', 'ID']);

export type TokenType = z.infer<typeof tokenTypeSchema>;

export const mfaTokenTypeSchema = z.literal('MFA');

export type MFATokenType = z.infer<typeof mfaTokenTypeSchema>;

export const commonTokenInfoSchema = z.object({
  /** The user ID of the user the token is for */
  userId: z.string(),
  /** When the token was created */
  iat: z.number(),
  /** The expiration time of the token */
  exp: z.number(),
});

export type CommonTokenInfo = z.infer<typeof commonTokenInfoSchema>;

export const tokenPayloadSchema = commonTokenInfoSchema.extend({
  /** The token's generation id */
  generationId: z.string(),
  /** The type of the token */
  type: tokenTypeSchema,
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

export const refreshTokenPayloadSchema = tokenPayloadSchema.extend({
  /** The token's unique identifier. */
  jti: z.string().min(1),
  /** The token's generation id */
  generationId: z.string(),
  /** The type of the token */
  type: z.literal(tokenTypeSchema.enum.REFRESH),
});

export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

export const accessTokenUserSchema = userWithIdSchema.extend({
  /** The households the user is a member of and their access permissions
   * The key is the household id and entry is their access permissions
   */
  households: z.record(memberSchema),
});
export type AccessTokenUser = z.infer<typeof accessTokenUserSchema>;

export const accessTokenPayloadSchema = refreshTokenPayloadSchema.extend({
  /** The user */
  user: accessTokenUserSchema,
  /** The refresh token used to generate this access token's identifier */
  refreshJti: z.string().min(1),
  /** The type of the token */
  type: z.literal(tokenTypeSchema.enum.ACCESS),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

export const idTokenPayloadSchema = tokenPayloadSchema.extend({
  /** The user's name */
  name: z.string(),
  /** The user */
  user: accessTokenUserSchema,
  /** The type of the token */
  type: z.literal(tokenTypeSchema.enum.ID),
});

export type IDTokenPayload = z.infer<typeof idTokenPayloadSchema>;

// mfa token
export const mfaTokenPayloadSchema = commonTokenInfoSchema.extend({
  /** The token's type */
  type: mfaTokenTypeSchema,
  /** The token's unique identifier. */
  jti: z.string().min(1),
  /** The device ID of the device the token is for */
  deviceId: z.string().min(1),
  /** MFA formatted key */
  formattedKey: mfaFormattedKeySchema.optional(),
});

export type MFATokenPayload = z.infer<typeof mfaTokenPayloadSchema>;

/**
 * An error that is thrown when a token is invalid or malformed
 */
export class InvalidTokenError extends Error {
  constructor(message?: string) {
    super(`Invalid token${message ? `: ${message}` : ''}`);
    this.name = 'InvalidTokenError';
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}
