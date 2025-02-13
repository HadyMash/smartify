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
  public async findUserByEmail(
    email: string,
  ): Promise<Partial<RequestUser | null>> {
    console.log(`Searching for user with email: ${email}`);
    const user = await this.collection.findOne({ email: email });
    if (user) {
      console.log(`User found: ${JSON.stringify(user)}`);
      return { email: user.email };
    } else {
      console.log('User not found');
      return null;
    }
  }
  public async changePassword(
    email: string,
    newPassword: string,
  ): Promise<RequestUser | undefined> {
    const user = await this.collection.findOneAndUpdate(
      { email: email },
      { $set: { password: newPassword } },
    );
    return;
  }
  public async deleteUser(email: string): Promise<boolean> {
    const user = await this.collection.findOneAndDelete({ email: email });
    return true;
  }
}
