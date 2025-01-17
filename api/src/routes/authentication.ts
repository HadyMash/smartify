import { Router } from 'express';
import middleware from '../middleware/log';
import {
  registrationController,
  loginController,
  forgotPassswordController,
} from '../controllers/authentication';
const authenticationRouter = Router();
authenticationRouter.get('/', middleware, (req, res) => {
  res.send('Authentication');
});
authenticationRouter.post('/', (req, res, next) => {
  registrationController.register;
});
authenticationRouter.post('/', (req, res, next) => {
  loginController.login;
});
authenticationRouter.post('/', (req, res, next) => {
  forgotPassswordController.forgotPassword;
});

authenticationRouter.get('/', (req, res, next) => {});
module.exports = authenticationRouter;
