/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MFAError,
  MFACode,
  MFA,
  MFAErrorType,
  IncorrectPasswordError,
  srpSessionSchema,
  SRPSession,
  MFAFormattedKey,
  SRPJSONSession,
  AuthSessionError,
} from '../../schemas/auth/auth';
import {
  Email,
  InvalidUserError,
  InvalidUserType,
  LoginData,
  RegisterData,
  UserWithId,
  userWithIdSchema,
} from '../../schemas/auth/user';
import { ObjectIdOrString } from '../../schemas/obj-id';
import { DatabaseService } from '../db/db';
import { MFAService } from './mfa';
import crypto, { createHash, Hash } from 'crypto';
import { modPow } from './srp-utils';

export class AuthService {
  protected readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Registers the user with their information and auth data
   * @param data - The user's data and auth data
   * @returns The user's id and their MFA formatted key so that they can setup
   * MFA
   * @throws An `InvalidUserError` if the user already exists
   */
  public async registerUser(
    data: RegisterData,
  ): Promise<{ userId: ObjectIdOrString; formattedKey: MFAFormattedKey }> {
    console.log('awaiting db connect');

    // Ensure database is fully connected before proceeding
    await this.db.connect();
    console.log('db connected here');

    // check user doesn't already exist
    const userExists = await this.db.userRepository.userExistsEmail(data.email);
    if (userExists) {
      throw new InvalidUserError({ type: InvalidUserType.ALREADY_EXISTS });
    }

    // generate their mfa info
    const ms = new MFAService();
    const formattedKey = ms.generateMFAFormattedKey();

    // create the user and get their user id
    const userId = await this.db.userRepository.createUser(data, formattedKey);

    return { userId, formattedKey };
  }

  /**
   * Initialises an auth session for the user.
   * @param email - The user's email
   */
  public async initiateAuthSession(
    email: Email,
  ): Promise<{ salt: string; B: bigint }> {
    await this.db.connect();
    // get the user's SRP credentiails
    const {
      userId,
      salt,
      verifier: verifierString,
    } = await this.db.userRepository.getUserSRPCredentials(email);

    // generate the server keys
    const verifier = BigInt(verifierString);
    const { b, B } = SRP.generateServerKeys(verifier);

    // get mfa info
    const { formattedKey, confirmed } =
      await this.db.userRepository.getUserMFA(userId);

    const session: SRPSession = {
      userId: userId.toString(),
      email,
      salt,
      verifier,
      B,
      b,
      mfaFormattedKey: formattedKey,
      mfaConfirmed: confirmed,
    };

    const success = await this.db.srpSessionRepository.storeSRPSession(
      srpSessionSchema.parse(session),
    );

    if (!success) {
      throw new Error('Failed to store SRP session');
    }

    return { salt, B };
  }

  /**
   * Get a user's auth session
   * @param email - The user's email
   * @returns The SRP session
   * @throws An {@link AuthSessionError} if the session is expired or does not exist
   */
  public async getAuthSession(email: Email): Promise<SRPSession> {
    await this.db.connect();
    const jsonSession: SRPJSONSession | undefined =
      await this.db.srpSessionRepository.getSRPSession(email);

    if (!jsonSession) {
      throw new AuthSessionError();
    }
    return srpSessionSchema.parse(jsonSession);
  }

  /**
   * Delete S a user's auth session
   * @param email - The user's email
   * @returns
   */
  public async deleteAuthSession(email: Email): Promise<void> {
    await this.db.connect();
    return await this.db.srpSessionRepository.deleteSRPSession(email);
  }

  /**
   * Verifies the client's proof is correct and generates a corresponding server
   * proof
   * @param email - The user's email
   * @param A - The client's public key
   * @param Mc - The client's proof
   * @returns The server's proof
   * @throws An {@link IncorrectPasswordError} if the client's proof is incorrect
   */
  public validateLoginCredentials(
    email: Email,
    A: bigint,
    Mc: bigint,
    session: SRPSession,
  ): bigint {
    // check the client proof is correct
    const serverProof = SRP.verifyClientProof({
      email,
      salt: session.salt,
      verifier: session.verifier,
      A,
      b: session.b,
      B: session.B,
      Mc,
    });

    return serverProof;
  }

  /**
   * Check if a user with the provided email exists
   * @param email - The email to check
   * @returns true if the email is registered, false otherwise
   */
  public async userExistsEmail(email: Email): Promise<boolean> {
    await this.db.connect();
    return await this.db.userRepository.userExistsEmail(email);
  }

  /**
   * Check if a user witht he provided id exists
   * @param userId - The id to check
   * @returns true if the user exists, false otherwise
   */
  public async userExistsId(userId: string): Promise<boolean> {
    await this.db.connect();
    return await this.db.userRepository.userExists(userId);
  }

  /**
   * Verify an MFA Code and mark the user's mfa as correctly setup/confirmed
   * @param userId - The id of the user
   * @param code - the MFA code to verify
   * @throws An error if the user does not exist
   * @throws An error if the user already confirmed MFA
   * @throws An IncorrectMFATokenError if the code is incorrect
   */
  public async confirmUserMFA(userId: string, code: MFACode) {
    await this.db.connect();
    const userMFA = await this.db.userRepository.getUserMFA(userId);
    if (userMFA.confirmed) {
      throw new MFAError(MFAErrorType.MFA_ALREADY_CONFIRMED);
    }
    const ms = new MFAService();
    if (ms.verifyCode(userMFA.formattedKey, code)) {
      // correct, mark mfa as confirmed
      await this.db.userRepository.confirmUserMFA(userId);
    } else {
      throw new MFAError(MFAErrorType.INCORRECT_CODE);
    }
  }

  /**
   * Get a user by their id
   * @param userId - The user's id
   * @returns The user
   */
  public async getUserById(userId: ObjectIdOrString): Promise<UserWithId> {
    await this.db.connect();
    return await this.db.userRepository.getUserById(userId);
  }

  /**
   * Verify the MFA code entered by the user is correct
   * @param userId - The id of the user
   * @param code - The MFA code the user entered
   * @returns true if correct, false otherwise
   * @throws An MFAError if the user has not confirmed setting up MFA
   */
  public async verifyMFA(
    userId: ObjectIdOrString,
    code: MFACode,
  ): Promise<boolean> {
    await this.db.connect();
    const mfa = await this.db.userRepository.getUserMFA(userId);
    if (!mfa.confirmed) {
      throw new MFAError(MFAErrorType.MFA_NOT_CONFIRMED);
    }
    const ms = new MFAService();
    const result = ms.verifyCode(mfa.formattedKey, code);
    return result;
  }
}

export class SRP {
  /**
   * Generate server's private and public keys for SRP authentication
   * @param verifier - The user's verifier value
   * @returns The server's private key (b) and public key (B)
   */
  static generateServerKeys(verifier: bigint): { b: bigint; B: bigint } {
    // Generate random 32-byte private key
    const b = this.generateRandomBigInt(32);

    // Calculate B = (k*v + g^b) % N
    const kv = (this.k * verifier) % this.N;
    const gb = modPow(this.g, b, this.N);
    const B = (kv + gb) % this.N;

    return { b, B };
  }

  /**
   * Verify the client's proof and generate server proof
   * @param data - The SRP authentication data
   * @returns The server's proof value
   * @throws IncorrectPasswordError if the client's proof is incorrect
   */
  static verifyClientProof(data: {
    email: string;
    salt: string;
    verifier: bigint;
    A: bigint;
    b: bigint;
    B: bigint;
    Mc: bigint;
  }): bigint {
    const { email, salt, verifier, A, b, B, Mc } = data;

    // Security check: A should not be 0 mod N
    if (A % this.N === BigInt(0)) {
      console.log('A % N === 0, throwing');

      throw new IncorrectPasswordError();
    }

    // Calculate u = H(A | B)
    const u = this.calculateU(A, B);

    // Security check: u should not be 0
    if (u === BigInt(0)) {
      console.log('u === 0, throwing');

      throw new IncorrectPasswordError();
    }

    // Calculate S = (A * (verifier^u)) ^ b % N
    const vu = modPow(verifier, u, this.N);
    const Avu = (A * vu) % this.N;
    const S = modPow(Avu, b, this.N);

    // Calculate K = H(S)
    const K = this.hash(S.toString(16));

    // Calculate expected client proof
    const expectedMc = this.calculateClientProof(email, salt, A, B, K);

    // Verify client proof
    if (expectedMc !== Mc) {
      console.log('expectedMc !== Mc, throwing');

      throw new IncorrectPasswordError();
    }

    // Generate server proof
    const Ms = this.calculateServerProof(A, Mc, K);
    return Ms;
  }

  /**
   * Calculate the hash parameter u = H(A | B)
   */
  private static calculateU(A: bigint, B: bigint): bigint {
    const concatenated = A.toString(16) + B.toString(16);
    return BigInt('0x' + this.hashString(concatenated));
  }

  /**
   * Calculate the client proof M = H(H(N) XOR H(g) | H(email) | salt | A | B | K)
   */
  private static calculateClientProof(
    email: string,
    salt: string,
    A: bigint,
    B: bigint,
    K: bigint,
  ): bigint {
    // Hash N and g
    const HN = this.hash(this.N.toString(16));
    const Hg = this.hash(this.g.toString(16));

    // XOR operation (convert to Buffer for easier XOR)
    const hnBuffer = Buffer.from(HN.toString(16).padStart(64, '0'), 'hex');
    const hgBuffer = Buffer.from(Hg.toString(16).padStart(64, '0'), 'hex');
    const xorBuffer = Buffer.alloc(hnBuffer.length);

    for (let i = 0; i < hnBuffer.length; i++) {
      xorBuffer[i] = hnBuffer[i] ^ (i < hgBuffer.length ? hgBuffer[i] : 0);
    }

    const Hemail = this.hashString(email);

    const concatString =
      xorBuffer.toString('hex') +
      Hemail +
      salt +
      A.toString(16) +
      B.toString(16) +
      K.toString(16);

    return BigInt('0x' + this.hashString(concatString));
  }

  /**
   * Calculate the server proof M2 = H(A | M | K)
   */
  private static calculateServerProof(A: bigint, M: bigint, K: bigint): bigint {
    const concatenated = A.toString(16) + M.toString(16) + K.toString(16);
    return BigInt('0x' + this.hashString(concatenated));
  }

  /**
   * Generate a random BigInt of specified byte length
   */
  public static generateRandomBigInt(byteLength: number): bigint {
    const bytes = crypto.randomBytes(byteLength);
    return BigInt('0x' + bytes.toString('hex'));
  }

  /**
   * Hash a string using SHA-256
   */
  private static hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Hash a BigInt
   */
  private static hash(input: string): bigint {
    return BigInt('0x' + this.hashString(input));
  }

  /**
   * Calculate the parameter x = H(salt | H(email | ':' | password))
   * This is used to derive the private key from the password
   */
  //private static calculateX(
  public static calculateX(
    email: string,
    password: string,
    salt: string,
  ): bigint {
    if (!email || !password || !salt) {
      throw new Error('Email, password, and salt must not be empty');
    }

    // First hash: H(email | ':' | password)
    const identity = this.hashString(`${email}:${password}`);

    // Convert salt from hex string to Buffer
    const saltBuffer = Buffer.from(salt, 'hex');

    // Concatenate salt bytes with identity hash bytes
    const saltedIdentity = Buffer.concat([
      saltBuffer,
      Buffer.from(identity, 'hex'),
    ]);

    // Final hash: H(salt | H(email | ':' | password))
    const result = this.hashString(saltedIdentity.toString('hex'));
    return BigInt('0x' + result);
  }

  // Constants
  private static readonly SRP_N_HEX =
    `AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294 3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74 7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A 436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D 5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73 03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6 94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F 9E4AFF73`
      .trim()
      .replace(/[\s\r\n]+/g, '');
  private static readonly SRP_GENERATOR = 2;
  private static readonly SRP_K = 3;

  public static readonly N = BigInt('0x' + this.SRP_N_HEX);
  public static readonly g = BigInt(this.SRP_GENERATOR);
  public static readonly k = BigInt(this.SRP_K);
}
