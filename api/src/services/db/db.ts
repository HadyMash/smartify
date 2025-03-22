import { Db, MongoClient } from 'mongodb';
import {
  AccessBlacklistRepository,
  MFABlacklistRepository,
  TokenRepository,
} from './repositories/token';
import { SRPSessionRepository, UserRepository } from './repositories/user';
import { createClient, RedisClientType } from 'redis';
import { HouseholdRepository } from './repositories/household';

const DB_NAME: string = 'smartify';

export class DatabaseService {
  protected static client: MongoClient;
  protected static db: Db;
  protected static redis: RedisClientType;
  private static connectionPromise: Promise<void> | null = null;

  // Repositories
  private _userRepository!: UserRepository;
  private _srpRepository!: SRPSessionRepository;
  private _tokenRepository!: TokenRepository;
  private _accessBlacklistRepository!: AccessBlacklistRepository;
  private _mfaBlacklistRepository!: MFABlacklistRepository;
  private _householdRepository!: HouseholdRepository;

  constructor() {
    //// Start connection process in constructor
    //this.connect().catch((err) => {
    //  console.error(
    //    'Failed to connect to databases during initialization:',
    //    err,
    //  );
    //  throw new Error('Failed to connect to databases during initialization');
    //});
  }

  /**
   * Connects to MongoDB and Redis, then initializes repositories.
   * Ensures only one connection attempt is made regardless of how many times it's called.
   */
  public async connect(): Promise<void> {
    // If we're already connecting or connected, return the existing promise
    if (DatabaseService.connectionPromise) {
      await DatabaseService.connectionPromise;

      // Make sure repositories are initialized even for duplicate calls
      if (!this._userRepository) {
        this.initializeRepositories();
      }
      return;
    }

    try {
      // Create a new connection promise
      DatabaseService.connectionPromise = this.establishConnections();

      // Wait for connections to be established
      await DatabaseService.connectionPromise;
    } catch (error) {
      // Reset connection promise on failure so a future call can try again
      DatabaseService.connectionPromise = null;
      throw error;
    }

    return;
  }

  /**
   * Establishes connections to MongoDB and Redis
   */
  private async establishConnections(): Promise<void> {
    // Connect to both databases but don't use Promise.all because we want
    // to know specifically which one failed if there's an error
    await this.connectToMongoDB();
    await this.connectToRedis();

    // Initialize repositories after successful connections
    this.initializeRepositories();
  }

  /**
   * Connects to MongoDB
   */
  private async connectToMongoDB(): Promise<void> {
    if (!DatabaseService.db) {
      const client = new MongoClient(process.env.MONGODB_URL!, {
        // TODO: configure pool settings
      });

      try {
        await client.connect();
        console.log('Connected to MongoDB');
        DatabaseService.client = client;
        DatabaseService.db = client.db(DB_NAME);
      } catch (err) {
        console.error('Error connecting to MongoDB', err);
        throw new Error('Error connecting to MongoDB');
      }
    }
  }

  /**
   * Connects to Redis
   */
  private async connectToRedis(): Promise<void> {
    if (!DatabaseService.redis) {
      // Define connection options with a reasonable socket timeout
      DatabaseService.redis = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            // Maximum number of retries
            if (retries > 3) {
              return new Error(
                'Redis connection failed after multiple attempts',
              );
            }
            // Exponential backoff with a maximum of 3 seconds
            return Math.min(retries * 1000, 3000);
          },
          connectTimeout: 5000, // 5 seconds timeout for initial connection
        },
      });

      // Create a promise that will reject if a connection error occurs
      const errorPromise = new Promise<void>((_, reject) => {
        const errorHandler = (err: Error) => {
          console.error('Redis connection error:', err);
          reject(new Error(`Failed to connect to Redis: ${err.message}`));
        };

        DatabaseService.redis.on('error', errorHandler);

        // Remove the error handler once connected successfully
        DatabaseService.redis.once('connect', () => {
          console.log('Connected to Redis');
          DatabaseService.redis.removeListener('error', errorHandler);
        });
      });

      DatabaseService.redis
        .on('end', () => {
          console.log('Disconnected from Redis');
        })
        .on('reconnecting', () => {
          console.log('Reconnecting to Redis');
        });

      try {
        // Race between connection attempt and connection error
        await Promise.race([DatabaseService.redis.connect(), errorPromise]);
        console.log('Redis client connected');
      } catch (err) {
        console.error('Error connecting to Redis client:', err);
        // Clean up the failed Redis client
        await DatabaseService.redis.disconnect().catch(() => {});
        // Reset Redis client in a type-safe way
        DatabaseService.redis = undefined as unknown as RedisClientType;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        throw new Error(`Error connecting to Redis: ${(err as any).message}`);
      }
    }
  }

  /**
   * Initializes all repository instances
   */
  private initializeRepositories(): void {
    // Initialize repositories
    if (!this._userRepository) {
      this._userRepository = new UserRepository(
        DatabaseService.client,
        DatabaseService.db,
        DatabaseService.redis,
      );
    }
    if (!this._srpRepository) {
      this._srpRepository = new SRPSessionRepository(
        DatabaseService.client,
        DatabaseService.db,
        DatabaseService.redis,
      );
    }

    if (!this._tokenRepository) {
      this._tokenRepository = new TokenRepository(
        DatabaseService.client,
        DatabaseService.db,
        DatabaseService.redis,
      );
    }
    if (!this._accessBlacklistRepository) {
      this._accessBlacklistRepository = new AccessBlacklistRepository(
        DatabaseService.client,
        DatabaseService.db,
        DatabaseService.redis,
      );
    }
    if (!this._mfaBlacklistRepository) {
      this._mfaBlacklistRepository = new MFABlacklistRepository(
        DatabaseService.client,
        DatabaseService.db,
        DatabaseService.redis,
      );
    }

    if (!this._householdRepository) {
      this._householdRepository = new HouseholdRepository(
        DatabaseService.client,
        DatabaseService.db,
        DatabaseService.redis,
      );
    }
  }

  get userRepository(): UserRepository {
    if (!this._userRepository) {
      throw new Error(
        'Database connection not established. Call connect() and await it before using repositories.',
      );
    }
    return this._userRepository;
  }

  get srpSessionRepository(): SRPSessionRepository {
    if (!this._srpRepository) {
      throw new Error(
        'Database connection not established. Call connect() and await it before using repositories.',
      );
    }
    return this._srpRepository;
  }

  get tokenRepository(): TokenRepository {
    if (!this._tokenRepository) {
      throw new Error(
        'Database connection not established. Call connect() and await it before using repositories.',
      );
    }
    return this._tokenRepository;
  }

  get accessBlacklistRepository(): AccessBlacklistRepository {
    if (!this._accessBlacklistRepository) {
      throw new Error(
        'Database connection not established. Call connect() and await it before using repositories.',
      );
    }
    return this._accessBlacklistRepository;
  }

  get mfaBlacklistRepository(): MFABlacklistRepository {
    if (!this._mfaBlacklistRepository) {
      throw new Error(
        'Database connection not established. Call connect() and await it before using repositories.',
      );
    }
    return this._mfaBlacklistRepository;
  }

  get householdRepository(): HouseholdRepository {
    if (!this._householdRepository) {
      throw new Error(
        'Database connection not established. Call connect() and await it before using repositories.',
      );
    }
    return this._householdRepository;
  }

  /** Configures all of the databases collections */
  public async configureCollections(): Promise<void> {
    // Ensure we're connected before configuring collections
    await this.connect();

    await Promise.all([
      this.userRepository.configureCollection(),
      this.srpSessionRepository.configureCollection(),
      this.tokenRepository.configureCollection(),
      this.accessBlacklistRepository.configureCollection(),
      this.mfaBlacklistRepository.configureCollection(),
      this.householdRepository.configureCollection(),
    ]);
  }
}
