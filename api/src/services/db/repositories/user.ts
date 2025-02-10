import assert from 'assert';
import { Collection, Db, ObjectId } from 'mongodb';
import { RequestUser, requestUserSchema } from '../../../schemas/user';
import { randomInt } from 'crypto';
import { RedisClientType } from 'redis';

//TODO: Add comments and documentation
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

  public async userExists(userId: string): Promise<boolean> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    return !!user;
  }

  public async createUser(
    email: string,
    password: string,
    dob: Date | undefined,
    gender: string | undefined,
  ) {
    const newUser = await this.collection.insertOne({
      email: email,
      password: password,
      dob: dob,
      gender: gender,
    });
    console.log(newUser);
    return;
  }
}
