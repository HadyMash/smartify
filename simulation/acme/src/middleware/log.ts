import { Request, Response, NextFunction } from 'express';

export const logMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(
    `${req.method} ${req.path}${req.method !== 'GET' ? ` ${JSON.stringify(req.body)}` : ''}`,
  );
  next();
};
