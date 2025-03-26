import { DeviceSource } from '../schemas/devices';
import { AcmeIoTAdapter } from '../services/iot/acme-adapter';
import { BaseIotAdapter } from '../services/iot/base-adapter';
import { log } from './log';

/**
 * Get a device adapter based on the source
 * @param source - The source of the device
 * @returns The device adapter for the source
 */
export function getAdapter(source: DeviceSource): BaseIotAdapter {
  switch (source) {
    case 'acme':
      return new AcmeIoTAdapter();
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      log.error(`Unsupported device source: ${source}`);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported device source: ${source}`);
  }
}
