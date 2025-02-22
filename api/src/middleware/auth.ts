import { Request, Response, NextFunction } from 'express';

// TODO: implement requireAuth middleware
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //// TODO: check for cookies/auth header
  //const user = req.body.user;
  //
  //if (!user) {
  //  console.log('no user found');
  //
  //  res.status(401).json({ message: 'Unauthorized' });
  //  return;
  //}
  //
  //const parseUserResult = requestUserSchema.safeParse(user);
  //
  //if (!parseUserResult.success) {
  //  console.log('invalid user found');
  //
  //  res.status(401).json({ message: 'Unauthorized' });
  //  return;
  //}
  //
  //req.user = parseUserResult.data;
  //
  //// check cookies for auth tokens
  next();
  return;
};
