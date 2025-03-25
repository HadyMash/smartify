/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import axios from 'axios';
import {
  BadRequestToDeviceError,
  Device,
  DeviceCapability,
  deviceCapabilitySchema,
  DeviceNotFoundError,
  DeviceOfflineError,
  deviceSchema,
  deviceSourceSchema,
  DeviceWithPartialState,
  deviceWithPartialStateSchema,
  DeviceWithState,
  deviceWithStateSchema,
  ExternalServerError,
  InvalidAPIKeyError,
  MissingAPIKeyError,
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
      // Set default timeout to avoid hanging connections
      timeout: 10000,
    });
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Use the configured axiosInstance with the API key instead of plain axios
      const response = await this.axiosInstance.get(`/health`);
      console.log('Health check response:', response.status);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  public mapCapability(capability: any): DeviceCapability | undefined {
    if (!capability?.type) {
      console.error('Invalid capability type');
      return undefined;
    }

    try {
      // Handle capability types based on the schema from the simulation
      switch (capability.type.toUpperCase()) {
        case 'POWER': {
          const mc: DeviceCapability = {
            id: capability.name || 'on', // Use provided name or default to 'on'
            type: 'switch',
            name: capability.name || 'power',
            readonly: capability.isReadOnly || false,
          };
          return deviceCapabilitySchema.parse(mc);
        }
        case 'RANGE': {
          const mc: DeviceCapability = {
            id: capability.name,
            type: 'range',
            min: capability.minValue || 0,
            max: capability.maxValue || 100,
            unit: capability.unit,
            readonly: capability.isReadOnly || false,
          };
          return deviceCapabilitySchema.parse(mc);
        }
        case 'RGB_COLOR': {
          const mc: DeviceCapability = {
            id: capability.name || 'rgb',
            type: 'multirange',
            min: capability.minValue || 0,
            max: capability.maxValue || 255,
            step: 1,
            length: 3, // RGB requires exactly 3 values
            name: capability.name || 'Color',
            readonly: capability.isReadOnly || false,
          };
          return deviceCapabilitySchema.parse(mc);
        }
        case 'LIMITED_COLOR': {
          const mc: DeviceCapability = {
            id: capability.name || 'color',
            name: 'color',
            type: 'mode',
            modes: capability.availableColors,
            readonly: capability.isReadOnly || false,
          };
          return deviceCapabilitySchema.parse(mc);
        }
        // TODO: change to range if both min and max are defined
        case 'ENERGY': {
          const mc: DeviceCapability = {
            id: capability.name,
            name: capability.name,
            type: 'number',
            bound:
              capability.minValue !== undefined
                ? { type: 'min', value: capability.minValue }
                : capability.maxValue !== undefined
                  ? { type: 'max', value: capability.maxValue }
                  : undefined,
            unit: capability.unit,
            readonly: capability.isReadOnly || false,
          };
          return deviceCapabilitySchema.parse(mc);
        }
        default:
          console.error(`Unsupported capability type: ${capability.type}`);
          return undefined;
      }
    } catch (error) {
      console.error('Error mapping capability:', error);
      return undefined;
    }
  }

  /**
   * Maps an array of external capabilities to our internal format
   *
   * @param capabilities - The array of capabilities from the external API
   * @returns An array of mapped capabilities
   */
  private mapCapabilities(capabilities: any[]): DeviceCapability[] {
    if (!Array.isArray(capabilities)) {
      console.warn('Capabilities is not an array, returning empty array');
      return [];
    }

    // Bind this context to ensure correct access to this.mapCapability
    // Filter out undefined/null values and properly type the result
    return capabilities
      .map((c) => this.mapCapability.bind(this)(c))
      .filter(
        (cap): cap is DeviceCapability => cap !== undefined && cap !== null,
      );
  }

  public mapDevice(device: any): Device | undefined {
    try {
      if (!device?.id) {
        console.error('Device mapping failed: missing ID');
        throw new Error('Device mapping failed: missing ID');
      }

      if (!device.capabilities || !Array.isArray(device.capabilities)) {
        // Try to get capabilities from the device type if capabilities not provided
        // This uses the deviceCapabilityMap from the simulation schema
        console.warn(
          `Device ${device.id} has no capabilities, attempting to infer from type`,
        );
        if (!device.type) {
          throw new Error(
            'Device mapping failed: no capabilities and no device type',
          );
        }

        // We'll let the validation handle the case where there are no capabilities
      }

      // Map device capabilities, binding the mapCapability method to this instance
      const mappedCapabilities: DeviceCapability[] = (device.capabilities || [])
        .map((c: any) => this.mapCapability.bind(this)(c))
        .filter(
          (cap: DeviceCapability | undefined): cap is DeviceCapability =>
            cap !== undefined && cap !== null,
        );

      if (mappedCapabilities.length === 0) {
        console.warn(`No valid capabilities mapped for device ${device.id}`);
        return;
      }

      const d: Device = {
        id: device.id,
        capabilities: mappedCapabilities as any,
        source: deviceSourceSchema.enum.acme,
      };

      return deviceSchema.parse(d);
    } catch (error) {
      console.warn('Failed to map device:', error);
      throw error;
    }
  }

  public mapDeviceWithState(device: any): DeviceWithState | undefined {
    try {
      if (!device?.id) {
        console.error('Device with state mapping failed: missing ID');
        return undefined;
      }

      // Map the capabilities - ensure we properly type and filter null/undefined values
      const mappedCapabilities: DeviceCapability[] = (device.capabilities || [])
        .map((c: any) => this.mapCapability.bind(this)(c))
        .filter(
          (cap: DeviceCapability | undefined | null): cap is DeviceCapability =>
            cap !== undefined && cap !== null,
        );

      if (mappedCapabilities.length === 0) {
        console.warn(`No valid capabilities mapped for device ${device.id}`);
        return;
      }

      // Map the state based on the capabilities
      const mappedState = this.mapState(device, mappedCapabilities);

      const mappedDevice: DeviceWithState = {
        id: device.id,
        source,
        capabilities: mappedCapabilities as any,
        state: mappedState,
      };

      // Validate against schema and return
      return deviceWithStateSchema.parse(mappedDevice);
    } catch (error) {
      console.error('Error mapping device with state:', error);
      return undefined;
    }
  }

  public mapDeviceWithPartialState(
    device: any,
  ): DeviceWithPartialState | undefined {
    try {
      if (!device?.id) {
        console.error('Device with partial state mapping failed: missing ID');
        return undefined;
      }

      // Map the capabilities - ensure we properly type and filter null/undefined values
      const mappedCapabilities: DeviceCapability[] = (device.capabilities || [])
        .map((c: any) => this.mapCapability.bind(this)(c))
        .filter(
          (cap: DeviceCapability | undefined | null): cap is DeviceCapability =>
            cap !== undefined && cap !== null,
        );

      if (mappedCapabilities.length === 0) {
        console.error(`No valid capabilities mapped for device ${device.id}`);
        return;
      }

      // Map the state based on the capabilities
      const mappedState = this.mapState(device, mappedCapabilities);

      const mappedDevice: DeviceWithPartialState = {
        id: device.id,
        source,
        capabilities: mappedCapabilities as any,
        state: mappedState,
      };

      // Validate against schema and return
      return deviceWithPartialStateSchema.parse(mappedDevice);
    } catch (error) {
      console.error('Error mapping device with partial state:', error);
      return undefined;
    }
  }

  /**
   * Maps the device state from external device representation to our internal state format
   *
   * @param device - The device data from the external API
   * @param capabilities - The already mapped device capabilities
   * @returns The device's mapped state
   */
  private mapState(device: any, capabilities: DeviceCapability[]) {
    const state: State = {};

    for (const capability of capabilities) {
      if (!capability) continue;

      // Map state values based on capability ID
      // This is more resilient as it will use the mapped IDs from our capabilities
      if (device[capability.id] !== undefined) {
        // Direct mapping when property names match
        state[capability.id] = device[capability.id];
      } else if (capability.name && device[capability.name] !== undefined) {
        // Try using the capability name as fallback
        state[capability.id] = device[capability.name];
      } else {
        // Special case mappings based on known device types and capability types
        switch (device.type) {
          case 'BULB_RGB_BRIGHTNESS':
            if (capability.id === 'color' && device.rgb) {
              state[capability.id] = device.rgb;
            }
            break;
          case 'CURTAIN':
            if (capability.id === 'position') {
              state[capability.id] = device.position;
            }
            break;
          case 'AC':
            if (capability.id === 'temperature') {
              state[capability.id] =
                device.targetTemperature || device.currentTemperature;
            }
            break;
          case 'THERMOMETER':
            if (capability.id === 'temperature') {
              state[capability.id] = device.temperature;
            }
            break;
          case 'HUMIDITY_SENSOR':
            if (capability.id === 'humidity') {
              state[capability.id] = device.humidity;
            }
            break;
        }
      }
    }

    return state;
  }

  public async discoverDevices(): Promise<Device[] | undefined> {
    // Call the external API to discover devices
    console.log('DISCOVER API KEY:', this.apiKey);

    try {
      const response = await this.axiosInstance.get('/discover');
      if (response.status !== 200) {
        switch (response.status) {
          case 500:
            throw new ExternalServerError(
              `500 Response when discovering devices`,
            );
          case 401:
            throw new MissingAPIKeyError(this.apiKey);
          case 403:
            throw new InvalidAPIKeyError(this.apiKey);
          default:
            throw new Error(
              `Failed to get device. response status: ${response.status}. Error: ${response?.data?.error}`,
            );
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data
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
        .filter((d: Device | undefined) => d !== undefined);
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
      const response = await this.axiosInstance.post(`/pair/${deviceId}`);

      if (response.status !== 201) {
        switch (response.status) {
          case 503:
            throw new DeviceOfflineError(deviceId);
          case 404:
            throw new DeviceNotFoundError(deviceId);
          case 500:
            throw new ExternalServerError(
              `500 Response when pairing device ${deviceId}`,
            );
          case 401:
            throw new MissingAPIKeyError(this.apiKey);
          case 403:
            throw new InvalidAPIKeyError(this.apiKey);
          case 400:
            throw new BadRequestToDeviceError(deviceId, 'getting device');
          default:
            throw new Error(
              `Failed to get device. response status: ${response.status}. Error: ${response?.data?.error}`,
            );
        }
      }
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
      const response = await this.axiosInstance.delete(`/pair/${deviceId}`);

      if (response.status !== 204) {
        switch (response.status) {
          case 503:
            throw new DeviceOfflineError(deviceId);
          case 404:
            throw new DeviceNotFoundError(deviceId);
          case 500:
            throw new ExternalServerError(
              `500 Response when unpairing device ${deviceId}`,
            );
          case 401:
            throw new MissingAPIKeyError(this.apiKey);
          case 403:
            throw new InvalidAPIKeyError(this.apiKey);
          case 400:
            throw new BadRequestToDeviceError(deviceId, 'getting device');
          default:
            throw new Error(
              `Failed to get device. response status: ${response.status}. Error: ${response?.data?.error}`,
            );
        }
      }
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
        switch (response.status) {
          case 503:
            throw new DeviceOfflineError(deviceId);
          case 404:
            throw new DeviceNotFoundError(deviceId);
          case 500:
            throw new ExternalServerError(
              `500 Response when getting device ${deviceId}`,
            );
          case 401:
            throw new MissingAPIKeyError(this.apiKey);
          case 403:
            throw new InvalidAPIKeyError(this.apiKey);
          case 400:
            throw new BadRequestToDeviceError(deviceId, 'getting device');
          default:
            throw new Error(
              `Failed to get device. response status: ${response.status}`,
            );
        }
      }

      const device = response.data;

      console.log('response data:', device);

      // Map and filter capabilities
      const mappedCapabilities: DeviceCapability[] = device.capabilities
        .map((c: any) => this.mapCapability(c))
        .filter(
          (cap: DeviceCapability | undefined | null): cap is DeviceCapability =>
            cap !== undefined && cap !== null,
        );

      if (mappedCapabilities.length === 0) {
        console.error(`No valid capabilities mapped for device ${device.id}`);
        return;
      }

      const mappedState = this.mapState(device, mappedCapabilities);

      const mappedDevice: DeviceWithState = {
        id: device.id,
        source,
        capabilities: mappedCapabilities as any,
        state: mappedState,
      };

      // validate and return
      return deviceWithStateSchema.parse(mappedDevice);
    } catch (e) {
      // TODO: Handle errors
      if (axios.isAxiosError(e)) {
        console.error(e.message);
        return;
      } else {
        console.log('non axios error:', e);
        throw e;
      }
    }
  }

  public async getDevices(
    deviceIds: string[],
  ): Promise<DeviceWithState[] | undefined> {
    try {
      const response = await this.axiosInstance.get(`/devices`);
      if (response.status !== 200) {
        switch (response.status) {
          case 503:
            throw new DeviceOfflineError(deviceIds.join(', '));
          case 404:
            throw new DeviceNotFoundError(deviceIds.join(', '));
          case 500:
            throw new ExternalServerError(
              `500 Response when getting devices ${deviceIds.join(', ')}`,
            );
          case 401:
            throw new MissingAPIKeyError(this.apiKey);
          case 403:
            throw new InvalidAPIKeyError(this.apiKey);
          case 400:
            throw new BadRequestToDeviceError(
              deviceIds.join(', '),
              'getting device',
            );
          default:
            throw new Error(
              `Failed to get device. response status: ${response.status}`,
            );
        }
      }

      const devices = response.data;

      const mappedDevices: DeviceWithState[] = devices
        .filter((d: any) => deviceIds.includes(d.id as string))
        .map((device: any) => {
          // Map and filter capabilities
          const mappedCapabilities: DeviceCapability[] = device.capabilities
            .map((c: any) => this.mapCapability(c))
            .filter(
              (
                cap: DeviceCapability | undefined | null,
              ): cap is DeviceCapability => cap !== undefined && cap !== null,
            );

          if (mappedCapabilities.length === 0) {
            console.error(
              `No valid capabilities mapped for device ${device.id}`,
            );
            return;
          }

          const mappedState = this.mapState(device, mappedCapabilities);

          const mappedDevice: DeviceWithState = {
            id: device.id,
            source,
            capabilities: mappedCapabilities as any,
            state: mappedState,
          };

          // validate and return
          return deviceWithStateSchema.parse(mappedDevice);
        })
        .filter((d: DeviceWithState | undefined) => d !== undefined);

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
      // Get current device state to check readonly fields
      const device = await this.getDevice(deviceId);
      if (!device) {
        console.log('device not found throwing error');
        throw new Error('Device not found');
      }

      // Check if any of the state updates are for readonly capabilities
      const readonlyAttempt = device.capabilities.some(
        (cap) => cap.readonly && state[cap.id] !== undefined,
      );

      if (readonlyAttempt) {
        throw new Error('Cannot modify readonly capabilities');
      }

      const response = await this.axiosInstance.patch(
        `/devices/${deviceId}/state`,
        state,
      );

      if (response.status !== 200) {
        switch (response.status) {
          case 503:
            throw new DeviceOfflineError(deviceId);
          case 404:
            throw new DeviceNotFoundError(deviceId);
          case 500:
            throw new ExternalServerError(
              `500 Response when setting device ${deviceId}`,
            );
          case 401:
            throw new MissingAPIKeyError(this.apiKey);
          case 403:
            throw new InvalidAPIKeyError(this.apiKey);
          case 400:
            throw new BadRequestToDeviceError(deviceId, 'getting device');
          default:
            throw new Error(
              `Failed to get device. response status: ${response.status}. Error: ${response?.data?.error}`,
            );
        }
      }
      return;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.message);
        if (e.response?.status === 401) {
          throw new MissingAPIKeyError(this.apiKey);
        } else if (e.response?.status === 403) {
          throw new InvalidAPIKeyError(this.apiKey);
        }
        throw e;
      } else {
        console.log('non axios error:', e);
        throw e;
      }
    }
  }

  public async setDeviceStates(
    deviceStates: Record<string, Record<string, unknown>>,
  ): Promise<DeviceWithState[] | undefined> {
    try {
      // Get all devices first to validate readonly states
      const deviceIds = Object.keys(deviceStates);
      const devices = await this.getDevices(deviceIds);

      if (!devices) {
        throw new Error('Failed to fetch devices');
      }

      // Create a map for quick lookup
      const deviceMap = new Map(devices.map((d) => [d.id, d]));

      const validUpdates = Object.entries(deviceStates).filter(([id]) =>
        deviceMap.has(id),
      );

      // Skip updates for non-existing devices
      if (validUpdates.length === 0) {
        console.warn('No valid devices to update.');
        return;
      }

      // Check for readonly violations first
      for (const [id, state] of validUpdates) {
        const device = deviceMap.get(id)!;

        const readonlyAttempt = device.capabilities.some(
          (cap) => cap.readonly && state[cap.id] !== undefined,
        );

        if (readonlyAttempt) {
          throw new Error(
            `Cannot modify readonly capabilities for device ${id}`,
          );
        }
      }

      // If all checks pass, update the states

      await Promise.all(
        validUpdates.map(([id, state]) => this.setDeviceState(id, state)),
      );
      return;
    } catch (e) {
      console.log('Failed to set device states:', e);
      throw e;
    }
  }

  /*public async startAction(
    deviceId: string,
    actionId: string,
    args: Record<string, unknown>,
  ): Promise<DeviceWithState | undefined> {
    try {
      const device = await this.getDevice(deviceId);
      if (!device) throw new Error('Device not found');

      const capability = device.capabilities.find((c) => c.id === actionId);
      if (!capability) throw new Error('Action not supported');

      if (capability.readonly) {
        throw new Error('Cannot modify readonly capabilities');
      }

      const response = await this.axiosInstance.post(
        `/devices/${deviceId}/actions/${actionId}`,
        { args },
      );

      if (response.status !== 200) {
        throw new Error('Failed to start action');
      }

      return this.getDevice(deviceId);
    } catch (error) {
      console.error('Error starting action:', error);
      return undefined;
    }
  }

  public async startActions(
    actions: Record<
      string,
      { actionId: string; args: Record<string, unknown> }
    >,
  ): Promise<DeviceWithState[] | undefined> {
    try {
      const results = await Promise.all(
        Object.entries(actions).map(([deviceId, { actionId, args }]) =>
          this.startAction(deviceId, actionId, args),
        ),
      );

      return results.filter(
        (result): result is DeviceWithState => result !== undefined,
      );
    } catch (error) {
      console.error('Error starting multiple actions:', error);
      return undefined;
    }
  }*/
}
