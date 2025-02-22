import assert from 'assert';
import { Collection, Db, ObjectId } from 'mongodb';
import { User } from '../../../schemas/auth/user';
import { randomInt } from 'crypto';
import { RedisClientType } from 'redis';

const COLLECTION_NAME = 'users';

// TODO: create type

export class UserRepository {
  private readonly collection: Collection;
  private readonly redis: RedisClientType;

  constructor(db: Db, redis: RedisClientType) {
    this.collection = db.collection(COLLECTION_NAME);
    this.redis = redis;
  }

  // ! temp method
  // TODO: replace with actual methods
  public async getUserById(userId: string) {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    const doc = await this.collection.findOne({ _id: new ObjectId(userId) });

    return doc;
  }

  /**
   *Checks if a user exists by their id
   * @param userId - The user to check
   * @returns true if the user exists, false otherwise
   */
  public async userExists(userId: string): Promise<boolean> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    return !!user;
  }

  /**
   * @returns The user's id
   */
  public async createUser() {
    const result = await this.collection.insertOne({
      email: `example${randomInt(99999)}@domain.com`,
    });

    return result.insertedId.toString();
  }
}
