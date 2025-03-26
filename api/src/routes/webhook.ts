import { Router, Request, Response } from 'express';
import { WebhookController } from '../controllers/webhook';

export const webhookRouter = Router();

webhookRouter.post('/iot', async (req: Request, res: Response) =>
  WebhookController.iotUpdate(req, res),
);
