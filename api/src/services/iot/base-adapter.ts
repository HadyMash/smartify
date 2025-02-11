import { Device, DeviceWithState } from '../../schemas/devices';

export interface HealthCheck {
  healthCheck(): Promise<boolean>;
}

export abstract class BaseIotAdapter {
  /**
   * Checks if the adapter implements the HealthCheck interface
   * @param adapter - The adapter to check
   * @returns Whether the adapter implements the HealthCheck interface
   */
  public static isHealthCheck(
    adapter: BaseIotAdapter,
  ): adapter is BaseIotAdapter & HealthCheck {
    return 'healthCheck' in adapter;
  }

  /**
   * Checks if this adapter implements the HealthCheck interface
   * @returns Whether the adapter implements the HealthCheck interface
   */
  public isHealthCheck(): this is BaseIotAdapter & HealthCheck {
    return BaseIotAdapter.isHealthCheck(this);
  }

  /**
   * Discover unpaired devices that are available for pairing.
   * This method scans the network or queries the IoT platform for available devices that haven't been paired yet.
   *
   * @returns Promise containing an array of discovered devices if successful, undefined otherwise
   * @throws Error if the discovery request fails or if the response is not as expected
   */
  public abstract discoverDevices(): Promise<Device[] | undefined>;

  /**
   * Pairs devices with our system. This is for adapters which require pairing
   * before devices can be used.
   *
   * @param devices - Array of Device objects to pair
   * @throws Error if the pairing request fails or if the response is not as expected
   */
  public abstract pairDevices(devices: Device[]): Promise<void>;

  /**
   * Pairs devices with our system using device IDs.
   *
   * @param deviceIds - Array of device IDs to pair
   * @throws Error if the pairing request fails or if the response is not as expected
   */
  public abstract pairDevices(deviceIds: string[]): Promise<void>;

  /**
   * Unpairs devices from our system. This removes the pairing relationship
   * between our system and the devices.
   *
   * @param devices - Array of Device objects to unpair
   * @throws Error if the unpairing request fails or if the response is not as expected
   */
  public abstract unpairDevices(devices: Device[]): Promise<void>;

  /**
   * Unpairs devices from our system using device IDs.
   *
   * @param deviceIds - Array of device IDs to unpair
   * @throws Error if the unpairing request fails or if the response is not as expected
   */
  public abstract unpairDevices(deviceIds: string[]): Promise<void>;

  /**
   * Gets a single device's state and information.
   *
   * @param deviceId - The device's unique identifier
   * @returns Promise containing the device with its current state or undefined if not found
   * @throws Error if the request fails or if the response is not as expected
   */
  public abstract getDevice(
    deviceId: string,
  ): Promise<DeviceWithState | undefined>;

  /**
   * Gets the current state and information for multiple devices.
   *
   * @param deviceIds - Array of device IDs to query
   * @returns Promise containing an array of devices with their current states or undefined
   * @throws Error if the request fails or if the response is not as expected
   */
  public abstract getDevices(
    deviceIds: string[],
  ): Promise<DeviceWithState[] | undefined>;

  /**
   * Changes a device's state.
   *
   * This method doesn't validate the state before sending the request.
   *
   * @param deviceId - The device's unique identifier
   * @returns A promise which may return the devices state if supported by the adapter and is otherwise undefined
   * @throws Error if the request fails or if the response is not as expected
   */
  public abstract setDeviceState(
    deviceId: string,
    state: Record<string, unknown>,
  ): Promise<DeviceWithState | undefined>;

  /**
   * Changes the state of multiple devices.
   *
   * This method doesn't validate the states of the devices before sending the request.
   *
   * @param deviceStates - A dictionary of device IDs to their new states
   * @returns A promise which may return the devices states if supported by the adapter and is otherwise undefined
   * @throws Error if the request fails or if the response is not as expected
   */
  public abstract setDeviceStates(
    deviceStates: Record<string, Record<string, unknown>>,
  ): Promise<DeviceWithState[] | undefined>;
}
