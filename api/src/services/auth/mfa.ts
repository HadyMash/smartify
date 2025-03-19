import * as authenticator from 'authenticator';
import { Email } from '../../schemas/auth/user';
import { MFAFormattedKey, MFACode } from '../../schemas/auth/auth';

export class MFAService {
  constructor() {}

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
}
