import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/auth';
import { TokenService } from '../services/auth/token';
import { AccessTokenPayload, tokenTypeSchema } from '../schemas/auth/tokens';
import { AuthController } from '../controllers/auth';
import { log } from '../util/log';

// TODO: auto refresh tokens if access is about to expire
// TODO: finish implementation and testing
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

    async function parseAccess(accessToken: string) {
      const { valid, payload } = await ts.verifyToken(accessToken, true);

      if (valid) {
        if (payload!.type === tokenTypeSchema.enum.ACCESS) {
          accessTokenPayload = payload as AccessTokenPayload;
          req.accessTokenPayload = accessTokenPayload;
          req.user = (payload as AccessTokenPayload).user;
        }
      }
    }

    // get access token from authorization header
    const authHeader = req.headers.authorization;
    let accessTokenPayload: AccessTokenPayload | undefined = undefined;
    if (authHeader) {
      const prefix = 'Bearer ';
      if (authHeader.startsWith(prefix)) {
        const accessToken = authHeader.substring(prefix.length);
        await parseAccess(accessToken);
      }
    } else {
      // check cookies for access
      const accessToken: string | undefined = req.cookies['access-token'] as
        | string
        | undefined;
      if (accessToken) {
        await parseAccess(accessToken);
      }
    }

    // check if refresh token exists
    const refreshToken: string | undefined = req.cookies['refresh-token'] as
      | string
      | undefined;

    if (refreshToken) {
      const ts = new TokenService();
      const { valid, payload } = await ts.verifyToken(refreshToken, true);

      if (valid && payload!.type === tokenTypeSchema.enum.REFRESH) {
        req.refreshToken = refreshToken;
      }
    }

    // auto refresh
    // if access token is invalid (possibly expired) or expiring soon (within 5 minutes)
    if (
      (!req.accessTokenPayload ||
        req.accessTokenPayload.exp - Date.now() / 1000 < 300) &&
      req.refreshToken !== undefined &&
      req.deviceId !== undefined
    ) {
      const tokens = await AuthController.refresh(req, res);

      if (tokens) {
        // parse access token after refresh
        await parseAccess(tokens.accessToken);
      }
    }

    next();
  } catch (e) {
    log.error(e);
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
