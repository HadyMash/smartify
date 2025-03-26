import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/auth';
import { BaseIotAdapter } from '../services/iot/base-adapter';
import { AcmeIoTAdapter } from '../services/iot/acme-adapter';
import { HouseholdService } from '../services/household';

export class IoTController {
  public static async updateDevice(req: AuthenticatedRequest, res: Response) {
    try {
      // TODO check authenticated request to check user has permission to update the device

      const { deviceId, state } = req.body as {
        deviceId: string;
        state: Record<string, unknown>;
      };
      if (!deviceId || !state) {
        return res
          .status(400)
          .send({ message: 'deviceId and state are required' });
      }
      // TODO: check device info in db to figure out adapter type etc and make sure it exists

      const hs = new HouseholdService();
      const household = await hs.getHouseholdByDevice(deviceId);
      if (
        !household ||
        !household._id ||
        !(household._id.toString() in req.user!.households)
      ) {
        return res.status(403).send({
          message: 'Unauthorized: Device not linked to your household',
        });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();

      // TODO: update device state

      const updatedDevice = await adapter.setDeviceState(deviceId, state);
      if (!updatedDevice) {
        return res
          .status(400)
          .send({ message: 'Failed to update device state' });
      }

      res
        .status(200)
        .send({ message: 'Device updated', device: updatedDevice });
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

      res
        .status(200)
        .send({ message: 'Device state retrieved', state: device.state });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public static async getAllDevicesState(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const devices = await adapter.discoverDevices();

      if (!devices || devices.length === 0) {
        return res.status(404).send({ message: 'No connected devices found' });
      }

      const devicesWithState = await adapter.getDevices(
        devices.map((d) => d.id),
      );
      const formattedDevices = devicesWithState?.map((device) => ({
        id: device.id,
        state: device.state,
      }));

      res.status(200).send({
        message: 'All devices state retrieved',
        devices: formattedDevices,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public static async setDeviceState(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceId, state } = req.body as {
        deviceId: string;
        state: Record<string, unknown>;
      };
      if (!deviceId || !state) {
        return res
          .status(400)
          .send({ message: 'deviceId and state are required' });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const device = await adapter.getDevice(deviceId);
      if (!device) {
        return res.status(404).send({ message: 'Device not found' });
      }

      const updatedDevice = await adapter.setDeviceState(deviceId, state);
      if (!updatedDevice) {
        return res
          .status(400)
          .send({ message: 'Failed to update device state' });
      }

      res
        .status(200)
        .send({ message: 'Device state updated', device: updatedDevice });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
  public static async pairDevices(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceIds } = req.body as { deviceIds: string[] };
      if (!deviceIds || deviceIds.length === 0) {
        return res.status(400).send({ message: 'deviceIds are required' });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const existingDevices = await adapter.getDevices(deviceIds);

      const alreadyPaired =
        existingDevices?.filter((device) => device.id) || [];
      if (alreadyPaired.length > 0) {
        return res.status(400).send({
          message: 'Devices are already paired',
          devices: alreadyPaired,
        });
      }

      await adapter.pairDevices(deviceIds);
      const pairedDevices = await adapter.getDevices(deviceIds);
      if (!pairedDevices || pairedDevices.length === 0) {
        return res.status(400).send({ message: 'Failed to pair devices' });
      }

      res.status(200).send({
        message: 'Devices paired successfully',
        devices: pairedDevices,
      });
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

  public static async getHouseholdDevices(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { householdId } = req.params;
      if (!(householdId in req.user!.households)) {
        return res
          .status(403)
          .send({ message: 'Unauthorized: Not part of this household' });
      }
      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const devices = await adapter.getDevicesByHousehold(householdId);
      if (!Array.isArray(devices) || devices.length === 0) {
        return res.status(400).send({ message: 'deviceIds are required' });
      }

      res.status(200).send({ message: 'Household devices retrieved', devices });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
  /*public static async startAction(req: AuthenticatedRequest, res: Response) {
    try {
      const { deviceId, actionId, args } = req.body;
      if (!deviceId || !actionId || !args) {
        return res
          .status(400)
          .send({ message: 'deviceId, actionId, and args are required' });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const updatedDevice = await adapter.startAction(deviceId, actionId, args);

      if (!updatedDevice) {
        return res.status(400).send({ message: 'Failed to start action' });
      }

      res.status(200).send({
        message: 'Action started successfully',
        device: updatedDevice,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public static async startActions(req: AuthenticatedRequest, res: Response) {
    try {
      const { actions } = req.body;
      if (!actions || Object.keys(actions).length === 0) {
        return res.status(400).send({ message: 'actions are required' });
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const updatedDevices = await adapter.startActions(actions);

      if (!updatedDevices || updatedDevices.length === 0) {
        return res.status(400).send({ message: 'Failed to start actions' });
      }

      res.status(200).send({
        message: 'Actions started successfully',
        devices: updatedDevices,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }*/
}
