import { DatabaseService } from '../db/db';
import { RequestUser, userSchema, User } from '../../schemas/user';
import crypto from 'crypto';
import { MFAService } from './mfa';
import { TokenService } from './token';
import { ObjectId } from 'mongodb';

export class AuthService {
  protected readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Registers a new user in the system.
   * Uses Secure Remote Password for the password and stores the hash and the salt in the database.
   * @param _id - The unique identifier for the user.
   * @param email - The email address of the user.
   * @param password - The password for the user's account.
   * @param dob - The date of birth of the user (optional).
   * @param gender - The gender of the user (optional).
   * @returns A promise that resolves when the user is successfully registered.
   * @throws An error if the user already exists.
   */
  public async registerWithEmailandPassword(
    _id: string,
    email: string,
    password: string,
    dob?: Date,
    gender?: string,
  ) {
    const foundUser = await this.db.userRepository.findUserByEmail(email);
    if (foundUser) {
      throw new Error('User already exists');
    }

    const srp = new SRP();
    const { salt, modExp } = await srp.generateKey(password);
    const id = new ObjectId(_id);

    const newUser = await this.db.userRepository.createUser(
      id,
      email,
      modExp,
      salt,
      dob,
      gender,
    );

    return;
  }

  public async checkMFASetup(email: string) {
    const deviceId = 'iphone';
    const userId = await this.db.userRepository.getObjectIdByEmail(email);

    if (!userId) throw new Error('User not found');
    const stringID = userId.toString();
    const mfa = new MFAService();
    const token = new TokenService();
    const { formattedKey } =
      await this.db.userRepository.getUserMFAformattedKey(stringID);

    const finishSetup = await mfa.finishInitMFASetup(stringID, formattedKey);
    if (!finishSetup) throw new Error('User did not setup MFA');
    return finishSetup;
  }
  /**
   * Logs in a user with the provided email and password.
   * It checks if the user exists in the database and then retrieves the sakt and the hash of the user.
   * After which it uses the SRP class to generate the session keys and proofs them. If the proofs match the user is logged in.
   *
   * @param email - The email of the user attempting to log in.
   * @param password - The password of the user attempting to log in.
   * @returns When a user is successfully logged in.
   * @throws An error if the a user isnt found in the database
   * @throws An error if the user is not found or if the proofs do not match.
   */
  public async login(email: string, verifier: string) {
    const srp = new SRP();
    try {
      const user = await this.db.userRepository.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      const { salt, verifier } = user;

      try {
        const { A, privateA } = await srp.generateA();

        const { B, privateB } = await srp.generateB(email);

        const sP = await srp.scrambleParam(A, B);
        const serverSessionKey = await srp.serverSessionKeyGenerator(
          BigInt('0x' + A),
          verifier,
          sP,
          privateB,
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
        }
        if (clientProof !== serverProof) {
          throw new Error('Proofs do not match');
        }
        return;
      } catch (_) {
        console.error('Error logging in: Passwords do not match');
        throw new Error('Invalid password. Please try again');
      }
    } catch (e) {
      console.error('Error logging in ', e);
      throw new Error('User not found');
    }
  }
  /**
   * Changes the password for a user identified.
   *
   * @param email - The email of the user whose password is to be changed.
   * @param oldpassword - The current password of the user.
   * @param newPassword - The new password to be set for the user.
   * @returns A promise that resolves to a boolean indicating whether the password change was successful.
   * @throws Will throw an error if the user is not found, if the new password is the same as the old password, or if the proofs do not match.
   */
  public async changePassword(
    email: string,
    oldVerifier: string,
    newVerifier: string,
  ): Promise<boolean> {
    console.log('start of change password');
    const user = await this.db.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const { verifier, salt: oldSalt } = user;
    if (!verifier) {
      console.log('No password');
    }
    const sPassword = verifier.toString();
    console.log('This is the current password' + sPassword);
    if (!sPassword) {
      throw new Error('Password not found');
    }
    const srp = new SRP();
    const newPasswordKey = await srp.generateKey(newVerifier, oldSalt);
    console.log('This is the new password:' + newPasswordKey.modExp);
    if (newPasswordKey.modExp === verifier) {
      console.log('New password cannot be the same as the old password');
      throw new Error('New password cannot be the same as the old password');
    }
    try {
      const { A, privateA } = await srp.generateA();
      const { B, privateB } = await srp.generateB(email);
      const sP = await srp.scrambleParam(A, B);
      const serverSessionKey = await srp.serverSessionKeyGenerator(
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
    const { salt, modExp } = await srp.generateKey(newVerifier);
    const id = await this.db.userRepository.getObjectIdByEmail(email);
    if (!id) {
      throw new Error('User not found');
    }

    const change = await this.db.userRepository.changePassword(
      id,
      salt,
      modExp,
    );

    return true;
  }
  /**
   * Deletes a user account.
   * Checks if the user exists and if so deletes the account.
   * @param email - The email of the user to delete.
   * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
   * @throws Will throw an error if the user is not found
   * @throws If deletion of the user fails.
   *
   */
  public async deleteAccount(_id: string): Promise<boolean> {
    try {
      if (!_id) {
        throw new Error('Invalid user id');
      }

      const userId = await this.db.userRepository.getUserById(_id);
      if (!userId) {
        throw new Error('User not found');
      }
      try {
        await this.db.userRepository.deleteUser(userId._id);
        return true;
      } catch (_) {
        throw new Error('Failed to delete user');
      }
    } catch (e) {
      console.error('Error logging in', e);
      throw new Error('User not found');
    }
  }
  /**
   * Requests a password reset for the user.
   * It chceks if the user exists and if so the method generates a 6 digit hexidecimal code
   * and returns it to the user with a request to reset the password.
   *
   *
   * @param email - The email address of the user requesting a password reset.
   * @returns A promise that resolves to the reset code as a string.
   * @throws Will throw an error if the user is not found
   * @throws If there is an issue generating the reset code.
   * @throws If a user was not found
   */
  public async requestResetPassword(email: string) {
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

        return resetCode;
      } catch (e) {
        console.error('Error resetting password', e);
        throw new Error('User not found');
      }
    }
  }
  /**
   * Resets the password for a user identified by their email.
   * It checks if the user exists and then verifies the code against the one stored in the datbase
   * if they match it changes the password to the new password with the application of Secure Remote Password protocol.
   * It then stores the new hash and the salt in the database.
   * If the verification of the code fails it throws an error.
   * @param email - The email address of the user requesting the password reset.
   * @param resetCode - The reset code sent to the user's email for verification.
   * @param newPassword - The new password to be set for the user.
   * @returns An object containing the result of the password change and code deletion.
   * @throws Will throw an error if the user is not found or if the reset code is invalid.
   */
  public async resetPassword(
    _id: string,
    resetCode: string,
    newPassword: string,
  ) {
    try {
      const user = await this.db.userRepository.getUserById(_id);
      if (!user) {
        throw new Error('User not found');
      }
      const checkCode = await this.db.userRepository.verifyResetCode(
        _id,
        resetCode,
      );
      if (checkCode !== 'Code verified') {
        throw new Error('Invalid code');
      }
      const id = await this.db.userRepository.getUserById(_id);
      if (!id) {
        throw new Error('User not found');
      }
      const objId = new ObjectId(_id);
      const srp = new SRP();
      const { salt, modExp } = await srp.generateKey(newPassword);
      const change = await this.db.userRepository.changePassword(
        objId,
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
    if (!process.env.N) {
      throw new Error('Environment variable N not set');
    }
    if (!process.env.g) {
      throw new Error('Environment variable g not set');
    }

    this.N = BigInt(process.env.N);
    this.g = BigInt(process.env.g);
    this.db = new DatabaseService();
  }
  /**
   * Generates a cryptographic key using a password and an optional salt.
   * If no salt is provided, a new random salt is generated.
   * The function returns an object containing the modular exponentiation result and the salt used.
   *
   * @param password - The password to be used for key generation.
   * @param salt - An optional salt value. If not provided, a new random salt is generated.
   * @returns A promise that resolves to an object containing the modular exponentiation result (`modExp`) and the salt used.
   */
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
  /**
   * Generates a public value using modular exponentiation.
   *
   * This function generates a random 32-byte value, converts it to a BigInt,
   * and then performs modular exponentiation using the base `g` and modulus `N`.
   * The result is converted to a string and returned.
   *
   * @returns {Promise<string>} A promise that resolves to the generated public value as a string.
   */
  public async generatePublicValue() {
    const pV = this.modExp(
      this.g,
      BigInt('0x' + crypto.randomBytes(32).toString('hex')),
      this.N,
    );
    const stringPV = pV.toString();
    return stringPV;
  }
  /**
   * Generates a random private value and computes the corresponding public value.
   *
   * This method generates a random 32-byte private value and computes the public value
   * using modular exponentiation. The public value is computed as A = g^a % N, where
   * `g` is the generator and `N` is the prime modulus.
   *
   * @returns An object containing:
   * - `A`: The public value as a hexadecimal string.
   * - `privateA`: The private value as a BigInt.
   */
  public async generateA() {
    const rB = crypto.randomBytes(32);
    const privateA = BigInt('0x' + rB.toString('hex'));
    const A = this.modExp(this.g, privateA, this.N); // Compute A = g^a % N
    return { A: A.toString(16), privateA };
  }
  //Generateing a public value B (Server side)
  /**
   * Generates the value B and a private value privateB for the given email.
   *
   * This function performs the following steps:
   * 1. Extracts the verifier associated with the provided email from the database.
   * 2. Generates a random private value privateB.
   * 3. Computes g^B mod N using the privateB.
   * 4. Computes the value B as (verifier + g^B) % N.
   *
   * @param email - The email address for which to generate the values.
   * @returns An object containing:
   *  - `B`: The computed value B as a hexadecimal string.
   *  - `privateB`: The generated private value privateB.
   * @throws Will throw an error if there is an issue generating the values.
   */
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
  /**
   * Scrambles two input strings by concatenating them, hashing the result using SHA-256,
   * and converting the hash to a BigInt.
   *
   * @param A - The first input string.
   * @param B - The second input string.
   * @returns A promise that resolves to a BigInt representation of the hashed concatenated string.
   */
  public async scrambleParam(A: string, B: string) {
    const AB = A + B;
    const hashAB = crypto.createHash('sha256').update(AB).digest('hex');
    const sP = BigInt('0x' + hashAB);
    return sP;
  }

  /**
   * Generates a server session key using the provided parameters.
   *
   * @param A - A bigint value used in the key generation process.
   * @param password - A string representing the password.
   * @param sP - A bigint value used in the key generation process.
   * @param privateB - A bigint value representing the private key.
   * @returns A bigint representing the generated server session key.
   */
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

  /**
   * Generates a client session key for authentication.
   *
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @param B - The server's public value.
   * @param sP - The server's private value.
   * @param privateA - The client's private value.
   * @returns A promise that resolves to the client session key as a bigint.
   * @throws Will throw an error if the user is not found.
   */
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
  /**
   * Derives a session key by hashing the provided session key using SHA-256.
   *
   * @param sessionKey - The session key as a bigint.
   * @returns A promise that resolves to the derived session key as a hexadecimal string.
   */
  public async deriveSessionKey(sessionKey: bigint) {
    const hexS = sessionKey.toString();
    const K = crypto.createHash('sha256').update(hexS).digest('hex');
    return K;
  }
  /**
   * Generates a client proof by concatenating the provided strings and hashing the result using SHA-256.
   *
   * @param {string} A - The first string to be concatenated.
   * @param {string} B - The second string to be concatenated.
   * @param {string} K - The third string to be concatenated.
   * @returns {Promise<string>} - A promise that resolves to the SHA-256 hash of the concatenated string.
   * @throws {Error} - Throws an error if there is an issue generating the client proof.
   */
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
  /**
   * Generates a server proof by concatenating the provided values and hashing them using SHA-256.
   *
   * @param A - The first value to be concatenated.
   * @param B - The second value to be concatenated.
   * @param clientProof - The client proof to be concatenated.
   * @returns A promise that resolves to the server proof as a hexadecimal string.
   */
  public async proofServer(A: string, B: string, clientProof: string) {
    const concat = A + B + clientProof;
    const serverProof = crypto
      .createHash('sha256')
      .update(concat)
      .digest('hex');
    return serverProof;
  }
}
