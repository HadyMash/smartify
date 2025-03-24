import { Response } from 'express';
import {
  AuthenticatedRequest,
  AuthSessionError,
  Email,
  emailSchema,
  IncorrectPasswordError,
  MFACode,
  mfaCodeSchema,
  MFAError,
  MFAErrorType,
} from '../schemas/auth/auth';
import { TokenService } from '../services/auth/token';
import { tryAPIController, validateSchema } from '../util';
import {
  changePasswordDataSchema,
  InvalidUserError,
  InvalidUserType,
  loginDataSchema,
  registerDataSchema,
  resetPasswordDataSchema,
  userWithIdSchema,
} from '../schemas/auth/user';
import { AuthService } from '../services/auth/auth';
import { MFAService } from '../services/auth/mfa';
import { InvalidTokenError, MFATokenPayload } from '../schemas/auth/tokens';

const MFA_TOKEN_COOKIE_NAME = 'mfa-token';
const ACCESS_TOKEN_COOKIE_NAME = 'access-token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';
const ID_TOKEN_COOKIE_NAME = 'id-token';

export class AuthController {
  /**
   * Write the auth tokens to the response's cookies
   * @param res - The response
   * @param accessToken - The access token
   * @param refreshToken - The refresh token
   * @param idToken - The id token
   */
  public static writeAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string,
    idToken?: string,
  ) {
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: false,
      expires: new Date(
        Date.now() + TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS * 1000,
      ),
    });
    if (refreshToken) {
      res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: false,
        expires: new Date(
          Date.now() + TokenService.REFRESH_TOKEN_LIFESPAN_SECONDS * 1000,
        ),
      });
    }
    if (idToken) {
      res.cookie(ID_TOKEN_COOKIE_NAME, idToken, {
        httpOnly: false,
        secure: false,
        expires: new Date(
          Date.now() + TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS * 1000,
        ),
      });
    }
  }

  /**
   * Write the MFA token to the response's cookies
   * @param res - The response
   * @param mfaToken - The MFA token
   */
  public static writeMFACookie(res: Response, mfaToken: string) {
    res.cookie(MFA_TOKEN_COOKIE_NAME, mfaToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      expires: new Date(
        Date.now() + TokenService.MFA_TOKEN_LIFESPAN_SECONDS * 1000,
      ),
    });
  }

  /**
   * Delete all auth cookies from the response (auth and MFA)
   * @param res - The response
   */
  public static deleteAllAuthCookies(res: Response) {
    this.deleteMFACookie(res);
    this.deleteAuthCookies(res);
  }

  /**
   * Delete the auth token cookies from the response
   * @param res - The response
   */
  public static deleteAuthCookies(res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    res.clearCookie(ID_TOKEN_COOKIE_NAME);
  }

  /**
   * Delete the MFA token cookie from the response
   * @param res - The response
   */
  public static deleteMFACookie(res: Response) {
    res.clearCookie(MFA_TOKEN_COOKIE_NAME);
  }

  public static register(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        // check if any user is already logged in
        if (req.user) {
          res.status(400).send({ error: 'Already logged in' });
          return;
        }

        // get data from body
        const data = validateSchema(res, registerDataSchema, req.body);
        if (!data) {
          console.log('data invalid');
          return;
        }

        const as = new AuthService();
        const { userId, formattedKey } = await as.registerUser(data);
        const mfa = new MFAService();
        const mfaQRUri = mfa.generateMFAUri(formattedKey, data.email);
        const ts = new TokenService();
        const mfaToken = await ts.createMFAToken(
          userId.toString(),
          req.deviceId!,
          formattedKey,
        );
        this.writeMFACookie(res, mfaToken);
        res
          .status(201)
          .send({ userId, mfaFormattedKey: formattedKey, mfaQRUri });
        return;
      },
      (e) => {
        if (
          e instanceof InvalidUserError &&
          e.type === InvalidUserType.ALREADY_EXISTS
        ) {
          // don't tell the client the user doesn't already exist, just return a
          // generic error
          res.status(400).send({ error: 'Invalid request' });
          return true;
        }
        return false;
      },
    );
  }

  public static initateAuthSession(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        // check if user is already signed in
        if (req.user) {
          res.status(400).send({ error: 'Already logged in' });
          return;
        }

        // get email from query
        const email: Email | undefined = validateSchema(
          res,
          emailSchema,
          req.query.email,
        );

        if (!email) {
          return;
        }

        const as = new AuthService();

        // initiate auth session
        const { salt, B } = await as.initiateAuthSession(email);
        res.status(201).send({ salt, B: `0x${B.toString(16)}` });
        return;
      },
      (e) => {
        if (e instanceof InvalidUserError) {
          // don't tell the client the user doesn't exist, return a generic
          // error
          res.status(400).send({ error: 'Invalid request' });
          return true;
        }
        return false;
      },
    );
  }

  public static login(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        // check if user is already signed in
        if (req.user) {
          res.status(400).send({ error: 'Already logged in' });
          return;
        }

        // validate the body
        const data = validateSchema(res, loginDataSchema, req.body);
        if (!data) {
          return;
        }

        // validate the login credentials
        const as = new AuthService();

        // get the auth session
        const session = await as.getAuthSession(data.email);

        const Ms = as.validateLoginCredentials(
          data.email,
          data.A,
          data.Mc,
          session,
        );

        // login credentials are correct
        // generate mfa token to send back to user
        const ts = new TokenService();
        const mfaToken = await ts.createMFAToken(
          session.userId.toString(),
          req.deviceId!,
          session.mfaConfirmed ? undefined : session.mfaFormattedKey,
        );

        this.writeMFACookie(res, mfaToken);

        // don't wait for this as it will unnecessarily delay the response
        as.deleteAuthSession(data.email).catch((e) =>
          console.error('Error deleting auth sesssion:', e),
        );

        if (session.mfaConfirmed) {
          res.status(200).send({ Ms: `0x${Ms.toString(16)}` });
          return;
        } else {
          const mfa = new MFAService();
          const mfaQRUri = mfa.generateMFAUri(
            session.mfaFormattedKey,
            data.email,
          );
          res.status(200).send({
            Ms: `0x${Ms.toString(16)}`,
            mfaFormattedKey: session.mfaFormattedKey,
            mfaQRUri,
          });
          return;
        }
      },
      (err) => {
        if (err instanceof InvalidUserError) {
          console.log('invalid user error');
          res.status(400).send({ error: 'Invalid request' });
          return true;
        } else if (err instanceof IncorrectPasswordError) {
          console.log('incorrect password');
          res.status(400).send({ error: 'Incorrect email or password' });
          return true;
        } else if (err instanceof AuthSessionError) {
          console.log('auth session does not exist');
          res.status(404).send({ error: 'Auth session does not exist' });
          return true;
        }
        return false;
      },
    );
  }

  public static async confirmMFA(req: AuthenticatedRequest, res: Response) {
    try {
      const deviceId = req.deviceId!;

      // get mfa token
      const mfaToken = req.cookies['mfa-token'] as string | undefined;
      console.log(req.cookies);

      if (!mfaToken) {
        res.status(400).send({ error: 'MFA token not found' });
        return;
      }

      let code: MFACode;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        code = mfaCodeSchema.parse(req.body.code);
      } catch (_) {
        res.status(400).send({ error: 'Invalid code' });
        return;
      }

      // verify mfa token
      const ts = new TokenService();
      let mfaPayload: MFATokenPayload;
      try {
        mfaPayload = await ts.verifyMFAToken(mfaToken);
        console.log('mfaPayload:', mfaPayload);
      } catch (e) {
        if (e instanceof InvalidTokenError) {
          res.status(401).send({ error: 'Invalid MFA auth token' });
          return;
        } else {
          console.error(e);
          res.status(500).send({ error: 'Internal Server Error' });
          return;
        }
      }

      if (deviceId !== mfaPayload.deviceId) {
        res.status(400).send({ error: 'Invalid device id' });
        return;
      }

      const as = new AuthService();
      try {
        await as.confirmUserMFA(mfaPayload.userId, code);
        const { accessToken, refreshToken, idToken } =
          await ts.generateAllTokens(mfaPayload.userId, deviceId);
        this.deleteMFACookie(res);
        this.writeAuthCookies(res, accessToken, refreshToken, idToken);
        res.status(200).send();
        return;
      } catch (e) {
        // mfa is valid, create a new one since the old one is now blacklisted
        const newMfaToken = await ts.createMFAToken(
          mfaPayload.userId,
          mfaPayload.deviceId,
          mfaPayload.formattedKey,
        );
        this.writeMFACookie(res, newMfaToken);
        if (e instanceof MFAError) {
          switch (e.type) {
            case MFAErrorType.INCORRECT_CODE:
              console.log('incorrect code');
              res.status(400).send({ error: 'Incorrect MFA Code' });
              break;
            case MFAErrorType.MFA_ALREADY_CONFIRMED:
              console.log('mfa already confirmed');
              res.status(400).send({ error: 'MFA already confirmed' });
              break;
            case MFAErrorType.MFA_NOT_CONFIRMED:
              // this should never happen
              console.error('mfa not confirmed in confirm mfa');
              res.status(500).send({ error: 'Internal Server Error' });
              break;
          }
        } else {
          console.error(e);
          res
            .status(400)
            // user does not exist but don't tell client that
            .send({ error: 'Invalid request' });
        }
      }
      return;
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  public static async verifyMFA(req: AuthenticatedRequest, res: Response) {
    try {
      // get mfa token
      const mfaToken = req.cookies['mfa-token'] as string | undefined;

      if (!mfaToken) {
        res.status(400).send({ error: 'MFA token not found' });
        return;
      }

      let code: MFACode;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        code = mfaCodeSchema.parse(req.body.code);
      } catch (_) {
        res.status(400).send({ error: 'Invalid code' });
        return;
      }

      // verify mfa token
      const ts = new TokenService();
      let mfaPayload: MFATokenPayload;
      try {
        mfaPayload = await ts.verifyMFAToken(mfaToken);
        console.log('mfaPayload:', mfaPayload);
      } catch (e) {
        if (e instanceof InvalidTokenError) {
          res.status(401).send({ error: 'Invalid MFA auth token' });
          return;
        } else {
          console.error(e);
          res.status(500).send({ error: 'Internal Server Error' });
          return;
        }
      }

      if (req.deviceId !== mfaPayload.deviceId) {
        res.status(400).send({ error: 'Invalid device id' });
        return;
      }

      const as = new AuthService();
      try {
        const result = await as.verifyMFA(mfaPayload.userId, code);
        if (!result) {
          // mfa is valid, create a new one since the old one is now blacklisted
          const newMfaToken = await ts.createMFAToken(
            mfaPayload.userId,
            mfaPayload.deviceId,
            mfaPayload.formattedKey,
          );
          this.writeMFACookie(res, newMfaToken);
          console.log('incorrect code');

          res.status(400).send({ error: 'Incorrect MFA Code' });
          return;
        }

        // mfa correct, generate new tokens
        const { accessToken, refreshToken, idToken } =
          await ts.generateAllTokens(mfaPayload.userId, mfaPayload.deviceId);
        this.writeAuthCookies(res, accessToken, refreshToken, idToken);
        this.deleteMFACookie(res);
        res.status(200).send();
        return;
      } catch (e) {
        if (e instanceof MFAError) {
          // mfa is valid, create a new one since the old one is now blacklisted
          const newMfaToken = await ts.createMFAToken(
            mfaPayload.userId,
            mfaPayload.deviceId,
            mfaPayload.formattedKey,
          );
          this.writeMFACookie(res, newMfaToken);
          switch (e.type) {
            case MFAErrorType.INCORRECT_CODE:
              console.log('incorrect code');

              res.status(400).send({ error: 'Incorrect MFA Code' });
              break;
            case MFAErrorType.MFA_ALREADY_CONFIRMED:
              // this should never happen
              console.error('mfa already confirmed in verify mfa');
              res.status(500).send({ error: 'Internal Server Error' });
              break;
            case MFAErrorType.MFA_NOT_CONFIRMED:
              console.log('mfa not confirmed');
              res.status(400).send({ error: 'MFA not confirmed' });
              break;
          }
        } else {
          console.error(e);
          res.status(500).send({ error: 'Internal Server Error' });
        }
        return;
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Refreshes the user's tokens. This method will not send a response, it only
   * adds the tokens to the response object.
   * @param req - The request
   * @param res - The response
   */
  public static async refresh(req: AuthenticatedRequest, res: Response) {
    if (req.tokensRefreshed) {
      return;
    }

    if (req.refreshToken === undefined) {
      throw new Error('No refresh token to refresh with');
    }
    if (req.deviceId === undefined) {
      throw new Error('No device id to refresh with');
    }

    const ts = new TokenService();
    // refresh tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      idToken,
    } = await ts.refreshTokens(req.refreshToken, req.deviceId);

    // TEMP
    {
      const refreshPayload = await ts.verifyToken(req.refreshToken, true);
      console.log('Tokens refreshed for user:', refreshPayload.payload?.userId);
    }

    // set new tokens in cookies
    AuthController.writeAuthCookies(res, accessToken, newRefreshToken, idToken);
    req.tokensRefreshed = true;

    return { accessToken, newRefreshToken, idToken };
  }

  public static refreshTokens(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      if (req.tokensRefreshed) {
        res.status(200).send();
        return;
      }
      await this.refresh(req, res);
      res.status(200).send();
      return;
    });
  }

  public static logout(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      // change generation id
      const ts = new TokenService();
      await ts.revokeDeviceRefreshTokens(req.user!._id, req.deviceId!);

      // delete all auth cookies
      this.deleteAllAuthCookies(res);

      res.status(200).send();
    });
  }

  //public static srpCredentials(req: AuthenticatedRequest, res: Response) {
  //  tryAPIController(res, async () => {
  //    const userId = req.user!._id;
  //    const as = new AuthService();
  //    const srp = await as.getUserSRPCredentials(userId);
  //    res.status(200).send(srp);
  //  });
  //}

  public static userData(req: AuthenticatedRequest, res: Response) {
    // eslint-disable-next-line @typescript-eslint/require-await
    tryAPIController(res, async () => {
      res.status(200).send(userWithIdSchema.parse(req.user));
    });
  }

  public static changePassword(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      const userId = req.user!._id;
      const data = validateSchema(res, changePasswordDataSchema, req.body);
      if (!data) {
        return;
      }

      const as = new AuthService();
      const success = await as.changeUserSRPCredentials(
        userId,
        data.salt,
        data.verifier,
      );
      if (success) {
        res.status(200).send();
        return;
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });
  }

  public static resetPassword(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        if (req.user) {
          res.status(400).send({ error: 'Already logged in' });
          return;
        }

        const data = validateSchema(res, resetPasswordDataSchema, req.body);
        if (!data) {
          res.status(400).send({ error: 'Invalid request' });
          return;
        }

        const as = new AuthService();
        await as.resetPassword(data);
        res.status(200).send({ message: 'Password reset successfully' });
        return;
      },
      (e: unknown) => {
        if (e instanceof InvalidUserError) {
          // don't tell the client the user doesn't exist, just return ok status
          res.status(200).send();
          return true;
        }
        if (e instanceof MFAError && e.type == MFAErrorType.INCORRECT_CODE) {
          res.status(400).send({ error: 'MFA code incorrect or missing' });
          return true;
        }
        return false;
      },
    );
  }
}
