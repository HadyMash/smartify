import assert from 'assert';
import { Collection, Db, ObjectId } from 'mongodb';
import { User } from '../../../schemas/auth/user';
import { randomInt } from 'crypto';
import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../db';

// TODO: create type

export class UserRepository extends DatabaseRepository {
  protected readonly COLLECTION_NAME = 'users';
  protected readonly collection: Collection;

  constructor(db: Db, redis: RedisClientType) {
    super(redis);
    this.collection = db.collection(this.COLLECTION_NAME);
  }

  // TODO: implement configure collection
  public async configureCollectiob(): Promise<void> {
    // create collection
    //
    // configure indices
    //
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
