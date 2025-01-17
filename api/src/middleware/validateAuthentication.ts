import { Request, Response, NextFunction } from 'express';
import { userSchema, AuthenticatedRequest } from '../schemas/users';

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.body.user;

  if (!user) {
    console.log('No user found');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const parseUserResult = userSchema.safeParse(user);

  if (!parseUserResult.success) {
    console.log('Invalid user found');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.body.user = parseUserResult.data;
  return next();
};
