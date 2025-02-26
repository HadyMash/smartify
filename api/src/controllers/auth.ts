import { Response } from 'express';
import {
  Email,
  emailSchema,
  InvalidUserError,
  InvalidUserType,
  loginDataSchema,
  registerDataSchema,
} from '../schemas/auth/user';
import { AuthService } from '../services/auth/auth';
import { MFAService } from '../services/auth/mfa';
import {
  AuthenticatedRequest,
  MFAError,
  MFACode,
  mfaCodeSchema,
  MFAErrorType,
  IncorrectPasswordError,
} from '../schemas/auth/auth';
import { TokenService } from '../services/auth/token';
import { InvalidTokenError, MFATokenPayload } from '../schemas/auth/tokens';
import { validateSchema } from '../util';

const MFA_TOKEN_COOKIE_NAME = 'mfa-token';
const ACCESS_TOKEN_COOKIE_NAME = 'access-token';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';
const ID_TOKEN_COOKIE_NAME = 'id-token';

export class AuthController {
  private static writeAuthCookies(
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

  private static writeMFACookie(res: Response, mfaToken: string) {
    res.cookie(MFA_TOKEN_COOKIE_NAME, mfaToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      expires: new Date(
        Date.now() + TokenService.MFA_TOKEN_LIFESPAN_SECONDS * 1000,
      ),
    });
  }

  private static deleteAllCookies(res: Response) {
    this.deleteMFACookie(res);
    this.deleteAuthCookies(res);
  }

  private static deleteAuthCookies(res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    res.clearCookie(ID_TOKEN_COOKIE_NAME);
  }

  private static deleteMFACookie(res: Response) {
    res.clearCookie(MFA_TOKEN_COOKIE_NAME);
  }

  public static async register(req: AuthenticatedRequest, res: Response) {
    try {
      // check if they are already logged in
      if (req.user) {
        console.log(req.user);

        res.status(400).send({ error: 'Already logged in' });
        return;
      }

      const data = validateSchema(res, registerDataSchema, req.body);
      if (!data) {
        return;
      }
      const as = new AuthService();
      const { userId, formattedKey } = await as.initUserSRP(data);

      res.status(201).send({ userId, formattedKey });
      return;
    } catch (e) {
      if (
        e instanceof InvalidUserError &&
        e.type === InvalidUserType.ALREADY_EXISTS
      ) {
        // don't tell the client the user doesn't already exist
        res.status(400).send({ error: 'Invalid request' });
        return;
      }

      console.error(e);
      res.status(500).send('Internal Server Error');
      return;
    }
  }

  public static async initiateAuthSession(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      // check if they are already logged in
      if (req.user) {
        console.log(req.user);

        res.status(400).send({ error: 'Already logged in' });
        return;
      }

      const email: Email | undefined = validateSchema(
        res,
        emailSchema,
        req.query.email,
      );

      if (!email) {
        return;
      }

      const as = new AuthService();

      try {
        const { salt, B } = await as.initAuthSession(email);

        res.status(200).send({ salt, B });
      } catch (e) {
        if (e instanceof InvalidUserError) {
          // don't tell the client the user doesn't exist
          res.status(400).send({ error: 'Invalid request' });
          return;
        } else {
          throw e;
        }
      }
    } catch (e) {
      console.error(e);

      res.status(500).send({ error: 'Internal server error' });
      return;
    }
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
          res.status(401).send({ error: 'Invalid MFA token' });
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
              res.status(400).send({ error: 'Incorrect MFA Code' });
              break;
            case MFAErrorType.MFA_ALREADY_CONFIRMED:
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

  public static async login(req: AuthenticatedRequest, res: Response) {
    try {
      // check if they are already logged in
      if (req.user) {
        res.status(400).send({ error: 'Already logged in' });
        return;
      }

      const data = validateSchema(res, loginDataSchema, req.body);

      if (!data) {
        return;
      }

      const as = new AuthService();

      // get auth session
      const session = await as.getAuthSession(data.email);

      // check it exists
      if (!session) {
        res.status(404).send({ error: 'Auth session does not exist' });
        return;
      }

      try {
        const { user, mfa, Ms } = await as.login({
          ...data,
          ...session,
          verifier: BigInt(session.verifier),
        });

        // generate mfa token to send back to user
        const ts = new TokenService();
        const mfaToken = await ts.createMFAToken(
          user._id.toString(),
          req.deviceId!,
          mfa.confirmed ? undefined : mfa.formattedKey,
        );

        this.writeMFACookie(res, mfaToken);

        if (mfa.confirmed) {
          res.status(200).send({ Ms });
        } else {
          const ms = new MFAService();
          const mfaQRUri = ms.generateMFAUri(mfa.formattedKey, user.email);
          res
            .status(200)
            .send({ Ms, formattedKey: mfa.formattedKey, mfaQRUri });
        }
      } catch (e) {
        if (
          e instanceof InvalidUserError ||
          e instanceof IncorrectPasswordError
        ) {
          res.status(400).send({ error: 'Incorrect email or password' });
          return;
        } else {
          throw e;
        }
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  public static async verifyMFA(req: AuthenticatedRequest, res: Response) {
    try {
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
          res.status(401).send({ error: 'Invalid MFA token' });
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
              res.status(400).send({ error: 'Incorrect MFA Code' });
              break;
            case MFAErrorType.MFA_ALREADY_CONFIRMED:
              // this should never happen
              console.error('mfa already confirmed in verify mfa');
              res.status(500).send({ error: 'Internal Server Error' });
              break;
            case MFAErrorType.MFA_NOT_CONFIRMED:
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
}
