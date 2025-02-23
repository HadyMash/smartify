import {
  MFAError,
  MFAFormattedKey,
  MFACode,
  MFA,
  MFAErrorType,
  IncorrectPasswordError,
} from '../../schemas/auth/auth';
import {
  CreateUserData,
  Email,
  LoginData,
  UserWithId,
  userWithIdSchema,
} from '../../schemas/auth/user';
import { ObjectIdOrString } from '../../schemas/obj-id';
import { DatabaseService } from '../db/db';
import { MFAService } from './mfa';

export class AuthService {
  protected readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Registers a user with our system
   * @param data - The user's information
   * @returns The user that was created and their MFA formatted key
   */
  public async registerUser(
    data: CreateUserData,
  ): Promise<{ user: UserWithId; mfaFormattedKey: MFAFormattedKey }> {
    const ms = new MFAService();
    const formattedKey = ms.generateMFAFormattedKey();
    const userId = await this.db.userRepository.createUser(data, formattedKey);

    return {
      user: await this.db.userRepository.getUserById(userId),
      mfaFormattedKey: formattedKey,
    };
  }

  /**
   * Check if a user with the provided email exists
   * @param email - The email to check
   * @returns true if the email is registered, false otherwise
   */
  public async userExistsEmail(email: Email): Promise<boolean> {
    return await this.db.userRepository.userExistsEmail(email);
  }

  /**
   * Check if a user witht he provided id exists
   * @param userId - The id to check
   * @returns true if the user exists, false otherwise
   */
  public async userExistsId(userId: string): Promise<boolean> {
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

  public async getUserById(userId: ObjectIdOrString): Promise<UserWithId> {
    return await this.db.userRepository.getUserById(userId);
  }

  public async login(data: LoginData): Promise<{ user: UserWithId; mfa: MFA }> {
    const email = data.email;
    const user = await this.db.userRepository.getUserDocByEmail(email);
    const mfa: MFA = {
      confirmed: user.mfaConfirmed,
      formattedKey: user.mfaFormattedKey,
    };

    if (user.password !== data.password) {
      throw new IncorrectPasswordError();
    }

    return { user: userWithIdSchema.parse(user), mfa };
  }

  public async verifyMFA(userId: ObjectIdOrString, code: MFACode) {
    const mfa = await this.db.userRepository.getUserMFA(userId);
    if (!mfa.confirmed) {
      throw new MFAError(MFAErrorType.MFA_NOT_CONFIRMED);
    }
    const ms = new MFAService();
    const result = ms.verifyCode(mfa.formattedKey, code);
    return result;
  }
}
