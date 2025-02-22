import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient, ObjectId } from 'mongodb';
import {
  Household,
  HouseholdMember,
  HouseholdRoom,
} from '../../../schemas/household';

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
  public async addMember(
    householdId: string,
    memberId: string,
    ownerId: string,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId), owner: ownerId },
      {
        $addToSet: {
          members: {
            id: new ObjectId(memberId),
            role: 'dweller',
          },
        },
      },
      { returnDocument: 'after' },
    );
  }

  public async removeMember(
    householdId: string,
    memberId: string,
    ownerId: string,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId), owner: ownerId },
      { $pull: { members: { id: new ObjectId(memberId) } } },
      { returnDocument: 'after' },
    );
  }

  public async deleteHousehold(
    householdId: string,
    ownerId: string,
  ): Promise<void> {
    await this.collection.deleteOne({ _id: householdId, owner: ownerId });
  }

  public async addRoom(
    householdId: string,
    roomData: HouseholdRoom,
    ownerId: string,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId), owner: ownerId },
      { $push: { rooms: roomData } },
      { returnDocument: 'after' },
    );
  }

  public async changeUserRole(
    householdId: string,
    memberId: string,
    newRole: HouseholdMember,
    ownerId: string,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(householdId),
        owner: ownerId,
        'members.id': new ObjectId(memberId),
      },
      { $set: { 'members.$.role': newRole } },
      { returnDocument: 'after' },
    );
  }
  public async manageRooms(
    householdId: string,
    roomId: string,
    action: string,
    ownerId: string,
  ): Promise<HouseholdDoc | null> {
    const update =
      action === 'add'
        ? { $push: { rooms: { _id: new ObjectId(roomId) } } }
        : { $pull: { rooms: { _id: new ObjectId(roomId) } } };

    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId), owner: ownerId },
      update,
      { returnDocument: 'after' },
    );
  }
  public async processInviteResponse(
    inviteId: string,
    response: boolean,
    userId: string,
  ): Promise<HouseholdDoc | null> {
    if (response === true) {
      return this.collection.findOneAndUpdate(
        { 'invites._id': new ObjectId(inviteId), 'invites.userId': userId },
        {
          $pull: { invites: { _id: new ObjectId(inviteId) } },
          $addToSet: {
            members: { _id: new ObjectId(userId), role: 'dweller' },
          },
        },
        { returnDocument: 'after' },
      );
    } else {
      return this.collection.findOneAndUpdate(
        { 'invites._id': new ObjectId(inviteId), 'invites.userId': userId },
        { $pull: { invites: { _id: new ObjectId(inviteId) } } },
        { returnDocument: 'after' },
      );
    }
  }
  public async removeRoom(
    householdId: string,
    roomId: string,
    ownerId: string,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId), owner: ownerId },
      { $pull: { rooms: { _id: new ObjectId(roomId) } } },
      { returnDocument: 'after' },
    );
  }
  //TODO: public async userPermissions(){}
}
