import { Request, Response, NextFunction } from 'express';

export const logMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(`${req.method} ${req.path} ${JSON.stringify(req.body)}`);
  next();
};
