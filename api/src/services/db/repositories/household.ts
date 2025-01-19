import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../db';
import { Collection, Db } from 'mongodb';

interface HouseholdDoc {}

export class HouseholdRepository extends DatabaseRepository {
  protected readonly COLLECTION_NAME = 'households';
  protected readonly collection: Collection<HouseholdDoc>;

  constructor(db: Db, redis: RedisClientType) {
    super(redis);
    this.collection = db.collection<HouseholdDoc>(this.COLLECTION_NAME);
  }

  // TODO: implement configure collection
  public async configureCollectiob(): Promise<void> {
    // create collection
    //
    // configure indices
    //
  }
}
