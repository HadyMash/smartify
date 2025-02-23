import * as authenticator from 'authenticator';
import { DatabaseService } from '../db/db';
import { Email } from '../../schemas/auth/user';
import { MFAFormattedKey, MFACode } from '../../schemas/auth/auth';

export class MFAService {
  private readonly db;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Generate a formatted key for MFA
   * @returns The formatted key
   */
  public generateMFAFormattedKey(): MFAFormattedKey {
    return authenticator.generateKey();
  }

  /**
   * Generate a QR Code URI for a user to setup MFA
   * @param formattedKey - The user's formatted key
   * @param email - The user's email address
   * @returns The formatted key
   */
  public generateMFAUri(formattedKey: MFAFormattedKey, email: Email) {
    return authenticator.generateTotpUri(
      formattedKey,
      email,
      'Smartify',
      'SHA1',
      6,
      30,
    );
  }

  /**
   * Verifies the user's MFA token is correct
   * @param formattedKey - The user's formatted key
   * @param code - The code the user entered
   * @returns True if the code is correct, false otherwise
   */
  public verifyCode(formattedKey: MFAFormattedKey, code: MFACode): boolean {
    const result = authenticator.verifyToken(formattedKey, code);
    return result != null;
  }

  ///**
  // * Finish the users MFA setup by confirming the user has correctly setup MFA
  // * @param userId - The id of the user
  // * @param token - The token the user entered to confirm they've correctly setup MFA
  // * @returns A boolean indicating if the code is correct or not, and hence, if the MFA setup was successful
  // * @throws Error if the user does not exist
  // * @throws Error if the user did not setup MFA
  // * @throws Error if the user already confirmed MFA
  // */
  //public async finishInitMFASetup(
  //  userId: string,
  //  token: MFAToken,
  //): Promise<boolean> {
  //  if (!(await this.db.userRepository.userExists(userId))) {
  //    throw new Error('User does not exist');
  //  }
  //  const userMFA = await this.db.userRepository.getUserMFAformattedKey(userId);
  //  if (!userMFA || !userMFA.formattedKey) {
  //    throw new Error('User did not setup MFA');
  //  }
  //  if (userMFA.confirmed) {
  //    throw new Error('User already confirmed MFA');
  //  }
  //  if (!this.verifyToken(userMFA.formattedKey, token)) {
  //    return false;
  //  }
  //  await this.db.userRepository.confirmUserMFA(userId);
  //  return true;
  //}

  ///**
  // * Verify the user's MFA token.
  // * @param userId - The user's id
  // * @param token - The token the user entered (6 digit string)
  // * @returns whether the token is correct or not
  // * @throws Error if the user did not setup MFA
  // */
  //public async verifyMFA(userId: string, token: MFAToken): Promise<boolean> {
  //  const userMFA = await this.db.userRepository.getUserMFA(userId);
  //  if (!userMFA || !userMFA.formattedKey || !userMFA.confirmed) {
  //    throw new Error('User did not setup MFA');
  //  }
  //  return this.verifyToken(userMFA.formattedKey, token);
  //}
}
