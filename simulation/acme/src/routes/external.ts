import { Router, Request, Response } from 'express';
import { validateApiKey, validateDevicePairing } from '../middleware/api-key';
import { DBService } from '../services/db-service';
import { DeviceType, deviceTypeSchema } from '../schemas/device';

// Define read-only fields mapping
const deviceReadOnlyFields: Record<DeviceType, string[]> = {
  [deviceTypeSchema.enum.BULB_ON_OFF]: [],
  [deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS]: [],
  [deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS]: [],
  [deviceTypeSchema.enum.BULB_LIMITED_COLOR]: [],
  [deviceTypeSchema.enum.CURTAIN]: [],
  [deviceTypeSchema.enum.AC]: [],
  //[deviceTypeSchema.enum.GARAGE_DOOR]: [],
  //[deviceTypeSchema.enum.SOLAR_PANEL]: [
  //  'currentPowerOutput',
  //  'totalDailyOutput',
  //  'isExportingToGrid',
  //],
  [deviceTypeSchema.enum.THERMOMETER]: ['temperature', 'lastUpdated'],
  [deviceTypeSchema.enum.HUMIDITY_SENSOR]: ['humidity', 'lastUpdated'],
  [deviceTypeSchema.enum.POWER_METER]: [
    'currentConsumption',
    'totalConsumption',
    'lastUpdated',
  ],
  [deviceTypeSchema.enum.BULB_TEMP_COLOR]: ['color'],
  //[deviceTypeSchema.enum.COFFEE_MACHINE]: [
  //  'waterLevel',
  //  'beansLevel',
  //  'lastMaintenance',
  //], // these are sensor readings
};

export const externalAPIRouter = Router();

// Public endpoints
externalAPIRouter.get('/health', (_, res) => {
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
      .filter((d) => !d.pairedApiKeys.includes(apiKey) && d.connected)
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

//// Execute device action
//externalAPIRouter.post(
//  '/devices/:deviceId/actions/:actionName',
//  validateDevicePairing,
//  async (req: Request, res: Response) => {
//    try {
//      const dbService = new DBService();
//      const device = await dbService.getDevice(req.params.deviceId);
//
//      if (!device) {
//        res.status(404).json({ error: 'Device not found' });
//        return;
//      }
//
//      // Check if device has the specified action capability
//      const deviceWithCaps = await dbService.getDeviceWithCapabilities(
//        req.params.deviceId,
//      );
//      const actionCapability = deviceWithCaps?.capabilities.find(
//        (cap) =>
//          cap.type === 'ACTION' &&
//          (cap as ActionCapability).name === req.params.actionName,
//      ) as ActionCapability;
//
//      const actionManager = ActionManager.getInstance();
//      const { actionId, action } = await actionManager.startAction(
//        req.params.deviceId,
//        req.params.actionName,
//        actionCapability.duration,
//        actionCapability.hooks,
//      );
//
//      res.status(202).json({
//        actionId,
//        status: action.status,
//        startedAt: action.startedAt,
//      });
//    } catch (e) {
//      console.error(e);
//      res.status(500).json({ error: 'Internal server error' });
//    }
//  },
//);

//// Get device action status
//externalAPIRouter.get(
//  '/devices/:deviceId/actions/:actionId',
//  validateDevicePairing,
//  async (req: Request, res: Response) => {
//    try {
//      const dbService = new DBService();
//      const device = await dbService.getDevice(req.params.deviceId);
//
//      if (!device) {
//        res.status(404).json({ error: 'Device not found' });
//        return;
//      }
//
//      const action = device.activeActions[req.params.actionId];
//      if (!action) {
//        res.status(404).json({ error: 'Action not found' });
//        return;
//      }
//
//      res.json(action);
//    } catch (e) {
//      console.error(e);
//      res.status(500).json({ error: 'Internal server error' });
//    }
//  },
//);

// Update device state
externalAPIRouter.patch(
  '/devices/:deviceId/state',
  validateDevicePairing,
  async (req: Request, res: Response) => {
    try {
      const dbService = new DBService();
      const device = await dbService.getDevice(req.params.deviceId);

      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      // Check for read-only fields
      const readOnlyFields = deviceReadOnlyFields[device.type];
      const attemptedReadOnlyUpdate = Object.keys(req.body).some((field) =>
        readOnlyFields.includes(field),
      );

      if (attemptedReadOnlyUpdate) {
        res.status(400).json({
          error: 'Cannot modify read-only fields',
          readOnlyFields,
        });
        return;
      }

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
