import { Router } from 'express';
import middleware from '../middleware/log.middleware';

const registerRouter = Router();
registerRouter.get('/', middleware, (req, res) => {
    res.send('Registration');
});
module.exports = registerRouter;