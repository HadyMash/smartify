import { ClientSession, Db, MongoClient } from 'mongodb';
import {
  AccessBlacklistRepository,
  MFABlacklistRepository,
  TokenRepository,
} from './repositories/token';
import { SRPSessionRepository, UserRepository } from './repositories/user';
import { createClient, RedisClientType } from 'redis';
import { HouseholdRepository } from './repositories/household';
import { DeviceInfoRepository } from './repositories/device-info';
import { log } from '../../util/log';

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
  private _deviceInfoRepository!: DeviceInfoRepository;

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
        log.info('Connected to MongoDB');
        DatabaseService.client = client;
        DatabaseService.db = client.db(DB_NAME);
      } catch (err) {
        log.fatal('Error connecting to MongoDB', err);
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
          log.fatal('Redis connection error:', err);
          reject(new Error(`Failed to connect to Redis: ${err.message}`));
        };

        DatabaseService.redis.on('error', errorHandler);

        // Remove the error handler once connected successfully
        DatabaseService.redis.once('connect', () => {
          log.info('Connected to Redis');
          DatabaseService.redis.removeListener('error', errorHandler);
        });
      });

      DatabaseService.redis
        .on('end', () => {
          log.warn('Disconnected from Redis');
        })
        .on('reconnecting', () => {
          log.info('Reconnecting to Redis');
        });

      try {
        // Race between connection attempt and connection error
        await Promise.race([
          DatabaseService.redis.connect().catch((e) => {
            throw e;
          }),
          errorPromise,
        ]);
        log.info('Redis client connected');
      } catch (err) {
        log.error('Error connecting to Redis client:', err);
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

    if (!this._deviceInfoRepository) {
      this._deviceInfoRepository = new DeviceInfoRepository(
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

  get deviceInfoRepository(): DeviceInfoRepository {
    if (!this._deviceInfoRepository) {
      throw new Error(
        'Database connection not established. Call connect() and await it before using repositories.',
      );
    }
    return this._deviceInfoRepository;
  }

  /**
   * Starts a new MongoDB transaction session.
   * @returns The session object to be used with repository methods
   */
  public async startTransaction() {
    await this.connect();
    const session = DatabaseService.client.startSession();
    session.startTransaction();
    return session;
  }

  /**
   * Commits a transaction and ends the session.
   * @param session - The session to commit
   */
  public async commitTransaction(session: ClientSession) {
    try {
      await session.commitTransaction();
    } finally {
      await session.endSession();
    }
  }

  /**
   * Aborts a transaction and ends the session.
   * @param session - The session to abort
   */
  public async abortTransaction(session: ClientSession) {
    try {
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }

  /**
   * Executes a function within a transaction and handles session lifecycle.
   * This method creates a session, starts a transaction, executes the callback,
   * and then either commits or aborts the transaction based on success or failure.
   *
   * @param operation - Async function that accepts a session and performs DB operations
   * @param validator - Optional function that determines whether to commit (true) or abort (false) the transaction
   *                   even when no exceptions are thrown
   * @returns The result of the operation function
   * @throws Any error that occurs during the operation (after aborting the transaction)
   */
  public async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    validator?: (result: T, session: ClientSession) => Promise<boolean>,
  ): Promise<{ result: T; committed: boolean }> {
    await this.connect();
    const session = await this.startTransaction();

    try {
      const result = await operation(session);

      // If validator is provided, check whether to commit or abort
      if (validator) {
        const shouldCommit = await validator(result, session);
        if (shouldCommit) {
          await this.commitTransaction(session);
          return { result, committed: true };
        } else {
          await this.abortTransaction(session);
          return { result, committed: false };
        }
      } else {
        // No validator provided, commit as usual
        await this.commitTransaction(session);
        return { result, committed: true };
      }
    } catch (error) {
      await this.abortTransaction(session);
      throw error;
    }
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
      this.deviceInfoRepository.configureCollection(),
    ]);
  }
}
