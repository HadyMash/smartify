import * as jwt from 'jsonwebtoken';
import { compactDecrypt, CompactEncrypt, importJWK } from 'jose';
import { DatabaseService } from '../db/db';
import {
  AccessTokenPayload,
  accessTokenPayloadSchema,
  accessTokenUserSchema,
  CommonTokenInfo,
  IDTokenPayload,
  idTokenPayloadSchema,
  InvalidTokenError,
  JWTSecret,
  MFATokenPayload,
  mfaTokenPayloadSchema,
  mfaTokenTypeSchema,
  RefreshTokenPayload,
  refreshTokenPayloadSchema,
  tokenTypeSchema,
} from '../../schemas/auth/tokens';
import {
  InvalidUserError,
  InvalidUserType,
  User as UserWithId,
  userSchema,
} from '../../schemas/auth/user';
import { randomUUID } from 'crypto';
import { ObjectIdOrString } from '../../schemas/obj-id';
import { MFAFormattedKey } from '../../schemas/auth/auth';

export class TokenService {
  private static _ACCESS_TOKEN_LIFESPAN_SECONDS: number;
  private static _REFRESH_TOKEN_LIFESPAN_SECONDS: number;
  private static _MFA_TOKEN_LIFESPAN_SECONDS: number;

  public static get ACCESS_TOKEN_LIFESPAN_SECONDS(): number {
    if (this._ACCESS_TOKEN_LIFESPAN_SECONDS === undefined) {
      this._ACCESS_TOKEN_LIFESPAN_SECONDS = parseInt(
        process.env.AUTH_TOKEN_ACCESS_EXPIRY_SECONDS!,
      );
    }
    if (isNaN(this._ACCESS_TOKEN_LIFESPAN_SECONDS)) {
      throw new Error(
        `Invalid access token expiry time: ${process.env.AUTH_TOKEN_ACCESS_EXPIRY_SECONDS}`,
      );
    }

    return this._ACCESS_TOKEN_LIFESPAN_SECONDS;
  }

  public static get REFRESH_TOKEN_LIFESPAN_SECONDS(): number {
    if (this._REFRESH_TOKEN_LIFESPAN_SECONDS === undefined) {
      this._REFRESH_TOKEN_LIFESPAN_SECONDS = parseInt(
        process.env.AUTH_TOKEN_REFRESH_EXPIRY_SECONDS!,
      );
    }

    if (isNaN(this._REFRESH_TOKEN_LIFESPAN_SECONDS)) {
      throw new Error(
        `Invalid refresh token expiry time: ${process.env.AUTH_TOKEN_REFRESH_EXPIRY_SECONDS}`,
      );
    }

    return this._REFRESH_TOKEN_LIFESPAN_SECONDS;
  }

  public static get MFA_TOKEN_LIFESPAN_SECONDS(): number {
    if (this._MFA_TOKEN_LIFESPAN_SECONDS === undefined) {
      this._MFA_TOKEN_LIFESPAN_SECONDS = parseInt(
        process.env.AUTH_TOKEN_MFA_EXPIRY_SECONDS!,
      );
    }

    if (isNaN(this._MFA_TOKEN_LIFESPAN_SECONDS)) {
      throw new Error(
        `Invalid MFA token expiry time: ${process.env.AUTH_TOKEN_MFA_EXPIRY_SECONDS}`,
      );
    }
    return this._MFA_TOKEN_LIFESPAN_SECONDS;
  }

  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  private async encryptToken(token: string): Promise<string> {
    const key = await importJWK(
      {
        kty: 'oct',
        k: process.env.JWT_ENCRYPTION_KEY!,
      },
      'A256GCM',
    );

    const enc = new CompactEncrypt(
      new TextEncoder().encode(token),
    ).setProtectedHeader({ alg: 'dir', enc: 'A256GCM' });

    return await enc.encrypt(key);
  }

  private async decryptToken(token: string): Promise<string> {
    const key = await importJWK(
      {
        kty: 'oct',
        k: process.env.JWT_ENCRYPTION_KEY!,
      },
      'A256GCM',
    );

    const { plaintext } = await compactDecrypt(token, key);
    return new TextDecoder().decode(plaintext);
  }

  /**
   * Generate a signed JWT token
   * @param payload - The payload to include in the JWT
   * @param secret - The secret key to sign the JWT with
   * @param lifetime {}- The lifeimte of the token in seconds
   * @param encrypt - Whether to encrypt the token
   * @returns The generated JWT
   */
  private async generateToken<T extends CommonTokenInfo>(
    payload: Omit<T, 'exp'>,
    secret: JWTSecret,
    lifetime: number,
    encrypt: boolean,
  ): Promise<string> {
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload,
        secret.secret,
        {
          keyid: secret.secret,
          //algorithm,
          expiresIn: lifetime,
        },
        (err: Error | null, token: string | undefined) => {
          if (err) reject(err);
          else resolve(token!);
        },
      );
    });

    // Only encrypt if specified
    return encrypt ? await this.encryptToken(token) : token;
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
    return await this.generateToken(
      payload,
      secret,
      TokenService.REFRESH_TOKEN_LIFESPAN_SECONDS,
      true, // Always encrypt refresh tokens
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
    return await this.generateToken(
      payload,
      secret,
      TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS,
      true, // Always encrypt access tokens
    );
  }

  /**
   * Creates a new ID token with the provided payload. The ID token is only
   * intended for use on the client side; it should never be used for
   * any server-side operations.
   * @param payload - The ID token payload to include in the JWT
   * @param secret - The secret to sign the JWT with
   * @returns
   */
  private async generateIdToken(
    payload: Omit<IDTokenPayload, 'exp'>,
    secret: JWTSecret,
  ): Promise<string> {
    return await this.generateToken(
      payload,
      secret,
      TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS,
      false, // don't encrypt so the client can read it
    );
  }

  /**
   * Generates all the tokens for a user if they exist
   * @param user - The user to generate tokens for
   * @param deviceId - The device ID to generate the tokens for
   * @returns The generated tokens
   */
  public async generateAllTokens(userId: ObjectIdOrString, deviceId: string) {
    const secret: JWTSecret = {
      secret: process.env.JWT_SECRET!, // TODO: generate random one
      secretId: '1', // TODO: rotate keys and store in DB
    };

    await this.db.connect();
    // check user exists
    const userExists = await this.db.userRepository.userExists(userId);

    if (!userExists) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }

    //  user._id,
    //  true

    const generationId = await this.db.tokenRepository.getUserTokenGenerationId(
      userId,
      deviceId,
      true,
    );

    // get the user
    const userInfo = await this.db.userRepository.getUserById(userId);
    // TODO: get resources user can access
    const user = accessTokenUserSchema.parse(userInfo);

    const created = new Date();
    // convert created to a number of seconds
    const createdSeconds = Math.floor(created.getTime() / 1000);

    const refreshTokenPayload: Omit<RefreshTokenPayload, 'exp'> = {
      userId: userId.toString(),
      iat: createdSeconds,
      type: tokenTypeSchema.enum.REFRESH,
      jti: randomUUID(),
      generationId,
    };

    const accessTokenPayload: Omit<AccessTokenPayload, 'exp'> = {
      userId: userId.toString(),
      user,
      iat: createdSeconds,
      type: tokenTypeSchema.enum.ACCESS,
      jti: randomUUID(),
      refreshJti: refreshTokenPayload.jti,
      generationId,
    };

    const idTokenPayload: Omit<IDTokenPayload, 'exp'> = {
      userId: userId.toString(),
      user,
      type: tokenTypeSchema.enum.ID,
      generationId,
      iat: createdSeconds,
      name: 'John Doe',
    };

    const [refreshToken, accessToken, idToken] = await Promise.all([
      this.generateRefreshToken(refreshTokenPayload, secret),
      this.generateAccessToken(accessTokenPayload, secret),
      this.generateIdToken(idTokenPayload, secret),
    ]);

    return {
      refreshToken,
      accessToken,
      idToken,
    };
  }

  /**
   * Parse an auth tokens payload. This method will throw an error if the token
   * is invalid or is not a valid token type. Token payload is guaranteed to be
   * of it's respective type if it doesn't throw an error.
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

    const type: unknown = payload?.type;

    const validType = tokenTypeSchema.safeParse(type);

    if (!validType.success) {
      throw new InvalidTokenError(
        `Invalid token type: ${validType.error.message}`,
      );
    }

    switch (validType.data) {
      case tokenTypeSchema.enum.ACCESS: {
        const accessParseResult = accessTokenPayloadSchema.safeParse(payload);

        if (!accessParseResult.success) {
          throw new InvalidTokenError(
            `Invalid token payload: ${accessParseResult.error.message}`,
          );
        }

        const accessTokenPayload: AccessTokenPayload = accessParseResult.data;
        return accessTokenPayload;
      }
      case tokenTypeSchema.enum.REFRESH: {
        const refreshParseResult = refreshTokenPayloadSchema.safeParse(payload);

        if (!refreshParseResult.success) {
          throw new InvalidTokenError(
            `Invalid token payload: ${refreshParseResult.error.message}`,
          );
        }

        const refreshTokenPayload: RefreshTokenPayload =
          refreshParseResult.data;
        return refreshTokenPayload;
      }
      case tokenTypeSchema.enum.ID: {
        const idParseResult = idTokenPayloadSchema.safeParse(payload);

        if (!idParseResult.success) {
          throw new InvalidTokenError(
            `Invalid token payload: ${idParseResult.error.message}`,
          );
        }

        const idTokenPayload: IDTokenPayload = idParseResult.data;
        return idTokenPayload;
      }
    }
  }

  /**
   * Decode an auth token and get it's payload. This does not check if it's valid
   * @param token - The token to decode
   * @returns The token's payload
   * @throws An error if the token is invalid or is not a valid token type
   */
  private async decodeToken(
    token: string,
  ): Promise<AccessTokenPayload | RefreshTokenPayload | IDTokenPayload> {
    // Decrypt the token first
    return this.decryptToken(token).then((decryptedToken) => {
      const payload = jwt.decode(decryptedToken);
      return this.parseToken(payload);
    });
  }

  /**
   * Verifies a token and decodes it. This method doesn't cross check the
   * token's generation id.
   *
   * @param token - The token to verify and decode
   * @param encrypted - Whether the token is encrypted
   * @returns A boolean indicating if the token is valid and the token's payload. The payload is undefined if the token is invalid but is defined if the token is valid
   */
  public async verifyToken(
    token: string,
    encrypted: boolean,
  ): Promise<{
    valid: boolean;
    payload?: AccessTokenPayload | RefreshTokenPayload | IDTokenPayload;
  }> {
    try {
      // Decrypt the token first
      const decryptedToken = encrypted ? await this.decryptToken(token) : token;

      // Verify the decrypted token
      const result = await new Promise<string | jwt.JwtPayload | null>(
        (resolve, reject) => {
          jwt.verify(
            decryptedToken,
            process.env.JWT_SECRET!,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err: Error | null, decoded: any) => {
              if (err) reject(err);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              else resolve(decoded);
            },
          );
        },
      );

      const payload = this.parseToken(result);

      await this.db.connect();
      // check token generation ID isn't blacklisted
      const blacklisted =
        await this.db.tokenRepository.isTokenGenerationIdBlacklisted(
          payload.generationId,
        );
      if (blacklisted) {
        return { valid: false };
      }

      // For access tokens, also check if the specific token is blacklisted
      if (payload.type === tokenTypeSchema.enum.ACCESS) {
        const tokenBlacklisted =
          await this.db.accessBlacklistRepository.isAccessTokenBlacklisted(
            payload.jti,
          );
        if (tokenBlacklisted) {
          return { valid: false };
        }
      }

      return { valid: true, payload };
    } catch (_) {
      return { valid: false };
    }
  }

  // TODO: implement token rotation
  /**
   * Refresh the user's tokens
   * @param oldRefreshToken - The refresh token to use to generate a new access
   * token
   * @param deviceId - The device ID to generate the new access token for
   * @returns new tokens. Only the access token is guaranteed to be returned if
   * the method returns. The others might be undefined if their generation
   * fails.
   * @throws an {@link InvalidTokenError} if the refresh token is invalid
   * @throws an {@link InvalidUserError} if the user is invalid
   */
  public async refreshTokens(
    oldRefreshToken: string,
    deviceId: string,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
  }> {
    // validate the refresh token
    const { valid, payload: oldRefreshPayload } = await this.verifyToken(
      oldRefreshToken,
      true,
    );

    // check we have a valid payload
    if (
      !valid ||
      !oldRefreshPayload ||
      oldRefreshPayload.type !== tokenTypeSchema.enum.REFRESH
    ) {
      throw new InvalidTokenError();
    }

    // check the refresh token hasn't been revoked
    const currGenId = await this.db.tokenRepository.getUserTokenGenerationId(
      oldRefreshPayload.userId,
      deviceId,
      false,
    );

    if (!currGenId || currGenId !== oldRefreshPayload.generationId) {
      throw new InvalidTokenError();
    }

    // TODO: replace with user service call
    //
    // get user's email

    await this.db.connect();
    const userDoc = await this.db.userRepository.getUserById(
      oldRefreshPayload.userId,
    );
    let user: UserWithId;
    try {
      user = userSchema.parse(userDoc);
    } catch (e) {
      console.log('error parsing user:', e);
      throw new InvalidUserError();
    }

    // TODO: get user household access and roles

    const accessUser = accessTokenUserSchema.parse(user);

    const created = new Date();
    // convert created to a number of seconds
    const createdSeconds = Math.floor(created.getTime() / 1000);

    const refreshTokenPayload: Omit<RefreshTokenPayload, 'exp'> = {
      userId: oldRefreshPayload.userId,
      iat: createdSeconds,
      type: tokenTypeSchema.enum.REFRESH,
      jti: randomUUID(),
      generationId: oldRefreshPayload.generationId,
    };

    const accessTokenPayload: Omit<AccessTokenPayload, 'exp'> = {
      userId: oldRefreshPayload.userId,
      user: accessUser,
      iat: createdSeconds,
      type: tokenTypeSchema.enum.ACCESS,
      jti: randomUUID(),
      refreshJti: refreshTokenPayload.jti,
      generationId: oldRefreshPayload.generationId,
    };

    const idTokenPayload: Omit<IDTokenPayload, 'exp'> = {
      userId: oldRefreshPayload.userId,
      user: accessUser,
      type: tokenTypeSchema.enum.ID,
      generationId: oldRefreshPayload.generationId,
      iat: createdSeconds,
      name: 'John Doe',
    };

    // ! temp
    const secret: JWTSecret = {
      secret: process.env.JWT_SECRET!, // TODO: generate random one
      secretId: '1', // TODO: rotate keys and store in DB
    };

    const [refreshToken, accessToken, idToken] = await Promise.all([
      this.generateRefreshToken(refreshTokenPayload, secret).catch((e) => {
        console.error('error generating refresh token:', e);
        return undefined;
      }),
      this.generateAccessToken(accessTokenPayload, secret),
      this.generateIdToken(idTokenPayload, secret).catch((e) => {
        console.error('error generating refresh token:', e);
        return undefined;
      }),
    ]);

    return {
      refreshToken,
      accessToken,
      idToken,
    };
  }

  // TODO: implement per device token generation
  // TODO: implement access only blacklist to avoid signing out but refresh permissions

  /**
   * Revoke a particular device's refresh tokens by changing it's generation ID.
   * This will invalidate using the revoked generation ids. However, the access
   * tokens may still be used as methods may not cross check the generation id
   *
   * It's also important to note that the verify method will still return true,
   * however, that shouldn't be a problem as the refresh token is only used to
   * generate new access tokens, and the generate new access token method will
   * check the current generation id.
   *
   * @param userId - The user for whom to revoke token generation
   * @param deviceId - The device ID to revoke tokens for
   * @returns the user's new token generation ID
   */
  public async revokeDeviceRefreshTokens(
    userId: ObjectIdOrString,
    deviceId: string,
  ) {
    await this.db.connect();
    return await this.db.tokenRepository.changeUserTokenGenerationId(
      userId,
      deviceId,
    );
  }

  /**
   * Revoke all tokens for a user. This will invalidate all refresh tokens and
   * all access tokens generated with them. Additionally, it will add the user's
   * token generation ID to the blacklist, preventing access tokens from being
   * used as well.
   *
   * This method should be used for security-sensitive operations, such as when
   * a user changes their password, being removed from a household, etc. as it
   * will sign the user out of all devices.
   *
   * @param userId - The user for whom to revoke all tokens
   */
  public async revokeAllTokensImmediately(userId: ObjectIdOrString) {
    await this.db.connect();
    // add to blacklist
    await this.db.tokenRepository.blacklistTokenGenerationIds(userId);
  }

  /**
   * Blacklist a specific access token. This will prevent the token from being used
   * for any future requests, but won't affect other tokens generated with the same
   * refresh token.
   *
   * This is useful for scenarios where you want to revoke a single access token
   * without affecting other sessions, such as when a user logs out of a specific device.
   *
   * @param accessToken - The access token to blacklist
   * @returns Promise that resolves when the token has been blacklisted
   * @throws InvalidTokenError if the token is invalid or not an access token
   */
  public async blacklistAccessToken(accessToken: string): Promise<void> {
    // Verify and decode the token
    const { valid, payload } = await this.verifyToken(accessToken, true);

    if (!valid || !payload) {
      throw new InvalidTokenError('Invalid access token');
    }

    // Ensure it's an access token
    if (payload.type !== tokenTypeSchema.enum.ACCESS) {
      throw new InvalidTokenError('Token is not an access token');
    }

    // Get expiry time from the payload
    const exp = (payload as jwt.JwtPayload).exp;
    if (!exp) {
      throw new InvalidTokenError('Token has no expiry time');
    }
    await this.db.connect();

    // Blacklist the token
    await this.db.accessBlacklistRepository.blacklistAccessToken(
      payload.jti,
      exp,
    );
  }

  /**
   * Creates a new MFA token with the provided payload
   * @param payload - The MFA token payload to include in the JWT
   * @param secret - The secret to sign the JWT with
   * @returns The generated MFA token
   */
  private async generateMFAToken(
    payload: Omit<MFATokenPayload, 'exp'>,
    secret: JWTSecret,
  ): Promise<string> {
    return await this.generateToken(
      payload,
      secret,
      TokenService.MFA_TOKEN_LIFESPAN_SECONDS,
      true, // Always encrypt MFA tokens
    );
  }

  /**
   * Creates a new MFA token for a user
   * @param userId - The user's ID to create the token for
   * @param deviceId - The device ID to create the token for
   * @param formattedKey - The user's mfa formatted key
   * @returns The generated MFA token
   */
  public async createMFAToken(
    userId: ObjectIdOrString,
    deviceId: string,
    formattedKey?: MFAFormattedKey,
  ): Promise<string> {
    const created = new Date();
    const createdSeconds = Math.floor(created.getTime() / 1000);

    const mfaTokenPayload: Omit<MFATokenPayload, 'exp'> = {
      type: 'MFA',
      userId: userId.toString(),
      deviceId,
      iat: createdSeconds,
      jti: randomUUID(),
      formattedKey,
    };

    const secret: JWTSecret = {
      secret: process.env.JWT_SECRET!, // TODO: generate random one
      secretId: '1', // TODO: rotate keys and store in DB
    };

    return await this.generateMFAToken(mfaTokenPayload, secret);
  }

  /**
   * Verify and decode an MFA token. This method will automatically blacklist
   * the MFA token if it's valid so that it can't be used again
   * @param token - The MFA token to verify
   * @returns The decoded token payload if valid
   * @throws InvalidTokenError if the token is invalid or has been blacklisted
   */
  public async verifyMFAToken(token: string): Promise<MFATokenPayload> {
    // Decrypt the token first
    const decryptedToken = await this.decryptToken(token);

    // Verify the decrypted token
    const result = await new Promise<string | jwt.JwtPayload | null>(
      (resolve, reject) => {
        jwt.verify(
          decryptedToken,
          process.env.JWT_SECRET!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err: Error | null, decoded: any) => {
            if (err) reject(err);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            else resolve(decoded);
          },
        );
      },
    );

    const { success, data } = mfaTokenPayloadSchema.safeParse(result);

    if (!success) {
      throw new InvalidTokenError('Invalid MFA token');
    }

    if (data.type !== mfaTokenTypeSchema.value) {
      throw new InvalidTokenError('Token is not an MFA token');
    }

    await this.db.connect();
    // check token generation ID isn't blacklisted
    const blacklisted =
      await this.db.mfaBlacklistRepository.isMFATokenBlacklisted(data.jti);
    if (blacklisted) {
      throw new InvalidTokenError('MFA token has been blacklisted');
    }

    // valid, blacklist so it can't be used again
    await this.blacklistMFAToken(data);

    return data;
  }

  /**
   * Blacklist an MFA token to prevent it from being used again
   * @param token - The MFA token to blacklist
   */
  private async blacklistMFAToken(token: MFATokenPayload): Promise<void> {
    const exp = token.exp;
    if (!exp) {
      throw new InvalidTokenError('Token has no expiry time');
    }
    await this.db.connect();

    await this.db.mfaBlacklistRepository.blacklistMFA(token.jti, exp);
  }
}
