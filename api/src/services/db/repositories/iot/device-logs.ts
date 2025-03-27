import { RedisClientType } from 'redis';
import { log } from '../../../../util/log';
import { DatabaseRepository } from '../../repo';
import { Db, MongoClient } from 'mongodb';

interface ApplianceLogDoc {
  timestamp: Date;
  deviceId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  field: string;
}

/** The MongoDB collection name for energy logs */
export const APPLIANCE_LOG_COLLECTION_NAME = 'iot-appliance-logs';

/**
 * Repository class for handling IoT energy log data
 * Manages storage and retrieval of energy consumption logs from IoT devices
 */
export class IoTApplianceLogsRepsoitory extends DatabaseRepository<ApplianceLogDoc> {
  /**
   * Configures the MongoDB collection for energy logs
   * Creates necessary indexes and sets up the timeseries collection if needed
   */
  public async configureCollection(): Promise<void> {
    try {
      const collections = await this.db
        .listCollections({ name: APPLIANCE_LOG_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(APPLIANCE_LOG_COLLECTION_NAME);
      }

      await this.collection.createIndex({ timestamp: 1 });

      await this.collection.createIndex({ deviceId: 1 });

      // create field index
      await this.collection.createIndex({ field: 1 });
      // create compound index for device and field
      await this.collection.createIndex({ deviceId: 1, field: 1 });
      // create compound index for device and field and timestamp
      await this.collection.createIndex({
        deviceId: 1,
        field: 1,
        timestamp: 1,
      });

      log.info('Indexes created for appliance logscollection.');
    } catch (error) {
      log.error('Error configuring appliance logs collection:', error);
      throw error;
    }
  }

  /**
   * Creates a new IoTEnergyLogsRepository instance
   * @param client - MongoDB client
   * @param db - MongoDB database
   * @param redis - Redis client for rate limiting
   */
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, APPLIANCE_LOG_COLLECTION_NAME, redis);
  }

  /**
   * Inserts an energy log if enough time has passed since the last insertion
   * Throttles insertions to once every 10 minutes per device/field pair
   * @param deviceId - The device identifier
   * @param field - The energy measurement field (e.g., 'voltage', 'current')
   * @param value - The energy measurement value
   * @param timestamp - The time of the measurement
   * @returns Promise resolving when the operation completes
   */
  public async insertLog(
    deviceId: string,
    field: string,
    value: number,
    timestamp: Date,
  ): Promise<void> {
    try {
      // Insert the document
      await this.collection.insertOne({
        deviceId,
        field,
        value,
        timestamp,
      });

      log.debug(
        `Appliance log inserted for ${deviceId}:${field} at ${timestamp.toISOString()}`,
      );
    } catch (error) {
      log.error('Error inserting energy log:', error);
      throw error;
    }
  }
}
