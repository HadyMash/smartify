import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/auth';

/**
 * A middleware for routes which require the user to be logged in. If the user
 * is found and valid, they will be added to the request object. If not found or
 * not valid, a 401 is returned.
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: implement
  next();
  return;
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
  // TODO: implement

  // check cookies for auth tokens
  return next();
};
