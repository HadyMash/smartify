import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../db';
import { Collection, Db, ObjectId } from 'mongodb';
import { Coordinates, Household } from '../../../schemas/household';

interface HouseholdDoc extends Document {}

export class HouseholdRepository extends DatabaseRepository<HouseholdDoc> {
  constructor(db: Db, redis: RedisClientType) {
    super(db, 'households', redis);
  }

  // TODO: implement configure collection
  public async configureCollectiob(): Promise<void> {
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
    ownerId: ObjectId,
    name: string,
    coordinates?: Coordinates,
  ): Promise<Household> {
    // create household
  }
}
