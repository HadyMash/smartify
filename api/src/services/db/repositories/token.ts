import { randomUUID } from 'crypto';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { TokenService } from '../../auth/token';
import { ObjectIdOrString, objectIdSchema } from '../../../schemas/obj-id';

/**
 * Document representing a blacklisted access token in the database
 */
interface BlacklistedAccessTokenDoc {
  /**
   * The user ID this revocation applies to
   */
  _id: ObjectId;
  /**
   * When the access tokens were revoked. Any token generated before this time
   * would be considered invalid
   */
  revocationTime: Date;
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

const TOKENS_COLLECTION_NAME = 'tokens';
const ACCESS_BLACKLIST_COLLECTION_NAME = 'blacklisted_access_tokens';
const MFA_BLACKLIST_COLLECTION_NAME = 'mfa_token_blacklist';

// TODO: integrate with token service to remove lifespan parameter

/* revoked access tokens are stored in redis (some sort of version
 * included in payload so if server crashes it invalidates all access tokens
 * that way no revoked access tokens get unrevoked) */
export class TokenRepository extends DatabaseRepository<TokenGenIdDoc> {
  protected static readonly GENERATION_IDS_BLACKLIST_REDIS_KEY =
    'token-blacklist';

  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, TOKENS_COLLECTION_NAME, redis);
  }

  /**
   * Configures the token collection by creating necessary indices.
   * This method should be called during application initialization.
   */
  public async configureCollection(): Promise<void> {
    try {
      // Check if collection exists, if not MongoDB will create it automatically
      const collections = await this.db
        .listCollections({ name: TOKENS_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(TOKENS_COLLECTION_NAME);
      }

      // Configure indices for TokenGenIdDoc collection
      await Promise.all([
        // Index for querying by userId and deviceId (used in getUserTokenGenerationId)
        this.collection.createIndex({ userId: 1, deviceId: 1 }),

        // Index for querying by tokenGenerationId (used in isTokenGenerationIdBlacklisted)
        this.collection.createIndex({ tokenGenerationId: 1 }),

        // Compound index for the frequent query pattern including blacklisted status
        this.collection.createIndex({
          userId: 1,
          deviceId: 1,
          blacklisted: 1,
        }),

        // Index to filter by blacklisted status and expiry
        this.collection.createIndex({ blacklisted: 1, expiry: 1 }),

        // TTL index to automatically remove expired tokens
        this.collection.createIndex(
          { expiry: 1 },
          {
            expireAfterSeconds: 0,
            partialFilterExpression: { expiry: { $exists: true } },
          },
        ),

        // Index for sorting by created date (used in getUserTokenGenerationId with sort)
        this.collection.createIndex({ created: 1 }),
      ]);

      console.log(
        `Configured ${TOKENS_COLLECTION_NAME} collection with required indices`,
      );
    } catch (error) {
      console.error(
        `Failed to configure ${TOKENS_COLLECTION_NAME} collection:`,
        error,
      );
      throw error;
    }
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
    userId: ObjectIdOrString,
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
    userId: ObjectIdOrString,
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
    userId: ObjectIdOrString,
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
    userId: ObjectIdOrString,
    deviceId: string,
    upsert?: boolean,
  ): Promise<string | undefined> {
    // always get the latest token generation id
    const doc = await this.collection.findOne(
      {
        userId: objectIdSchema.parse(userId),
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
    userId: ObjectIdOrString,
    deviceId: string,
  ): Promise<string> {
    const expiry = this.tokenExpiry();

    // update the latest document
    await this.collection.updateMany(
      {
        userId: objectIdSchema.parse(userId),
        $or: [{ expiry: { $exists: false } }, { expiry: undefined }],
      },
      { $set: { expiry } },
    );

    // create a new document
    const genId = this.generateTokenGenerationId();

    const doc: TokenGenIdDoc = {
      userId: objectIdSchema.parse(userId),
      tokenGenerationId: genId,
      deviceId,
      created: new Date(),
      blacklisted: false,
    };

    const result = await this.collection.insertOne(doc);

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
  public async blacklistTokenGenerationIds(
    userId: ObjectIdOrString,
  ): Promise<void> {
    const expiry = this.tokenExpiry();

    // begin blacklisting all tokens in the db but don't wait
    const dbPromise = this.collection
      .updateMany(
        { userId: objectIdSchema.parse(userId), blacklisted: false },
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
    const docs = await this.collection
      .find(
        { userId: objectIdSchema.parse(userId) },
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
    const doc = await this.collection.findOne({
      tokenGenerationId: genId,
      blacklisted: true, // fewer blacklisted tokens, faster query
    });

    if (doc === null) {
      return false;
    }

    // doc not null, meaning it's expired.
    // add to redis cache to avoid another cache miss
    // this should be non blocking so don't await

    this.cacheGenIDBlacklist([doc]).catch((e) =>
      console.warn('Error blacklisting gen id:', e),
    );

    // and return
    return true;
  }
}

export class AccessBlacklistRepository extends DatabaseRepository<BlacklistedAccessTokenDoc> {
  protected static readonly ACCESS_BLACKLIST_REDIS_KEY =
    'access-token-blacklist';
  protected static readonly REVOCATION_TIME_KEY =
    'access-token-revocation-time';
  protected static readonly ACCESS_TOKEN_JTI_KEY = 'access-token-jti';

  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, ACCESS_BLACKLIST_COLLECTION_NAME, redis);
  }

  /**
   * Load all non-expired blacklisted access token revocation times from MongoDB into Redis cache
   * This should be called on application startup to ensure Redis has the latest revocation times
   */
  public async loadBlacklistToCache(): Promise<void> {
    const now = new Date();
    const docs = await this.collection
      .find({
        expiry: { $gt: now },
      })
      .toArray();

    if (docs.length > 0) {
      console.log(
        `Loading ${docs.length} access token revocation times to Redis cache`,
      );

      const promises = docs.map((doc) =>
        this.cacheRevocationTime(doc._id, doc.revocationTime, doc.expiry),
      );

      await Promise.all(promises);
    } else {
      console.log('No access token revocation times to load into cache');
    }
  }

  /**
   * Configures the access token blacklist collection by creating necessary indices.
   * This method should be called during application initialization.
   */
  public async configureCollection(): Promise<void> {
    try {
      // Check if collection exists, if not MongoDB will create it automatically
      const collections = await this.db
        .listCollections({ name: ACCESS_BLACKLIST_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(ACCESS_BLACKLIST_COLLECTION_NAME);
      }

      // Configure indices
      await Promise.all([
        // Compound index on user ID and revocation time for efficient querying
        this.collection.createIndex({ _id: 1, revocationTime: -1 }),

        // TTL index to automatically remove expired revocation times
        this.collection.createIndex(
          { expiry: 1 },
          {
            expireAfterSeconds: 0,
          },
        ),
      ]);

      console.log(
        `Configured ${ACCESS_BLACKLIST_COLLECTION_NAME} collection with required indices`,
      );
    } catch (error) {
      console.error(
        `Failed to configure ${ACCESS_BLACKLIST_COLLECTION_NAME} collection:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Blacklist all access tokens for a specific user generated before the current time.
   * This creates a new revocation time entry in both the database and Redis cache.
   * @param userId - The user ID whose tokens should be blacklisted
   * @param expirySeconds - When the revocation time entry expires in seconds since epoch
   */
  public async blacklistAccessTokens(userId: ObjectIdOrString): Promise<void> {
    // 5 minutes after the access token lifespan
    const expiry = new Date(
      Date.now() +
        TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS * 1000 +
        5 * 60 * 1000,
    );
    // Time for tokens to be created for them to have expired 5 minutes ago
    const revocationTime = new Date();
    const userObjectId = objectIdSchema.parse(userId);

    // Add to MongoDB
    const doc: BlacklistedAccessTokenDoc = {
      _id: userObjectId,
      revocationTime,
      expiry,
    };

    const [dbResult] = await Promise.all([
      // Add to MongoDB - use upsert to ensure only one document per user
      this.collection.updateOne(
        { _id: userObjectId },
        { $set: doc },
        { upsert: true },
      ),
      // Add to Redis cache
      this.cacheRevocationTime(userObjectId, revocationTime, expiry),
    ]);

    if (!dbResult.acknowledged) {
      throw new Error(
        'Failed to create access token revocation time in database',
      );
    }
  }

  /**
   * Add a revocation time to the Redis cache
   * @param userId - The user ID this revocation applies to
   * @param revocationTime - The time before which all tokens are considered revoked
   * @param expiry - When this revocation time entry expires
   */
  private async cacheRevocationTime(
    userId: ObjectId,
    revocationTime: Date,
    expiry: Date,
  ): Promise<void> {
    const ttlSeconds = Math.ceil((expiry.getTime() - Date.now()) / 1000);

    // Don't cache if already expired
    if (ttlSeconds <= 0) {
      return;
    }

    // Store the revocation time timestamp in Redis with user-specific key
    const key = `${AccessBlacklistRepository.REVOCATION_TIME_KEY}:${userId.toString()}`;
    await this.redis.set(key, revocationTime.getTime().toString(), {
      EX: ttlSeconds,
    });
  }

  /**
   * Check if an access token is blacklisted by checking if it was created before the latest revocation time
   * @param userId - The user ID the token belongs to
   * @param tokenCreatedAt - The timestamp when the token was created
   * @returns True if the token is blacklisted (created before revocation time), false otherwise
   */
  public async isAccessTokenBlacklisted(
    userId: ObjectIdOrString,
    tokenCreatedAtSeconds: number,
  ): Promise<boolean> {
    try {
      // only check redis
      // Check Redis cache for the user-specific revocation time
      return await this.isTokenCreatedBeforeRevocationTime(
        userId,
        new Date(tokenCreatedAtSeconds * 1000),
      );
    } catch (e) {
      console.error(
        'Error checking redis cache for access token revocation time',
        e,
      );

      return false;
    }
  }

  /**
   * Check if a token was created before the latest revocation time in Redis
   * @param userId - The user ID the token belongs to
   * @param tokenCreatedAt - The timestamp when the token was created
   * @returns True if the token is blacklisted (created before revocation time), false otherwise
   */
  private async isTokenCreatedBeforeRevocationTime(
    userId: ObjectIdOrString,
    tokenCreatedAt: Date,
  ): Promise<boolean> {
    const userObjectId = objectIdSchema.parse(userId);
    const key = `${AccessBlacklistRepository.REVOCATION_TIME_KEY}:${userObjectId.toString()}`;
    const result = await this.redis.get(key);

    if (result === null) {
      return false; // No revocation time set for this user
    }

    const revocationTime = new Date(parseInt(result, 10));

    return tokenCreatedAt.getTime() < revocationTime.getTime();
  }
}

export class MFABlacklistRepository extends DatabaseRepository<BlacklistedMFAToken> {
  protected static readonly MFA_BLACKLIST_KEY = MFA_BLACKLIST_COLLECTION_NAME;

  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, MFA_BLACKLIST_COLLECTION_NAME, redis);
  }

  /**
   * Load all non-expired blacklisted MFA tokens from MongoDB into Redis cache
   * This should be called on application startup to ensure Redis has all blacklisted tokens
   */
  public async loadBlacklistToCache(): Promise<void> {
    const now = new Date();
    const docs = await this.collection
      .find({
        expiry: { $gt: now },
      })
      .toArray();

    console.log(`Loading ${docs.length} MFA tokens to Redis blacklist cache`);

    const promises = docs.map((doc) => {
      const ttlSeconds = Math.ceil((doc.expiry.getTime() - Date.now()) / 1000);
      if (ttlSeconds <= 0) return Promise.resolve();

      const key = `${MFABlacklistRepository.MFA_BLACKLIST_KEY}:${doc.jti}`;
      return this.redis.set(key, '1', {
        EX: ttlSeconds,
      });
    });

    await Promise.all(promises);
  }

  /**
   * Configures the MFA token blacklist collection by creating necessary indices.
   * This method should be called during application initialization.
   */
  public async configureCollection(): Promise<void> {
    try {
      // Check if collection exists, if not MongoDB will create it automatically
      const collections = await this.db
        .listCollections({ name: MFA_BLACKLIST_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(MFA_BLACKLIST_COLLECTION_NAME);
      }

      // Configure indices
      await Promise.all([
        // Unique index for querying by JTI (used in isMFATokenBlacklisted)
        this.collection.createIndex({ jti: 1 }, { unique: true }),

        // TTL index to automatically remove expired tokens
        this.collection.createIndex(
          { expiry: 1 },
          {
            expireAfterSeconds: 0,
          },
        ),
      ]);

      console.log(
        `Configured ${MFA_BLACKLIST_COLLECTION_NAME} collection with required indices`,
      );
    } catch (error) {
      console.error(
        `Failed to configure ${MFA_BLACKLIST_COLLECTION_NAME} collection:`,
        error,
      );
      throw error;
    }
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
    const key = `${MFABlacklistRepository.MFA_BLACKLIST_KEY}:${jti}`;
    const redisPromise = this.redis
      .set(key, '1', {
        EX: ttlSeconds,
      })
      .catch((e) => console.warn('Error caching MFA token blacklist', e));

    // add to db in case Redis fails
    const dbPromise = this.collection.insertOne(doc).then((result) => {
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
      const key = `${MFABlacklistRepository.MFA_BLACKLIST_KEY}:${jti}`;
      const existsInCache = await this.redis.get(key);
      return existsInCache !== null;
    } catch (e) {
      console.error('Error checking redis cache for MFA token blacklist', e);
      return false;
    }
  }
}
