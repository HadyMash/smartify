import { Db, MongoClient } from 'mongodb';
import { DatabaseRepository } from '../repo';
import { RedisClientType } from 'redis';
import { log } from '../../../util/log';

interface DeviceIconsDoc {
  signature: string;
  hash: string;
  icon: string;
}

const DEVICE_ICONS_COLLECTION_NAME = 'device-icons';

/**
 * Repository class for managing device information in the database
 * Handles CRUD operations for household devices
 */
export class DeviceIconsRepositroy extends DatabaseRepository<DeviceIconsDoc> {
  /**
   * Creates a new DeviceInfoRepository instance
   * @param client - MongoDB client connection
   * @param db - MongoDB database instance
   * @param redis - Redis client for caching
   */
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, DEVICE_ICONS_COLLECTION_NAME, redis);
  }

  /**
   * Initializes the device info collection and creates necessary indexes
   * Creates the collection if it doesn't exist and sets up indexes for efficient queries
   * @throws Error if collection configuration fails
   */
  public async configureCollection(): Promise<void> {
    try {
      const collections = await this.db
        .listCollections({ name: DEVICE_ICONS_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(DEVICE_ICONS_COLLECTION_NAME);
      }

      await this.collection.createIndex({ hash: 1 });
    } catch (e) {
      log.fatal('Error configuring device info repo:', e);
      throw e;
    }
  }

  public async storeDeviceIcons(
    hash: string,
    signature: string,
    icon: string,
  ): Promise<void> {
    await this.collection.insertOne({ signature, hash, icon });
  }

  public async getDeviceIcon(
    hash: string,
    signature: string,
  ): Promise<string | null> {
    //const doc = await this.collection.findOne({ hash });
    const docs = await this.collection.find({ hash }).toArray();

    if (docs.length === 0) {
      return null;
    }
    // Verify the signature matches the stored signature
    const doc = docs.find((d) => d.signature === signature);
    return doc ? doc.icon : null;
  }
}
