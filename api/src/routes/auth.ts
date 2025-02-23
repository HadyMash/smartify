import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { requireDeviceId } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', requireDeviceId, (req, res) =>
  AuthController.register(req, res),
);

authRouter.post('/mfa/confirm', requireDeviceId, (req, res) =>
  AuthController.confirmMFA(req, res),
);
