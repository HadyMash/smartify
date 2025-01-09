import { z } from 'zod';

export const JWTSecretSchema = z.object({
  /** The secret to sign the JWT with */
  secret: z.string(),
  /** The ID of the secret */
  secretId: z.string(),
});

export type JWTSecret = z.infer<typeof JWTSecretSchema>;

export const TokenTypeSchema = z.enum(['ACCESS', 'REFRESH', 'ID']);

export type TokenType = z.infer<typeof TokenTypeSchema>;

export const TokenPayloadSchema = z.object({
  /** The user ID of the user the token is for */
  userId: z.string(),
  /** When the token was created */
  iat: z.number(),
  /** The token's generation id */
  generationId: z.string(),
  /** The expiration time of the token */
  exp: z.number(),
  /** The type of the token */
  type: TokenTypeSchema,
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;

export const RefreshTokenPayloadSchema = TokenPayloadSchema.extend({
  /** The token's unique identifier. */
  jti: z.string(),
  /** The token's generation id */
  generationId: z.string(),
  /** The type of the token */
  type: z.literal(TokenTypeSchema.enum.REFRESH),
});

export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

export const AccessTokenPayloadSchema = RefreshTokenPayloadSchema.extend({
  /** The email of the user the token is for */
  email: z.string(),
  /** The refresh token used to generate this access token's identifier */
  refreshJti: z.string(),
  /** The type of the token */
  type: z.literal(TokenTypeSchema.enum.ACCESS),
  // TODO: include household access and role
});

export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;

export const IDTokenPayloadSchema = TokenPayloadSchema.extend({
  name: z.string(),
  /** The user's email */
  email: z.string().email(),
  /** The type of the token */
  type: z.literal(TokenTypeSchema.enum.ID),
});

export type IDTokenPayload = z.infer<typeof IDTokenPayloadSchema>;

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
