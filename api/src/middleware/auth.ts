import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/auth';
import { TokenService } from '../services/auth/token';
import { AccessTokenPayload, tokenTypeSchema } from '../schemas/auth/tokens';

// TODO: auto refresh tokens if access is about to expire
// TODO finish implementation and testing
export const parseAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // check for device id
    const deviceId = req.headers['x-device-id'] as string | undefined;
    if (deviceId) {
      req.deviceId = deviceId;
    }

    const ts = new TokenService();

    // get access token from authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const prefix = 'Bearer ';
      if (authHeader.startsWith(prefix)) {
        const accessToken = authHeader.substring(prefix.length);

        const { valid, payload } = await ts.verifyToken(accessToken, true);

        if (valid) {
          if (payload!.type === tokenTypeSchema.enum.ACCESS) {
            req.user = (payload as AccessTokenPayload).user;
          }
        }
      }
    } else {
      // check cookies for access
      const accessToken: string | undefined = req.cookies['access-token'] as
        | string
        | undefined;
      if (accessToken) {
        const { valid, payload } = await ts.verifyToken(accessToken, true);
        if (valid) {
          if (payload!.type === tokenTypeSchema.enum.ACCESS) {
            req.user = (payload as AccessTokenPayload).user;
          }
        }
      }
    }

    // TODO: auto refresh
    //if (!req.user) {
    //  // access either missing or invalid (possibly expired), check for refresh
    //  const refreshToken: string | undefined = req.cookies['refresh-token'] as
    //    | string
    //    | undefined;
    //  const deviceId = req.deviceId;
    //  if (refreshToken && deviceId) {
    //    const { valid, payload } = await ts.verifyToken(refreshToken, true);
    //    if (valid) {
    //      if (payload!.type === tokenTypeSchema.enum.REFRESH) {
    //        // refresh access token
    //        const newTokens = await ts.refreshTokens(refreshToken, deviceId);
    //
    //        // set new tokens in cookies
    //        res.cookie('access-token', newTokens.accessToken, {
    //          httpOnly: true,
    //          secure: false, // TODO: set to true in production
    //          sameSite: 'none',
    //        });
    //        if (newTokens.refreshToken) {
    //          res.cookie('refresh-token', newTokens.refreshToken, {
    //            httpOnly: true,
    //            secure: false, // TODO: set to true in production
    //            sameSite: 'none',
    //          });
    //        }
    //        if (newTokens.idToken) {
    //          res.cookie('id-token', newTokens.idToken, {
    //            httpOnly: false,
    //            secure: false, // TODO: set to true in production
    //            sameSite: 'none',
    //          });
    //        }
    //      }
    //    }
    //  }
    //}

    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Internal Server Error' });
    return;
  }
};

export const requireDeviceId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.deviceId || req.deviceId.length === 0) {
    res.status(400).send({ error: 'Device ID required' });
    return;
  }
  next();
};

/**
 * A middleware for routes which require the user to be logged in. If the user
 * is found and valid, they will be added to the request object. If not found or
 * not valid, a 401 is returned.
 */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    res.status(401).send('Unauthorized');
    return;
  }
  next();
  return;
};
