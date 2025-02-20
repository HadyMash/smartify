import { Router, Response } from 'express';
import { IoTController } from '../controllers/iot';
import { AuthenticatedRequest } from '../schemas/auth';

export const iotRouter = Router();

iotRouter.post('/:deviceId', (req: AuthenticatedRequest, res: Response) =>
  IoTController.updateDevice(req, res),
);
