import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient, ObjectId } from 'mongodb';
import {
  Email,
  InvalidUserError,
  InvalidUserType,
  RegisterData,
  User,
  UserWithId,
  userWithIdSchema,
} from '../../../schemas/auth/user';
import { ObjectIdOrString, objectIdSchema } from '../../../schemas/obj-id';
import {
  MFA,
  MFAFormattedKey,
  SRPJSONSession,
  SRPJSONSessionSchema,
  SRPMongoSession,
  SRPMongoSessionSchema,
  SRPSession,
} from '../../../schemas/auth/auth';

export interface UserDoc extends User {
  _id?: ObjectId;
  /** The user's mfa formatted key */
  mfaFormattedKey: string;
  /** Whether the user has confirmed correctly setting up MFA */
  mfaConfirmed: boolean;
  /** The user's salt for SRP */
  salt: string;
  /** The user's verifier for SRP */
  verifier: string;
}

const USER_COLLECTION_NAME = 'users';

export class UserRepository extends DatabaseRepository<UserDoc> {
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, USER_COLLECTION_NAME, redis);
  }

  // TODO: create more indexes on relevant fields
  /**
   * Configures the user collection by creating necessary indices.
   * This method should be called during application initialization.
   */
  public async configureCollection(): Promise<void> {
    try {
      // Check if collection exists, if not MongoDB will create it automatically
      const collections = await this.db
        .listCollections({ name: USER_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(USER_COLLECTION_NAME);
      }

      // Configure indices
      await Promise.all([
        // Create a unique index on email to ensure no duplicate accounts
        this.collection.createIndex({ email: 1 }, { unique: true }),
      ]);

      console.log(
        `Configured ${USER_COLLECTION_NAME} collection with required indices`,
      );
    } catch (error) {
      console.error(
        `Failed to configure ${USER_COLLECTION_NAME} collection:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Initialises a document for the user in the database containing the user's
   * authentication information and their data (email, etc.). Also sets the
   * user's mfa as unconfirmed.
   * @param email - The user's email
   * @param salt - The user's salt
   * @param verifier - The user's verifier
   * @param mfaFormattedKey - The user's MFA formatted key
   * @returns The user's id
   */
  public async createUser(
    data: RegisterData,
    mfaFormattedKey: MFAFormattedKey,
  ): Promise<ObjectIdOrString> {
    const result = await this.collection.insertOne({
      ...data,
      // convert the verifier to a hex string
      verifier: `0x${data.verifier.toString(16)}`,
      mfaFormattedKey,
      mfaConfirmed: false,
    });

    return result.insertedId;
  }

  /**
   * Get the user's SRP credentials
   * @param email - The user's email
   * @returns the user's salt and verifier
   * @throws An InvalidUserError if the user does not exist
   */
  public async getUserSRPCredentials(
    email: Email,
  ): Promise<{ userId: ObjectId; salt: string; verifier: string }> {
    const result = await this.collection.findOne(
      {
        email,
      },
      { projection: { _id: 1, salt: 1, verifier: 1 } },
    );
    if (!result) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return { userId: result._id, salt: result.salt, verifier: result.verifier };
  }

  /**
   * Get's a user by their id
   * @param userId - The id of the user to get
   * @returns The user with the given id
   * @throws Error if the user does not exist
   */
  public async getUserById(userId: ObjectIdOrString): Promise<UserWithId> {
    const user = await this.collection.findOne({
      _id: objectIdSchema.parse(userId),
    });
    if (!user) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return userWithIdSchema.parse(user);
  }

  /**
   * Get's a user by their email
   * @param email - The email of the user to get
   * @returns The user with the given id
   * @throws Error if the user does not exist
   */
  public async getUserByEmail(email: Email): Promise<UserWithId> {
    const user = await this.collection.findOne({
      email: email,
    });
    if (!user) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return userWithIdSchema.parse(user);
  }

  /**
   *Checks if a user exists by their id
   * @param userId - The user to check
   * @returns true if the user exists, false otherwise
   */
  public async userExists(userId: ObjectIdOrString): Promise<boolean> {
    const user = await this.collection.findOne(
      {
        _id: objectIdSchema.parse(userId),
      },
      { projection: { _id: 1 } },
    );
    return !!user;
  }

  /**
   *Checks if a user exists by their email
   * @param email - The email to check
   * @returns true if the user exists, false otherwise
   */
  public async userExistsEmail(email: Email): Promise<boolean> {
    const user = await this.collection.findOne(
      {
        email: email,
      },
      { projection: { _id: 1 } },
    );
    return !!user;
  }

  /**
   * Checks if the user has confirmed MFA
   * @param userId - The id of the user
   * @returns true if the user has confirmed MFA, false otherwise
   * @throws Error if the user does not exist
   */
  public async isUserMFAConfirmed(userId: ObjectIdOrString): Promise<boolean> {
    const user = await this.collection.findOne(
      {
        _id: objectIdSchema.parse(userId),
      },
      { projection: { mfaConfirmed: 1 } },
    );
    if (!user) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return user.mfaConfirmed ?? false;
  }

  /**
   * Get's the user's MFA formatted key
   * @param userId - The id of the user
   * @returns The user's MFA formatted key
   * @throws Error if the user does not exist
   */
  public async getUserMFA(userId: ObjectIdOrString): Promise<MFA> {
    const user = await this.collection.findOne(
      {
        _id: objectIdSchema.parse(userId),
      },
      { projection: { mfaFormattedKey: 1, mfaConfirmed: 1 } },
    );
    if (!user) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return { formattedKey: user.mfaFormattedKey, confirmed: user.mfaConfirmed };
  }

  /**
   * Set the user's MFA to be confirmed
   * @param userId - The id of the user
   * @returns true if the operation was successful
   */
  public async confirmUserMFA(userId: ObjectIdOrString): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: objectIdSchema.parse(userId) },
      { $set: { mfaConfirmed: true } },
    );
    return result.acknowledged && result.matchedCount === 1;
  }

  /**
   * Get a user's document. This method should be used carefully, and it's
   * results must be filtered and should never be returned tot he client without
   * preprocessing as it contains sensitive authentication information for
   * server-side use only.
   * @param userId - The user's id
   * @returns The user's document in the database
   */
  public async getUserDoc(userId: ObjectIdOrString): Promise<UserDoc> {
    const result = await this.collection.findOne({
      _id: objectIdSchema.parse(userId),
    });
    if (!result) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return result;
  }

  /**
   * Get the user's document by their email. Similar to getUserDoc but uses the
   * user's email. This method also should not be used to return data to the
   * client without preprocessing.
   * @param email - The user's email
   * @returns The user's document
   */
  public async getUserDocByEmail(email: string): Promise<UserDoc> {
    const result = await this.collection.findOne({
      email: email,
    });
    if (!result) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return result;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SRPSessionDoc extends SRPMongoSession {}

const SRP_SESSION_COLLECTION_NAME = 'srp-sessions';
const SRP_SESSION_KEY_PREFIX = 'srp-auth-session';
const SRP_SESSION_EXPIRY_SECONDS = 60 * 5; // 5 minutes

export class SRPSessionRepository extends DatabaseRepository<SRPSessionDoc> {
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, SRP_SESSION_COLLECTION_NAME, redis);
  }

  /**
   * Load all valid SRP sessions from MongoDB into Redis cache.
   * This should be called on application startup to ensure Redis has all active sessions.
   * Sessions older than SRP_SESSION_EXPIRY_SECONDS are considered expired and won't be loaded.
   */
  public async loadSessionsToCache(): Promise<void> {
    const cutoffTime = new Date(Date.now() - SRP_SESSION_EXPIRY_SECONDS * 1000);

    // Find all sessions that were created within the expiry window
    const docs = await this.collection
      .find({
        createdAt: { $gt: cutoffTime },
      })
      .toArray();

    console.log(`Loading ${docs.length} SRP sessions to Redis cache`);

    const promises = docs.map(async (doc) => {
      // Calculate remaining TTL
      const createdAt = new Date(doc.createdAt);
      const elapsedSeconds = Math.floor(
        (Date.now() - createdAt.getTime()) / 1000,
      );
      const remainingTTL = SRP_SESSION_EXPIRY_SECONDS - elapsedSeconds;

      // Only cache if there's remaining time
      if (remainingTTL <= 0) return;

      try {
        await this.redis.set(
          `${SRP_SESSION_KEY_PREFIX}:${doc.email}`,
          JSON.stringify(SRPJSONSessionSchema.parse(doc)),
          {
            EX: remainingTTL,
          },
        );
      } catch (e) {
        console.error(`Failed to cache SRP session ${doc.email}:`, e);
      }
    });

    await Promise.all(promises);
  }

  public async configureCollection(): Promise<void> {
    // Check if collection exists, if not MongoDB will create it automatically
    const collections = await this.db
      .listCollections({ name: USER_COLLECTION_NAME })
      .toArray();
    if (collections.length === 0) {
      await this.db.createCollection(USER_COLLECTION_NAME);
    }

    await Promise.all([
      // Create unique index on sessionId
      this.collection.createIndex({ email: 1 }, { unique: true }),
      // Create TTL index on createdAt for auto-expiration after SRP_SESSION_EXPIRY_SECONDS
      this.collection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: SRP_SESSION_EXPIRY_SECONDS },
      ),
    ]);
  }

  /**
   * Store's an auth session in the database. The session will expire after a
   * set time.
   * @param session - The session to store
   * @returns A boolean indicating if the session was stored successfully
   */
  public async storeSRPSession(session: SRPSession) {
    // convert to json friendly format
    const jsonSession = SRPJSONSessionSchema.parse({
      ...session,
      createdAt: new Date(),
    });

    // store session in redis
    const redisPromise = this.redis.set(
      `${SRP_SESSION_KEY_PREFIX}:${session.email}`,
      JSON.stringify(jsonSession),
      {
        EX: SRP_SESSION_EXPIRY_SECONDS,
      },
    );

    // store session in mongo as a backup (fail-safe)
    const mongoPromise = this.collection.updateOne(
      { userId: session.userId.toString() },
      {
        $set: SRPMongoSessionSchema.parse(jsonSession),
      },
      { upsert: true },
    );

    try {
      const redisResult = await redisPromise;
      if (redisResult) {
        return true;
      }
    } catch (e) {
      console.error('Failed to store SRP session in redis:', e);
      // ignore, try mongo
    }

    try {
      const mongoResult = await mongoPromise;
      return (
        mongoResult.acknowledged &&
        mongoResult.matchedCount +
          mongoResult.modifiedCount +
          mongoResult.upsertedCount >
          0
      );
    } catch (e) {
      console.error('Failed to store SRP session in mongo:', e);
    }
    return false;
  }

  /**
   * Get a user's SRP session if it exists
   * @param userId - The user's id
   * @returns The auth session if it exists. If it doesn't undefined will be
   * returned
   */
  public async getSRPSession(
    email: Email,
  ): Promise<SRPJSONSession | undefined> {
    // check redis first
    const redisResult = await this.redis.get(
      `${SRP_SESSION_KEY_PREFIX}:${email}`,
    );

    if (redisResult) {
      try {
        return SRPJSONSessionSchema.parse(JSON.parse(redisResult));
      } catch (e) {
        console.error('Failed to parse SRP session from redis', e);
        // ignore, try mongo
      }
    }

    const session = await this.collection.findOne({
      email: email,
    });
    if (!session) {
      return;
    }
    return SRPJSONSessionSchema.parse(session);
  }

  /**
   * Delete a user's SRP session
   * @param email - The user's email
   */
  public async deleteSRPSession(email: Email): Promise<void> {
    try {
      await this.redis.del(`${SRP_SESSION_KEY_PREFIX}:${email}`);
    } catch (e) {
      console.error('Failed to delete SRP session from redis:', e);
    }

    try {
      await this.collection.deleteOne({ email: email });
    } catch (e) {
      console.error('Failed to delete SRP session from mongo:', e);
    }
  }
}
