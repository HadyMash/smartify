import { Router, Response } from 'express';
import { IoTController } from '../controllers/iot';
import { AuthenticatedRequest } from '../schemas/auth';
import { requireAuth } from '../middleware/auth';

export const iotRouter = Router();

iotRouter.post(
  '/:deviceId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.updateDevice(req, res);
  },
);

iotRouter.get(
  '/:deviceId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.getDeviceState(req, res);
  },
);

iotRouter.get(
  '/',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.getAllDevicesState(req, res);
  },
);

iotRouter.patch(
  '/:deviceId/state',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.setDeviceState(req, res);
  },
);

iotRouter.post(
  '/pair',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.pairDevices(req, res);
  },
);

iotRouter.delete(
  '/:deviceId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.unpairDevice(req, res);
  },
);

iotRouter.post(
  '/:deviceId/action',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.startAction(req, res);
  },
);

iotRouter.post(
  '/actions',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    await IoTController.startActions(req, res);
  },
);
