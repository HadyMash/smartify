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
import {
  ObjectIdOrString,
  objectIdOrStringSchema,
} from '../../../schemas/obj-id';

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
    console.log('household:', result);
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
    const objectId =
      typeof id === 'string' ? objectIdOrStringSchema.parse(id) : id;
    console.log('Household ID:', objectId);
    return this.collection.findOne({ _id: objectId });
  }

  /**
   * Removes a member from a household.
   * @param householdId - The ID of the household.
   * @param memberId - The ID of the member to remove.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document.
   */

  public async removeMember(
    householdId: ObjectIdOrString,
    memberId: ObjectIdOrString,
  ): Promise<HouseholdDoc | null> {
    console.log('removing id:', memberId);

    const objectId =
      typeof householdId === 'string' ? new ObjectId(householdId) : householdId;
    const parsedMemberId =
      typeof memberId === 'string' ? memberId : memberId.toString();

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId },
      { $pull: { members: { id: parsedMemberId } } }, // Ensure `id` matches the format in DB
      { returnDocument: 'after' },
    );

    console.log('post removal:', result);
    return result;
  }

  /**
   * Deletes a household.
   * @param householdId - The ID of the household to delete.
   * @param ownerId - The ID of the household owner.
   */
  public async deleteHousehold(householdId: string): Promise<void> {
    await this.collection.deleteOne({
      _id: objectIdOrStringSchema.parse(householdId),
    });
    console.log('Household deleted');
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
    const result = this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      { $push: { rooms: roomData } },
      { returnDocument: 'after' },
    );
    console.log('household room update', result);
    return result;
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
    householdId: ObjectIdOrString,
    memberId: ObjectIdOrString,
    newRole: HouseholdMember,
    ownerId: ObjectIdOrString,
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
        _id: objectIdOrStringSchema.parse(householdId),
        owner: ownerId,
        'members.id': objectIdOrStringSchema.parse(memberId),
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
    householdId: ObjectIdOrString,
    room: HouseholdRoom,
    action: 'add' | 'edit' | 'remove',
  ): Promise<HouseholdDoc | null> {
    const update =
      action === 'add'
        ? {
            $push: {
              rooms: {
                _id: objectIdOrStringSchema.parse(room._id),
                type: room.type,
                name: room.name,
                floor: room.floor,
              },
            },
          }
        : { $pull: { rooms: { _id: objectIdOrStringSchema.parse(room._id) } } };

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
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      { $pull: { rooms: { _id: objectIdOrStringSchema.parse(roomId) } } },
      { returnDocument: 'after' },
    );
    console.log('household update removed room:', result);
    return result;
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
      {
        _id: objectIdOrStringSchema.parse(householdId),
        'members.id': { $ne: objectIdOrStringSchema.parse(userId) },
        'invites.userId': { $ne: objectIdOrStringSchema.parse(userId) },
      },
      {
        $addToSet: {
          invites: {
            _id: new ObjectId(),
            userId: objectIdOrStringSchema.parse(userId),
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
  public async getUserInvites(userId: ObjectIdOrString): Promise<Invite[]> {
    const parsedUserId = objectIdOrStringSchema.parse(userId);
    const households = await this.collection
      .find(
        { 'invites.userId': parsedUserId },
        { projection: { invites: 1, _id: 1 } },
      )
      .toArray();

    const userInvites = households.flatMap(
      (h) =>
        h.invites?.filter(
          (invite) => invite.userId.toString() === parsedUserId.toString(),
        ) ?? [],
    );

    return userInvites.map((invite) => ({
      householdId: invite._id,
      inviteId: invite._id,
      userId: invite.userId,
      role: invite.role,
      permissions: invite.permissions,
    }));
  }

  /**
   * Processes a user's response to an invite (accept or decline).
   * @param inviteId - The ID of the invite.
   * @param response - The user's response (true for accept, false for decline).
   * @param userId - The ID of the user responding to the invite.
   * @returns The updated household document after processing the response.
   */
  public async processInviteResponse(
    inviteId: ObjectIdOrString,
    response: boolean,
    userId: ObjectIdOrString,
  ): Promise<Household | null> {
    const parsedInviteId = objectIdOrStringSchema.parse(inviteId);
    const parsedUserId = objectIdOrStringSchema.parse(userId);

    if (response) {
      return this.collection.findOneAndUpdate(
        {
          'invites._id': parsedInviteId,
          'invites.userId': parsedUserId,
        },
        {
          $pull: { invites: { _id: parsedInviteId } },
          $addToSet: {
            members: {
              id: parsedUserId,
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
          'invites._id': parsedInviteId,
          'invites.userId': parsedUserId,
        },
        { $pull: { invites: { _id: parsedInviteId } } },
        { returnDocument: 'after' },
      );
    }
  }
}
