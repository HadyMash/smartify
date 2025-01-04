import { Router } from 'express';
import middleware from '../middleware/log.middleware';
const loginRouter = Router();
loginRouter.get('/', middleware, (req, res) => {
    res.send('Login');
});

module.exports = loginRouter;
