import { Request, Response, Router } from 'express';
import { DBService } from '../services/db-service';
import {
  Device,
  DeviceNoId,
  deviceNoIdSchema,
  deviceSchema,
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
    let deviceInfo: DeviceNoId;
    try {
      deviceInfo = deviceNoIdSchema.parse(req.body);
    } catch (_) {
      console.log('schema error', _);

      res.status(400).send({ error: 'Invalid request body' });
      return;
    }

    const device: Device | undefined = await new DBService().createDevice(
      deviceInfo,
    );

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
