import { Router } from 'express';
import { mfaRouter } from './mfa.ts';

export const authRouter = Router();

authRouter.use('/mfa', mfaRouter);
