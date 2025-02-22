import assert from 'assert';
import { randomUUID } from 'crypto';
import { Collection, Db, ObjectId } from 'mongodb';
import { RedisClientType } from 'redis';
import { TokenService } from '../../auth/token';

/**
 * Document representing a blacklisted access token in the database
 */
interface BlacklistedAccessTokenDoc {
  /**
   * The JWT ID of the access token
   */
  jti: string;
  /**
   * When the token was blacklisted
   */
  created: Date;
  /**
   * When the token expires
   */
  expiry: Date;
}

/**
 * Document representing a blacklisted MFA token in the database
 */
interface BlacklistedMFAToken {
  /**
   * The JWT ID of the MFA token
   */
  jti: string;
  /**
   * When the token expires
   */
  expiry: Date;
}

/**
 * Token generation ID document. There may be multiple tokens per user/device.
 *
 * States:
 * - Current token: blacklisted=false, no expiry
 * - Previous tokens: blacklisted=false, has expiry
 * - Blacklisted tokens: blacklisted=true, has expiry
 */
interface TokenGenIdDoc {
  /**
   * The user who the token generation ID is for
   */
  userId: ObjectId;
  /**
   * The token generation ID
   */
  tokenGenerationId: string;
  /**
   * The device ID the token generation ID is for
   */
  deviceId: string;
  /**
   * When the generation id was created
   */
  created: Date;
  /**
   * When the generation id is set to expire
   */
  expiry?: Date | undefined;
  /**
   * If this generation id is blacklisted
   */
  blacklisted: boolean;
}

// TODO: integrate with token service to remove lifespan parameter

/* revoked access tokens are stored in redis (some sort of version
 * included in payload so if server crashes it invalidates all access tokens
 * that way no revoked access tokens get unrevoked) */
export class TokenRepository {
  protected readonly tokensCollection: Collection<TokenGenIdDoc>;
  protected readonly accessBlacklistCollection: Collection<BlacklistedAccessTokenDoc>;
  protected readonly mfaBlacklistCollection: Collection<BlacklistedMFAToken>;
  protected readonly redis: RedisClientType;

  protected static readonly TOKENS_COLLECTION_NAME = 'tokens';
  protected static readonly ACCESS_BLACKLIST_COLLECTION_NAME =
    'blacklisted_access_tokens';

  protected static readonly GENERATION_IDS_BLACKLIST_REDIS_KEY =
    'token-blacklist' as const;
  protected static readonly ACCESS_BLACKLIST_REDIS_KEY =
    'access-token-blacklist' as const;

  protected static readonly MFA_BLACKLIST_KEY = 'mfa-token-blacklist' as const;

  /**
   * @param db - The database to use
   * @param redis - The redis client to use
   * @param accessLifespanSeconds - The lifespan of an access token in seconds
   */
  constructor(db: Db, redis: RedisClientType) {
    this.tokensCollection = db.collection<TokenGenIdDoc>(
      TokenRepository.TOKENS_COLLECTION_NAME,
    );
    this.accessBlacklistCollection = db.collection<BlacklistedAccessTokenDoc>(
      TokenRepository.ACCESS_BLACKLIST_COLLECTION_NAME,
    );
    this.mfaBlacklistCollection = db.collection<BlacklistedMFAToken>(
      TokenRepository.MFA_BLACKLIST_KEY,
    );
    this.redis = redis;
  }

  /**
   * Generates a new token generation ID
   * @returns A new token generation ID
   */
  private generateTokenGenerationId(): string {
    return randomUUID();
  }

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID for which to get the token gen id
   * @param deviceId - The device ID for which to get the token gen id
   * @returns The user's token generation ID or null if it doesn't exist
   */
  public async getUserTokenGenerationId(
    userId: string,
    deviceId: string,
  ): Promise<string | undefined>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID for which to get the token gen id
   * @param deviceId - The device ID for which to get the token gen id
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID or null if it doesn't exist and upsert is false
   */
  public async getUserTokenGenerationId(
    userId: string,
    deviceId: string,
    upsert: false,
  ): Promise<string | undefined>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID
   * */
  public async getUserTokenGenerationId(
    userId: string,
    deviceId: string,
    upsert: true,
  ): Promise<string>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID or null if it doesn't exist and upsert is false
   */
  public async getUserTokenGenerationId(
    userId: string,
    deviceId: string,
    upsert?: boolean,
  ): Promise<string | undefined> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    // always get the latest token generation id
    const doc = await this.tokensCollection.findOne(
      {
        userId: new ObjectId(userId),
        deviceId,
        blacklisted: false,
        $or: [{ expiry: { $exists: false } }, { expiry: undefined }],
      },
      { sort: { created: -1 } },
    );

    // create if it doesn't exist (or blacklisted)
    if ((doc === null || !doc.tokenGenerationId) && upsert) {
      return await this.changeUserTokenGenerationId(userId, deviceId);
    }

    // if blacklisted and upsert is false return undefined, otherwise return
    // whatever the value is
    return doc?.tokenGenerationId;
  }

  /**
   * Change's the user's token generation ID
   * @param userId - The user's ID
   * @param deviceId - The device ID
   * @returns the new token generation ID
   */
  public async changeUserTokenGenerationId(
    userId: string,
    deviceId: string,
  ): Promise<string> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    const expiry = this.tokenExpiry();

    // update the latest document
    await this.tokensCollection.updateMany(
      {
        userId: new ObjectId(userId),
        $or: [{ expiry: { $exists: false } }, { expiry: undefined }],
      },
      { $set: { expiry } },
    );

    // create a new document
    const genId = this.generateTokenGenerationId();

    const doc: TokenGenIdDoc = {
      userId: new ObjectId(userId),
      tokenGenerationId: genId,
      deviceId,
      created: new Date(),
      blacklisted: false,
    };

    const result = await this.tokensCollection.insertOne(doc);

    if (!result.acknowledged) {
      throw new Error('Failed to update token generation ID');
    }

    return genId;
  }

  /**
   * Adds the token generation IDs provided in docs to the Redis blacklist cache
   * @param docs - Array of documents containing tokenGenerationId and expiry to cache
   */
  private async cacheGenIDBlacklist(
    docs: Pick<TokenGenIdDoc, 'tokenGenerationId' | 'expiry'>[],
  ) {
    console.log('adding blacklisted genids to cache');

    await Promise.all(
      docs.map(async (doc) => {
        // calculate TTL
        const ttlSeconds = Math.ceil(
          ((doc.expiry ?? this.tokenExpiry()).getTime() - Date.now()) / 1000,
        );

        // don't add it if it's already expired
        if (ttlSeconds <= 0) {
          return;
        }

        // key format: token-blacklist:<tokenGenerationId>
        const key = `${TokenRepository.GENERATION_IDS_BLACKLIST_REDIS_KEY}:${doc.tokenGenerationId}`;

        // add to redis with TTL using SET
        // use '1' as the key since we don't care about the value we just want
        // it to exist.
        await this.redis.set(key, '1', {
          EX: ttlSeconds,
        });
      }),
    );

    return;
  }

  /**
   * Calculate the expiry date for a token based on the current time and token lifespan
   * @returns The calculated expiry date
   */
  private tokenExpiry = (): Date =>
    new Date(Date.now() + TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS * 1000);

  /**
   * Blacklist all a user's token generation IDs to prevent all tokens from being
   * used including access tokens.
   * @param userId - The ID of the user whose tokens should be blacklisted
   */
  public async blacklistTokenGenerationIds(userId: string): Promise<void> {
    const expiry = this.tokenExpiry();

    // begin blacklisting all tokens in the db but don't wait
    const dbPromise = this.tokensCollection
      .updateMany(
        { userId: new ObjectId(userId), blacklisted: false },
        [
          {
            $set: {
              blacklisted: true,
              expiry: {
                $cond: {
                  if: { $ifNull: ['$expiry', false] }, // Check if expiry exists and is not null/undefined
                  then: '$expiry', // Keep the existing expiry value if it exists
                  else: expiry, // Set the new expiry value if it doesn't exist
                },
              },
            },
          },
        ],
        { upsert: false },
      )
      .then((result) => {
        console.log(
          'Acknowledged:',
          result.acknowledged,
          ', Blacklisted',
          result.modifiedCount,
          'tokens',
        );
      });

    // get all of them as well to blacklist in redis
    const docs = await this.tokensCollection
      .find(
        { userId: new ObjectId(userId) },
        { projection: { tokenGenerationId: 1, expiry: 1 } },
      )
      .toArray();

    await Promise.all([this.cacheGenIDBlacklist(docs), dbPromise]);
  }

  /**
   * Check if a token generation ID is blacklisted in the Redis cache
   * @param genId - The token generation ID to check
   * @returns True if the token generation ID is blacklisted in cache, false otherwise
   */
  private async isTokenGenerationIdBlacklistedCache(
    genId: string,
  ): Promise<boolean> {
    const result = await this.redis.get(
      `${TokenRepository.GENERATION_IDS_BLACKLIST_REDIS_KEY}:${genId}`,
    );

    return result !== null;
  }

  /**
   * Blacklist a specific access token by its JTI. This will add the token to both
   * the database and Redis cache.
   * @param jti - The JWT ID of the access token to blacklist
   * @param expirySeconds - When the token expires in seconds since epoch
   */
  public async blacklistAccessToken(
    jti: string,
    expirySeconds: number,
  ): Promise<void> {
    const ttlSeconds = expirySeconds - Math.floor(Date.now() / 1000);

    // Don't blacklist if already expired
    if (ttlSeconds <= 0) {
      return;
    }

    const expiry = new Date(expirySeconds * 1000);

    // Add to MongoDB
    const doc: BlacklistedAccessTokenDoc = {
      jti,
      created: new Date(),
      expiry,
    };

    const [dbResult] = await Promise.all([
      // Add to MongoDB
      this.accessBlacklistCollection.insertOne(doc),
      // Add to Redis cache
      this.cacheAccessBlacklist(jti, expirySeconds),
    ]);

    if (!dbResult.acknowledged) {
      throw new Error('Failed to blacklist access token in database');
    }
  }

  /**
   * Add an access token to the Redis blacklist cache
   * @param jti - The JWT ID of the access token to blacklist
   * @param expirySeconds - When the token expires in seconds since epoch
   */
  private async cacheAccessBlacklist(
    jti: string,
    expirySeconds: number,
  ): Promise<void> {
    const ttlSeconds = expirySeconds - Math.floor(Date.now() / 1000);

    // Don't blacklist if already expired
    if (ttlSeconds <= 0) {
      return;
    }

    const key = `${TokenRepository.ACCESS_BLACKLIST_REDIS_KEY}:${jti}`;
    await this.redis.set(key, '1', {
      EX: ttlSeconds,
    });
  }

  /**
   * Check if an access token is blacklisted by checking both Redis cache and MongoDB
   * @param jti - The JWT ID to check
   * @returns True if the token is blacklisted, false otherwise
   */
  public async isAccessTokenBlacklisted(jti: string): Promise<boolean> {
    try {
      // Check Redis cache first
      const existsInCache = await this.isAccessTokenBlacklistedCache(jti);
      if (existsInCache) {
        return true;
      }
    } catch (e) {
      console.error('Error checking redis cache for access token blacklist', e);
    }

    // Not found in Redis, check MongoDB
    const doc = await this.accessBlacklistCollection.findOne({ jti });

    if (doc === null) {
      return false;
    }

    // Found in DB, add to Redis cache to avoid future cache misses
    // Don't await as this is non-blocking
    this.cacheAccessBlacklist(jti, Math.floor(doc.expiry.getTime() / 1000));

    return true;
  }

  /**
   * Check if an access token is blacklisted by its JTI
   * @param jti - The JWT ID to check
   * @returns True if the token is blacklisted, false otherwise
   */
  private async isAccessTokenBlacklistedCache(jti: string): Promise<boolean> {
    const key = `${TokenRepository.ACCESS_BLACKLIST_REDIS_KEY}:${jti}`;
    const result = await this.redis.get(key);
    return result !== null;
  }

  /**
   * Checks if a token generation ID is blacklisted
   * @param genId - The generation id to check
   * @returns True if blacklisted, false otherwise
   */
  public async isTokenGenerationIdBlacklisted(genId: string): Promise<boolean> {
    // try because we don't want it to fail
    try {
      const existsInCache =
        await this.isTokenGenerationIdBlacklistedCache(genId);
      // we foudn it in cache, return true for blacklisted
      if (existsInCache) {
        return true;
      }
    } catch (e) {
      console.error('Error checking redis cache', e);
    }

    // not found in redis, check db
    const doc = await this.tokensCollection.findOne({
      tokenGenerationId: genId,
      blacklisted: true, // fewer blacklisted tokens, faster query
    });

    if (doc === null) {
      return false;
    }

    // doc not null, meaning it's expired.
    // add to redis cache to avoid another cache miss
    // this should be non blocking so don't await

    this.cacheGenIDBlacklist([doc]);

    // and return
    return true;
  }

  /**
   * Blacklist an MFA token by adding it to both Redis cache and MongoDB storage
   * @param jti - The JWT ID of the MFA token to blacklist
   * @param expirySeconds - When the token expires in seconds since epoch
   * @throws {Error} If the token fails to be blacklisted in the database
   */
  public async blacklistMFA(jti: string, expirySeconds: number): Promise<void> {
    const expiry = new Date(expirySeconds * 1000);
    // calculate TTL
    const ttlSeconds = Math.ceil(
      ((expiry ?? TokenService.MFA_TOKEN_LIFESPAN_SECONDS).getTime() -
        Date.now()) /
        1000,
    );

    // don't add it if it's already expired
    if (ttlSeconds <= 0) {
      return;
    }

    const doc: BlacklistedMFAToken = {
      jti,
      expiry,
    };

    // cache in Redis
    const key = `${TokenRepository.ACCESS_BLACKLIST_REDIS_KEY}:${jti}`;
    const redisPromise = this.redis
      .set(key, '1', {
        EX: ttlSeconds,
      })
      .catch((e) => console.warn('Error caching MFA token blacklist', e));

    // add to db in case Redis fails
    const dbPromise = this.mfaBlacklistCollection
      .insertOne(doc)
      .then((result) => {
        return result.acknowledged;
      });

    const [dbResult] = await Promise.all([dbPromise, redisPromise]);

    if (!dbResult) {
      throw new Error('Failed to blacklist MFA token in database');
    }
  }

  /**
   * Check if an MFA token is blacklisted by its JTI
   * @param jti - The JWT ID to check
   * @returns True if the token is blacklisted, false otherwise
   */
  public async isMFATokenBlacklisted(jti: string): Promise<boolean> {
    try {
      // Check Redis cache first
      const key = `${TokenRepository.MFA_BLACKLIST_KEY}:${jti}`;
      const existsInCache = await this.redis.get(key);
      if (existsInCache !== null) {
        return true;
      }
    } catch (e) {
      console.error('Error checking redis cache for MFA token blacklist', e);
    }

    // Not found in Redis, check MongoDB
    const doc = await this.mfaBlacklistCollection.findOne({ jti });

    if (doc === null) {
      return false;
    }

    // Found in DB, add to Redis cache to avoid future cache misses
    // Don't await as this is non-blocking
    const ttlSeconds = Math.ceil((doc.expiry.getTime() - Date.now()) / 1000);
    if (ttlSeconds > 0) {
      const key = `${TokenRepository.MFA_BLACKLIST_KEY}:${jti}`;
      this.redis
        .set(key, '1', {
          EX: ttlSeconds,
        })
        .catch((e) =>
          console.warn('Error caching MFA token blacklist status', e),
        );
    }

    return true;
  }
}
