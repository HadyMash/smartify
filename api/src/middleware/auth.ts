import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, requestUserSchema } from '../schemas/auth';

// TODO: implement requireAuth middleware
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

  const parseUserResult = requestUserSchema.safeParse(user);

  if (!parseUserResult.success) {
    console.log('invalid user found');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.user = parseUserResult.data;

  // check cookies for auth tokens
  return next();
};
