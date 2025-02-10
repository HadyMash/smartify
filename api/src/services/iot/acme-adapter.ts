/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import axios from 'axios';
import {
  Device,
  DeviceCapability,
  deviceCapabilitySchema,
  deviceSourceSchema,
} from '../../schemas/devices';
import { BaseIotAdapter, HealthCheck } from './base-adapter';

const source = deviceSourceSchema.enum.acme;

export class AcmeIoTAdapter extends BaseIotAdapter implements HealthCheck {
  protected readonly apiUrl: string;
  protected readonly apiKey: string;
  protected readonly axiosInstance;

  constructor() {
    super();
    this.apiUrl = process.env.ACME_API_URL!;
    this.apiKey = process.env.ACME_API_KEY!;
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'x-api-key': this.apiKey,
      },
    });
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/health`);
      return response.status === 200;
    } catch (_) {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapCapability(capability: any): DeviceCapability {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!capability?.type) {
      throw new Error('Invalid capability type');
    }

    switch ((capability.type as string).toLowerCase()) {
      case 'power': {
        const mc: DeviceCapability = {
          id: 'power',
          type: 'switch',
          name: 'power',
        };
        // validate the capability and return
        return deviceCapabilitySchema.parse(mc);
      }
      case 'brightness': {
        const mc: DeviceCapability = {
          id: 'brightness',
          type: 'range',
          min: (capability.min as number) || 0,
          max: (capability.max as number) || 100,
          unit: '%',
        };
        return deviceCapabilitySchema.parse(mc);
      }
      case 'rgb_color': {
        console.log(capability.type);

        throw new Error('Unsupported capability type');
      }
      case 'limited_color': {
        const mc: DeviceCapability = {
          id: 'color',
          type: 'mode',
          modes: capability.availableColors,
        };
        return deviceCapabilitySchema.parse(mc);
      }
      default:
        throw new Error('Unsupported capability type');
    }
  }

  public async discoverDevices(): Promise<Device[] | undefined> {
    // Call the external API to discover devices

    try {
      const response = await this.axiosInstance.get('/discover');
      if (response.status !== 200) {
        throw new Error('Failed to discover devices');
      }

      //console.log(
      //  response.data
      //    // TEMP
      //    .filter((device: any) => device.type !== 'BULB_RGB_BRIGHTNESS')
      //    .map((device: any): Device | undefined => {
      //      try {
      //        const mc: Device = {
      //          id: device.id,
      //          capabilities: device.capabilities.map((c: any) =>
      //            this.mapCapability(c),
      //          ),
      //          source,
      //        };
      //        return mc;
      //      } catch (_e) {
      //        console.log(_e);
      //        return undefined;
      //      }
      //    }),
      //);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (
        response.data
          // TEMP
          .filter((device: any) => device.type !== 'BULB_RGB_BRIGHTNESS')

          .map((device: any): Device | undefined => {
            try {
              const mc: Device = {
                id: device.id,
                capabilities: device.capabilities.map((c: any) =>
                  this.mapCapability(c),
                ),
                source,
              };
              return mc;
            } catch (_) {
              console.warn('Failed to map device:');
              return undefined;
            }
          })
          .filter((d: Device | undefined) => d !== undefined)
      );
    } catch (e: unknown) {
      // TODO: Handle errors
      if (axios.isAxiosError(e)) {
        console.log(e.message);
      }
    }
  }

  /**
   * Pairs the API Key with the device
   *
   * @param device - The device to pair
   * @throws Error if the pairing fails
   */
  private async pairDevice(device: Device): Promise<void> {
    // Call the external API to pair devices
    try {
      await this.axiosInstance.post(`/pair/${device.id}`);
    } catch (e: unknown) {
      // TODO: Handle errors
      if (axios.isAxiosError(e)) {
        console.log(e.message);
      }
      throw new Error('Failed to pair device');
    }
  }

  public async pairDevices(device: Device[]): Promise<void> {
    await Promise.all(device.map((d) => this.pairDevice(d)));
  }
}
