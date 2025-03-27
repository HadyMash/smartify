import { RedisClientType } from 'redis';
import { log } from '../../../../util/log';
import { DatabaseRepository } from '../../repo';
import { Db, MongoClient } from 'mongodb';

interface IotEnergyLogDoc {
  timestamp: Date;
  deviceId: string;
  value: number;
  field: string;
}

/** The MongoDB collection name for energy logs */
export const ENERGY_LOG_COLLECTION_NAME = 'iot-energy-logs';

/** Time interval in minutes between allowed log insertions for the same device/field */
export const LOG_THROTTLE_MINUTES = 10;

/**
 * Repository class for handling IoT energy log data
 * Manages storage and retrieval of energy consumption logs from IoT devices
 */
export class IoTEnergyLogsRepository extends DatabaseRepository<IotEnergyLogDoc> {
  /**
   * Redis key prefix for tracking last log insertion timestamps
   * @private
   */
  private readonly REDIS_KEY_PREFIX = 'energy-log:last-insert:';

  /**
   * Configures the MongoDB collection for energy logs
   * Creates necessary indexes and sets up the timeseries collection if needed
   */
  public async configureCollection(): Promise<void> {
    try {
      const collections = await this.db
        .listCollections({ name: ENERGY_LOG_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(ENERGY_LOG_COLLECTION_NAME, {
          timeseries: {
            timeField: 'timestamp',
            metaField: 'minutes',
          },
        });
      }

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

      log.info('Indexes created for energy logs timeseries collection.');
    } catch (error) {
      log.error('Error configuring energy logs timeseries collection:', error);
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
    super(client, db, ENERGY_LOG_COLLECTION_NAME, redis);
  }

  /**
   * Generates a Redis key for tracking the last insertion time of a device/field pair
   * @param deviceId - The device identifier
   * @param field - The energy measurement field
   * @returns The Redis key string
   * @private
   */
  private getRedisKey(deviceId: string, field: string): string {
    return `${this.REDIS_KEY_PREFIX}${deviceId}:${field}`;
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
      const redisKey = this.getRedisKey(deviceId, field);

      // Check when this device/field was last updated
      const lastUpdateStr = await this.redis.get(redisKey);

      if (lastUpdateStr) {
        const lastUpdate = new Date(lastUpdateStr);
        const minutesSinceLastUpdate =
          (timestamp.getTime() - lastUpdate.getTime()) / (1000 * 60);

        // If it's been less than LOG_THROTTLE_MINUTES minutes, skip the insertion
        if (minutesSinceLastUpdate < LOG_THROTTLE_MINUTES) {
          log.debug(
            `Skipping energy log insertion for ${deviceId}:${field}, last update was ${minutesSinceLastUpdate.toFixed(2)} minutes ago`,
          );
          return;
        }
      }

      // Insert the document
      await this.collection.insertOne({
        deviceId,
        field,
        value,
        timestamp,
      });

      // Update the last insertion time in Redis with TTL of 10 minutes + 10 seconds (in seconds)
      const ttlSeconds = LOG_THROTTLE_MINUTES * 60 + 10;
      await this.redis.set(redisKey, timestamp.toISOString(), {
        EX: ttlSeconds,
      });

      log.debug(
        `Energy log inserted for ${deviceId}:${field} at ${timestamp.toISOString()} with TTL of ${ttlSeconds} seconds`,
      );
    } catch (error) {
      log.error('Error inserting energy log:', error);
      throw error;
    }
  }
}
