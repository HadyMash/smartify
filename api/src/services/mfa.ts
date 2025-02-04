import * as authenticator from 'authenticator';
import { MFAToken } from '../schemas/mfa';

// TODO: replace temp classes with actual classes

// ! temp interface
interface MFAFormattedKey {
  formattedKey: string;
  confirmed: boolean;
}

// ! temp interface
interface User {
  _id: string;
  email: string;
}

// ! temp class
class UserRepository {
  private static readonly m: { [key: string]: MFAFormattedKey } = {};

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  public async userExists(userId: string): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getUserById(userId: string) {
    const testUser: User = {
      _id: userId,
      email: 'example@domain.com',
    };
    return testUser;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getUserMFAformattedKey(userId: string) {
    console.log('userid', userId, 'm', UserRepository.m);

    if (!UserRepository.m[userId]) {
      return null;
    }
    return UserRepository.m[userId];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async isUserMFAInitialised(userId: string) {
    return !!UserRepository.m[userId];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async saveUserMFAUnconfirmed(userId: string, formattedKey: string) {
    console.log('mfa initialised');

    UserRepository.m[userId] = { formattedKey, confirmed: false };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async confirmUserMFA(userId: string) {
    if (!UserRepository.m[userId]) {
      throw new Error('User did not setup MFA');
    }

    UserRepository.m[userId].confirmed = true;
  }
}

// ! temp class
export class DatabaseService {
  private readonly _userRepo;

  constructor() {
    this._userRepo = new UserRepository();
  }

  get userRepository(): UserRepository {
    return this._userRepo;
  }
}

export class MFAService {
  private readonly db;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * Initialises MFA for the user. It must be confirmed by {@link finishInitMFASetup} before it can be used. They also must not have already setup MFA.
   * @param userId - The user for whom to init MFA
   * @returns The formattedKey to be used for MFA
   * @throws Error if the user already has MFA setup
   * @throws Error if the user does not exist
   * @throws Error if the db operation fails
   */
  public async initUserMFA(userId: string): Promise<{
    formattedKey: string;
    uri: string;
  }> {
    const user = await this.db.userRepository.getUserById(userId);

    if (!(await this.db.userRepository.userExists(userId))) {
      throw new Error('User does not exist');
    }

    if (await this.db.userRepository.isUserMFAInitialised(userId)) {
      throw new Error('User already has MFA setup');
    }

    const formattedKey = authenticator.generateKey();
    const uri = authenticator.generateTotpUri(
      formattedKey,
      user.email,
      'Smartify',
      'SHA1',
      6,
      30,
    );

    await this.db.userRepository.saveUserMFAUnconfirmed(userId, formattedKey);

    // TODO: check if result is successful once implemented with actual classes

    return { formattedKey, uri };
  }

  /**
   * Verifies the user's MFA token is correct
   * @param formattedKey - The user's formatted key
   * @param userToken - The token the user entered
   * @returns True if the token is correct, false otherwise
   */
  private verifyToken(formattedKey: string, userToken: MFAToken): boolean {
    const result = authenticator.verifyToken(formattedKey, userToken);
    return result != null;
  }

  /**
   * Finish the users MFA setup by confirming the user has correctly setup MFA
   * @param userId - The id of the user
   * @param token - The token the user entered to confirm they've correctly setup MFA
   * @returns A boolean indicating if the code is correct or not, and hence, if the MFA setup was successful
   * @throws Error if the user does not exist
   * @throws Error if the user did not setup MFA
   * @throws Error if the user already confirmed MFA
   */
  public async finishInitMFASetup(
    userId: string,
    token: MFAToken,
  ): Promise<boolean> {
    if (!(await this.db.userRepository.userExists(userId))) {
      throw new Error('User does not exist');
    }
    const userMFA = await this.db.userRepository.getUserMFAformattedKey(userId);
    if (!userMFA || !userMFA.formattedKey) {
      throw new Error('User did not setup MFA');
    }
    if (userMFA.confirmed) {
      throw new Error('User already confirmed MFA');
    }
    if (!this.verifyToken(userMFA.formattedKey, token)) {
      return false;
    }
    await this.db.userRepository.confirmUserMFA(userId);
    return true;
  }

  /**
   * Verify the user's MFA token.
   * @param userId - The user's id
   * @param token - The token the user entered (6 digit string)
   * @returns whether the token is correct or not
   * @throws Error if the user did not setup MFA
   */
  public async verifyMFA(userId: string, token: MFAToken): Promise<boolean> {
    const userMFA = await this.db.userRepository.getUserMFAformattedKey(userId);
    if (!userMFA || !userMFA.formattedKey || !userMFA.confirmed) {
      throw new Error('User did not setup MFA');
    }
    return this.verifyToken(userMFA.formattedKey, token);
  }
}
