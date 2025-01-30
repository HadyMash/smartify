import { Router } from 'express';
import middleware from '../middleware/log';
import { RegistrationController } from '../controllers/authentication';
const authenticationRouter = Router();
authenticationRouter.get('/', middleware, (req, res) => {
  res.send('Authentication');
});
authenticationRouter.post('/', (req, res, next) => {
  RegistrationController.register;
});
authenticationRouter.post('/', (req, res, next) => {
  RegistrationController.login;
});
authenticationRouter.post('/', (req, res, next) => {
  RegistrationController.forgotPassword;
});

authenticationRouter.get('/', (req, res, next) => {});
module.exports = authenticationRouter;
