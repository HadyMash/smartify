import { RedisClientType } from 'redis';
import { DatabaseRepository } from '../repo';
import { Db, MongoClient, ObjectId } from 'mongodb';
import {
  Household,
  HouseholdMember,
  HouseholdRoom,
  InvalidHouseholdError,
  InvalidHouseholdType,
  HouseholdInvite,
  MemberPermissions,
  MemberRole,
  MissingPermissionsError,
  HouseholdDevice,
} from '../../../schemas/household';
import { ObjectIdOrString, objectIdSchema } from '../../../schemas/obj-id';
import { InvalidUserError, InvalidUserType } from '../../../schemas/auth/user';

type HouseholdDoc = Household;

const HOUSEHOLD_COLLECTION_NAME = 'households';

export class HouseholdRepository extends DatabaseRepository<Household> {
  constructor(client: MongoClient, db: Db, redis: RedisClientType) {
    super(client, db, HOUSEHOLD_COLLECTION_NAME, redis);
  }

  public async configureCollection(): Promise<void> {
    try {
      const collections = await this.db
        .listCollections({ name: HOUSEHOLD_COLLECTION_NAME })
        .toArray();
      if (collections.length === 0) {
        await this.db.createCollection(HOUSEHOLD_COLLECTION_NAME);
        //console.log('Households collection created with schema validation.');
      }

      await this.collection.createIndex({ owner: 1 });
      await this.collection.createIndex({ 'members.id': 1 });
      await this.collection.createIndex({ 'members.id': 1, _id: 1 });
      await this.collection.createIndex({ 'invites.id': 1 });
      await this.collection.createIndex({ 'invites.inviteId': 1 });
      await this.collection.createIndex({ 'inivtes.id': 1, _id: 1 });
      await this.collection.createIndex({ 'devices.id': 1 });
      // compound index for device id and household id
      await this.collection.createIndex({ 'devices.deviceId': 1, _id: 1 });

      console.log('Indexes created for households collection.');
    } catch (error) {
      console.error('Error configuring households collection:', error);
      throw error;
    }
  }

  /**
   * Creates a new household.
   * @param ownerId - The ID of the user creating the household.
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

  public async getUserHouseholds(
    userId: ObjectIdOrString,
  ): Promise<Household[]> {
    return await this.collection
      .find({
        $or: [
          { 'members.id': objectIdSchema.parse(userId) },
          { owner: objectIdSchema.parse(userId) },
        ],
      })
      .toArray();
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
    const household = await this.getHouseholdById(householdId);
    if (!household)
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);

    if (!household.members.some((m) => m.id?.toString() === memberId)) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }

    // Filter out the member to be removed
    const updatedMembers = household.members.filter(
      (member) => member.id && member.id.toString() !== memberId.toString(),
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
  public async deleteHousehold(
    householdId: ObjectIdOrString,
  ): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: objectIdSchema.parse(householdId),
    });
    //console.log('Household deleted:', result);
    return result.deletedCount === 1;
  }

  /**
   * Checks if a household exists
   * @param id - The household's id
   * @returns true if the household exists
   */
  public async householdExists(id: ObjectIdOrString): Promise<boolean> {
    const household = await this.collection.findOne({
      _id: objectIdSchema.parse(id),
    });

    return household != null;
  }

  /**
   * Adds a room to a household.
   * @param householdId - The ID of the household.
   * @param roomData - The data of the room to add.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document.
   */
  public async addRoom(
    householdId: ObjectIdOrString,
    rooms: HouseholdRoom[],
  ): Promise<HouseholdDoc | null> {
    const household = await this.getHouseholdById(householdId);
    if (!household) throw new Error('Household not found');

    const existingRoomIds = new Set(
      household.rooms.map((r) => r.id.toString()),
    );
    const newRooms = rooms.filter(
      (room) => !existingRoomIds.has(room.id.toString()),
    );

    if (newRooms.length === 0) {
      throw new Error('All rooms already exist');
    }

    const result = await this.collection.findOneAndUpdate(
      { _id: objectIdSchema.parse(householdId) },
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
    role: MemberRole,
    permissions?: MemberPermissions,
  ): Promise<HouseholdDoc | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setQuery: any = {
      'members.$[user].role': role,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsetQuery: any = {};

    if (role === 'dweller') {
      if (!permissions) {
        throw new MissingPermissionsError();
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setQuery['members.$[user].permissions'] = permissions;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      unsetQuery['members.$[user].permissions'] = '';
    }

    const updatedHousehold = await this.collection.findOneAndUpdate(
      {
        _id: objectIdSchema.parse(householdId),
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { $set: setQuery, $unset: unsetQuery },
      {
        arrayFilters: [
          {
            'user.id': objectIdSchema.parse(memberId),
          },
        ],
        returnDocument: 'after',
      },
    );

    console.log('Updated Household After Role Change:', updatedHousehold); // Debugging log

    if (!updatedHousehold) {
      console.error('Update failed: No matching document found.');
    }

    return updatedHousehold;
  }

  public async updateRooms(id: ObjectIdOrString, rooms: HouseholdRoom[]) {
    // TODO: update to include adjacency list
    await this.collection.updateOne(
      { _id: objectIdSchema.parse(id) },
      { $set: { rooms } },
    );
  }

  /**
   * Sends an invite to a user to join the household.
   * @param householdId - The ID of the household to invite the user to.
   * @param userId - The ID of the user to invite.
   * @param role - The role to assign to the user (default is 'dweller').
   * @param permissions - The permissions to assign to the user (default is false for all).
   * @returns The updated household document after the invite.
   */
  public async inviteMember(
    householdId: ObjectIdOrString,
    invitee: HouseholdMember,
  ): Promise<HouseholdInvite> {
    const doc = await this.collection.findOneAndUpdate(
      {
        _id: objectIdSchema.parse(householdId),
        owner: { $ne: objectIdSchema.parse(invitee.id) },
        members: {
          $not: { $elemMatch: { id: objectIdSchema.parse(invitee.id) } },
        },
      },
      {
        $addToSet: {
          invites: {
            ...invitee,
            inviteId: new ObjectId(),
          },
        },
      },
      { returnDocument: 'after' },
    );

    if (!doc) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    const inv = doc.invites.find(
      (i) => i.id.toString() === invitee.id.toString(),
    );

    if (!inv) {
      throw new Error('Failed to send invite');
    }

    return inv;
  }

  /**
   * Revokes an invite to a household
   * @param inviteId - The invite's id
   * @returns A boolean indiciating if the invite was revoked successfully
   */
  public async revokeInvite(inviteId: ObjectIdOrString): Promise<boolean> {
    const result = await this.collection.updateOne(
      { 'invites.inviteId': objectIdSchema.parse(inviteId) },
      { $pull: { invites: { id: objectIdSchema.parse(inviteId) } } },
    );
    return result.modifiedCount === 1;
  }

  /**
   * Fetches all pending invites for a user.
   * @param userId - The ID of the user to fetch invites for.
   * @returns A list of all invites for the user.
   */
  public async getUserInvites(
    userId: ObjectIdOrString,
  ): Promise<HouseholdInvite[]> {
    const parsedUserId = objectIdSchema.parse(userId);
    console.log('Fetching invites for user:', parsedUserId);
    const households = await this.collection
      .find(
        { 'invites.id': parsedUserId },
        { projection: { invites: 1, _id: 1 } },
      )
      .toArray();

    console.log('Households with invites:', households);

    const userInvites = households.flatMap(
      (h) =>
        h.invites?.filter(
          (invite) => invite.id.toString() === parsedUserId.toString(),
        ) ?? [],
    );

    console.log('Filtered invites:', userInvites);

    return userInvites;
  }

  public async getInvite(
    inviteId: ObjectIdOrString,
  ): Promise<HouseholdInvite | null> {
    const h = await this.collection.findOne({
      'invites.inviteId': objectIdSchema.parse(inviteId),
    });
    if (!h || !h.invites) {
      return null;
    }

    return (
      h.invites.find((i) => i.inviteId.toString() === inviteId.toString()) ??
      null
    );
  }

  /**
   * Get's a household by an invite id
   * @param inviteId - The invite id
   * @returns The household document if the invite exists
   */
  public async getHouseholdByInvite(
    inviteId: ObjectIdOrString,
  ): Promise<HouseholdDoc | null> {
    const household = await this.collection.findOne({
      'invites.inviteId': objectIdSchema.parse(inviteId),
    });
    return household;
  }

  /**
   * Invite a member to a household
   * @param householdId - The household id
   * @param member - The new member's id
   * @returns The updated household
   */
  public async addMember(
    householdId: ObjectIdOrString,
    member: HouseholdMember,
  ): Promise<HouseholdDoc | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: objectIdSchema.parse(householdId) },
      { $addToSet: { members: member } },
    );
    console.log('Added member to household:', result);

    return result;
  }

  /**
   * Transfer a household's ownership to another member
   * @param householdId - The household Id
   * @param to - The new owner's id
   * @returns The new household
   */
  public async transferOwnership(
    householdId: ObjectIdOrString,
    to: ObjectIdOrString,
  ): Promise<HouseholdDoc | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: objectIdSchema.parse(householdId) },
      // pull new owner from members, add old owner to members, and update owner fieldj
      {
        $pull: { members: { id: objectIdSchema.parse(to) } },
        $addToSet: { members: { id: objectIdSchema.parse(to), role: 'admin' } },
        $set: { owner: objectIdSchema.parse(to) },
      },
      { returnDocument: 'after' },
    );

    console.log('Transferred ownership:', result);
    return result;
  }

  /**
   * Get a household by a device id
   * @param deviceId - The device id
   * @returns The household if it exists
   */
  public async getHouseholdByDevice(
    deviceId: string,
  ): Promise<Household | null> {
    const household = await this.collection.findOne({
      'devices.id': deviceId,
    });
    return household;
  }

  /**
   * Get households by device ids
   * @param deviceIds - The device ids
   * @returns The households that contain the devices
   */
  public async getHouseholdsByDevices(
    deviceIds: string[],
  ): Promise<Household[]> {
    return this.collection.find({ 'devices.id': { $in: deviceIds } }).toArray();
  }

  /**
   * Add a device to a household
   * @param householdId - Household id
   * @param device - The device to add
   */
  public async addDevicesToHousehold(
    householdId: ObjectIdOrString,
    devices: HouseholdDevice[],
  ): Promise<HouseholdDoc | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: objectIdSchema.parse(householdId) },
      { $push: { devices: { $each: devices } } },
      { returnDocument: 'after' },
    );

    console.log('Added device to household:', result);
    return result;
  }

  public async removeDeviceFromHousehold(
    householdId: ObjectIdOrString,
    deviceId: string,
  ): Promise<HouseholdDoc | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: objectIdSchema.parse(householdId) },
      { $pull: { devices: { id: deviceId } } },
      { returnDocument: 'after' },
    );
    console.log('Removed device from household:', result);
    return result;
  }
}
