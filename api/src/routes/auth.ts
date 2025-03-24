import { Router } from 'express';
import { mfaRouter } from './mfa';

export const authRouter = Router();

authRouter.use('/mfa', mfaRouter);
