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

// TODO: create a base token payload schema and have the other schemas extend it

export const RefreshTokenPayloadSchema = z.object({
  /** The user ID of the user the token is for */
  userId: z.string(),
  /** When the token was created */
  iat: z.number(),
  /** The token's unique identifier. */
  jti: z.string(),
  /** The tokne's generation id */
  generationId: z.string(),
  /** The type of the token */
  type: z.literal(TokenTypeSchema.enum.REFRESH),
  /** The expiration time of the tokne */
  exp: z.number(),
});

export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

export const AccessTokenPayloadSchema = z.object({
  /** The user ID of the user the token is for */
  userId: z.string(),
  /** The email of the user the token is for */
  email: z.string(),
  /** The token's unique identifier. */
  jti: z.string(),
  /** The refresh token used to generate this access token's identifier */
  refreshJti: z.string(),
  /** When the token was created */
  iat: z.number(),
  /** The tokne's generation id */
  generationId: z.string(),
  /** The type of the token */
  type: z.literal(TokenTypeSchema.enum.ACCESS),
  /** The expiration time of the tokne */
  exp: z.number(),
  // TODO: include household access and role
});

export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;

export const IDTokenPayloadSchema = z.object({
  /** The user ID of the user the token is for */
  userId: z.string(),
  /** The user's email */
  email: z.string().email(),
  /** The type of the token */
  type: z.literal(TokenTypeSchema.enum.ID),
  /** The expiration time of the tokne */
  exp: z.number(),
  /** The tokne's generation id */
  generationId: z.string(),
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
