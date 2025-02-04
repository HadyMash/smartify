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
  CoffeeMachine,
  GarageDoor,
  SolarPanel,
} from '../schemas/device';
import { randomBytes, randomUUID } from 'crypto';
import { APIKey } from '../schemas/api-key';

export class DBService {
  private static _db: JsonDB;
  private readonly db: JsonDB;

  private static readonly DEVICE_DB_PATH = '/devices';
  private static readonly API_KEY_DB_PATH = '/apikeys';

  constructor() {
    if (!DBService._db) {
      const db = new JsonDB(
        // TODO: change human readable to false
        new Config('data/devices', true, true, '/'),
      );
      db.load();

      DBService._db = db;
    }

    this.db = DBService._db;
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
          case deviceTypeSchema.enum.COFFEE_MACHINE:
            return baseDevice as CoffeeMachine;
          case deviceTypeSchema.enum.GARAGE_DOOR:
            return baseDevice as GarageDoor;
          case deviceTypeSchema.enum.SOLAR_PANEL:
            return baseDevice as SolarPanel;
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

      const updatedState: Partial<Omit<T, 'id'>> & { id?: string } = {
        ...currentDevice,
        ...partialState,
      };

      delete updatedState.id; // Remove id before updating
      await this.db.push(`${DBService.DEVICE_DB_PATH}/${id}`, updatedState);
      return await this.getDevice<T>(id);
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }
      return;
    }
  }
}
