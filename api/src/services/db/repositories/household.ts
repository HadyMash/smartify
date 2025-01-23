import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient } from 'mongodb';
import { Household } from '../../../schemas/household';

type HouseholdDoc = Household;

export class HouseholdRepository extends DatabaseRepository<HouseholdDoc> {
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, 'households', redis);
  }

  // TODO: implement configure collection
  public async configureCollection(): Promise<void> {
    // create collection
    //
    // configure indices
    //
  }

  /**
   * Creates a new household.
   * @param ownerId - The ID of the user creating the household.
   * @param name - The name of the household.
   * @param coordinates - The coordinates of the household.
   * @returns The created household.
   */
  public async createHousehold(
    data: Omit<HouseholdDoc, '_id'>,
  ): Promise<HouseholdDoc> {
    // insert into db
    const result = await this.collection.insertOne(data);

    if (!result.acknowledged || !result.insertedId) {
      throw new Error('Failed to create household');
    }

    return {
      _id: result.insertedId,
      ...data,
    };
  }

  /**
   * Get a household by its ID
   * @param id - The household's ID
   */
  public async getHouseholdById(id: string): Promise<HouseholdDoc | null> {
    const result = await this.collection.findOne({ _id: id });
    if (!result) {
      return null;
    }
    return result;
  }
}
