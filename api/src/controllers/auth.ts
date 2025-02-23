import { Request, Response } from 'express';
import { CreateUserData, createUserSchema } from '../schemas/auth/user';
import { AuthService } from '../services/auth/auth';
import { MFAService } from '../services/auth/mfa';
import {
  AuthenticatedRequest,
  IncorrectMFACodeError,
  MFACode,
  mfaCodeSchema,
} from '../schemas/auth/auth';
import { TokenService } from '../services/auth/token';
import { InvalidTokenError, MFATokenPayload } from '../schemas/auth/tokens';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      // TODO: remove and replace with require device id middleware
      const deviceId = req.headers['x-device-id'] as string | undefined;
      if (!deviceId) {
        res.status(400).send({ error: 'Device id not found' });
        return;
      }

      // TODO: password SRP stuff

      // validate body
      let data: CreateUserData;
      try {
        data = createUserSchema.parse(req.body);
      } catch (_) {
        res.status(400).send('Invalid body');
        return;
      }

      console.log(data);

      const as = new AuthService();

      if (await as.userExistsEmail(data.email)) {
        res.status(400).send({ error: 'Invalid request' });
        return;
      }

      // create user
      const { user, mfaFormattedKey } = await as.registerUser(data);
      const ms = new MFAService();
      const mfaUri = ms.generateMFAUri(mfaFormattedKey, user.email);

      // generate mfa token
      const mfaToken = await new TokenService().createMFAToken(
        user._id.toString(),
        deviceId,
      );

      res.cookie('mfa-token', mfaToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        expires: new Date(
          Date.now() + TokenService.MFA_TOKEN_LIFESPAN_SECONDS * 1000,
        ),
      });

      res.status(201).send({ user, mfaFormattedKey, mfaQRUri: mfaUri });
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
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

        res.cookie('access-token', accessToken, {
          httpOnly: true,
          secure: false,
          expires: new Date(
            Date.now() + TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS * 1000,
          ),
        });
        res.cookie('refresh-token', refreshToken, {
          httpOnly: true,
          secure: false,
          expires: new Date(
            Date.now() + TokenService.REFRESH_TOKEN_LIFESPAN_SECONDS * 1000,
          ),
        });
        res.cookie('id-token', idToken, {
          httpOnly: false,
          secure: false,
          expires: new Date(
            Date.now() + TokenService.ACCESS_TOKEN_LIFESPAN_SECONDS * 1000,
          ),
        });
        res.clearCookie('mfa-token');
        res.status(200).send();
        return;
      } catch (e) {
        // mfa is valid, create a new one since the old one is now blacklisted
        const newMfaToken = await ts.createMFAToken(
          mfaPayload.userId,
          mfaPayload.deviceId,
        );
        res.cookie('mfa-token', newMfaToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'none',
          expires: new Date(
            Date.now() + TokenService.MFA_TOKEN_LIFESPAN_SECONDS * 1000,
          ),
        });
        if (e instanceof IncorrectMFACodeError) {
          res.status(400).send({ error: 'Incorrect MFA Code' });
        } else {
          console.error(e);
          res
            .status(400)
            .send({ error: 'User does not exist or already confirmed MFA' });
        }
      }
      return;
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
