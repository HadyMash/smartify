import { DatabaseService } from '../db/db';
import { RequestUser, userSchema, User } from '../../schemas/user';
import crypto from 'crypto';

//TODO: Add comments and documentation
export class AuthSerice {
  protected readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  public async register(
    email: string,
    password: string,
    dob: Date | undefined,
    gender: string | undefined,
  ): Promise<RequestUser> {
    // TODO: Check if the user already exists, if so deny the registration

    const newUser = await this.db.userRepository.createUser(
      email,
      password,
      dob,
      gender,
    );
    return { email, password, dob, gender };
  }
  public async login(email: string, password: string): Promise<Partial<User>> {
    //TODO: Check if the user exists, if so let him login otherwise deny
    try {
      const user = await this.db.userRepository.findUserByEmail(email);
      console.log(user);

      if (!user) {
        throw new Error('User not found');
      }
      return { email };
    } catch (e) {
      console.error('Error logging in', e);
      throw new Error('User not found');
    }
  }
  public async changePassword(
    email: string,
    password: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.db.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    //TODO: Check the passwords and return true if chnged otherwise false
    return true;
  }
  public async deleteAccount(email: string): Promise<boolean> {
    //TODO: Implement MFA to check that the token is valid and isnt expired and the signature is valid
    //TODO: find the user by their email, and the delete all of their data
    try {
      const user = await this.db.userRepository.findUserByEmail(email);
      console.log(user);
      if (!user) {
        throw new Error('User not found');
      }
      try {
        await this.db.userRepository.deleteUser(email);
        return true;
      } catch (_) {
        throw new Error('Failed to delete user');
      }
    } catch (e) {
      console.error('Error logging in', e);
      throw new Error('User not found');
    }
  }
  //   public async requestReset(email: string): Promise<void> {
  //     //Receives the user’s email, generates a token, stores it, and sends the reset email.
  //     try {
  //       const user = await this.db.userRepository.findUserByEmail(email);
  //       console.log(user);
  //       if (!user) {
  //         throw new Error('User not found');
  //       }
  //       }
  //       return;
  //     } catch (e) {
  //   return "lmao"
  //   }
  //   public async resetPassword(): Promise<boolean> {
  //     return true
  //   }
}
