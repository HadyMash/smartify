import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { CreateUserData, User } from '../../../schemas/auth/user';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserDoc extends User {}

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

  public async createUser(data: CreateUserData) {
    const result = await this.collection.insertOne(data);

    return result.insertedId.toString();
  }

  public async getUserById(_userId: string) {
    await Promise.resolve();
    // TODO: implement
    const user: UserDoc = {
      _id: new ObjectId().toString(),
      email: 'example@domain.com',
    };
    return user;
  }

  /**
   *Checks if a user exists by their id
   * @param userId - The user to check
   * @returns true if the user exists, false otherwise
   */
  public async userExists(_userId: string): Promise<boolean> {
    // TODO implement
    await Promise.resolve();
    return true;
  }
}
