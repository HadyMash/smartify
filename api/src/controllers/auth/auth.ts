import { Request, response, Response } from 'express';
import {
  requestUserSchema,
  RequestUser,
  userSchema,
  User,
  changePasswordSchema,
  ChangePassword,
  deleteAccountSchema,
  DeleteAccount,
  requestResetPasswordSchema,
  RequestResetPassword,
  resetPasswordSchema,
  ResetPassword,
  AuthenticatedRequest,
} from '../../schemas/user';
import { DatabaseService } from '../../services/db/db';
import { TokenService } from '../../services/auth/token';
import { MFAService } from '../../services/auth/mfa';
import { MFAToken, mfaTokenSchema } from '../../schemas/mfa';
import { AuthService } from '../../services/auth/auth';
//TODO: Add comments and documentation
export class AuthController {
  /**
   * Registers a new user.
   *
   * It validates the request body against the requestUserSchema, checks the password for required
   * criteria, and then calls the AuthService to register the user. If the registration
   * is successful, it responds with a success message and prompts the user to complete
   * the MFA setup.
   *
   * @param req - The request object containing the user data.
   * @param res - The response object used to send the response.
   *
   * @throws If the user data is invalid.
   * @throws If the password does not meet the required criteria.
   * @throws If there is an error during the registration process.
   *
   * @returns When the registration process is complete.
   */
  public static async register(req: Request, res: Response) {
    try {
      let data: RequestUser;
      try {
        console.log('parsing the schema');
        data = requestUserSchema.parse(req.body);
        console.log(data);
      } catch (_) {
        console.log('Invalid user data');
        res.status(400).send({
          error: 'Invalid user data',
          message: 'Please provide a valid email and password',
        });
        throw new Error('Invalid user data');
      }
      if (!data) {
        console.log('no user found');
        res.status(400).json({ message: 'No user found' });
        throw new Error('No user found');
      }
      const pass = data.password;
      console.log(pass);

      try {
        if (!pass) {
          res.status(401).json({ message: 'Password not found' });
        }
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(pass);
        const hasLowercase = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
        if (pass.length < minLength) {
          res.status(400).json('Password must be at least 8 characters long');
          throw new Error('Password must be at least 8 characters long');
        }
        if (!hasUppercase) {
          res
            .status(400)
            .json({ message: 'Password must have an uppercase character' });
          throw new Error('Password must have an uppercase character');
        }
        if (!hasLowercase) {
          res
            .status(400)
            .json({ message: 'Password must have a lowercase character' });
          throw new Error('Password must have a lowercase character');
        }
        if (!hasNumber) {
          res.status(400).json({ message: 'Password must have a number' });
          throw new Error('Password must have a number');
        }
        if (!hasSymbol) {
          res.status(400).json({ message: 'Password must have a symbol' });
          throw new Error('Password must have a symbol');
        }
      } catch (error) {
        console.error('Error validating your password');
        res.status(400).json({ message: 'Error validating your password' });
        throw new Error('Error validating your password');
      }
      const as = new AuthService();
      const user = await as.registerWithEmailandPassword(
        data._id,
        data.email,
        data.password,
        data.dob,
        data.gender,
      );
      const mfa = new MFAService();
      const token = new TokenService();
      const db = new DatabaseService();

      if (!req.body) {
        res.status(401).json({ message: 'Unauthorized' });
        throw new Error('No body was passed');
      }
      res
        .status(201)
        .send('You are successfully registered! Please complete the MFA setup');

      return;
    } catch (e) {
      console.error('error registering', e);
      res.status(500).send({
        error: 'Internal Server Error',
        message: 'Please try again later',
      });
      throw new Error('Error registering');
    }
  }
  /**
   * Initializes MFA for the user.
   *
   * This method checks if the user is authenticated, and if so, it initiates the MFA setup process.
   * It generates a JWT token for the MFA device and returns the formatted key, URI, and JWT token.
   *
   * @param req - The request object, which should contain the authenticated user.
   * @param res - The response object used to send back the response.
   *
   * @returns } - A promise that resolves when the MFA setup process is complete.
   *
   * @throws {Error} - Throws an error if there is an issue with initiating the MFA setup process.
   */
  public static async initMFA(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      console.log('Unauthorized');

      res.status(401).send('Unauthorized');
      return;
    }

    const db = new DatabaseService();
    const mfa = new MFAService();
    const token = new TokenService();
    const deviceId = 'iphone';
    const jwtToken = await token.createMFAToken(req.user._id, deviceId);
    try {
      const result = await mfa.initUserMFA(req.user._id);
      console.log('MFA setup initiated');

      res.status(201).json({
        formattedKey: result.formattedKey,
        uri: result.uri,
        jwtToken: jwtToken,
      });
      return;
    } catch (e: any) {
      console.log('Internal Server Error:', e.message);
      res.status(500).send({
        error: 'Internal Server Error',
        message: 'Please try again later',
      });
      return;
    }
  }

  /**
   * Confirms the Multi-Factor Authentication (MFA) setup for an authenticated user.
   *
   * This method verifies the provided MFA token and completes the MFA setup process.
   * If the token is valid, it generates and returns a set of authentication tokens.
   *
   * @param req - The request object, containing the authenticated user and the MFA token in the body.
   * @param res - The response object used to send back the appropriate HTTP response.
   *
   * @returns  - When the confirmation of the token is complete
   *
   * @throws - If the MFA token is invalid
   * @throws - If there is an internal server error.
   *
   */
  public static async confirmMFA(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      console.log('Unauthorized');

      res
        .status(401)
        .send({ error: 'Unauthorized', message: 'User must be authenticated' });
      return;
    }
    let mfaToken: MFAToken;
    try {
      mfaToken = mfaTokenSchema.parse(req.body);
    } catch (_) {
      console.log('Invalid token');
      res.status(400).send({
        error: 'Invalid token',
        message: 'Token must be a 6 digit number',
      });
      return;
    }

    const db = new DatabaseService();
    const mfa = new MFAService();

    try {
      const confirmed = await mfa.finishInitMFASetup(req.user._id, mfaToken);
      if (confirmed) {
        console.log('MFA setup confirmed');
        const token = new TokenService();
        const deviceId = 'iphone';
        const allTokens = await token.generateAllTokens(req.user, deviceId);
        const { refreshToken, accessToken, idToken } = allTokens;
        res.status(200).json({
          message: 'MFA setup confirmed',
          refreshToken,
          accessToken,
          idToken,
        });
      } else {
        console.log('MFA setup not confirmed because code is incorrect');
        res.status(400).send({
          error: 'Incorrect Code',
          message: 'Please enter the correct code',
        });
      }

      return;
    } catch (e: any) {
      console.log('Internal Server Error:', e.message);

      res.status(500).send({
        error: 'Internal Server Error',
        message: 'Please try again later',
      });
      return;
    }
  }

  /**
   * Verifies MFAtoken provided by the user.
   * Checks if the user is authenticated if not
   *
   * @param req - The authenticated request object containing the user and the MFA token in the body.
   * @param res - The response object used to send back the appropriate HTTP status and messages.
   *
   * The function performs the following steps:
   * 1. Checks if the user is authenticated. If not, responds with a 401 status and an error message.
   * 2. Parses the MFA token from the request body. If the token is invalid, responds with a 400 status and an error message.
   * 3. Verifies the MFA token using the MFAService. If the token is correct, responds with a 200 status. If incorrect, responds with a 400 status and an error message.
   * 4. Handles any internal server errors by responding with a 500 status and an error message.
   *
   * @returns
   */
  public static async verifyMFA(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      console.log('Unauthorized');

      res
        .status(401)
        .send({ error: 'Unauthorized', message: 'User must be authenticated' });
      return;
    }
    let mfaToken: MFAToken;
    try {
      mfaToken = mfaTokenSchema.parse(req.body);
    } catch (_) {
      console.log('Invalid token');

      res.status(400).send({
        error: 'Invalid token',
        message: 'Token must be a 6 digit number',
      });
      return;
    }
    const db = new DatabaseService();
    const mfa = new MFAService();
    try {
      const confirmed = await mfa.verifyMFA(req.user._id, mfaToken);

      if (confirmed) {
        console.log('MFA code correct');

        res.status(200).send();
        return;
      } else {
        console.log('MFA code incorrect');
        res.status(400).send({
          error: 'Incorrect Code',
          message: 'Please enter the correct code',
        });
        return;
      }
    } catch (e: any) {
      console.log('Internal Server Error:', e.message);
      res.status(500).send({
        error: 'Internal Server Error',
        message: e.message,
      });
      return;
    }
  }
  /**
   * Handles user login requests.
   *
   * This method parses the request body to validate user credentials,
   * initializes the authentication service, and attempts to log in the user.
   *
   * @param req - The request object.
   * @param res - The response object.
   *
   * @returns If login is successful
   *
   * @throws Will send a 400 status code with an error message if the user data is invalid.
   */
  public static async login(req: Request, res: Response) {
    try {
      let data: RequestUser;
      try {
        console.log('parsing the schema');
        data = requestUserSchema.parse(req.body);

        console.log(data);
      } catch (_) {
        console.log('Invalid user data');
        res.status(400).send({
          error: 'Invalid user data',
          message: 'Please provide a valid email and password',
        });
        return;
      }
      console.log('initializing the auth service');
      const as = new AuthService();
      const tokenService = new TokenService();
      const db = new DatabaseService();
      const deviceId = 'iphone';
      const mfaToken = await tokenService.createMFAToken(data._id, deviceId);
      const user = await as.login(data.email, data.password);

      res.status(200).json({
        message: 'Login successful',
        mfaToken: mfaToken,
      });
    } catch (_) {
      console.log('Invalid user data');
      res.status(400).send({
        error: 'Invalid user data',
        message: 'Please provide a valid email and password',
      });
      return;
    }
  }
  /**
   * Handles the password change request.
   *
   * This method validates the new password.
   *
   * If the new password meets the criteria, it attempts to change the user's password.
   *
   * @param req - The request object containing the user's email, current password, and new password.
   * @param res - The response object used to send the status and message back to the client.
   *
   * @returns A JSON response indicating the success or failure of the password change operation.
   *
   * @throws If the new password does not meet the criteria or if the user data is invalid.
   * @throws If the password is not found.
   * @throws If there is an internal server error.
   */
  public static async changePassword(req: Request, res: Response) {
    try {
      let data: ChangePassword;
      try {
        data = changePasswordSchema.parse(req.body);
        console.log(data);
        const pass = data.newPassword;
        console.log(pass);

        try {
          if (!pass) {
            res.status(401).json({ message: 'Password not found' });
          }
          const minLength = 8;
          const hasUppercase = /[A-Z]/.test(pass);
          const hasLowercase = /[a-z]/.test(pass);
          const hasNumber = /[0-9]/.test(pass);
          const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
          if (pass.length < minLength) {
            res.status(400).json('Password must be at least 8 characters long');
            return;
          }
          if (!hasUppercase) {
            res
              .status(400)
              .json({ message: 'Password must have an uppercase character' });
            return;
          }
          if (!hasLowercase) {
            res
              .status(400)
              .json({ message: 'Password must have a lowercase character' });
            return;
          }
          if (!hasNumber) {
            res.status(400).json({ message: 'Password must have a number' });
            return;
          }
          if (!hasSymbol) {
            res.status(400).json({ message: 'Password must have a symbol' });
            return;
          }
        } catch (error) {
          console.error('Error validating your password');
          res.status(400).json({ message: 'Error validating your password' });
          return;
        }
        try {
          const as = new AuthService();
          const user = await as.changePassword(
            data.email,
            data.password,
            data.newPassword,
          );
          res.status(200).send('Password successfully changed!');
        } catch (e) {
          res.status(400).send({
            error: 'Passwords cannot be the same',
            message: 'Please enter a different new password',
          });
        }
      } catch (_) {
        console.log('Invalid user data');
        res.status(400).send({
          error: 'Invalid user data',
          message: 'Please provide a valid email and password',
        });
        return;
      }
    } catch (_) {
      console.error('Error changing password');
      res.status(500).send({
        error: 'Internal Server Error',
        message: 'Please try again later',
      });
      return;
    }
  }
  /**
   * Deletes a user account based on the provided email.
   *
   * @param req - The request object containing the user data.
   * @param res - The response object to send the result of the deletion.
   *
   * @remarks
   * This method first validates the request body against the `deleteAccountSchema`.
   * If the validation passes, it attempts to delete the user account using the `AuthService`.
   *
   * @returns if the account is deleted successfully.
   * @returns if the user data is invalid.
   * @returns if there is an error during the deletion process.
   *
   */
  public static async deleteAccount(req: Request, res: Response) {
    let data: DeleteAccount;
    try {
      data = deleteAccountSchema.parse(req.body);
      try {
        const as = new AuthService();
        const user = await as.deleteAccount(data._id);
        res.status(200).send('Account deleted successfully!');
      } catch (_) {
        res.status(500).send({
          error: 'Internal Server Error',
          message: 'Please try again later',
        });
        console.error('Error deleting account');
      }
    } catch (_) {
      console.log('Invalid user data');
      res.status(400).send({
        error: 'Invalid user data',
        message: 'Please provide a valid email and password',
      });
      return;
    }
  }

  /**
   * Handles the request to reset a user's password.
   *
   * This method parses the request body to extract the email address,
   * then uses the AuthService to request a password reset. If successful,
   * it sends a response with a reset code. If the email is not found or
   * any other error occurs, it sends a 400 status with an error message.
   *
   * @param req - The HTTP request object, expected to contain the email in the body.
   * @param res - The HTTP response object used to send back the appropriate response.
   *
   * @returns A promise that resolves to sending a response to the client.
   */
  public static async requestReset(req: Request, res: Response) {
    let data: RequestResetPassword;

    try {
      console.log('Starting the parsing');
      data = requestResetPasswordSchema.parse(req.body);
      console.log(data);
      const as = new AuthService();
      const reset = await as.requestResetPassword(data.email);
      console.log(reset);
      res
        .status(200)
        .send('Reset Password request sent. Here is your code: ' + reset);
    } catch (_) {
      console.error('Error requesting reset');
      res.status(400).send({
        error: 'User with that email not found',
        message: 'Please provide a valid email',
      });
    }
  }
  /**
   * Handles the password reset process.
   *
   * This method validates the request body against the `resetPasswordSchema`,
   * and if valid, attempts to reset the user's password using the `AuthService`.
   *
   * @param req - The request object, expected to contain the reset password data in the body.
   * @param res - The response object used to send back the appropriate response.
   *
   * @return The success of the reset password
   * @throws If there is a server error
   * @throws If the user data is invalid
   */
  public static async resetPassword(req: Request, res: Response) {
    let data: ResetPassword;
    try {
      data = resetPasswordSchema.parse(req.body);
      console.log(data);
      try {
        const as = new AuthService();
        const reset = await as.resetPassword(
          data.email,
          data.code,
          data.newPassword,
        );
        res.status(200).send('Password successfully reset!');
        return;
      } catch (_) {
        res.status(500).send({
          error: 'Internal Server Error',
          message: 'Please try again later',
        });
        console.error('Error resetting password');
      }
    } catch (_) {
      console.log('Invalid user data');
      res.status(400).send({
        error: 'Invalid user data',
        message: 'Please provide a valid email and password',
      });
      throw new Error('Invalid user data');
    }
  }
}
