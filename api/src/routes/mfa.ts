import { Router } from 'express';
import { MFAController } from '../controllers/mfa';
import { requireAuth } from '../middleware/auth';

export const mfaRouter = Router();

// TODO: update routes so they aren't these temp ones for testing

mfaRouter.post('/init', requireAuth, (req, res) =>
  MFAController.initMFA(req, res),
);

mfaRouter.post('/confirm-init', requireAuth, (req, res) =>
  MFAController.confirmMFA(req, res),
);

mfaRouter.post('/verify', requireAuth, (req, res) =>
  MFAController.verifyMFA(req, res),
);

// TODO: add route to reinit MFA if they are alrady signed in
