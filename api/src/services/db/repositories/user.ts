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
  SRPJSONSessoin,
  SRPSession,
  srpSessionJSONSchema,
  srpSessionSchema,
} from '../../../schemas/auth/auth';

export interface UserDoc extends User {
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

  // TODO: implement configure collection
  public async configureCollection(): Promise<void> {
    // create collection
    //
    // configure indices
    //
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
      verifier: `0x${data.verifier.toString()}`,
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
  ): Promise<{ salt: string; verifier: string }> {
    const result = await this.collection.findOne(
      {
        email,
      },
      { projection: { salt: 1, verifier: 1 } },
    );
    if (!result) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return { salt: result.salt, verifier: result.verifier };
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

interface SRPSessionDoc extends SRPJSONSessoin {
  _id?: ObjectId;
}

const SRP_SESSION_COLLECTION_NAME = 'srp-sessions';
const SRP_SESSION_KEY_PREFIX = 'srp-auth-session';
const SRP_SESSION_EXPIRY_SECONDS = 60 * 20; // 20 minutes

export class SRPSessionRepository extends DatabaseRepository<SRPSessionDoc> {
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, SRP_SESSION_COLLECTION_NAME, redis);
  }

  // TODO: implement configure collection
  public async configureCollection(): Promise<void> {
    await this.collection.createIndex({ sessionId: 1 }, { unique: true });
  }

  public async storeSRPAuthSession(sessionId: string, session: SRPSession) {
    // convert bigints to strings
    const sessionJSON = srpSessionJSONSchema.parse(session);

    // store session in redis
    const redisPromise = this.redis.set(
      `${SRP_SESSION_KEY_PREFIX}:${sessionId}`,
      JSON.stringify(srpSessionJSONSchema.parse(sessionJSON)),
      {
        EX: SRP_SESSION_EXPIRY_SECONDS,
      },
    );

    // store session in db (fail-safe) using upsert
    const mongoPromise = this.collection.updateOne(
      { sessionId: sessionId },
      { $set: sessionJSON },
      { upsert: true },
    );

    try {
      await redisPromise;
      return;
    } catch (e) {
      console.error(
        'Failed to store SRP session in redis. trying mongo. error:',
        e,
      );
      try {
        await mongoPromise;
      } catch (mongoError) {
        console.error('Failed to store SRP session in mongo:', mongoError);
        throw new Error(
          'Failed to store SRP session in both Redis and MongoDB',
        );
      }
    }
  }

  public async getSRPAuthSession(
    sessionId: string,
  ): Promise<SRPSession | null> {
    const redisResult = await this.redis.get(
      `${SRP_SESSION_KEY_PREFIX}:${sessionId}`,
    );
    if (redisResult) {
      try {
        console.log(
          'redis result:',
          srpSessionSchema.parse(JSON.parse(redisResult)),
        );

        return srpSessionSchema.parse(JSON.parse(redisResult));
      } catch (e) {
        console.error('Failed to parse SRP session from redis', e);
        // ignore, try mongo
      }
    }
    const mongoResult = await this.collection.findOne({
      sessionId,
    });
    if (!mongoResult) {
      return null;
    }
    console.log('mongo result:', srpSessionSchema.parse(mongoResult));
    return srpSessionSchema.parse(mongoResult);
  }
}
