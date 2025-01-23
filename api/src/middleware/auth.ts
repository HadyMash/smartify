import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, userSchema } from '../schemas/auth/user';

// TODO: implement requireAuth middleware
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
  // TODO: check for cookies/auth header
  const user = (req.body as { user?: unknown }).user;

  if (!user) {
    console.log('no user found');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const parseUserResult = userSchema.safeParse(user);

  if (!parseUserResult.success) {
    console.log('invalid user found');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.user = parseUserResult.data;

  // check cookies for auth tokens
  return next();
};

/**
 * A middleware for routes which may use authentication information if available
 * but the user isn't required to be logged in. If found, the user will be added
 * to the request object. If not found or not valid, it will be undefined.
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // TODO: check for cookies/auth header
  const user = (req.body as { user?: unknown }).user;

  const parseUserResult = userSchema.safeParse(user);

  if (parseUserResult.success) {
    req.user = parseUserResult.data;
  }

  // check cookies for auth tokens
  return next();
};
