/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient, ObjectId } from 'mongodb';
import {
  Household,
  HouseholdMember,
  HouseholdRoom,
  Invite,
} from '../../../schemas/household';

type HouseholdDoc = Household;

export class HouseholdRepository extends DatabaseRepository<Household> {
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
  public async createHousehold(data: Household): Promise<Household> {
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
  public async getHouseholdById(
    id: ObjectId | string,
  ): Promise<Household | null> {
    const result = await this.collection.findOne({ _id: id });
    if (!result) {
      return null;
    }
    return result;
  }

  /**
   * Removes a member from a household.
   * @param householdId - The ID of the household.
   * @param memberId - The ID of the member to remove.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document.
   */

  public async removeMember(
    householdId: ObjectId | string,
    memberId: ObjectId | string,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      { $pull: { members: { id: new ObjectId(memberId) } } },
      { returnDocument: 'after' },
    );
  }
  /**
   * Deletes a household.
   * @param householdId - The ID of the household to delete.
   * @param ownerId - The ID of the household owner.
   */
  public async deleteHousehold(householdId: string): Promise<void> {
    await this.collection.deleteOne({ _id: householdId });
  }
  /**
   * Adds a room to a household.
   * @param householdId - The ID of the household.
   * @param roomData - The data of the room to add.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document.
   */
  public async addRoom(
    householdId: string,
    roomData: HouseholdRoom,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      { $push: { rooms: roomData } },
      { returnDocument: 'after' },
    );
  }
  /**
   * Changes the role of a household member.
   * @param householdId - The ID of the household.
   * @param memberId - The ID of the member.
   * @param newRole - The new role to assign.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document.
   */
  public async changeUserRole(
    householdId: ObjectId | string,
    memberId: ObjectId | string,
    newRole: HouseholdMember,
    ownerId: ObjectId | string,
    permissions?: {
      appliances: boolean;
      health: boolean;
      security: boolean;
      energy: boolean;
    },
  ): Promise<HouseholdDoc | null> {
    const updateQuery: any = {
      'members.$.role': newRole,
    };

    if (newRole.role === 'dweller') {
      if (!permissions) {
        throw new Error(
          'Permissions are required when assigning dweller role.',
        );
      }
      updateQuery['members.$.permissions'] = permissions;
    } else {
      updateQuery['members.$.permissions'] = undefined;
    }
    return this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(householdId),
        owner: ownerId,
        'members.id': new ObjectId(memberId),
        permissions: permissions,
      },
      { $set: { 'members.$.role': newRole } },
      { returnDocument: 'after' },
    );
  }
  /**
   * Manages rooms in a household by adding or removing them.
   * @param householdId - The ID of the household.
   * @param roomId - The ID of the room.
   * @param action - The action to perform ('add' or 'remove').
   * @returns The updated household document.
   */
  public async manageRooms(
    householdId: ObjectId | string,
    roomId: ObjectId | string,
    action: 'add' | 'remove',
  ): Promise<HouseholdDoc | null> {
    const update =
      action === 'add'
        ? { $push: { rooms: { _id: new ObjectId(roomId) } } }
        : { $pull: { rooms: { _id: new ObjectId(roomId) } } };

    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      update,
      { returnDocument: 'after' },
    );
  }

  /**
   * Removes a room from a household.
   * @param householdId - The ID of the household.
   * @param roomId - The ID of the room to remove.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document.
   */
  public async removeRoom(
    householdId: string,
    roomId: string,
  ): Promise<HouseholdDoc | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      { $pull: { rooms: { _id: new ObjectId(roomId) } } },
      { returnDocument: 'after' },
    );
  }
  //TODO: public async userPermissions(){}

  /**
   * Sends an invite to a user to join the household.
   * @param householdId - The ID of the household to invite the user to.
   * @param userId - The ID of the user to invite.
   * @param role - The role to assign to the user (default is 'dweller').
   * @param permissions - The permissions to assign to the user (default is false for all).
   * @returns The updated household document after the invite.
   */
  public async inviteMember(
    householdId: string,
    userId: string,
    role: HouseholdMember['role'] = 'dweller',
    permissions = {
      appliances: false,
      health: false,
      security: false,
      energy: false,
    },
  ): Promise<Household | null> {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      {
        $addToSet: {
          invites: {
            _id: new ObjectId(),
            userId: new ObjectId(userId),
            role,
            permissions,
          },
        },
      },
      { returnDocument: 'after' },
    );
  }
  /**
   * Fetches all pending invites for a user.
   * @param userId - The ID of the user to fetch invites for.
   * @returns A list of all invites for the user.
   */
  public async getUserInvites(userId: string): Promise<Invite[]> {
    const households = await this.collection
      .find(
        { 'invites.userId': new ObjectId(userId) },
        { projection: { invites: 1 } },
      )
      .toArray();

    return households.flatMap((h) => h.invites ?? []);
  }

  /**
   * Processes a user's response to an invite (accept or decline).
   * @param inviteId - The ID of the invite.
   * @param response - The user's response (true for accept, false for decline).
   * @param userId - The ID of the user responding to the invite.
   * @returns The updated household document after processing the response.
   */
  public async processInviteResponse(
    inviteId: string,
    response: boolean,
    userId: string,
  ): Promise<Household | null> {
    if (response) {
      return this.collection.findOneAndUpdate(
        {
          'invites._id': new ObjectId(inviteId),
          'invites.userId': new ObjectId(userId),
        },
        {
          $pull: { invites: { _id: new ObjectId(inviteId) } },
          $addToSet: {
            members: {
              id: new ObjectId(userId),
              role: 'dweller',
              permissions: {
                appliances: false,
                health: false,
                security: false,
                energy: false,
              },
            },
          },
        },
        { returnDocument: 'after' },
      );
    } else {
      return this.collection.findOneAndUpdate(
        {
          'invites._id': new ObjectId(inviteId),
          'invites.userId': new ObjectId(userId),
        },
        { $pull: { invites: { _id: new ObjectId(inviteId) } } },
        { returnDocument: 'after' },
      );
    }
  }
}
