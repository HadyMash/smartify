import { Request, Response, NextFunction } from 'express';
import { log } from '../util/log';

export const logMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  log.info(
    `${req.method} ${req.path}${req.method !== 'GET' ? ` ${JSON.stringify(req.body)}` : ''}`,
  );
  next();
};
