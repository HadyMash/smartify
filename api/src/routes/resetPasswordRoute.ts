import { Router } from 'express';
import middleware from '../middleware/log.middleware';
const resetPasswordRouter = Router();
resetPasswordRouter.get('/', middleware, (req, res) => {
    res.send('Reset Password');
});
module.exports = resetPasswordRouter;