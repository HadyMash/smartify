import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth';
export const authRouter = Router();

// authRouter.use('/mfa', mfaRouter);

authRouter.post('/register', (req, res) => AuthController.register(req, res));
authRouter.post('/login', (req, res) => AuthController.login(req, res));

authRouter.post('/change-password', (req, res) =>
  AuthController.changePassword(req, res),
);

authRouter.delete('/delete-account', (req, res) =>
  AuthController.deleteAccount(req, res),
);
authRouter.post('/reset-request', (req, res) =>
  AuthController.requestReset(req, res),
);
authRouter.post('/reset-password', (req, res) =>
  AuthController.resetPassword(req, res),
);
