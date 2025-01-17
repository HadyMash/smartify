import { Request, Response, Router } from 'express';
import { DBService } from '../services/db-service';
import {
  defaultStates,
  Device,
  deviceTypeSchema,
  limitedColorBrightnessBulbSchema,
  limitedColorBulbSchema,
  onOffBulbSchema,
  rgbBulbSchema,
} from '../schemas/device';

export const adminRouter = Router();

adminRouter.get('/devices/', async (req: Request, res: Response) => {
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

adminRouter.post('/devices/new', async (req: Request, res: Response) => {
  try {
    const { type } = req.body as { type: keyof typeof defaultStates };
    let deviceInfo: Omit<Device, 'id'>;

    try {
      const baseInfo = { type, ...defaultStates[type] };
      switch (type) {
        case deviceTypeSchema.enum.BULB_ON_OFF:
          deviceInfo = onOffBulbSchema.omit({ id: true }).parse(baseInfo);
          break;
        case deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS:
          deviceInfo = rgbBulbSchema.omit({ id: true }).parse(baseInfo);
          break;
        case deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS:
          deviceInfo = limitedColorBrightnessBulbSchema
            .omit({ id: true })
            .parse(baseInfo);
          break;
        case deviceTypeSchema.enum.BULB_LIMITED_COLOR:
          deviceInfo = limitedColorBulbSchema
            .omit({ id: true })
            .parse(baseInfo);
          break;
        default:
          throw new Error('Invalid device type');
      }
    } catch (_) {
      console.log('schema error', _);
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

adminRouter.patch('/devices/:id/state', async (req: Request, res: Response) => {
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
