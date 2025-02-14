import { DatabaseService } from '../db/db';
import { RequestUser, userSchema, User } from '../../schemas/user';
import crypto from 'crypto';
import { bigint } from 'zod';

//TODO: Add comments and documentation
export class AuthService {
  protected readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  public async register(
    email: string,
    password: string,
    dob: Date | undefined,
    gender: string | undefined,
  ) {
    // TODO: Check if the user already exists, if so deny the registration
    const srp = new SRP();
    const { salt, modExp } = await srp.generateKey(password);

    const newUser = await this.db.userRepository.createUser(
      email,
      modExp,
      salt,
      dob,
      gender,
    );
    return { email: email, gender: gender };
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
  // TODO:Implement a reset password when MFA is integrated into the code
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
export class SRP {
  private readonly N: bigint;
  private readonly g: bigint;

  constructor() {
    this.N = BigInt(
      '125617018995153554710546479714086468246499594858746646874671447258204721048803',
    );
    this.g = BigInt(2);
  }
  public async generateKey(
    password: string,
  ): Promise<{ modExp: string; salt: string }> {
    //Generating salt
    const salt = crypto.randomBytes(32).toString('hex');
    const randomB = crypto.randomBytes(32);
    const randomBI = BigInt('0x' + randomB.toString('hex'));

    //Creating a hash
    const hash = crypto
      .createHash('sha256')
      .update(salt + password)
      .digest('hex');
    const hashBI = BigInt('0x' + hash);
    //Calculating the exponent
    const modExp = this.modExp(this.g, hashBI, this.N);

    return { modExp: modExp.toString(), salt };
  }
  private modExp(base: bigint, exp: bigint, mod: bigint): bigint {
    let res = BigInt(1);
    let b = base % mod;
    let e = exp;
    while (e > 0) {
      if (e % BigInt(2) == BigInt(1)) {
        res = (res * b) % mod;
      }
      e = e / BigInt(2);
      b = (b * b) % mod;
    }
    return res;
  }
}
