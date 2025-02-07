import { Router, Request, Response } from 'express';
import { validateApiKey, validateDevicePairing } from '../middleware/api-key';
import { DBService } from '../services/db-service';

export const externalAPIRouter = Router();

// Public endpoints
externalAPIRouter.get('/health', (req, res) => {
  res.status(200).send();
});

// Protected routes using API key from request body
externalAPIRouter.use(validateApiKey);

// Device pairing management
externalAPIRouter.post(
  '/pair/:deviceId',
  async (req: Request, res: Response) => {
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
  },
);

externalAPIRouter.delete(
  '/pair/:deviceId',
  async (req: Request, res: Response) => {
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
  },
);

// Get all paired devices with their capabilities
externalAPIRouter.get('/devices', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    const dbService = new DBService();

    const devices = await dbService.getDevicesWithCapabilities();
    const pairedDevices = devices
      .filter((d) => d.pairedApiKeys.includes(apiKey))
      .map((d) => {
        const { pairedApiKeys, ...deviceData } = d;
        return deviceData;
      });

    res.json(pairedDevices);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unpaired devices that are available for pairing
externalAPIRouter.get('/discover', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    const dbService = new DBService();

    const devices = await dbService.getDevicesWithCapabilities();
    const unpairedDevices = devices
      .filter((d) => !d.pairedApiKeys.includes(apiKey))
      .map((d) => {
        // Only return essential information for unpaired devices
        const { id, type, connected, capabilities } = d;
        return { id, type, connected, capabilities };
      });

    res.json(unpairedDevices);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get paired devices and their states
externalAPIRouter.get(
  '/devices/paired',
  async (req: Request, res: Response) => {
    try {
      const apiKey = (req as any).apiKey;
      const dbService = new DBService();
      const devices = await dbService
        .getDevicesWithCapabilities()
        .then((devices) => {
          return devices.filter((d) => d.pairedApiKeys.includes(apiKey));
        });
      if (!devices) {
        res.status(404).json({ error: 'No paired devices found' });
        return;
      }

      res.status(200).json(devices);
      return;
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Get specific device
externalAPIRouter.get(
  '/devices/:deviceId',
  validateDevicePairing,
  async (req: Request, res: Response) => {
    try {
      const dbService = new DBService();
      const device = await dbService.getDeviceWithCapabilities(
        req.params.deviceId,
      );

      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      const { pairedApiKeys, ...deviceData } = device;
      res.json(deviceData);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Update device state
externalAPIRouter.patch(
  '/devices/:deviceId/state',
  validateDevicePairing,
  async (req: Request, res: Response) => {
    try {
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
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);
