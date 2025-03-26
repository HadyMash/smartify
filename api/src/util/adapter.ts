import { DeviceSource } from '../schemas/devices';
import { AcmeIoTAdapter } from '../services/iot/acme-adapter';
import { BaseIotAdapter } from '../services/iot/base-adapter';

/**
 * Get a device adapter based on the source
 * @param source - The source of the device
 * @returns The device adapter for the source
 */
export function getAdapter(source: DeviceSource): BaseIotAdapter {
  switch (source) {
    case 'acme':
      return new AcmeIoTAdapter();
  }
}
