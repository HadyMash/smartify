/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth';
import { BaseIotAdapter } from '../services/iot/base-adapter';
import { AcmeIoTAdapter } from '../services/iot/acme-adapter';

export class IoTController {
  public static async updateDevice(req: AuthenticatedRequest, res: Response) {
    try {
      // TODO check authenticated request to check user has permission to update the device

      const { deviceId, state } = req.body as { deviceId: string; state: Record<string, unknown> };
      if (!deviceId || !state) {
        return res.status(400).send({ message: 'deviceId and state are required' });
      }
      // TODO: check device info in db to figure out adapter type etc and make sure it exists

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();

      // TODO: update device state
      const device = await adapter.getDevice(deviceId);
      if (!device) {
        return res.status(404).send({ message: 'Device not found' });
      }

      const updatedDevice = await adapter.setDeviceState(deviceId, state);
      if (!updatedDevice) {
        return res.status(400).send({ message: 'Failed to update device state' });
      }

      res.status(200).send({ message: 'Device updated', device: updatedDevice });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public static async getDeviceState(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceId } = req.params;
      if (!deviceId) {
        return res.status(400).send({ message: 'Missing deviceId' });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const device = await adapter.getDevice(deviceId);

      if (!device) {
        return res.status(404).send({ message: 'Device not found' });
      }

      res.status(200).send({ message: 'Device state retrieved', state: device.state });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public static async getAllDevicesState(req: AuthenticatedRequest, res: Response) {
    try {
      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const devices = await adapter.discoverDevices();

      if (!devices || devices.length === 0) {
        return res.status(404).send({ message: 'No connected devices found' });
      }

      const devicesWithState = await adapter.getDevices(devices.map(d => d.id));
      const formattedDevices = devicesWithState?.map(device => ({
        id: device.id,
        state: device.state,
      }));

      res.status(200).send({ message: 'All devices state retrieved', devices: formattedDevices });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public static async setDeviceState(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceId, state } = req.body as { deviceId: string; state: Record<string, unknown> };
      if (!deviceId || !state) {
        return res.status(400).send({ message: 'deviceId and state are required' });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const device = await adapter.getDevice(deviceId);
      if (!device) {
        return res.status(404).send({ message: 'Device not found' });
      }

      const updatedDevice = await adapter.setDeviceState(deviceId, state);
      if (!updatedDevice) {
        return res.status(400).send({ message: 'Failed to update device state' });
      }

      res.status(200).send({ message: 'Device state updated', device: updatedDevice });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
  public static async pairDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceId } = req.body;
      if (!deviceId) {
        return res.status(400).send({ message: 'deviceId is required' });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      await adapter.pairDevices(deviceId);
      const pairedDevice = await adapter.getDevice(deviceId);
      if (!pairedDevice) {
        return res.status(400).send({ message: 'Failed to pair device' });
      }

      res.status(200).send({ message: 'Device paired successfully', device: pairedDevice });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public static async unpairDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceId } = req.params;
      if (!deviceId) {
        return res.status(400).send({ message: 'deviceId is required' });
      }
      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      await adapter.unpairDevices([deviceId]);
      res.status(200).send({ message: 'Device unpaired successfully' });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
}