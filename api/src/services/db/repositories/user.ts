import assert from 'assert';
import { Collection, Db, ObjectId } from 'mongodb';
import { User } from '../../../schemas/auth/user';
import { randomInt } from 'crypto';
import { RedisClientType } from 'redis';

const COLLECTION_NAME = 'users';

export interface UserDoc extends User {}

export class UserRepository {
  private readonly collection: Collection<UserDoc>;
  private readonly redis: RedisClientType;

  constructor(db: Db, redis: RedisClientType) {
    this.collection = db.collection<UserDoc>(COLLECTION_NAME);
    this.redis = redis;
  }

  //public async getUserById(userId: string) {
  //  // TODO: implement
  //}

  ///**
  // *Checks if a user exists by their id
  // * @param userId - The user to check
  // * @returns true if the user exists, false otherwise
  // */
  //public async userExists(userId: string): Promise<boolean> {
  //  assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');
  //  const user = await this.collection.findOne({ _id: new ObjectId(userId) });
  //  return !!user;
  //}

  ///**
  // * @returns The user's id
  // */
  //public async createUser() {
  //  const result = await this.collection.insertOne({
  //    email: `example${randomInt(99999)}@domain.com`,
  //  });
  //
  //  return result.insertedId.toString();
  //}
}
