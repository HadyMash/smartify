import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { requireAuth, requireDeviceId } from '../middleware/auth';

export const authRouter = Router();
authRouter.use(requireDeviceId);

authRouter.post('/register', (req, res) => AuthController.register(req, res));

authRouter.post('/init', (req, res) =>
  AuthController.initateAuthSession(req, res),
);

authRouter.post('/login', (req, res) => AuthController.login(req, res));

authRouter.post('/mfa/confirm', (req, res) =>
  AuthController.confirmMFA(req, res),
);

authRouter.post('/mfa/verify', (req, res) =>
  AuthController.verifyMFA(req, res),
);

authRouter.get('/refresh', requireAuth, (req, res) =>
  AuthController.refreshTokens(req, res),
);

authRouter.get('/user', requireAuth, (req, res) =>
  AuthController.userData(req, res),
);

//authRouter.get('/srp-credentials', requireAuth, (req, res) =>
//  AuthController.srpCredentials(req, res),
//);

authRouter.patch('/password/change', requireAuth, (req, res) =>
  AuthController.changePassword(req, res),
);

authRouter.patch('/password/reset', (req, res) =>
  AuthController.resetPassword(req, res),
);

authRouter.get('/logout', requireAuth, (req, res) =>
  AuthController.logout(req, res),
);
