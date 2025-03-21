/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient, ObjectId, UpdateFilter } from 'mongodb';
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
  private db: Db;
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, 'households', redis);
    this.db = db;
  }

  public async configureCollection(): Promise<void> {
    try {
      const collections = await this.db
        .listCollections({ name: 'households' })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection('households', {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['name', 'owner', 'members', 'rooms'],
              properties: {
                name: {
                  bsonType: 'string',
                  description: 'Household name must be a string',
                },
                owner: {
                  bsonType: 'objectId',
                  description: 'Owner must be an ObjectId',
                },
                members: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    required: ['id', 'role'],
                    properties: {
                      id: {
                        bsonType: 'objectId',
                        description: 'Member ID must be an ObjectId',
                      },
                      role: {
                        bsonType: 'string',
                        enum: ['owner', 'admin', 'dweller'],
                        description:
                          'Role must be one of: owner, admin, dweller',
                      },
                      permissions: {
                        bsonType: 'object',
                        properties: {
                          appliances: { bsonType: 'bool' },
                          health: { bsonType: 'bool' },
                          security: { bsonType: 'bool' },
                          energy: { bsonType: 'bool' },
                        },
                        description: 'Optional permissions object for members',
                      },
                    },
                  },
                },
                rooms: {
                  bsonType: 'array',
                  minItems: 1,
                  items: {
                    bsonType: 'object',
                    required: ['_id', 'type', 'name', 'floor'],
                    properties: {
                      _id: {
                        bsonType: 'objectId',
                        description: 'Room ID must be an ObjectId',
                      },
                      type: {
                        bsonType: 'string',
                        description: 'Room type must be a string',
                      },
                      name: {
                        bsonType: 'string',
                        description: 'Room name must be a string',
                      },
                      floor: {
                        bsonType: 'int',
                        description: 'Floor must be an integer',
                      },
                    },
                  },
                  description: 'Household must have at least one room.',
                },
                invites: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'object',
                    required: ['_id', 'userId', 'role'],
                    properties: {
                      _id: {
                        bsonType: 'objectId',
                        description: 'Invite ID must be an ObjectId',
                      },
                      userId: {
                        bsonType: 'objectId',
                        description: 'User ID must be an ObjectId',
                      },
                      role: {
                        bsonType: 'string',
                        enum: ['dweller', 'admin'],
                        description: 'Role must be either dweller or admin',
                      },
                      permissions: {
                        bsonType: 'object',
                        properties: {
                          appliances: { bsonType: 'bool' },
                          health: { bsonType: 'bool' },
                          security: { bsonType: 'bool' },
                          energy: { bsonType: 'bool' },
                        },
                        description:
                          'Optional permissions object for invited members',
                      },
                    },
                  },
                },
              },
            },
          },
        });
        console.log('Households collection created with schema validation.');
      }

      await this.collection.createIndex({ name: 1 }, { unique: true });
      await this.collection.createIndex({ owner: 1 });
      await this.collection.createIndex({ 'members.id': 1 });
      await this.collection.createIndex({ 'rooms._id': 1 });
      await this.collection.createIndex({ 'invites.userId': 1 });

      console.log('Indexes created for households collection.');
    } catch (error) {
      console.error('Error configuring households collection:', error);
      throw error;
    }
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

    const createdHousehold = await this.collection.findOne({
      _id: result.insertedId,
    });
    if (!createdHousehold) {
      throw new Error('Failed to retrieve created household');
    }

    return createdHousehold;
  }

  /**
   * Get a household by its ID
   * @param id - The household's ID
   */
  public async getHouseholdById(
    id: ObjectIdOrString,
  ): Promise<Household | null> {
    const household = await this.collection.findOne({ _id: new ObjectId(id) });
    return household ? household : null;
  }

  /**
   * Removes a member from a household.
   * @param householdId - The ID of the household.
   * @param memberId - The ID of the member to remove.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document.
   */
  public async removeMember(
    householdId: string,
    memberId: string,
  ): Promise<HouseholdDoc | null> {
    const household = await this.getHouseholdById(householdId);
    if (!household) throw new Error('Household not found');

    if (!household.members.some((m) => m.id?.toString() === memberId)) {
      throw new Error('Member not found');
    }

    // Filter out the member to be removed
    const updatedMembers = household.members.filter(
      (member) => member.id && member.id.toString() !== memberId,
    );

    // Update the household with the new members array
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      { $set: { members: updatedMembers } },
      { returnDocument: 'after' },
    );

    console.log('Updated household after removing member:', result);
    return result;
  }

  /**
   * Deletes a household.
   * @param householdId - The ID of the household to delete.
   * @param ownerId - The ID of the household owner.
   */
  public async deleteHousehold(householdId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: objectIdOrStringSchema.parse(householdId),
    });
    console.log('Household deleted:', result);
    return result.deletedCount === 1;
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
    rooms: HouseholdRoom[],
  ): Promise<HouseholdDoc | null> {
    const household = await this.getHouseholdById(householdId);
    if (!household) throw new Error('Household not found');

    const existingRoomIds = new Set(
      household.rooms.map((r) => r._id.toString()),
    );
    const newRooms = rooms.filter(
      (room) => !existingRoomIds.has(room._id.toString()),
    );

    if (newRooms.length === 0) {
      throw new Error('All rooms already exist');
    }

    const result = await this.collection.findOneAndUpdate(
      { _id: objectIdOrStringSchema.parse(householdId) },
      { $push: { rooms: { $each: newRooms } } },
      { returnDocument: 'after' },
    );
    console.log('Updated household with new rooms:', result);
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
    const householdObjectId = objectIdOrStringSchema.parse(householdId);
    const memberObjectId = objectIdOrStringSchema.parse(memberId);

    // Debugging: Check if household exists before update
    const household = await this.collection.findOne({ _id: householdObjectId });
    console.log('Household before update:', household);

    if (!household) {
      console.error('Household not found:', householdObjectId);
      return null;
    }

    const updateQuery: any = {
      'members.$.role': newRole.role,
    };

    if (newRole.role === 'dweller') {
      if (!permissions) {
        throw new Error(
          'Permissions are required when assigning dweller role.',
        );
      }
      updateQuery['members.$.permissions'] = permissions;
    } else {
      updateQuery['members.$.permissions'] = {}; // Reset permissions for non-dwellers
    }

    const updatedHousehold = await this.collection.findOneAndUpdate(
      {
        _id: householdObjectId,
        owner: ownerId,
        'members.id': memberObjectId, // Ensure we match `id` (check if `_id` is used in members instead)
      },
      { $set: updateQuery },
      { returnDocument: 'after' },
    );

    console.log('Updated Household After Role Change:', updatedHousehold); // Debugging log

    if (!updatedHousehold) {
      console.error('Update failed: No matching document found.');
    }

    return updatedHousehold;
  }
  /**
   * Manages rooms in a household by adding or removing them.
   * @param householdId - The ID of the household.
   * @param roomId - The ID of the room.
   * @param action - The action to perform ('add' or 'remove').
   * @returns The updated household document.
   */
  public async manageRooms(
    householdId: string,
    room: HouseholdRoom,
    action: 'add' | 'edit' | 'remove',
  ): Promise<HouseholdDoc | null> {
    if (!householdId || !room || !action) {
      throw new Error(
        'Invalid arguments: householdId, room, and action are required.',
      );
    }

    if (action === 'add') {
      return this.addRoom(householdId, [room]);
    }

    if (action === 'edit') {
      const household = await this.getHouseholdById(householdId);
      if (!household)
        throw new Error(`Household with ID ${householdId} not found.`);

      // Validate room data
      if (!room.type || !room.name || typeof room.floor !== 'number') {
        throw new Error(
          'Invalid room data: type, name, and floor are required',
        );
      }

      // Find the room to edit
      const roomIndex = household.rooms.findIndex(
        (r) => r._id.toString() === room._id.toString(),
      );
      if (roomIndex === -1) {
        throw new Error(
          `Room with ID ${room._id} not found in household ${householdId}.`,
        );
      }

      // Check if another room with the same name exists (excluding the current room)
      const duplicateRoom = household.rooms.find(
        (r) => r.name === room.name && r._id.toString() !== room._id.toString(),
      );
      if (duplicateRoom) {
        throw new Error(`A room with name "${room.name}" already exists`);
      }

      const updateQuery = {
        $set: {
          [`rooms.${roomIndex}`]: {
            _id: room._id,
            type: room.type,
            name: room.name,
            floor: room.floor,
          },
        },
      };

      try {
        const result = await this.collection.findOneAndUpdate(
          { _id: new ObjectId(householdId) },
          updateQuery,
          { returnDocument: 'after' },
        );

        if (!result) {
          throw new Error('Failed to update room');
        }

        console.log('Updated household room:', result);
        return result;
      } catch (error) {
        console.error('Error updating room:', error);
        throw error;
      }
    }

    if (action === 'remove') {
      return this.removeRoom(householdId, room._id.toString());
    }

    throw new Error(
      `Invalid action: ${action}. Allowed actions: 'add', 'edit', 'remove'.`,
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
    const household = await this.getHouseholdById(householdId);
    if (!household) throw new Error('Household not found');

    if (household.rooms.length <= 1) {
      throw new Error('Cannot remove the only room in a household');
    }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(householdId) },
      { $pull: { rooms: { _id: roomId.toString() } } },
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
    console.log('Fetching invites for user:', parsedUserId);
    const households = await this.collection
      .find(
        { 'invites.userId': parsedUserId },
        { projection: { invites: 1, _id: 1 } },
      )
      .toArray();

    console.log('Households with invites:', households);

    const userInvites = households.flatMap(
      (h) =>
        h.invites?.filter(
          (invite) => invite.userId.toString() === parsedUserId.toString(),
        ) ?? [],
    );

    console.log('Filtered invites:', userInvites);

    return userInvites.map((invite) => ({
      _id: invite._id,
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
   * @param householdId - The ID of the household.
   * @returns The updated household document after processing the response.
   */
  public async processInviteResponse(
    inviteId: ObjectIdOrString,
    response: boolean,
    userId: ObjectIdOrString,
    householdId: ObjectIdOrString,
  ): Promise<Household | null> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error(`Invalid ObjectId: ${userId}`);
      }
      if (!ObjectId.isValid(householdId)) {
        throw new Error(`Invalid ObjectId: ${householdId}`);
      }
      if (!ObjectId.isValid(inviteId)) {
        throw new Error(`Invalid ObjectId: ${inviteId}`);
      }
      const parsedInviteId = new ObjectId(inviteId);
      const parsedHouseholdId = new ObjectId(householdId);
      const parsedUserId = new ObjectId(userId);

      // First, check if the household exists with the given invite
      const household = await this.collection.findOne({
        _id: parsedHouseholdId,
        invites: { $elemMatch: { _id: parsedInviteId, userId: parsedUserId } }, // Ensure userId is an ObjectId
      });

      if (!household) {
        throw new Error(
          `Invite not found: Household ${householdId.toString()}, Invite ${inviteId.toString()}, User ${userId.toString()}`,
        );
      }

      const updateQuery = response
        ? {
            $pull: { invites: { _id: parsedInviteId } },
            $push: {
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
          }
        : {
            $pull: { invites: { _id: parsedInviteId } },
          };

      const updatedHousehold = await this.collection.findOneAndUpdate(
        { _id: parsedHouseholdId },
        updateQuery as UpdateFilter<HouseholdDoc>,
        { returnDocument: 'after' },
      );

      return updatedHousehold;
    } catch (error) {
      console.error(
        `Error in processInviteResponse: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
