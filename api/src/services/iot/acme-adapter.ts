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
  DeviceWithState,
  deviceWithStateSchema,
  State,
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

  private mapCapability(capability: any): DeviceCapability {
    if (!capability?.type) {
      throw new Error('Invalid capability type');
    }

    switch ((capability.type as string).toLowerCase()) {
      case 'power': {
        const mc: DeviceCapability = {
          id: 'on',
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
        const mc: DeviceCapability = {
          id: 'color',
          type: 'multirange',
          min: 0,
          max: 255,
          step: 1,
          length: 3, // RGB requires exactly 3 values
          name: 'RGB Color',
        };
        return deviceCapabilitySchema.parse(mc);
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

  /**
   * Maps the device state to the internal state
   * @param device - The device state from the external API
   * @param capabilities - The device capabilities
   * @returns The device's state
   */
  private mapState(device: any, capabilities: DeviceCapability[]) {
    const state: State = {};
    //Object.fromEntries(capabilities.map(capability => [capability.id, device[capability.id]]))
    for (const capability of capabilities) {
      state[capability.id] = device[capability.id];
    }
    return state;
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
        return;
      } else {
        console.log('non axios error:', e);
      }
    }
  }

  /**
   * Pairs the API Key with the device
   *
   * @param device - The device to pair
   * @throws Error if the pairing fails
   */
  private async pairDeviceById(deviceId: string): Promise<void> {
    // Call the external API to pair devices
    try {
      await this.axiosInstance.post(`/pair/${deviceId}`);
    } catch (e: unknown) {
      // TODO: Handle errors
      if (axios.isAxiosError(e)) {
        console.log(e.message);
        return;
      } else {
        console.log('non axios error:', e);
      }
    }
  }

  public async pairDevices(devicesOrIds: Device[] | string[]): Promise<void> {
    const ids =
      Array.isArray(devicesOrIds) &&
      devicesOrIds.length > 0 &&
      typeof devicesOrIds[0] === 'string'
        ? (devicesOrIds as string[])
        : (devicesOrIds as Device[]).map((d) => d.id);

    await Promise.all(ids.map((id) => this.pairDeviceById(id)));
  }

  private async unpairDeviceById(deviceId: string): Promise<void> {
    // Call the external API to unpair devices
    try {
      await this.axiosInstance.delete(`/pair/${deviceId}`);
    } catch (e: unknown) {
      // TODO: Handle errors
      if (axios.isAxiosError(e)) {
        console.log(e.message);
        return;
      } else {
        console.log('non axios error:', e);
      }
    }
  }

  public async unpairDevices(devicesOrIds: Device[] | string[]): Promise<void> {
    const ids =
      Array.isArray(devicesOrIds) &&
      devicesOrIds.length > 0 &&
      typeof devicesOrIds[0] === 'string'
        ? (devicesOrIds as string[])
        : (devicesOrIds as Device[]).map((d) => d.id);

    await Promise.all(ids.map((id) => this.unpairDeviceById(id)));
  }

  public async getDevice(
    deviceId: string,
  ): Promise<DeviceWithState | undefined> {
    try {
      const response = await this.axiosInstance.get(`/devices/${deviceId}`);
      if (response.status !== 200) {
        throw new Error('Failed to get device');
      }

      const device = response.data;

      const mappedCapabilites = device.capabilities.map((c: any) =>
        this.mapCapability(c),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const mappedState = this.mapState(device, mappedCapabilites);

      const mappedDevice: DeviceWithState = {
        id: device.id,
        source,
        capabilities: mappedCapabilites,
        state: mappedState,
      };

      // validate and return
      return deviceWithStateSchema.parse(mappedDevice);
    } catch (e) {
      // TODO: Handle errors
      if (axios.isAxiosError(e)) {
        console.log(e.message);
        return;
      } else {
        console.log('non axios error:', e);
      }
    }
  }

  public async getDevices(
    deviceIds: string[],
  ): Promise<DeviceWithState[] | undefined> {
    try {
      const response = await this.axiosInstance.get(`/devices`);
      if (response.status !== 200) {
        throw new Error('Failed to get device');
      }

      const devices = response.data;

      const mappedDevices = devices
        .filter((d: any) => deviceIds.includes(d.id as string))
        .map((device: any) => {
          const mappedCapabilites = device.capabilities.map((c: any) =>
            this.mapCapability(c),
          );

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const mappedState = this.mapState(device, mappedCapabilites);

          const mappedDevice: DeviceWithState = {
            id: device.id,
            source,
            capabilities: mappedCapabilites,
            state: mappedState,
          };

          // validate and return
          return deviceWithStateSchema.parse(mappedDevice);
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return mappedDevices;
    } catch (e) {
      // TODO: Handle errors
      if (axios.isAxiosError(e)) {
        console.log(e.message);
        return;
      } else {
        console.log('non axios error:', e);
      }
    }
  }

  public async setDeviceState(
    deviceId: string,
    state: Record<string, unknown>,
  ): Promise<DeviceWithState | undefined> {
    try {
      const response = await this.axiosInstance.patch(
        `/devices/${deviceId}/state`,
        state,
      );

      if (response.status !== 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new Error(response?.data?.error || 'Failed to set device state');
      }
      return;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.message);
        return;
      } else {
        console.log('non axios error:', e);
      }
    }
  }
  public async setDeviceStates(
    deviceStates: Record<string, Record<string, unknown>>,
  ): Promise<DeviceWithState[] | undefined> {
    await Promise.all(
      Object.entries(deviceStates).map(([id, state]) =>
        this.setDeviceState(id, state),
      ),
    );
    return;
  }
}
