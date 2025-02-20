import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/auth/token';
import {
  AuthenticatedRequest,
  requestUserSchema,
  AuthUserRequest,
} from '../schemas/user';
import { RequestUser } from '../schemas/user';

/**
 * Middleware to require authentication for a route.
 *
 * This middleware checks for the presence of an authorization header or cookies containing access or refresh tokens.
 * If a valid token is found, it verifies the token and proceeds to the next middleware.
 * If no access token is found, it looks for a refresh token. If one is found it verifies the token and sets it as the new access token.
 * If no refresh token is found it returns Unathorized
 *
 * @param req - The request object, expected to be of type `AuthUserRequest`.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 *
 *
 */
export const requireAuth = async (
  req: AuthUserRequest,
  res: Response,
  next: NextFunction,
) => {
  //TODO:make the deviceid to be grebbed from the request
  const deviceId = 'iphone';

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('no auth header found');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (!authHeader?.startsWith('Bearer')) {
    console.log('no auth header found');

    res.status(401).json({ message: 'Unauthorized' });
  }
  let token = authHeader.split(' ')[1];
  const tokenService = new TokenService();
  if (!token) {
    const accessToken = req.cookies['access_token'];
    if (accessToken) {
      token = accessToken;
    } else {
      const refreshToken = req.cookies['refresh_token'];
      if (refreshToken) {
        try {
          const { accessToken: newAccessToken } =
            await tokenService.refreshTokens(refreshToken, deviceId);
          res.cookie('access_token', newAccessToken);
        } catch (e) {
          console.log('Invalid refresh token');

          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
      }
    }
  }

  try {
    const verifiedToken = await tokenService.verifyToken(token, true);
    console.log(token);
    console.log(verifiedToken);
    const { valid, payload } = verifiedToken;
    if (!valid) {
      console.log('invalid token');

      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!payload) {
      console.log('no payload found');

      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  } catch (_) {
    console.log('Invalid token');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  // I am not sure if too keep this or if this was temporary
  // const user = req.user;

  // if (!user) {
  //   console.log('no user found');

  //   res.status(401).json({ message: 'Unauthorized' });
  //   return;
  // }

  // const parseUserResult = requestUserSchema.safeParse(user);

  // if (!parseUserResult.success) {
  //   console.log('invalid user found');

  //   res.status(401).json({ message: 'Unauthorized' });
  //   return;
  // }

  // req.user = parseUserResult.data;

  // check cookies for auth tokens
  next();
  return;
};
