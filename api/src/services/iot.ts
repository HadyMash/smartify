import { z } from 'zod';
import {
  DeviceNotFoundError,
  deviceWithPartialStateSchema,
} from '../schemas/devices';
import { log } from '../util/log';
import { DatabaseService } from './db/db';

export class IotService {
  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }
  public async logDeviceChanges(
    deviceId: string,
    changes: Record<string, unknown>,
  ): Promise<void> {
    try {
      // get the device from the db
      await this.db.connect();
      const device =
        await this.db.deviceInfoRepository.getDeviceInfoById(deviceId);

      if (!device) {
        throw new DeviceNotFoundError(deviceId);
      }

      // map the partial state
      //log.debug('Mapping device with partial state:', device);

      const deviceWithPartialState = deviceWithPartialStateSchema.parse({
        ...device,
        id: device._id,
        state: changes,
      });

      //log.debug('Mapped device with partial state:', deviceWithPartialState);

      switch (device.accessType) {
        case 'appliances':
        case 'security': {
          for (const [field, value] of Object.entries(
            deviceWithPartialState?.state ?? {},
          )) {
            //if (deviceWithPartialState.capabilities[field as string]?.readonly ?? false) {
            if (
              deviceWithPartialState.capabilities.find((c) => c.id === field)
                ?.readonly ??
              false
            ) {
              log.debug('skip readonly field', field);
              continue;
            }

            log.debug(
              'logging appliance/security device changes:',
              deviceWithPartialState.id,
            );
            // update the device in the db
            await this.db.applianceLogsRepository.insertLog(
              device._id,
              field,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value as any,
              new Date(),
            );
          }
          break;
        }
        case 'health':
          break;
        case 'energy': {
          log.debug(
            'logging energy device changes:',
            deviceWithPartialState.id,
          );
          // update the device in the db
          // log every field that changed
          for (const [field, value] of Object.entries(
            deviceWithPartialState?.state ?? {},
          )) {
            if (typeof value !== 'number') {
              log.debug('skip non-number value', value);
              continue;
            }
            await this.db.energyLogsRepository.insertLog(
              device._id,
              field,
              value,
              new Date(),
            );
          }
          break;
        }
        default: {
          log.error('Unknown device access type:', device.accessType);
          break;
        }
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        log.error('zod error:', e.errors);
      }
      throw e;
    }
  }
}
