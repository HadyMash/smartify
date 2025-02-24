import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { requireDeviceId } from '../middleware/auth';

export const authRouter = Router();
authRouter.use(requireDeviceId);

authRouter.post('/register', (req, res) => AuthController.register(req, res));

authRouter.post('/init', (req, res) =>
  AuthController.initiateAuthSession(req, res),
);

authRouter.post('/login', (req, res) => AuthController.login(req, res));

authRouter.post('/mfa/confirm', (req, res) =>
  AuthController.confirmMFA(req, res),
);

// TODO: get mfa formatted key route (only if mfa is unconfirmed)

authRouter.post('/mfa/verify', (req, res) =>
  AuthController.verifyMFA(req, res),
);
