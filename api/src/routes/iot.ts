import { Router, Response } from 'express';
import { IoTController } from '../controllers/iot';
import { AuthenticatedRequest } from '../schemas/auth/auth';
import { requireAuth } from '../middleware/auth';
import { tryAPIController } from '../util/controller';
import { HouseholdService } from '../services/household';
import { AcmeIoTAdapter } from '../services/iot/acme-adapter';
import { log } from '../util/log';
import { HouseholdDevice } from '../schemas/household';
import { randomInt } from 'crypto';

export const iotRouter = Router();

iotRouter.use(requireAuth);

iotRouter.get('/test-route', (req: AuthenticatedRequest, res: Response) => {
  tryAPIController(res, async () => {
    const hs = new HouseholdService();
    const adapter = new AcmeIoTAdapter();

    // discover devices
    const devices = await adapter.discoverDevices();
    log.debug('Discovered devices:', devices);
    if (!devices || devices.length === 0) {
      throw new Error('No devices found');
    }
    // pair the first device
    const device = devices[0];
    if (!device) {
      throw new Error('No devices found');
    }
    log.debug('Pairing device:', device);
    await adapter.pairDevices([device.id]);

    const hd: HouseholdDevice = {
      ...device,
      roomId: 'room_0_0',
      name: `my device ${randomInt(0, 1000)}`,
    };

    await hs.pairDevicesToHousehold('67e48b974bdb223b52a9458d', [hd]);
    res.status(200).send();
  });
});

iotRouter.get('/:householdId/all', (req: AuthenticatedRequest, res: Response) =>
  IoTController.getAllDevicesState(req, res),
);

//iotRouter.patch('/devices')
iotRouter.patch('/state', (req: AuthenticatedRequest, res: Response) =>
  IoTController.updateDeviceState(req, res),
);

iotRouter.get('/discover', (req: AuthenticatedRequest, res: Response) =>
  IoTController.discoverDevices(req, res),
);

iotRouter.get('/:deviceId', (req: AuthenticatedRequest, res: Response) =>
  IoTController.getDeviceState(req, res),
);

//iotRouter.post(
//  '/:deviceId',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.updateDevice(req, res);
//  },
//);
//
//iotRouter.get(
//  '/:deviceId',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.getDeviceState(req, res);
//  },
//);
//
//iotRouter.get(
//  '/',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.getAllDevicesState(req, res);
//  },
//);
//
//iotRouter.patch(
//  '/:deviceId/state',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.setDeviceState(req, res);
//  },
//);
//
//iotRouter.post(
//  '/pair',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.pairDevices(req, res);
//  },
//);
//
//iotRouter.delete(
//  '/:deviceId',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.unpairDevice(req, res);
//  },
//);
//
///*iotRouter.post(
//  '/:deviceId/action',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.startAction(req, res);
//  },
//);
//
//iotRouter.post(
//  '/actions',
//  requireAuth,
//  async (req: AuthenticatedRequest, res: Response) => {
//    await IoTController.startActions(req, res);
//  },
//);*/
