import { Router } from 'express';
import middleware from '../middleware/log.middleware';
const deleteAccountRouter = Router();
deleteAccountRouter.get('/', middleware, (req, res) => {
    res.send('Delete Account');
});
module.exports = deleteAccountRouter;