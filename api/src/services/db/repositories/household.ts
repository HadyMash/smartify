import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import {
  Coordinates,
  Household,
  HouseholdMember,
  householdSchema,
} from '../../../schemas/household';
import { z } from 'zod';

interface HouseholdDoc extends Household {}

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
    data: Omit<Household, '_id'>,
  ): Promise<Household> {
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
}
