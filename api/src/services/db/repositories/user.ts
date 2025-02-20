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
    verifier: string,
    salt: string,
    dob: Date | undefined,
    gender: string | undefined,
  ) {
    const newUser = await this.collection.insertOne({
      email: email,
      verifier: verifier,
      salt: salt,
      dob: dob,
      gender: gender,
    });
    console.log(newUser);
    console.log(email);
    return;
  }
  public async findUserByEmail(email: string) {
    const user = await this.collection.findOne({ email: email });
    if (user) {
      console.log(`User found: ${JSON.stringify(user)}`);
      return { email: user.email, password: user.password, salt: user.salt };
    } else {
      console.log('User not found');
      return null;
    }
  }
  public async getObjectIdByEmail(email: string): Promise<string | null> {
    try {
      const user = await this.collection.findOne(
        { email: email }, // Match the email
        { projection: { _id: 1 } }, // Only fetch the _id field
      );

      // Ensure user exists and return the ObjectId as a string
      return user?._id ? user._id.toString() : null;
    } catch (error) {
      console.error('Error fetching ObjectId by email:', error);
      return null; // Handle any unexpected errors gracefully
    }
  }
  public async changePassword(email: string, salt: string, modExp: string) {
    if (email === null) {
      console.log('No user found');
      return undefined;
    }
    const update = await this.collection.updateOne(
      { email: email, salt: salt, modExp: modExp },
      { $set: { verifier: modExp, salt: salt } },
    );
    if (!update) {
      return;
    }
    if (update.modifiedCount !== 0) return update.modifiedCount;
  }
  public async deleteUser(email: string) {
    const user = await this.collection.findOneAndDelete({ email: email });
    if (!user) {
      console.log('User not found');
      return;
    }
    if (!user.value) {
      return;
    }
    return user.value;
  }
  public async requestReset(email: string, code: string) {
    const user = await this.collection.findOne({ email: email });
    if (!user) {
      return 'User not found';
    }
    const codeInput = await this.collection.updateOne(
      { email: email },
      { $set: { code: code } },
    );
  }
  public async verifyResetCode(email: string, code: string): Promise<string> {
    const user = await this.collection.findOne({ email: email });
    if (!user) {
      return 'User not found';
    }
    if (user.code === code) {
      return 'Code verified';
    } else {
      return 'Code not verified';
    }
  }

  public async deleteCode(code: string): Promise<boolean> {
    const codeInput = await this.collection.updateOne(
      { code: code },
      { $unset: { code: code } },
    );
    if (codeInput.modifiedCount === 1) {
      console.log(`Parameter '${code}' deleted successfully`);
      return true;
    } else {
      console.log(`Failed to delete parameter '${code}'`);
      return false;
    }
  }
  public async extractVerifier(email: string): Promise<bigint> {
    const user = await this.collection.findOne({ email: email });
    if (!user) {
      throw new Error('User not found');
    }
    return user.password;
  }
}
