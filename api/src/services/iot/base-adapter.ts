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
   * Discover unpaired devices that are available for pairing. Returns a list of devices (possibly empty) if successful, and undefined otherwise.
   *
   * This may throw an error if the request fails or if the response is not as expected.
   *
   * @throws Error if the request fails or if the response is not as expected
   */
  public abstract discoverDevices(): Promise<Device[] | undefined>;

  /**
   * Pairs devices with our system. This is for adapters which require pairing
   * with our system before they an be used.
   * @param devices - The device to pair
   * @throws Error if the request fails or if the response is not as expected
   * @throws Error if the pairing fails
   */
  public abstract pairDevices(device: Device[]): Promise<void>;

  public abstract getDevice(): Promise<DeviceWithState | undefined>;

  /**
   * Gets a single device's state and information. This may be undefined if the device is not found.
   *
   * This may throw an error if the request fails or if the response is not as expected.
   *
   * @returns Promise containing the device with its state or undefined if not found
   * @throws Error if the request fails or if the response is not as expected
   */
  public abstract getDevice(): Promise<DeviceWithState | undefined>;

  /**
   * Gets all devices with their current state and information. Returns a list of devices (possibly empty) if successful, and undefined otherwise.
   *
   * This may throw an error if the request fails or if the response is not as expected.
   *
   * @returns Promise containing an array of devices with their states or undefined
   * @throws Error if the request fails or if the response is not as expected
   */
  public abstract getDevices(): Promise<DeviceWithState[] | undefined>;
}
