import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient } from 'mongodb';
import {
  CreateUserData,
  Email,
  InvalidUserError,
  InvalidUserType,
  User,
  UserWithId,
  userWithIdSchema,
} from '../../../schemas/auth/user';
import { ObjectIdOrString, objectIdSchema } from '../../../schemas/obj-id';
import { MFA, MFAFormattedKey } from '../../../schemas/auth/auth';

export interface UserDoc extends User {
  mfaFormattedKey: string;
  mfaConfirmed: boolean;
  password: string; // TEMP: TODO: remove once implemented srp
}

export class UserRepository extends DatabaseRepository<UserDoc> {
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, 'users', redis);
  }

  // TODO: implement configure collection
  public async configureCollection(): Promise<void> {
    // create collection
    //
    // configure indices
    //
  }

  /**
   * Creates the user in the database and sets their MFA formatted key, and sets
   * MFA to be unconfirmed.
   */
  public async createUser(
    data: CreateUserData,
    mfaFormattedKey: MFAFormattedKey,
  ) {
    const result = await this.collection.insertOne({
      ...data,
      mfaFormattedKey,
      mfaConfirmed: false,
    });

    return result.insertedId;
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
   */
  public async confirmUserMFA(userId: ObjectIdOrString): Promise<void> {
    await this.collection.updateOne(
      { _id: objectIdSchema.parse(userId) },
      { $set: { mfaConfirmed: true } },
    );
  }
}
