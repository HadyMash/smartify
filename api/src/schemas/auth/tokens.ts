import { z } from 'zod';

export const jwtSecretSchema = z.object({
  /** The secret to sign the JWT with */
  secret: z.string(),
  /** The ID of the secret */
  secretId: z.string(),
});

export type JWTSecret = z.infer<typeof jwtSecretSchema>;

export const tokenTypeSchema = z.enum(['ACCESS', 'REFRESH', 'ID']);

export type TokenType = z.infer<typeof tokenTypeSchema>;

export const tokenPayloadSchema = z.object({
  /** The user ID of the user the token is for */
  userId: z.string(),
  /** When the token was created */
  iat: z.number(),
  /** The token's generation id */
  generationId: z.string(),
  /** The expiration time of the token */
  exp: z.number(),
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

export const accessTokenPayloadSchema = refreshTokenPayloadSchema.extend({
  /** The email of the user the token is for */
  email: z.string(),
  /** The refresh token used to generate this access token's identifier */
  refreshJti: z.string().min(1),
  /** The type of the token */
  type: z.literal(tokenTypeSchema.enum.ACCESS),
  // TODO: include household access and role
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

export const idTokenPayloadSchema = tokenPayloadSchema.extend({
  /** The user's name */
  name: z.string(),
  /** The user's email */
  email: z.string().email(),
  /** The type of the token */
  type: z.literal(tokenTypeSchema.enum.ID),
});

export type IDTokenPayload = z.infer<typeof idTokenPayloadSchema>;

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
