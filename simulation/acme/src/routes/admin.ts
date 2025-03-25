import { Request, Response, Router } from 'express';
import util from 'util';
import { DBService } from '../services/db-service';
import { DeviceAction } from '../schemas/capabilities';
import {
  defaultStates,
  Device,
  deviceTypeSchema,
  limitedColorBrightnessBulbSchema,
  limitedColorBulbSchema,
  onOffBulbSchema,
  rgbBulbSchema,
  DeviceType,
  curtainSchema,
  acSchema,
  deviceSchemaMap,
} from '../schemas/device';
import { ZodObject } from 'zod';

// Define read-only fields mapping
const deviceReadOnlyFields: Record<DeviceType, string[]> = {
  [deviceTypeSchema.enum.BULB_ON_OFF]: [],
  [deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS]: [],
  [deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS]: [],
  [deviceTypeSchema.enum.BULB_LIMITED_COLOR]: [],
  [deviceTypeSchema.enum.CURTAIN]: [],
  [deviceTypeSchema.enum.AC]: [],
  //[deviceTypeSchema.enum.GARAGE_DOOR]: [],
  [deviceTypeSchema.enum.SOLAR_PANEL]: [
    'currentpoweroutput',
    'totalDailyOutput',
    'isExportingToGrid',
  ],
  [deviceTypeSchema.enum.THERMOMETER]: ['temperature'],
  [deviceTypeSchema.enum.HUMIDITY_SENSOR]: ['humidity'],
  [deviceTypeSchema.enum.POWER_METER]: [
    'currentConsumption',
    'totalConsumption',
  ],
  [deviceTypeSchema.enum.BULB_TEMP_COLOR]: ['color'],
  //[deviceTypeSchema.enum.COFFEE_MACHINE]: [
  //  'waterLevel',
  //  'beansLevel',
  //  'lastMaintenance',
  //], // these are sensor readings
};

export const adminRouter = Router();

adminRouter.get('/devices/types', (_: Request, res: Response) => {
  try {
    // Return list of device types that can be created
    const creatableDevices = Object.keys(defaultStates).map((type) => ({
      type,
      defaultState: defaultStates[type as DeviceType],
    }));

    res.status(200).json(creatableDevices);
  } catch (e) {
    console.error('error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/devices/', async (_: Request, res: Response) => {
  try {
    let devices: Device[] | undefined = await new DBService().getDevices();

    if (!devices) {
      devices = [];
    }

    res.status(200).send(devices);
  } catch (e) {
    console.log('error', e);

    res.status(500).send({ error: 'Internal server error' });
  }
});

adminRouter.get('/devices/:id', async (req: Request, res: Response) => {
  try {
    let device: Device | undefined = await new DBService().getDevice(
      req.params.id,
    );

    if (!device) {
      res.status(404).send({
        error: 'not found',
      });
      return;
    }

    res.status(200).send(device);
  } catch (e) {
    console.log('error', e);

    res.status(500).send({ error: 'Internal server error' });
  }
});

adminRouter.post('/devices/new', async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    const { type } = req.body as { type: keyof typeof defaultStates };
    let deviceInfo: Omit<Device, 'id'>;

    try {
      const baseInfo = {
        type,
        ...defaultStates[type],
      };

      const p = (s: ZodObject<any>) => s.omit({ id: true }).parse(baseInfo);

      const schema = deviceSchemaMap[type];
      if (!schema) {
        throw new Error('Invalid device type');
      }

      deviceInfo = p(schema) as any;
    } catch (e) {
      console.log('schema error', util.inspect(e, false));
      console.log('schema issues:', util.inspect((e as any).issues, false));

      res.status(400).send({ error: 'Invalid request body' });
      return;
    }

    const device = await new DBService().createDevice(deviceInfo);

    if (!device) {
      res.status(500).send({ error: 'Internal server error' });
      return;
    }

    res.status(201).send(device);
    return;
  } catch (e) {
    res.status(500).send({ error: 'Internal server error' });
    return;
  }
});

adminRouter.delete('/devices/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    // check device exists first
    const device = await new DBService().getDevice(id);
    if (!device) {
      res.status(404).send({ error: 'Device not found' });
      return;
    }

    const success = await new DBService().deleteDevice(id);
    if (!success) {
      res.status(500).send({ error: 'Internal server error' });
      return;
    }
    res.status(204).send();
    return;
  } catch (e) {
    console.error('error', e);
    res.status(500).send({ error: 'Internal server error' });
    return;
  }
});

//// Execute device action
//adminRouter.post(
//  '/devices/:id/actions/:actionName',
//  async (req: Request, res: Response) => {
//    try {
//      const dbService = new DBService();
//      const device = await dbService.getDevice(req.params.id);
//
//      if (!device) {
//        res.status(404).json({ error: 'Device not found' });
//        return;
//      }
//
//      // Check if device has the specified action capability
//      const deviceWithCaps = await dbService.getDeviceWithCapabilities(
//        req.params.id,
//      );
//      const actionCapability = deviceWithCaps?.capabilities.find(
//        (cap) =>
//          cap.type === 'ACTION' &&
//          (cap as ActionCapability).name === req.params.actionName,
//      );
//
//      if (!actionCapability) {
//        res.status(400).json({
//          error: 'Action not supported by device',
//          actionName: req.params.actionName,
//        });
//        return;
//      }
//
//      // Generate unique action ID
//      const actionId = `${req.params.actionName}-${Date.now()}`;
//
//      // Create action entry
//      const actionEntry: DeviceAction = {
//        name: req.params.actionName,
//        status: 'PENDING',
//        startedAt: new Date().toISOString(),
//      };
//
//      // Update device with new action
//      const updatedDevice = await dbService.updateDeviceState(req.params.id, {
//        activeActions: {
//          ...device.activeActions,
//          [actionId]: actionEntry,
//        },
//      });
//
//      if (!updatedDevice) {
//        res.status(500).json({ error: 'Failed to initiate action' });
//        return;
//      }
//
//      res.status(202).json({
//        actionId,
//        status: actionEntry.status,
//        startedAt: actionEntry.startedAt,
//      });
//    } catch (e) {
//      console.error(e);
//      res.status(500).json({ error: 'Internal server error' });
//    }
//  },
//);

// Update device action status
adminRouter.patch(
  '/devices/:id/actions/:actionId',
  async (req: Request, res: Response) => {
    try {
      const { status, error } = req.body;
      const dbService = new DBService();
      const device = await dbService.getDevice(req.params.id);

      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      const action = device.activeActions[req.params.actionId];
      if (!action) {
        res.status(404).json({ error: 'Action not found' });
        return;
      }

      // Validate status transition
      if (!status || !['IN_PROGRESS', 'COMPLETED', 'FAILED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const updatedAction = {
        ...action,
        status,
        ...(status === 'COMPLETED' || status === 'FAILED'
          ? { completedAt: new Date().toISOString() }
          : {}),
        ...(error && status === 'FAILED' ? { error } : {}),
      };

      const updatedDevice = await dbService.updateDeviceState(req.params.id, {
        activeActions: {
          ...device.activeActions,
          [req.params.actionId]: updatedAction,
        },
      });

      if (!updatedDevice) {
        res.status(500).json({ error: 'Failed to update action status' });
        return;
      }

      res.json(updatedAction);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Get device action status
adminRouter.get(
  '/devices/:id/actions/:actionId',
  async (req: Request, res: Response) => {
    try {
      const dbService = new DBService();
      const device = await dbService.getDevice(req.params.id);

      if (!device) {
        res.status(404).json({ error: 'Device not found' });
        return;
      }

      const action = device.activeActions[req.params.actionId];
      if (!action) {
        res.status(404).json({ error: 'Action not found' });
        return;
      }

      res.json(action);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Get all device actions
adminRouter.get('/devices/:id/actions', async (req: Request, res: Response) => {
  try {
    const dbService = new DBService();
    const device = await dbService.getDevice(req.params.id);

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.json(device.activeActions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.patch('/devices/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const device = await new DBService().getDevice(id);

    if (!device) {
      res.status(404).send({ error: 'Device not found' });
      return;
    }

    if (Object.keys(req.body).length === 0) {
      res.status(400).send({ error: 'Empty request body' });
      return;
    }

    try {
      // Check for read-only fields first
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

      let validatedState;
      if (device.type === deviceTypeSchema.enum.BULB_ON_OFF) {
        validatedState = onOffBulbSchema.partial().parse(req.body);
      } else if (device.type === deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS) {
        validatedState = rgbBulbSchema.partial().parse(req.body);
      } else if (
        device.type === deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS
      ) {
        validatedState = limitedColorBrightnessBulbSchema
          .partial()
          .parse(req.body);
      } else if (device.type === deviceTypeSchema.enum.BULB_LIMITED_COLOR) {
        validatedState = limitedColorBulbSchema.partial().parse(req.body);
      } else {
        validatedState = req.body;
      }

      const updatedDevice = await new DBService().updateDeviceState(
        id,
        validatedState,
      );

      if (!updatedDevice) {
        res.status(404).send({ error: 'Device not found' });
        return;
      }

      res.status(200).send(updatedDevice);
    } catch (e) {
      res.status(400).send({ error: 'Invalid state for device type' });
    }
  } catch (e) {
    console.error('error', e);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// API Key management

adminRouter.get('/api-keys', async (req: Request, res: Response) => {
  try {
    const active = req.query.active === 'true';
    const dbService = new DBService();
    const apiKeys = active
      ? await dbService.getActiveApiKeys()
      : await dbService.getApiKeys();
    res.status(200).json(apiKeys);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/api-keys/get', async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    if (!key) {
      res.status(400).json({ error: 'API key is required' });
      return;
    }
    const apiKey = await new DBService().getApiKey(key);
    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }
    res.status(200).json(apiKey);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.patch('/api-keys', async (req: Request, res: Response) => {
  try {
    const { key, ...updates } = req.body;
    if (!key) {
      res.status(400).json({ error: 'API key is required' });
      return;
    }
    if (!updates || Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    // Only allow updating certain fields
    const allowedUpdates = ['name', 'isActive', 'webhookUrl'];
    const hasDisallowedField = Object.keys(updates).some(
      (key) => !allowedUpdates.includes(key),
    );

    if (hasDisallowedField) {
      res.status(400).json({ error: 'Request contains disallowed fields' });
      return;
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedUpdates.includes(key)),
    );

    const updatedKey = await new DBService().updateApiKey(key, filteredUpdates);
    if (!updatedKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }

    res.status(200).json(updatedKey);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/api-keys', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const apiKey = await new DBService().createApiKey(name);
    res.status(201).json(apiKey);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/api-keys', async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    if (!key) {
      res.status(400).json({ error: 'API key is required' });
      return;
    }
    const dbService = new DBService();

    // Check if API key exists first
    const apiKey = await dbService.getApiKey(key);
    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }

    const success = await dbService.deleteApiKey(key);
    if (!success) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    console.error('error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/devices/:id/pair', async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    if (!key) {
      res.status(400).json({ error: 'API key is required' });
      return;
    }
    const success = await new DBService().pairDeviceWithApiKey(
      req.params.id,
      key,
    );
    if (!success) {
      res.status(404).json({ error: 'Device or API key not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/devices/:id/pair', async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    if (!key) {
      res.status(400).json({ error: 'API key is required' });
      return;
    }
    const success = await new DBService().unpairDeviceFromApiKey(
      req.params.id,
      key,
    );
    if (!success) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
