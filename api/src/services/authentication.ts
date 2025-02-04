import { randomBytes, pbkdf2Sync } from 'crypto';
import { Collection, Db, MongoClient } from 'mongodb';
import { UserType, userSchema } from '../schemas/users';
interface User {
  _id: string;
  email: string;
  password: string;
  dob: Date;
  gender: string;
  salt: string;
}
export class UserRepository {
  public static async findById(userId: string) {
    const testUser = {
      _id: userId,
    };
    return testUser;
  }
  public static async findByEmail(email: string) {
    if (!email) {
      return console.log('Please enter a valid email');
    }
    const testUser = {
      email: email,
    };

    return testUser;
  }
}
export class AuthenticationService {
  private collection = 'users';
  /**
   * This method chekcks for the errors in inputting the password and requires the password to have at least
   * 1 Lowercase character, 1 Uppercase Character, 1 Number and 1 Symbol
   **/
  private static readonly passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  public static validatePassword(password: string): boolean {
    return this.passwordRegex.test(password);
  }
  /**
   * @param password
   * @throws If the password is not a valid password
   * @throws If the password length is below the required length
   * @returns The hash of the password and the salt.
   */
  public async hashPassword(
    password: string,
  ): Promise<{ salt: string; hash: string }> {
    if (!AuthenticationService.validatePassword(password)) {
      throw new Error('Password is not valid.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const salt = randomBytes(16).toString('hex'); // Generate a random salt
    if (!salt || typeof salt !== 'string') {
      throw new Error('Failed to generate salt');
    }
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex'); // Generate hash
    const generator = 3;
    const verifier = generator;
    return { salt, hash };
  }
  /**
   * This method will check if the user exists already, after which it will create a new user, hash the password and then
   * @throws If a user exists return an error
   * @throws If the user's password is incorrect format
   * @throws If the user's password is below 8 characters
   * */
  public async createUser(userData: UserType) {
    // TODO: Check if user exists in the database
    const password = userData.password;
    // !temporary
    const existingUser = true;
    if (existingUser) {
      throw new Error('User already exists');
    }
    if (!AuthenticationService.validatePassword(userData.password)) {
      throw new Error('Password is not valid.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const { salt, hash } = await this.hashPassword(password);
    //const result = await db.collection(this.collection).insertOne({...userData, password:this.hashPassword.hash, salt, createdAt:new Date()});
    return;
  }
  /**
   *
   * @param userData User's data thats in the database
   * @throws If user is not found in the database
   * @throws If the password does not match the password inside the database
   * @returns
   */
  public async login(userData: UserType) {
    //const user = await db.collection('users').finOne({email});
    //if (!user){
    //throw new Error("User not found");
    //}
    //const {salt, hash} = user;
    //   if(hashedPassword === user.password){
    //     return true;
    //   }
    //   else{
    //     throw new Error("Incorrect password");
    //   }
    return true;
  }

  /**
   * This method checks if the password is the same and if the new password is as per requirements
   * @param password - The old password of the user
   * @param newPassword -The new password that the user wants to change to
   * @throws - If the new password is the same as the old one
   * @throws - If the password as not per requirements
   * @throws - If the new password is below the character minimum
   * @returns - The new password
   */
  public async changePassword(
    password: string,
    newPassword: string,
  ): Promise<{ newPassword: string }> {
    if (password === newPassword) {
      throw new Error('Passwords cannot be the same as the current password');
    }
    if (!AuthenticationService.validatePassword(newPassword)) {
      throw new Error('New password is invalid.');
    }
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }
    // Assuming the password change logic is implemented here
    return { newPassword };
  }
  public async resetPassword(email: string, password: string) {
    UserRepository.findByEmail(email);
    if (email) {
      const { salt, hash } = await this.hashPassword(password);
      // Update password in the database
      // const result = await db.collection('users').updateOne({email},{ $set: { password: hash, salt }});
      console.log('Password reset successfully');
    } else {
      console.log('Email not found');
    }
  }
  public async deleteUser(userId: string): Promise<boolean> {
    try {
      //const userDeleted = await deleteUserById(userId);
      //return userDeleted
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
