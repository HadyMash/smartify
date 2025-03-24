//import { Router } from 'express';
//import { MFAController } from '../controllers/mfa';
//import { requireAuth } from '../middleware/auth';
//import { logMiddleware } from '../middleware/log';
//
//export const mfaRouter = Router();
//
//// TODO: update routes so they aren't these temp ones for testing
//
//mfaRouter.post('/init', requireAuth, MFAController.initMFA);
//
//mfaRouter.post('/confirm-init', requireAuth, MFAController.confirmMFA);
//
//mfaRouter.post('/verify', requireAuth, MFAController.verifyMFA);
//
//// ! temp
//// TODO: remove
//mfaRouter.get('/test/:id', MFAController.testRoute);
//
//// TODO: add route to reinit MFA if they are alrady signed in
