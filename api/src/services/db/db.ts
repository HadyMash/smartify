import { Collection, Db, Document, MongoClient } from 'mongodb';
import { TokenRepository } from './repositories/token';
import { UserRepository } from './repositories/user';
import { createClient, RedisClientType } from 'redis';

const DB_NAME: string = 'smartify';

export class DatabaseService {
  private static db: Db;
  private static redis: RedisClientType;

  // Repositories
  private _userRepository: UserRepository;
  private _tokenRepository: TokenRepository;

  constructor() {
    if (!DatabaseService.db) {
      const client = new MongoClient(process.env.MONGODB_URL!, {
        // TODO: configure pool settings
      });
      client
        .connect()
        .then(() => {
          console.log('Connected to MongoDB');
        })
        .catch((err) => {
          console.error('Error connecting to MongoDB', err);
        });
      DatabaseService.db = client.db(DB_NAME);
    }
    if (!DatabaseService.redis) {
      DatabaseService.redis = createClient({
        url: process.env.REDIS_URL,
      });

      DatabaseService.redis
        .on('connect', () => {
          console.log('Connected to Redis');
        })
        .on('error', (err) => {
          console.error('Error connecting to Redis', err);
        })
        .on('end', () => {
          console.log('Disconnected from Redis');
        })
        .on('reconnecting', () => {
          console.log('Reconnecting to Redis');
        });

      DatabaseService.redis.connect();
    }

    // Initialize repositories
    this._userRepository = new UserRepository(
      DatabaseService.db,
      DatabaseService.redis,
    );
    this._tokenRepository = new TokenRepository(
      DatabaseService.db,
      DatabaseService.redis,
    );
  }

  get userRepository(): UserRepository {
    return this._userRepository;
  }

  get tokenRepository(): TokenRepository {
    return this._tokenRepository;
  }
}

export abstract class DatabaseRepository<T extends Document> {
  protected readonly collection: Collection<T>;
  protected readonly redis: RedisClientType;

  constructor(db: Db, collectionName: string, redis: RedisClientType) {
    this.collection = db.collection<T>(collectionName);
    this.redis = redis;
  }

  public abstract configureCollectiob(): Promise<void>;
}
