import { Document, MongoClient, Collection, Db } from 'mongodb';
import { RedisClientType } from 'redis';

export abstract class DatabaseRepository<T extends Document> {
  protected readonly client: MongoClient;
  protected readonly collection: Collection<T>;
  protected readonly redis: RedisClientType;

  constructor(
    client: MongoClient,
    db: Db,
    collectionName: string,
    redis: RedisClientType,
  ) {
    this.client = client;
    this.collection = db.collection<T>(collectionName);
    this.redis = redis;
  }

  public abstract configureCollection(): Promise<void>;
}
