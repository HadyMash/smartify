import assert from 'assert';
import { Collection, Db, ObjectId } from 'mongodb';
import { RequestUser, requestUserSchema } from '../../../schemas/user';
import { randomInt } from 'crypto';
import { RedisClientType } from 'redis';
import { boolean } from 'zod';

//TODO: Add comments and documentation
const COLLECTION_NAME = 'users';

export class UserRepository {
  private readonly collection: Collection;
  private readonly redis: RedisClientType;

  constructor(db: Db, redis: RedisClientType) {
    this.collection = db.collection(COLLECTION_NAME);
    this.redis = redis;
  }


  /**
   * Retrieves a user id from the database by id.
   *
   * @param userId - The id of the user, which must be a valid ObjectId.
   * @returns A promise that resolves to the user id  if found, or null if not found.
   * @throws Will throw an error if the provided userId is not a valid ObjectId.
   */

  public async getUserById(userId: string) {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    const doc = await this.collection.findOne({ _id: new ObjectId(userId) });

    return doc;
  }

  /**
   * Checks if a user exists in the database by their user ID.
   *
   * @param userId - The ID of the user to check.
   * @returns true if the user exists, otherwise false.
   * @throws Will throw an error if the provided userId is not a valid ObjectId.
   */
  public async userExists(userId: string): Promise<boolean> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    return !!user;
  }

  /**
   * Creates a new user in the database.
   *
   * @param _id - The unique identifier for the user.
   * @param email - The email address of the user.
   * @param passwordHash - The hashed password of the user.
   * @param salt - The salt used for hashing the password.
   * @param dob - The date of birth of the user (optional).
   * @param gender - The gender of the user (optional).
   * @returns The ID of the newly created user as a string.
   */
  public async createUser(
    _id: ObjectId,
    email: string,
    verifier: string,
    salt: string,
    dob: Date | undefined,
    gender: string | undefined,
  ) {
    const newUser = await this.collection.insertOne({
      _id: _id,
      email: email,
      verifier: verifier,
      salt: salt,
      dob: dob,
      gender: gender,
    });
    console.log(newUser);
    console.log(email);
    return newUser.insertedId.toString();
  }
  /**
   * Updates the user document in the database with the specified userId.
   * Sets the `formattedKey` field to the provided value and sets MFA automatically to false as it will be done after.
   *
   * @param userId - The unique identifier of the user to update. Must be a valid ObjectId.
   * @param formattedKey - The new value to set for the `formattedKey` field.
   * @returns A promise that resolves to `true` if the update was successful, otherwise `false`.
   * @throws Will throw an error if `userId` is not a valid ObjectId.
   */
  public async updateUser(userId: string, formattedKey: string) {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');
    const updateResult = await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { formattedKey: formattedKey, MFA: false } },
    );
    return updateResult.modifiedCount > 0;
  }
  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user to find.
   * @returns An object containing the user's email, password, and salt if found, or null if not found.
   */
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
  /**
   * Fetches the ObjectId of a user based on their email.
   *
   * @param email - The email of the user to find.
   * @returns A Promise that resolves to the ObjectId of the user as a string, or null if the user is not found.
   *          If an error occurs during the database operation, the Promise will resolve to null.
   */
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
  /**
   * Changes the password for a user identified by their email.
   *
   * @param email - The email of the user whose password is to be changed.
   * @param salt - The salt to be used for hashing the new password.
   * @param modExp - The new hashed password .
   * @returns The updated user document if the update was successful, otherwise `undefined`.
   */
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

  /**
   * Deletes a user from the collection based on the provided email.
   *
   * @param email - The email of the user to be deleted.
   * @returns A boolean whether the deletion was successful
   */

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
  /**
   * Requests a password reset for the user with the given email.
   *
   * It searches for a user by their email address if theuser is not found throws an error.
   * else it updates the user's record with the provided reset code.
   *
   * @param email - The email address of the user requesting the password reset.
   * @param code - The reset code to be associated with the user's account.
   */
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

  /**
   * Verifies the reset code for a given user's email.
   *
   * @param email - The email address of the user.
   * @param code - The reset code to verify.
   * @returns A string indicating whether the code was verified or not.
   */
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

  /**
   * Deletes a code from the collection.
   *
   * @param code - The code to be deleted.
   * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
   */
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
  /**
   * Extracts the password hash from the database.
   *
   * @param email - The email address of the user.
   * @returns A password hash of the user.
   * @throws An error if the user is not found.
   */
  public async extractVerifier(email: string): Promise<bigint> {
    const user = await this.collection.findOne({ email: email });
    if (!user) {
      throw new Error('User not found');
    }
    return user.password;
  }
  /**
   * Checks if MFA is initialized for a user.
   *
   * @param userId - The id of the user.
   * @returns A boolean indicating whether MFA is initialized.
   * @throws An error if the user does not exist.
   */
  public async isUserMFAInitialised(userId: string): Promise<boolean> {
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User does not exist');
    }
    const { MFA } = user;
    return MFA;
  }
  /**
   * Saves the unconfirmed MFA key for a user.
   *
   * @param userId - The id of the user.
   * @param formattedKey - The formatted MFA key to be saved.
   * @returns A boolean indicating the success of the operation.
   * @throws An error if the user does not exist.
   */
  public async saveUserMFAUnconfirmed(
    userId: string,
    formattedKey: string,
  ): Promise<boolean> {
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User does not exist');
    }
    const update = await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { formattedKey: formattedKey } },
    );
    return true;
  }
  /**
   * Retrieves the MFA formatted key and confirmation status for the user.
   *
   * @param userId - The id of the user.
   * @returns An object containing the formatted key and confirmation status.
   * @throws An error if the user does not exist.
   */
  public async getUserMFAformattedKey(
    userId: string,
  ): Promise<{ formattedKey: string; confirmed: boolean }> {
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User does not exist');
    }
    return {
      formattedKey: user.formattedKey,
      confirmed: user.confirmed,
    };
  }
  /**
   * Confirms the MFA for a user.
   *
   * @param userId - The id of the user.
   * @returns A boolean indicating whether the operation was successful.
   * @throws An error if the user does not exist.
   */
  public async confirmUserMFA(userId: string): Promise<boolean> {
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User does not exist');
    }
    const update = await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { MFA: true } },
    );
    return true;
  }
}
