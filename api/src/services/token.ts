import assert from 'assert';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import {
  InvalidUserError,
  InvalidUseType,
  type User,
  UserSchema,
} from '../schemas/user';
import {
  type AccessTokenPayload,
  AccessTokenPayloadSchema,
  type IDTokenPayload,
  IDTokenPayloadSchema,
  InvalidTokenError,
  type JWTSecret,
  type RefreshTokenPayload,
  RefreshTokenPayloadSchema,
  type TokenType,
  TokenTypeSchema,
} from '../schemas/tokens';
import { DatabaseService } from './db/db';

//const algorithm = 'RS256';

// TODO: make jwt operations async
export class TokenService {
  private readonly ACCESS_TOKEN_LIFESPAN_SECONDS: number;
  private readonly REFRESH_TOKEN_LIFESPAN_SECONDS: number;

  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();

    this.ACCESS_TOKEN_LIFESPAN_SECONDS = parseInt(
      process.env.AUTH_TOKEN_ACCESS_EXPIRY_SECONDS!,
    );
    this.REFRESH_TOKEN_LIFESPAN_SECONDS = parseInt(
      process.env.AUTH_TOKEN_REFRESH_EXPIRY_SECONDS!,
    );

    if (isNaN(this.ACCESS_TOKEN_LIFESPAN_SECONDS)) {
      throw new Error(
        `Invalid access token expiry time: ${process.env.AUTH_TOKEN_ACCESS_EXPIRY_SECONDS}`,
      );
    }

    if (isNaN(this.REFRESH_TOKEN_LIFESPAN_SECONDS)) {
      throw new Error(
        `Invalid refresh token expiry time: ${process.env.AUTH_TOKEN_REFRESH_EXPIRY_SECONDS}`,
      );
    }
  }

  /**
   * Generate a signed JWT token
   * @param payload - The payload to include in the JWT
   * @param secret - The secret key to sign the JWT with
   * @param lifetime {}- The lifeimte of the token in seconds
   * @returns The generated JWT
   */
  private generateToken(
    payload: any, // TODO: update payload to be a union of all the tokne types
    secret: JWTSecret,
    lifetime: number,
  ): string {
    const token = jwt.sign(payload, secret.secret, {
      keyid: secret.secret,
      //algorithm,
      expiresIn: lifetime,
    });

    // TODO: update method doc once encryuption is added
    // TODO: encrypt the token

    return token;
  }

  /**
   * Creates a new refresh token with the provided payload
   * @param payload - The refresh token's payload
   * @param secret - The secret to sign the JWT with
   * @returns A refresh token
   */
  private async generateRefreshToken(
    payload: Omit<RefreshTokenPayload, 'exp'>,
    secret: JWTSecret,
  ): Promise<string> {
    return this.generateToken(
      payload,
      secret,
      this.ACCESS_TOKEN_LIFESPAN_SECONDS,
    );
  }

  /**
   * Creates a new access token with the provided payload
   * @param payload - The accesse token payload to include in the JWT
   * @param secret - The secret to sign the JWT with
   * @param keyid - The
   * @returns The generated access token
   */
  private async generateAccessToken(
    payload: Omit<AccessTokenPayload, 'exp'>,
    secret: JWTSecret,
  ): Promise<string> {
    return this.generateToken(
      payload,
      secret,
      this.ACCESS_TOKEN_LIFESPAN_SECONDS,
    );
  }

  /**
   * Creates a new ID token with the provided payload
   * @param payload - The ID token payload to include in the JWT
   * @param secret - The secret to sign the JWT with
   * @returns
   */
  private generateIdToken(
    payload: Omit<IDTokenPayload, 'exp'>,
    secret: JWTSecret,
  ): string {
    return this.generateToken(
      payload,
      secret,
      this.ACCESS_TOKEN_LIFESPAN_SECONDS,
    );
  }

  /**
   * Generaters all the tokens for a user if they exist
   * @param user - The user to generate tokens for
   * @returns The generated tokens
   */
  public async generateAllTokens(user: User) {
    const secret: JWTSecret = {
      secret: process.env.JWT_SECRET!, // TODO: generate random one
      secretId: '1', // TODO: rotate keys and store in DB
    };

    // check user exists
    const userExists = await this.db.userRepository.userExists(user._id);

    if (!userExists) {
      throw new InvalidUserError({ type: InvalidUseType.DOES_NOT_EXIST });
    }

    //  user._id,
    //  true

    const generationId = await this.db.tokenRepository.getUserTokenGenerationId(
      user._id.toString(),
      this.ACCESS_TOKEN_LIFESPAN_SECONDS,
      true,
    );

    const created = new Date();
    // convert created to a number of seconds
    const createdSeconds = Math.floor(created.getTime() / 1000);

    const refreshTokenPayload: Omit<RefreshTokenPayload, 'exp'> = {
      userId: user._id,
      iat: createdSeconds,
      type: TokenTypeSchema.enum.REFRESH,
      jti: randomUUID(),
      generationId,
    };

    const accessTokenPayload: Omit<AccessTokenPayload, 'exp'> = {
      userId: user._id,
      email: user.email,
      iat: createdSeconds,
      type: TokenTypeSchema.enum.ACCESS,
      jti: randomUUID(),
      refreshJti: refreshTokenPayload.jti,
      generationId,
    };

    const idTokenPayload: Omit<IDTokenPayload, 'exp'> = {
      userId: user._id,
      email: user.email,
      type: TokenTypeSchema.enum.ID,
      generationId,
    };

    const [refreshToken, accessToken] = await Promise.all([
      this.generateRefreshToken(refreshTokenPayload, secret),
      this.generateAccessToken(accessTokenPayload, secret),
    ]);

    const idToken = this.generateIdToken(idTokenPayload, secret);

    return {
      refreshToken,
      accessToken,
      idToken,
    };
  }

  /**
   * Parse an auth tokens payload. This method will throw an error if the token is invalid or is not a valid token type. Token payload is guaranteed to be of it's repsective type if it doesn't throw an error.
   * @param payload - The token payload to parse
   * @returns The parsed token payload
   * @throws An error if the token is invalid or is not a valid token type
   */
  private parseToken(
    payload: string | jwt.JwtPayload | null,
  ): AccessTokenPayload | RefreshTokenPayload | IDTokenPayload {
    if (typeof payload === 'string' || payload === null) {
      throw new InvalidTokenError('Invalid token');
    }

    const type: any = payload?.type;

    const validType = TokenTypeSchema.safeParse(type);

    if (!validType.success) {
      throw new InvalidTokenError(
        `Invalid token type: ${validType.error.message}`,
      );
    }

    switch (validType.data) {
      case TokenTypeSchema.enum.ACCESS:
        const accessParseResult = AccessTokenPayloadSchema.safeParse(payload);

        if (!accessParseResult.success) {
          throw new InvalidTokenError(
            `Invalid token payload: ${accessParseResult.error.message}`,
          );
        }

        const accessTokenPayload: AccessTokenPayload = accessParseResult.data;
        return accessTokenPayload;
      case TokenTypeSchema.enum.REFRESH:
        const refreshParseResult = RefreshTokenPayloadSchema.safeParse(payload);

        if (!refreshParseResult.success) {
          throw new InvalidTokenError(
            `Invalid token payload: ${refreshParseResult.error.message}`,
          );
        }

        const refreshTokenPayload: RefreshTokenPayload =
          refreshParseResult.data;
        return refreshTokenPayload;
      case TokenTypeSchema.enum.ID:
        const idParseResult = IDTokenPayloadSchema.safeParse(payload);

        if (!idParseResult.success) {
          throw new InvalidTokenError(
            `Invalid token payload: ${idParseResult.error.message}`,
          );
        }

        const idTokenPayload: IDTokenPayload = idParseResult.data;
        return idTokenPayload;
    }
  }

  /**
   * Decode an auth token and get it's payload. This does not check if it's valid
   * @param token - The token to decode
   * @returns The token's payload
   * @throws An error if the token is invalid or is not a valid token type
   */
  private decodeToken(
    token: string,
  ): AccessTokenPayload | RefreshTokenPayload | IDTokenPayload {
    // TODO: decrypt the token

    // decode
    const payload = jwt.decode(token);

    // check it's not a string or null
    return this.parseToken(payload);
  }

  /**
   * Verifies a token and decodes it
   * @param token - The token to verify and decode
   * @returns A boolean indiciating if the token is valid and the token's payload. The payload is undefined if the token is invalid but is defined if the token is valid
   */
  public async verifyToken(token: string): Promise<{
    valid: boolean;
    payload?: AccessTokenPayload | RefreshTokenPayload | IDTokenPayload;
  }> {
    // TODO: decrypt the token

    // validate
    let result: string | jwt.JwtPayload | null = null;
    let payload: AccessTokenPayload | RefreshTokenPayload | IDTokenPayload;
    try {
      result = jwt.verify(token, process.env.JWT_SECRET!, {
        //algorithms: [algorithm],
      });

      payload = this.parseToken(result);

      // check token isn't blacklisted
      const blacklisted =
        await this.db.tokenRepository.isTokenGenerationIdBlacklisted(
          payload.generationId,
        );
      if (blacklisted) {
        return { valid: false };
      }
    } catch (_) {
      return { valid: false };
    }

    // parse and return
    return { valid: true, payload };
  }

  // TODO: implement token rotation
  /**
   * Refresh an access token using a refresh token
   * @param refreshToken - The refresh token to use to generate a new access token
   * @returns a new access token
   * @throws an {@link InvalidTokenError} if the refresh token is invalid
   * @throws an {@link InvalidUserError} if the user is invalid
   */
  public async refreshAccessToken(refreshToken: string) {
    // validate the refresh token
    const { valid, payload: refreshPayload } =
      await this.verifyToken(refreshToken);

    // check we have a valid payload
    if (
      !valid ||
      !refreshPayload ||
      refreshPayload.type !== TokenTypeSchema.enum.REFRESH
    ) {
      throw new InvalidTokenError();
    }

    // check the refresh token hasn't been revoked
    const currGenId = await this.db.tokenRepository.getUserTokenGenerationId(
      refreshPayload.userId,
      this.ACCESS_TOKEN_LIFESPAN_SECONDS,
      false,
    );

    if (!currGenId || currGenId !== refreshPayload.generationId) {
      throw new InvalidTokenError();
    }

    // get user's email
    const userDoc = await this.db.userRepository.getUserById(
      refreshPayload.userId,
    );
    let user: User;
    try {
      user = UserSchema.parse(userDoc);
    } catch (e) {
      console.log('error parsing user:', e);
      throw new InvalidUserError();
    }

    // TODO: get user household access and roles

    const payload: Omit<AccessTokenPayload, 'exp'> = {
      userId: refreshPayload.userId,
      email: user.email,
      iat: new Date().getTime() / 1000,
      type: TokenTypeSchema.enum.ACCESS,
      jti: randomUUID(),
      refreshJti: refreshPayload.jti,
      generationId: refreshPayload.generationId,
    };

    // ! temp
    const secret: JWTSecret = {
      secret: process.env.JWT_SECRET!, // TODO: generate random one
      secretId: '1', // TODO: rotate keys and store in DB
    };

    return this.generateAccessToken(payload, secret);
  }

  // TODO: implement per device token generation
  // TODO: implement access only blacklist to avoid signing out but refresh permissions

  /**
   * Change a user's token generation ID. This will invalidate old refresh tokens and all access tokens generated with it. However, the access token may still be used until it expires if an operation doesn't check the generation ID.
   * @param userId - The user for whom to revoke token generation
   * @returns the user's new token generation ID
   */
  public async revokeRefreshTokens(userId: string) {
    return await this.db.tokenRepository.changeUserTokenGenerationId(
      userId,
      this.ACCESS_TOKEN_LIFESPAN_SECONDS,
    );
  }

  /**
   * Revoke all tokens for a user. This will invalidate all refresh tokens and all access tokens generated with them. Additionally, it will add the user's token generation ID to the blacklist, preventing access tokens from being used as well.
   *
   * This method should be used for security-sensitive operations, such as when a user changes their password, being removed from a household, etc.
   * @param userId - The usre for whom to revoke all tokens
   */
  public async revokeAllTokensImmediately(userId: string) {
    // add to blacklist
    await this.db.tokenRepository.blacklistTokenGenerationId(
      userId,
      this.ACCESS_TOKEN_LIFESPAN_SECONDS,
    );
  }
}
