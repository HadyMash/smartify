import { Config, DataError, JsonDB } from 'node-json-db';
import { Device, DeviceNoId } from '../schemas/device';
import { randomUUID } from 'crypto';

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

  public async createDevice(
    deviceInfo: DeviceNoId,
  ): Promise<Device | undefined> {
    try {
      const id = randomUUID();

      await this.db.push(`${DBService.DEVICE_DB_PATH}/${id}`, deviceInfo);

      return await this.getDevice(id);
    } catch (e) {
      return;
    }
  }

  public async getDevice(id: string): Promise<Device | undefined> {
    try {
      const device: DeviceNoId = await this.db.getObject<DeviceNoId>(
        `${DBService.DEVICE_DB_PATH}/${id}`,
      );
      return { id, ...device };
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
        [key: string]: DeviceNoId;
      }>(DBService.DEVICE_DB_PATH);

      return Object.entries(data).map(([id, device]) => {
        (device as any).id = id;
        return device as Device;
      });
    } catch (e) {
      if (!(e instanceof DataError)) {
        throw e;
      }

      return;
    }
  }
}
