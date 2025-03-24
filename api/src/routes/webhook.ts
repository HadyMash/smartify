import { Router, Request, Response } from 'express';
import { WebhookController } from '../controllers/webhook.ts';

export const webhookRouter = Router();

webhookRouter.post('/iot', async (req: Request, res: Response) =>
  WebhookController.iotUpdate(req, res),
);
