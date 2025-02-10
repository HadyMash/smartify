import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth';

export const authRouter = Router();

// authRouter.use('/mfa', mfaRouter);

authRouter.post('/register', (req, res) => AuthController.register(req, res));
