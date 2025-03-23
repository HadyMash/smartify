import { Config, DataError, JsonDB } from 'node-json-db';
import {
  Device,
  OnOffBulb,
  RGBBulb,
  LimitedColorBrightnessBulb,
  LimitedColorBulb,
  deviceTypeSchema,
  Curtain,
  AC,
  SolarPanel,
  Thermometer,
  HumiditySensor,
  PowerMeter,
  TempColorBulb,
} from '../schemas/device';
import { randomBytes, randomUUID } from 'crypto';
import { APIKey, apiKeySchema } from '../schemas/api-key';
import { DeviceCapability, deviceCapabilityMap } from '../schemas/capabilities';
import { WebhookService } from './webhook-service';

export class DBService {
  private static _dbInstances: Map<string, JsonDB> = new Map();
  private static _db: JsonDB;
  private readonly db: JsonDB;
  private readonly dbFileName: string;

  private static readonly DEVICE_DB_PATH = '/devices';
  private static readonly API_KEY_DB_PATH = '/apikeys';

  constructor(fileName?: string) {
    // Generate a unique instance name using randomUUID
    this.dbFileName = fileName || `data/sim_${randomUUID()}`;

    if (!DBService._dbInstances.has(this.dbFileName)) {
      const db = new JsonDB(new Config(this.dbFileName, true, true, '/'));
      db.load();
      DBService._dbInstances.set(this.dbFileName, db);
    }

    this.db = DBService._dbInstances.get(this.dbFileName)!;

  }

  public async createDevice<T extends Device>(
    deviceInfo: Omit<T, 'id'>,
  ): Promise<T | undefined> {
    try {
      const id = randomUUID();

      await this.db.push(`${DBService.DEVICE_DB_PATH}/${id}`, deviceInfo);

      return await this.getDevice<T>(id);
    } catch (e) {
      return;
    }
  }

  public async getDevice<T extends Device = Device>(
    id: string,
  ): Promise<T | undefined> {
    try {
      const device: Omit<Device, 'id'> = await this.db.getObject<
        Omit<Device, 'id'>
      >(`${DBService.DEVICE_DB_PATH}/${id}`);
      return { ...device, id } as T;
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }
      return;
    }
  }

  public async deleteDevice(id: string): Promise<boolean> {
    try {
      this.db.delete(`${DBService.DEVICE_DB_PATH}/${id}`);
      return true;
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }
      return false;
    }
  }

  public async getDevices(): Promise<Device[] | undefined> {
    try {
      const data = await this.db.getObject<{
        [key: string]: Omit<Device, 'id'>;
      }>(DBService.DEVICE_DB_PATH);

      return Object.entries(data).map(([id, device]) => {
        const baseDevice = {
          ...device,
          id,
        };

        switch (device.type) {
          case deviceTypeSchema.enum.BULB_ON_OFF:
            return baseDevice as OnOffBulb;
          case deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS:
            return baseDevice as RGBBulb;
          case deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS:
            return baseDevice as LimitedColorBrightnessBulb;
          case deviceTypeSchema.enum.BULB_LIMITED_COLOR:
            return baseDevice as LimitedColorBulb;
          case deviceTypeSchema.enum.CURTAIN:
            return baseDevice as Curtain;
          case deviceTypeSchema.enum.AC:
            return baseDevice as AC;
          //case deviceTypeSchema.enum.GARAGE_DOOR:
          //  return baseDevice as GarageDoor;
          case deviceTypeSchema.enum.SOLAR_PANEL:
            return baseDevice as SolarPanel;
          case deviceTypeSchema.enum.THERMOMETER:
            return baseDevice as Thermometer;
          case deviceTypeSchema.enum.HUMIDITY_SENSOR:
            return baseDevice as HumiditySensor;
          case deviceTypeSchema.enum.POWER_METER:
            return baseDevice as PowerMeter;
          case deviceTypeSchema.enum.BULB_TEMP_COLOR:
            return baseDevice as TempColorBulb;
          default:
            throw new Error('Invalid device type');
        }
      });
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }

      return;
    }
  }

  public async createApiKey(name: string): Promise<APIKey> {
    const key = randomBytes(32).toString('hex');
    const apiKey: APIKey = {
      key,
      name,
      createdAt: new Date(),
      isActive: true,
    };

    await this.db.push(`${DBService.API_KEY_DB_PATH}/${key}`, apiKey);
    return apiKey;
  }

  public async deleteApiKey(key: string): Promise<boolean> {
    try {
      await this.db.delete(`${DBService.API_KEY_DB_PATH}/${key}`);
      return true;
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }
      return false;
    }
  }

  public async getApiKey(key: string): Promise<APIKey | undefined> {
    try {
      return await this.db.getObject<APIKey>(
        `${DBService.API_KEY_DB_PATH}/${key}`,
      );
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }
      return undefined;
    }
  }

  public async getApiKeys(): Promise<APIKey[]> {
    try {
      const data = await this.db.getObject<{ [key: string]: APIKey }>(
        DBService.API_KEY_DB_PATH,
      );
      return Object.values(data);
    } catch (e) {
      if (e instanceof DataError) {
        return [];
      }
      throw e;
    }
  }

  public async updateApiKey(
    key: string,
    updates: Partial<APIKey>,
  ): Promise<APIKey | undefined> {
    try {
      const currentKey = await this.getApiKey(key);
      if (!currentKey) return undefined;

      const updatedKey = { ...currentKey, ...updates };

      // valdidate updated key
      apiKeySchema.parse(updatedKey);

      await this.db.push(`${DBService.API_KEY_DB_PATH}/${key}`, updatedKey);
      return updatedKey;
    } catch (e) {
      return undefined;
    }
  }

  public async getActiveApiKeys(): Promise<APIKey[]> {
    const keys = await this.getApiKeys();
    return keys.filter((key) => key.isActive);
  }

  public async pairDeviceWithApiKey(
    deviceId: string,
    apiKey: string,
  ): Promise<boolean> {
    try {
      const device = await this.getDevice(deviceId);
      const key = await this.getApiKey(apiKey);
      if (!device || !key) return false;

      const updatedPairedKeys = [...new Set([...device.pairedApiKeys, apiKey])];
      await this.db.push(
        `${DBService.DEVICE_DB_PATH}/${deviceId}/pairedApiKeys`,
        updatedPairedKeys,
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  public async unpairDeviceFromApiKey(
    deviceId: string,
    apiKey: string,
  ): Promise<boolean> {
    try {
      const device = await this.getDevice(deviceId);
      if (!device) return false;

      const updatedPairedKeys = device.pairedApiKeys.filter(
        (k) => k !== apiKey,
      );
      await this.db.push(
        `${DBService.DEVICE_DB_PATH}/${deviceId}/pairedApiKeys`,
        updatedPairedKeys,
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  public async updateDeviceState<T extends Device>(
    id: string,
    partialState: Partial<Omit<T, 'id'>>,
  ): Promise<T | undefined> {
    try {
      const currentDevice = await this.getDevice<T>(id);
      if (!currentDevice) return;

      // Create new state object without id
      const { id: _, ...stateWithoutId } = {
        ...currentDevice,
        ...partialState,
      };

      await this.db.push(`${DBService.DEVICE_DB_PATH}/${id}`, stateWithoutId);

      const updatedDevice = await this.getDevice<T>(id);
      if (updatedDevice) {
        // Notify webhooks for all paired API keys
        const webhookService = WebhookService.getInstance();
        for (const apiKeyId of currentDevice.pairedApiKeys) {
          const apiKey = await this.getApiKey(apiKeyId);
          if (apiKey?.webhookUrl) {
            await webhookService.notifyWebhook(
              apiKey,
              updatedDevice,
              currentDevice,
              partialState as Partial<Device>,
            );
          }
        }
      }

      return updatedDevice;
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }
      return;
    }
  }

  private getDeviceCapabilities(device: Device): DeviceCapability[] {
    // Import the deviceCapabilityMap and use it directly
    const { deviceCapabilityMap } = require('../schemas/capabilities');
    return deviceCapabilityMap[device.type];
  }

  public async getDevicesWithCapabilities(): Promise<
    Array<Device & { capabilities: DeviceCapability[] }>
  > {
    const devices = (await this.getDevices()) || [];
    return devices.map((device) => ({
      ...device,
      capabilities: this.getDeviceCapabilities(device),
    }));
  }

  public async getDeviceWithCapabilities(
    id: string,
  ): Promise<(Device & { capabilities: DeviceCapability[] }) | undefined> {
    const device = await this.getDevice(id);
    if (!device) return undefined;

    return {
      ...device,
      capabilities: this.getDeviceCapabilities(device),
    };
  }
}
