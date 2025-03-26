import { RedisClientType } from 'redis';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { DatabaseRepository } from '../repo';
import { ObjectIdOrString, objectIdSchema } from '../../../schemas/obj-id';
import { HouseholdDevice } from '../../../schemas/household';

/**
 * Document structure for device information stored in MongoDB
 * Extends HouseholdDevice but uses MongoDB's _id pattern and adds householdId reference
 */
interface DeviceInfoDoc extends Omit<HouseholdDevice, 'id'> {
  _id: string;
  householdId: ObjectId;
}

const DEVICE_INFO_COLLECTION_NAME = 'device-info';

/**
 * Repository class for managing device information in the database
 * Handles CRUD operations for household devices
 */
export class DeviceInfoRepository extends DatabaseRepository<DeviceInfoDoc> {
  /**
   * Creates a new DeviceInfoRepository instance
   * @param client - MongoDB client connection
   * @param db - MongoDB database instance
   * @param redis - Redis client for caching
   */
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, DEVICE_INFO_COLLECTION_NAME, redis);
  }

  /**
   * Initializes the device info collection and creates necessary indexes
   * Creates the collection if it doesn't exist and sets up indexes for efficient queries
   * @throws Error if collection configuration fails
   */
  public async configureCollection(): Promise<void> {
    try {
      const collections = await this.db
        .listCollections({ name: DEVICE_INFO_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(DEVICE_INFO_COLLECTION_NAME);
      }

      // create indexes
      await this.collection.createIndex({ householdId: 1 });
      await this.collection.createIndex({ householdId: 1, _id: 1 });
      await this.collection.createIndex({ roomId: 1 });
      await this.collection.createIndex({ householdId: 1, roomId: 1 });
    } catch (e) {
      console.error('Error configuring device info repo:', e);
      throw e;
    }
  }

  /**
   * Retrieves a single device by its ID
   * @param id - The unique identifier of the device
   * @returns The device information document or null if not found
   */
  public async getDeviceInfoById(id: string): Promise<DeviceInfoDoc | null> {
    return this.collection.findOne({ _id: id });
  }

  /**
   * Retrieves all devices belonging to a specific household
   * @param householdId - The ID of the household
   * @returns Array of device information documents
   */
  public async getHouseholdDevices(
    householdId: ObjectIdOrString,
  ): Promise<DeviceInfoDoc[]> {
    return this.collection
      .find({ householdId: objectIdSchema.parse(householdId) })
      .toArray();
  }

  /**
   * Retrieves all devices in a specific room of a household
   * @param householdId - The ID of the household
   * @param roomId - The ID of the room
   * @returns Array of device information documents in the specified room
   */
  public async getRoomDevices(
    householdId: ObjectIdOrString,
    roomId: string,
  ): Promise<DeviceInfoDoc[]> {
    return this.collection
      .find({ householdId: objectIdSchema.parse(householdId), roomId })
      .toArray();
  }

  /**
   * Adds multiple devices to a household
   * Transforms the device objects to match the database schema before insertion
   * @param householdId - The ID of the household to add devices to
   * @param devices - Array of household devices to add
   */
  public async addDevicesToHousehold(
    householdId: ObjectIdOrString,
    devices: HouseholdDevice[],
  ): Promise<void> {
    const docs = devices.map((device): DeviceInfoDoc => {
      const x = {
        ...device,
        householdId: objectIdSchema.parse(householdId),
        _id: device.id,
        id: undefined,
      };
      return x as DeviceInfoDoc;
    });
    await this.collection.insertMany(docs);
  }

  /**
   * Removes multiple devices from a household
   * Only removes devices that belong to the specified household
   * @param householdId - The ID of the household
   * @param deviceIds - Array of device IDs to remove
   */
  public async removeDevicesFromHousehold(
    householdId: ObjectIdOrString,
    deviceIds: string[],
  ): Promise<void> {
    await this.collection.deleteMany({
      _id: { $in: deviceIds },
      householdId: objectIdSchema.parse(householdId),
    });
  }

  /**
   * Updates the room assignment for a single device
   * @param deviceId - The ID of the device to update
   * @param roomId - The new room ID to assign to the device
   */
  public async updateDeviceRoom(
    deviceId: string,
    roomId: string,
  ): Promise<void> {
    await this.collection.updateOne({ _id: deviceId }, { $set: { roomId } });
  }

  /**
   * Updates the room assignment for multiple devices at once
   * Only updates devices that belong to the specified household
   * @param householdId - The ID of the household containing the devices
   * @param roomId - The new room ID to assign to the devices
   * @param deviceIds - Array of device IDs to update
   */
  public async updateDeviceRooms(
    householdId: ObjectIdOrString,
    roomId: string,
    deviceIds: string[],
  ): Promise<void> {
    await this.collection.updateMany(
      {
        _id: { $in: deviceIds },
        householdId: objectIdSchema.parse(householdId),
      },
      { $set: { roomId } },
    );
  }

  public async getDevicePairedHousehold(
    deviceId: string,
  ): Promise<ObjectId | null> {
    const device = await this.collection.findOne(
      { _id: deviceId },
      {
        projection: { householdId: 1 },
      },
    );
    if (!device) {
      return null;
    }
    return device.householdId;
  }

  /**
   * Gets the households that devices are paired to
   * Note: This method is redundant with getHouseholdsByDeviceIds and can be removed
   * @deprecated Use getHouseholdsByDeviceIds instead
   */
  public async getDevicesPairedHousehlds(
    deviceIds: string[],
  ): Promise<ObjectId[]> {
    return this.getHouseholdsByDeviceIds(deviceIds);
  }

  public async getHouseholdsByDeviceIds(
    deviceIds: string[],
  ): Promise<ObjectId[]> {
    const devices = await this.collection
      .find({ _id: { $in: deviceIds } }, { projection: { householdId: 1 } })
      .toArray();
    return devices.map((device) => device.householdId);
  }
}
