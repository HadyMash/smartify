import { Router, Request, Response } from 'express';
import { validateApiKey, validateDevicePairing } from '../middleware/api-key';
import { DBService } from '../services/db-service';

const controlRouter = Router();
export const externalAPIRouter = Router();

// Public endpoints
externalAPIRouter.get('/health', (req, res) => {
  res.status(200).send();
});

// Protected routes using API key from request body
externalAPIRouter.use(validateApiKey);

// Device pairing management
controlRouter.post('/pair/:deviceId', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    const deviceId = req.params.deviceId;

    const dbService = new DBService();
    const device = await dbService.getDevice(deviceId);

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const success = await dbService.pairDeviceWithApiKey(deviceId, apiKey);
    if (!success) {
      res.status(500).json({ error: 'Failed to pair device' });
      return;
    }

    res.status(201).json({ message: 'Device paired successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

controlRouter.delete('/pair/:deviceId', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    const deviceId = req.params.deviceId;

    const dbService = new DBService();
    const success = await dbService.unpairDeviceFromApiKey(deviceId, apiKey);

    if (!success) {
      res.status(404).json({ error: 'Device not found or not paired' });
      return;
    }

    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all paired devices
controlRouter.get('/devices', async (req: Request, res: Response) => {
  const apiKey = (req as any).apiKey;
  const dbService = new DBService();

  const devices = (await dbService.getDevices()) || [];
  const pairedDevices = devices
    .filter((d) => d.pairedApiKeys.includes(apiKey))
    .map((d) => {
      const { pairedApiKeys, ...deviceData } = d;
      return deviceData;
    });

  res.json(pairedDevices);
});

// Get specific device
controlRouter.get(
  '/devices/:deviceId',
  validateDevicePairing,
  async (req: Request, res: Response) => {
    const dbService = new DBService();
    const device = await dbService.getDevice(req.params.deviceId);

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const { pairedApiKeys, ...deviceData } = device;
    res.json(deviceData);
  },
);

// Update device state
controlRouter.patch(
  '/devices/:deviceId/state',
  validateDevicePairing,
  async (req: Request, res: Response) => {
    const dbService = new DBService();
    const updatedDevice = await dbService.updateDeviceState(
      req.params.deviceId,
      req.body,
    );

    if (!updatedDevice) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const { pairedApiKeys, ...deviceData } = updatedDevice;
    res.json(deviceData);
  },
);

externalAPIRouter.use('/', controlRouter);
