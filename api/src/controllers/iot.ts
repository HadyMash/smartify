import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/auth';
import { tryAPIController } from '../util/controller';
import { BaseIotAdapter } from '../services/iot/base-adapter';
import { AcmeIoTAdapter } from '../services/iot/acme-adapter';
import { HouseholdService } from '../services/household';
import {
  BadRequestToDeviceError,
  DeviceNotFoundError,
  DeviceOfflineError,
  ExternalServerError,
  InvalidAPIKeyError,
  MissingAPIKeyError,
  setDeviceStateDataSchema,
} from '../schemas/devices';
import { log } from '../util/log';
import { validateSchema } from '../util/schema';
import { objectIdOrStringSchema } from '../schemas/obj-id';

export class IoTController {
  public static discoverDevices(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      // get a list of devices from the IoT sources
      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const devices = await adapter.discoverDevices();

      if (!devices) {
        res.status(500).send({ error: 'Internal Server Error' });
        return;
      }

      // check all the devices aren't paired with our system
      const hs = new HouseholdService();
      const households = await hs.getDevicesPairedToHouseholds(
        devices.map((d) => d.id),
      );

      // filter devices
      const unpairedDevices = devices.filter(
        (d) => !households.some((h) => h._id === d.id),
      );

      log.debug('Unpaired devices:', unpairedDevices);

      res.status(200).send({
        message: 'Devices discovered',
        devices: unpairedDevices.map((d) => ({
          id: d.id,
          name: d.name,
        })),
      });
    });
  }

  public static getDeviceState(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const deviceId = req.params.deviceId;
        if (!deviceId) {
          res.status(400).send({ error: 'Missing deviceId' });
          return;
        }

        // check if the device is paired with one of the user's households
        const hs = new HouseholdService();
        const di = await hs.getDeviceInfo(deviceId);

        if (!di) {
          res.status(404).send({ error: 'Device not found' });
          return;
        }

        // check if the user is a member of the device's houseohld
        if (!(di.householdId.toString() in req.user!.households)) {
          res.status(403).send({
            error: 'Unauthorized: You do not have access to this device',
          });
          return;
        }

        // get the device state
        const adapter: BaseIotAdapter = new AcmeIoTAdapter();
        const device = await adapter.getDevice(deviceId);

        if (!device) {
          res.status(404).send({ error: 'Device not found' });
          log.error('Device not found but paired with our system');
          return;
        }

        res.status(200).send({
          message: 'Device state retrieved',
          device,
        });
        return;
      },
      (e) => {
        if (e instanceof DeviceNotFoundError) {
          res.status(404).send({ error: 'Device not found' });
          return true;
        }
        if (e instanceof BadRequestToDeviceError) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof ExternalServerError) {
          res.status(502).send({ error: 'External Server Error' });
          return true;
        }
        if (
          e instanceof MissingAPIKeyError ||
          e instanceof InvalidAPIKeyError
        ) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof DeviceOfflineError) {
          res.status(503).send({ error: 'Device Offline' });
          return true;
        }
        return false;
      },
    );
  }

  public static getAllDevicesState(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      const householdId = validateSchema(
        res,
        objectIdOrStringSchema,
        req.params.householdId,
      );
      if (!householdId) {
        return;
      }

      const hs = new HouseholdService();
      const devices = await hs.getHouseholdDevices(householdId);

      if (!devices) {
        res.status(500).send({ error: 'Internal Server Error' });
        return;
      }

      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      const devicesWithStates = await adapter.getDevices(
        devices.map((d) => d._id),
      );

      if (!devicesWithStates) {
        res.status(500).send({ error: 'Internal Server Error' });
        return;
      }

      res.status(200).send({
        message: 'All devices state retrieved',
        devices: devicesWithStates,
      });
    });
  }

  public static updateDeviceState(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      const data = validateSchema(res, setDeviceStateDataSchema, req.body);
      if (!data) {
        return;
      }
      log.debug('state:', data);

      // check if the device is paired with one of the user's households
      const hs = new HouseholdService();
      const di = await hs.getDeviceInfo(data.deviceId);
      if (!di) {
        log.debug('device info not found:', di);
        res.status(404).send({ error: 'Device not found' });
        return;
      }

      // check if the user is a member of the device's houseohld
      if (!(di.householdId.toString() in req.user!.households)) {
        res.status(403).send({
          error: 'Unauthorized: You do not have access to this device',
        });
        return;
      }

      // set the device state
      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
      log.debug('setting device state');
      await adapter.setDeviceState(data.deviceId, data.state);

      res.status(200).send({
        message: 'Device state updated',
        //device,
      });
    });
  }

  //  public static async updateDevice(req: AuthenticatedRequest, res: Response) {
  //    try {
  //      // TODO check authenticated request to check user has permission to update the device
  //
  //      const { deviceId, state } = req.body as {
  //        deviceId: string;
  //        state: Record<string, unknown>;
  //      };
  //      if (!deviceId || !state) {
  //        return res
  //          .status(400)
  //          .send({ message: 'deviceId and state are required' });
  //      }
  //      // TODO: check device info in db to figure out adapter type etc and make sure it exists
  //
  //      const hs = new HouseholdService();
  //      const household = await hs.getHouseholdByDevice(deviceId);
  //      if (
  //        !household ||
  //        !household._id ||
  //        !(household._id.toString() in req.user!.households)
  //      ) {
  //        return res.status(403).send({
  //          message: 'Unauthorized: Device not linked to your household',
  //        });
  //      }
  //
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //
  //      // TODO: update device state
  //
  //      const updatedDevice = await adapter.setDeviceState(deviceId, state);
  //      if (!updatedDevice) {
  //        return res
  //          .status(400)
  //          .send({ message: 'Failed to update device state' });
  //      }
  //
  //      res
  //        .status(200)
  //        .send({ message: 'Device updated', device: updatedDevice });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //
  //  public static async getDeviceState(req: AuthenticatedRequest, res: Response) {
  //    try {
  //      const { deviceId } = req.params;
  //      if (!deviceId) {
  //        return res.status(400).send({ message: 'Missing deviceId' });
  //      }
  //
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      const device = await adapter.getDevice(deviceId);
  //
  //      if (!device) {
  //        return res.status(404).send({ message: 'Device not found' });
  //      }
  //
  //      res
  //        .status(200)
  //        .send({ message: 'Device state retrieved', state: device.state });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //
  //  public static async getAllDevicesState(
  //    req: AuthenticatedRequest,
  //    res: Response,
  //  ) {
  //    try {
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      const devices = await adapter.discoverDevices();
  //
  //      if (!devices || devices.length === 0) {
  //        return res.status(404).send({ message: 'No connected devices found' });
  //      }
  //
  //      const devicesWithState = await adapter.getDevices(
  //        devices.map((d) => d.id),
  //      );
  //      const formattedDevices = devicesWithState?.map((device) => ({
  //        id: device.id,
  //        state: device.state,
  //      }));
  //
  //      res.status(200).send({
  //        message: 'All devices state retrieved',
  //        devices: formattedDevices,
  //      });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //
  //  public static async setDeviceState(req: AuthenticatedRequest, res: Response) {
  //    try {
  //      const { deviceId, state } = req.body as {
  //        deviceId: string;
  //        state: Record<string, unknown>;
  //      };
  //      if (!deviceId || !state) {
  //        return res
  //          .status(400)
  //          .send({ message: 'deviceId and state are required' });
  //      }
  //
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      const device = await adapter.getDevice(deviceId);
  //      if (!device) {
  //        return res.status(404).send({ message: 'Device not found' });
  //      }
  //
  //      const updatedDevice = await adapter.setDeviceState(deviceId, state);
  //      if (!updatedDevice) {
  //        return res
  //          .status(400)
  //          .send({ message: 'Failed to update device state' });
  //      }
  //
  //      res
  //        .status(200)
  //        .send({ message: 'Device state updated', device: updatedDevice });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //  public static async pairDevices(req: AuthenticatedRequest, res: Response) {
  //    try {
  //      const { deviceIds } = req.body as { deviceIds: string[] };
  //      if (!deviceIds || deviceIds.length === 0) {
  //        return res.status(400).send({ message: 'deviceIds are required' });
  //      }
  //
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      const existingDevices = await adapter.getDevices(deviceIds);
  //
  //      const alreadyPaired =
  //        existingDevices?.filter((device) => device.id) || [];
  //      if (alreadyPaired.length > 0) {
  //        return res.status(400).send({
  //          message: 'Devices are already paired',
  //          devices: alreadyPaired,
  //        });
  //      }
  //
  //      await adapter.pairDevices(deviceIds);
  //      const pairedDevices = await adapter.getDevices(deviceIds);
  //      if (!pairedDevices || pairedDevices.length === 0) {
  //        return res.status(400).send({ message: 'Failed to pair devices' });
  //      }
  //
  //      res.status(200).send({
  //        message: 'Devices paired successfully',
  //        devices: pairedDevices,
  //      });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //
  //  public static async unpairDevice(req: AuthenticatedRequest, res: Response) {
  //    try {
  //      const { deviceId } = req.params;
  //      if (!deviceId) {
  //        return res.status(400).send({ message: 'deviceId is required' });
  //      }
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      await adapter.unpairDevices([deviceId]);
  //      res.status(200).send({ message: 'Device unpaired successfully' });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //
  //  public static async getHouseholdDevices(
  //    req: AuthenticatedRequest,
  //    res: Response,
  //  ) {
  //    try {
  //      const { householdId } = req.params;
  //      if (!(householdId in req.user!.households)) {
  //        return res
  //          .status(403)
  //          .send({ message: 'Unauthorized: Not part of this household' });
  //      }
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      const devices = await adapter.getDevicesByHousehold(householdId);
  //      if (!Array.isArray(devices) || devices.length === 0) {
  //        return res.status(400).send({ message: 'deviceIds are required' });
  //      }
  //
  //      res.status(200).send({ message: 'Household devices retrieved', devices });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //  /*public static async startAction(req: AuthenticatedRequest, res: Response) {
  //    try {
  //      const { deviceId, actionId, args } = req.body;
  //      if (!deviceId || !actionId || !args) {
  //        return res
  //          .status(400)
  //          .send({ message: 'deviceId, actionId, and args are required' });
  //      }
  //
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      const updatedDevice = await adapter.startAction(deviceId, actionId, args);
  //
  //      if (!updatedDevice) {
  //        return res.status(400).send({ message: 'Failed to start action' });
  //      }
  //
  //      res.status(200).send({
  //        message: 'Action started successfully',
  //        device: updatedDevice,
  //      });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }
  //
  //  public static async startActions(req: AuthenticatedRequest, res: Response) {
  //    try {
  //      const { actions } = req.body;
  //      if (!actions || Object.keys(actions).length === 0) {
  //        return res.status(400).send({ message: 'actions are required' });
  //      }
  //
  //      const adapter: BaseIotAdapter = new AcmeIoTAdapter();
  //      const updatedDevices = await adapter.startActions(actions);
  //
  //      if (!updatedDevices || updatedDevices.length === 0) {
  //        return res.status(400).send({ message: 'Failed to start actions' });
  //      }
  //
  //      res.status(200).send({
  //        message: 'Actions started successfully',
  //        devices: updatedDevices,
  //      });
  //    } catch (e) {
  //      console.error(e);
  //      res.status(500).send({ message: 'Internal Server Error' });
  //    }
  //  }*/
}
