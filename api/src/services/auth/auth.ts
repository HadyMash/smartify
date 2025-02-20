import { DatabaseService } from '../db/db';
import { RequestUser, userSchema, User } from '../../schemas/user';
import crypto from 'crypto';
import { bigint } from 'zod';
import { Server } from 'http';

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
    const srp = new SRP();
    const foundUser = await this.db.userRepository.findUserByEmail(email);
    if (foundUser) {
      throw new Error('User already exists');
    }

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
  public async login(email: string, password: string) {
    const srp = new SRP();
    try {
      const user = await this.db.userRepository.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      const { salt, password } = user;
      // console.log('this is is the email ' + email);
      // console.log(
      //   user +
      //     '\n' +
      //     'This is the password of the user:\n' +
      //     password +
      //     '\n' +
      //     'This is the salt of the user:\n' +
      //     salt,
      // );

      try {
        // console.log('start of SRP');
        const { A, privateA } = await srp.generateA();
        // console.log(
        //   'This is A:\n' + A + '\n' + 'This is private A:\n' + privateA,
        // );
        const { B, privateB } = await srp.generateB(email);

        // console.log(
        //   'This is B:\n' + B + '\n ' + ' This is private B:\n' + privateB,
        // );
        const sP = await srp.scrambleParam(A, B);
        // console.log('This is scrambling parameter:\n', sP);
        const serverSessionKey = await srp.serverSessionKeyGenerator(
          BigInt('0x' + A),
          password,
          sP,
          privateB,
        );
        console.log(
          'This is server session key:\n',
          serverSessionKey.toString(),
        );
        // const clientSessionKey = await srp.clientSessionKeyGenerator(
        //   email,
        //   password,
        //   BigInt('0x' + B),
        //   sP,
        //   privateA,
        // );
        // console.log(
        //   'This is client session key:\n',
        //   clientSessionKey.toString(),
        // );
        // if (clientSessionKey.toString() !== serverSessionKey.toString()) {
        //   throw new Error('Session keys do not match');
        // }
        // const clientK = await srp.deriveSessionKey(clientSessionKey);
        // console.log('This is derived client session key:\n', clientK);
        const serverK = await srp.deriveSessionKey(serverSessionKey);
        //console.log('This is derived server session key:\n', serverK);
        const clientProof = await srp.proofClient(A, B, serverK);
        //console.log('This is client proof:\n', clientProof);
        const serverProof = await srp.proofServer(A, B, serverK);
        //console.log('This is server proof:\n', serverProof);
        if (clientProof === serverProof) {
          console.log('Proofs match');
        }
        if (clientProof !== serverProof) {
          throw new Error('Proofs do not match');
        }
        return 'User is successfully logged in!';
      } catch (_) {
        console.error('Error logging in: Passwords do not match');
      }
    } catch (e) {
      console.error('Error logging in ', e);
      throw new Error('User not found');
    }
  }
  public async changePassword(
    email: string,
    oldpassword: string,
    newPassword: string,
  ): Promise<boolean> {
    console.log('start of change password');
    const user = await this.db.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const { password, salt: oldSalt } = user;
    if (!password) {
      console.log('No password');
    }
    const sPassword = password.toString();
    console.log('This is the current password' + sPassword);
    if (!sPassword) {
      throw new Error('Password not found');
    }
    const srp = new SRP();
    const newPasswordKey = await srp.generateKey(newPassword, oldSalt);
    console.log('This is the new password:' + newPasswordKey.modExp);
    if (newPasswordKey.modExp === password) {
      console.log('New password cannot be the same as the old password');
      throw new Error('New password cannot be the same as the old password');
    }
    try {
      const { A, privateA } = await srp.generateA();
      const { B, privateB } = await srp.generateB(email);
      const sP = await srp.scrambleParam(A, B);
      const serverSessionKey = await srp.serverSessionKeyGeneratorCP(
        BigInt('0x' + A),
        sPassword,
        sP,
        privateB,
      );
      const serverK = await srp.deriveSessionKey(serverSessionKey);
      const clientProof = await srp.proofClient(A, B, serverK);
      const serverProof = await srp.proofServer(A, B, serverK);
      if (clientProof !== serverProof) {
        throw new Error('Proofs do not match');
      }
    } catch (e) {
      console.error('Error changing password', e);
      return false;
    }
    const { salt, modExp } = await srp.generateKey(newPassword);

    const change = await this.db.userRepository.changePassword(
      email,
      salt,
      modExp,
    );

    return true;
  }
  public async deleteAccount(email: string): Promise<boolean> {
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
  public async requestResetPassword(email: string): Promise<string> {
    const user = await this.db.userRepository.findUserByEmail(email);
    console.log(user);
    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    } else {
      try {
        const resetCode = crypto.randomBytes(3).toString('hex');
        if (!resetCode) {
          console.error('Failed to generate reset code');
          throw new Error('Failed to generate reset code');
        }
        const request = this.db.userRepository.requestReset(email, resetCode);
        // const deleteCode = await this.db.userRepository.deleteCode(resetCode);
        return resetCode;
      } catch (e) {
        console.error('Error resetting password', e);
        throw new Error('User not found');
      }
    }
  }
  public async resetPassword(
    email: string,
    resetCode: string,
    newPassword: string,
  ) {
    try {
      const user = await this.db.userRepository.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      const checkCode = await this.db.userRepository.verifyResetCode(
        email,
        resetCode,
      );
      if (checkCode !== 'Code verified') {
        throw new Error('Invalid code');
      }
      const srp = new SRP();
      const { salt, modExp } = await srp.generateKey(newPassword);
      const change = await this.db.userRepository.changePassword(
        email,
        salt,
        modExp,
      );
      const codeDeletion = await this.db.userRepository.deleteCode(resetCode);
      return { change, codeDeletion };
    } catch (e) {
      console.error('Error resetting password', e);
      throw new Error('User not found');
    }
  }
}

class SRP {
  private readonly N: bigint;
  private readonly g: bigint;
  protected readonly db: DatabaseService;

  constructor() {
    this.N = BigInt(
      '125617018995153554710546479714086468246499594858746646874671447258204721048803',
    );
    this.g = BigInt(2);
    this.db = new DatabaseService();
  }
  public async generateKey(
    password: string,
    salt?: string,
  ): Promise<{ modExp: string; salt: string }> {
    //Generating salt
    if (!salt) {
      salt = crypto.randomBytes(32).toString('hex');
    }
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
  public async generatePublicValue() {
    const pV = this.modExp(
      this.g,
      BigInt('0x' + crypto.randomBytes(32).toString('hex')),
      this.N,
    );
    const stringPV = pV.toString();
    return stringPV;
  }
  public async generateA() {
    const rB = crypto.randomBytes(32);
    const privateA = BigInt('0x' + rB.toString('hex'));
    const A = this.modExp(this.g, privateA, this.N); // Compute A = g^a % N
    return { A: A.toString(16), privateA };
  }
  //Generateing a public value B (Server side)
  public async generateB(email: string) {
    try {
      // console.log('Start of extraction of the verifier:');
      const verifier = BigInt(
        await this.db.userRepository.extractVerifier(email),
      );
      // console.log('This is the verifier: ' + verifier);
      // console.log('start of privateB');
      const privateB = BigInt('0x' + crypto.randomBytes(32).toString('hex'));
      // console.log('This is your privateB: ' + privateB);
      const gPowB = this.modExp(this.g, privateB, this.N);
      // console.log('This is your g^B: ' + gPowB);
      const B = (verifier + gPowB) % this.N;
      // console.log('This is your B: ' + B);
      // const B = B.toString();
      return { B: B.toString(16), privateB };
    } catch (e) {
      console.error('Error generating B: ', e);
      throw new Error('Error generating B');
    }
  }
  public async scrambleParam(A: string, B: string) {
    const AB = A + B;
    const hashAB = crypto.createHash('sha256').update(AB).digest('hex');
    const sP = BigInt('0x' + hashAB);
    return sP;
  }
  public async serverSessionKeyGenerator(
    A: bigint,
    password: string,
    sP: bigint,
    privateB: bigint,
  ) {
    const v = BigInt(password);
    const serverSessionKey = this.modExp(
      A * this.modExp(v, sP, this.N),
      privateB,
      this.N,
    );
    return serverSessionKey;
  }

  public async serverSessionKeyGeneratorCP(
    A: bigint,
    password: string,
    sP: bigint,
    privateB: bigint,
  ) {
    const v = BigInt(password);
    const serverSessionKey = this.modExp(
      A * this.modExp(v, sP, this.N),
      privateB,
      this.N,
    );
    return serverSessionKey;
  }
  public async clientSessionKeyGenerator(
    email: string,
    password: string,
    B: bigint,
    sP: bigint,
    privateA: bigint,
  ) {
    const user = await this.db.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const salt = user.salt.toString();
    const hash = crypto
      .createHash('sha256')
      .update(salt + password)
      .digest('hex');
    const hashBig = BigInt('0x' + hash);
    const gX = this.modExp(this.g, hashBig, this.N);
    const B_gX = (B - gX) % this.N;
    const exp = privateA + sP * hashBig;
    const clientSessionKey = this.modExp(B_gX, exp, this.N);
    return clientSessionKey;
  }
  public async deriveSessionKey(sessionKey: bigint) {
    const hexS = sessionKey.toString();
    const K = crypto.createHash('sha256').update(hexS).digest('hex');
    return K;
  }
  public async proofClient(A: string, B: string, K: string) {
    try {
      const concat = A + B + K;

      const clientProof = crypto
        .createHash('sha256')
        .update(concat)
        .digest('hex');
      return clientProof;
    } catch (e) {
      console.error('Error generating proofClient: ', e);
      throw new Error('Error generating proofClient');
    }
  }
  public async proofServer(A: string, B: string, clientProof: string) {
    const concat = A + B + clientProof;
    const serverProof = crypto
      .createHash('sha256')
      .update(concat)
      .digest('hex');
    return serverProof;
  }
}
