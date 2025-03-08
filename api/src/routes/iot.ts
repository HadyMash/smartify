import { Router, Response } from 'express';
import { IoTController } from '../controllers/iot';
import { AuthenticatedRequest } from '../schemas/auth';

export const iotRouter = Router();

iotRouter.post('/:deviceId', async (req: AuthenticatedRequest, res: Response) => {
  await IoTController.updateDevice(req, res);
});

iotRouter.get('/:deviceId', async (req: AuthenticatedRequest, res: Response) => {
  await IoTController.getDeviceState(req, res);
});
iotRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  await IoTController.getAllDevicesState(req, res);
});

iotRouter.patch('/:deviceId/state', async (req: AuthenticatedRequest, res: Response) => {
  await IoTController.setDeviceState(req, res);
});

iotRouter.post('/pair', async (req: AuthenticatedRequest, res: Response) => {
  await IoTController.pairDevice(req, res);
});

iotRouter.delete('/:deviceId', async (req: AuthenticatedRequest, res: Response) => {
  await IoTController.unpairDevice(req, res);
});
