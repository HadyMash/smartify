import { Router } from 'express';
import middleware from '../middleware/log.middleware';
const changePasswordRouter = Router();
changePasswordRouter.get('/', middleware, (req, res) => {
    res.send('Change Password');
});
module.exports = changePasswordRouter;