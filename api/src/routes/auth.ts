import { Router } from 'express';
import { AuthController } from '../controllers/auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res) =>
  AuthController.register(req, res),
);
