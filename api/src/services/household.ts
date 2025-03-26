import { ClientSession } from 'mongodb';
import { Email } from '../schemas/auth/auth';
import { InvalidUserError, InvalidUserType } from '../schemas/auth/user';
import { Device, DeviceSource } from '../schemas/devices';
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
  householdSchema,
  AlreadyMemberError,
  memberSchema,
  AlreadyInvitedError,
  HouseholdInfo,
  householdInfoSchema,
  householdToInfo,
  InvalidInviteError,
  UIHousehold,
  UIMember,
  uiHouseholdSchema,
  UIInvitedMember,
  InvalidRoomsError,
  UIHouseholdInvite,
  HouseholdDevice,
  DeviceAlreadyPairedError,
} from '../schemas/household';
import { ObjectIdOrString } from '../schemas/obj-id';
import { getAdapter } from '../util/adapter';
import { validateRooms } from '../util/household';
import { DatabaseService } from './db/db';
import { log } from '../util/log';

export class HouseholdService {
  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Configures the household collection with validation and indexing.
   */
  public async configureCollection(): Promise<void> {
    await this.db.householdRepository.configureCollection();
  }

  /**
   * Creates a new household.
   * @param data - The household data (excluding the _id field).
   * @returns The created household document.
   */
  public async createHousehold(
    data: Omit<Household, '_id'>,
  ): Promise<Household> {
    await this.db.connect();
    return this.db.householdRepository.createHousehold(
      householdSchema.parse(data),
    );
  }

  /**
   * Get a household by its ID
   * @param id - The household's ID
   * @returns The household if it exists
   */
  public async getHousehold(id: ObjectIdOrString): Promise<Household | null> {
    await this.db.connect();
    const household = await this.db.householdRepository.getHouseholdById(id);
    if (household) {
      return householdSchema.parse(household);
    } else {
      return null;
    }
  }

  public async getUIHousehold(
    id: ObjectIdOrString,
    getMembers: boolean,
  ): Promise<UIHousehold | null> {
    await this.db.connect();
    const household = await this.db.householdRepository.getHouseholdById(id);

    return await this.transformToUIHousehold(household, getMembers);
  }

  /**
   * Transform a household into a UI household. It parses the schema before
   * returning to ensure data is valid and sanitised.
   * @param household - The household to trnsform
   * @param getMembers - Whether to get the members and invites of the household
   * @returns The UI Household if successful
   */
  public async transformToUIHousehold(
    household: Household | undefined | null,
    getMembers: boolean,
  ) {
    if (!household) {
      return null;
    }

    if (!getMembers) {
      // return household without members
      return uiHouseholdSchema.parse({
        ...household,
        members: [],
        invites: [],
      });
    }

    // get members and invites

    const promises = household.members.map(async (m) => {
      try {
        const user = await this.db.userRepository.getUserById(m.id);
        if (!user) {
          return null;
        }
        const member: UIMember = {
          id: user._id,
          name: user.name,
          role: m.role,
          permissions: m.permissions,
        };
        return member;
      } catch (_) {
        return null;
      }
    });

    const members: (UIMember | null)[] = await Promise.all(promises);

    // filter out nulls
    const filteredMembers = members.filter((m) => m !== null);

    const invitePromises = household.invites?.map(async (i) => {
      try {
        const user = await this.db.userRepository.getUserById(i.id);
        if (!user) {
          return null;
        }
        const member: UIInvitedMember = {
          id: user._id,
          name: user.name,
          role: i.role,
          permissions: i.permissions,
          inviteId: i.inviteId,
        };
        return member;
      } catch (_) {
        return null;
      }
    });

    const invites = invitePromises ? await Promise.all(invitePromises) : [];

    const filteredInvites = invites.filter((i) => i !== null);

    // return household with members
    return uiHouseholdSchema.parse({
      ...household,
      members: filteredMembers,
      invites: filteredInvites,
    });
  }

  /**
   * Get a household's information
   * @param id - The household's ID
   * @returns The household if it exists, null otherwise
   */
  public async getHouseholdInfo(
    id: ObjectIdOrString,
  ): Promise<HouseholdInfo | null> {
    await this.db.connect();
    const h = await this.db.householdRepository.getHouseholdById(id);

    if (!h) {
      return null;
    }

    const info: HouseholdInfo = {
      _id: h._id,
      floors: h.floors,
      name: h.name,
      members: h.members.length,
      owner: h.owner,
    };

    return householdInfoSchema.parse(info);
  }

  public async getUserHouseholds(
    userId: ObjectIdOrString,
  ): Promise<HouseholdInfo[]> {
    await this.db.connect();

    const households =
      await this.db.householdRepository.getUserHouseholds(userId);

    return households.map(householdToInfo);
  }

  public async householdExists(id: ObjectIdOrString): Promise<boolean> {
    await this.db.connect();
    return this.db.householdRepository.householdExists(id);
  }

  /**
   * Removes a member from a household.
   * @param householdId - The ID of the household.
   * @param memberId - The ID of the member to be removed.
   * @returns The updated household document or null if the operation fails.
   * @throws An {@link InvalidHouseholdError} if the household does not exist or
   * has an invalid id.
   */
  public async removeMember(
    householdId: ObjectIdOrString,
    memberId: ObjectIdOrString,
  ): Promise<Household | null> {
    await this.db.connect();
    // check if the user is a member or invited (or neither)
    const household =
      await this.db.householdRepository.getHouseholdById(householdId);
    if (!household) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }
    if (
      household.members.find((m) => m.id.toString() === memberId.toString())
    ) {
      return this.db.householdRepository.removeMember(householdId, memberId);
    } else if (
      household.invites?.find((i) => i.id.toString() === memberId.toString())
    ) {
      await this.db.householdRepository.revokeInvite(memberId);
      // get the updated household
      return this.db.householdRepository.getHouseholdById(householdId);
    } else {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
  }

  protected async unpairAllDevices(
    householdId: ObjectIdOrString,
    session: ClientSession,
  ): Promise<void> {
    await this.db.connect();
    // get all devices first
    const devices = await this.db.deviceInfoRepository.getHouseholdDevices(
      householdId,
      session,
    );

    if (devices.length === 0) {
      return; // No devices to unpair
    }

    // remove them from the household first within the transaction
    await this.db.deviceInfoRepository.removeDevicesFromHousehold(
      householdId,
      devices.map((d) => d._id),
      session,
    );

    // After transaction commits, handle device unpairing from external sources
    // Store device data for later unpairing (will happen after this method returns)
    this.scheduleExternalDeviceUnpairing(
      devices.map((d) => ({ ...d, id: d._id, _id: undefined })),
    );
  }

  /**
   * Schedules asynchronous unpairing of devices from external services.
   * This is called after DB transaction commits to prevent blocking the transaction.
   * Errors in external API calls won't affect the database transaction.
   *
   * @param devices - Array of devices to unpair from external services
   */
  private scheduleExternalDeviceUnpairing(devices: Device[]): void {
    // This executes asynchronously after the current function returns
    setTimeout(() => {
      this.unpairDevicesFromExternalServices(devices).catch((error) => {
        log.error('Error in scheduled device unpairing:', error);
      });
    }, 0);
  }

  /**
   * Unpairs devices from their external services.
   * Handles errors for each source independently to ensure maximum unpairing.
   *
   * @param devices - Array of devices to unpair from external services
   */
  private async unpairDevicesFromExternalServices(
    devices: Device[],
  ): Promise<void> {
    // Group devices by source
    const deviceSourceMap = new Map<DeviceSource, string[]>();

    for (const device of devices) {
      if (!device.source) {
        continue;
      }
      if (!deviceSourceMap.has(device.source)) {
        deviceSourceMap.set(device.source, []);
      }
      deviceSourceMap.get(device.source)?.push(device.id);
    }

    // Track errors for logging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: { source: string; error: any }[] = [];

    // Process each source independently
    const unpairPromises = Array.from(deviceSourceMap.entries()).map(
      async ([source, deviceIds]) => {
        try {
          const adapter = getAdapter(source);
          await adapter.unpairDevices(deviceIds);
        } catch (error) {
          log.error(`Error unpairing ${source} devices:`, error);
          errors.push({ source, error });
          // Don't rethrow to allow other sources to complete
        }
      },
    );

    // Wait for all unpairing attempts to complete
    await Promise.all(unpairPromises);

    // Log summary of any errors
    if (errors.length > 0) {
      log.error(
        `Failed to unpair devices from ${errors.length} sources during external unpairing`,
        errors.map((e) => e.source),
      );
    }
  }

  /**
   * Deletes a household and all associated devices in a transaction.
   * @param id - The ID of the household to delete.
   */
  public async deleteHousehold(id: ObjectIdOrString): Promise<void> {
    await this.db.connect();

    // check if the household exists
    if (!(await this.db.householdRepository.householdExists(id))) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    // Use a transaction to ensure atomicity with validation
    const { committed } = await this.db.withTransaction(
      async (session) => {
        // First unpair all devices (which removes them from household)
        await this.unpairAllDevices(id, session);

        // Then delete the household itself
        await this.db.householdRepository.deleteHousehold(id, session);

        // Return the id for the validator to use
        return id;
      },
      // Add validator function to verify the operation was fully successful
      async (householdId, session) => {
        try {
          // Verify devices are unpaired
          const remainingDevices =
            await this.db.deviceInfoRepository.getHouseholdDevices(
              householdId,
              session,
            );

          // Verify household is deleted
          const householdStillExists =
            await this.db.householdRepository.householdExists(householdId);

          // Commit only if all devices are unpaired and household is deleted
          return remainingDevices.length === 0 && !householdStillExists;
        } catch (e) {
          log.error('Error in deleteHousehold validator:', e);
          return false;
        }
      },
    );

    if (!committed) {
      throw new Error('Failed to delete household');
    }
  }

  /**
   * Updates the rooms configuration of a household with transaction support
   * Ensures all devices have valid room assignments after the update
   * All validation and updating happens within a single transaction for atomicity
   *
   * @param id - The household ID
   * @param rooms - The new room configuration
   * @returns The updated household or null
   */
  public async updateRooms(
    id: ObjectIdOrString,
    rooms: HouseholdRoom[],
  ): Promise<Household | null> {
    await this.db.connect();

    // Verify rooms valid structure before starting transaction
    if (!validateRooms(rooms)) {
      throw new InvalidRoomsError();
    }

    // Use a transaction for all database operations
    const { result: updatedHousehold, committed } =
      await this.db.withTransaction(
        async (session) => {
          // Get the household inside the transaction
          const household =
            await this.db.householdRepository.getHouseholdById(id);

          if (!household) {
            throw new InvalidHouseholdError(
              InvalidHouseholdType.DOES_NOT_EXIST,
            );
          }

          // Get the current rooms to identify removed rooms
          const oldRoomIds = new Set(household.rooms.map((room) => room.id));
          const newRoomIds = new Set(rooms.map((room) => room.id));

          // Find removed rooms
          const removedRoomIds = [...oldRoomIds].filter(
            (id) => !newRoomIds.has(id),
          );

          // Get all household devices inside the transaction
          const devices =
            await this.db.deviceInfoRepository.getHouseholdDevices(id, session);

          // Check if there are any devices assigned to rooms that will be removed
          if (removedRoomIds.length > 0) {
            const devicesInRemovedRooms = devices.filter((d) =>
              removedRoomIds.includes(d.roomId),
            );

            if (devicesInRemovedRooms.length > 0) {
              throw new InvalidRoomsError();
            }
          }

          // Check if all devices have valid room assignments in the new configuration
          if (
            !devices.every(
              (d) => !d.roomId || rooms.some((r) => r.id === d.roomId),
            )
          ) {
            throw new InvalidRoomsError();
          }

          // Update the rooms
          await this.db.householdRepository.updateRooms(id, rooms, session);

          // Get and return the updated household within the transaction
          return await this.db.householdRepository.getHouseholdById(id);
        },
        // Add transaction validator to ensure we got a valid result
        // eslint-disable-next-line @typescript-eslint/require-await
        async (result) => {
          return !!result && result.rooms.length === rooms.length;
        },
      );

    if (!committed) {
      throw new Error('Failed to update household rooms');
    }

    return updatedHousehold;
  }

  /**
   * Changes a household member's role.
   * @param householdId - The ID of the household.
   * @param memberId - The ID of the member whose role is being changed.
   * @param newRole - The new role to assign.
   * @param ownerId - The ID of the household owner.
   * @returns The updated household document or null if the operation fails.
   */
  public async changeUserRole(
    householdId: ObjectIdOrString,
    memberId: ObjectIdOrString,
    role: MemberRole,
    permissions?: MemberPermissions,
  ): Promise<Household | null> {
    if (role === 'dweller' && !permissions) {
      throw new MissingPermissionsError();
    }

    await this.db.connect();
    // check household exists first and the member exists as well
    const household =
      await this.db.householdRepository.getHouseholdById(householdId);
    if (!household) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    if (
      !household.members.find((m) => m.id.toString() === memberId.toString())
    ) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }

    return this.db.householdRepository.changeUserRole(
      householdId,
      memberId,
      role,
      permissions,
    );
  }

  /**
   * Sends an invite to a user to join a household.
   *
   * @param householdId - The ID of the household.
   * @param userId - The ID of the user to invite.
   * @param role - The role to assign to the invited user (default is 'dweller').
   * @param permissions - (Optional) The permissions to assign to the user (default is { appliances: false, health: false, security: false, energy: false }).
   * @returns The invite
   * @throws An {@link InvalidHouseholdError} error if the household does not exist.
   * @throws An {@link AlreadyMemberError} error if the user does not exist.
   */
  public async inviteMember(
    householdId: ObjectIdOrString,
    invitee: Omit<HouseholdMember, 'id'>,
    email: Email,
  ): Promise<HouseholdInvite> {
    await this.db.connect();

    // get invitee's id
    const user = await this.db.userRepository.getUserByEmail(email);

    // check if the household exists and if the invitee is already a member
    const h = await this.getHousehold(householdId);
    if (!h) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    if (
      user._id.toString() === h.owner.toString() ||
      h.members.find((m) => m.id.toString() === user._id.toString())
    ) {
      throw new AlreadyMemberError();
    }

    // check if user is already invited
    if (h.invites) {
      const invite = h.invites.find((i) => i.id.toString() === user._id);
      if (invite) {
        throw new AlreadyInvitedError();
      }
    }

    return this.db.householdRepository.inviteMember(householdId, {
      ...invitee,
      id: user._id,
    });
  }

  /**
   * Retrieves the pending invites for a user.
   *
   * @param userId - The ID of the user.
   * @returns {Promise<HouseholdInvite[]>} - An array of invites for the user.
   */
  public async getUserInvites(
    userId: ObjectIdOrString,
  ): Promise<UIHouseholdInvite[]> {
    await this.db.connect();

    const invites = await this.db.householdRepository.getUserInvites(userId);

    const results: (UIHouseholdInvite | null)[] = await Promise.all(
      invites.map(async (i) => {
        try {
          const household =
            await this.db.householdRepository.getHouseholdByInvite(i.inviteId);

          const owner = household
            ? await this.db.userRepository.getUserById(household.owner)
            : null;

          return {
            inviteId: i.inviteId,
            householdName: household?.name,
            ownerName: owner?.name,
          };
        } catch (e) {
          log.error('error getting invite:', e);
          return null;
        }
      }),
    );

    return results.filter((r) => r !== null);
  }

  public async getInvite(
    inviteId: ObjectIdOrString,
  ): Promise<HouseholdInvite | null> {
    await this.db.connect();
    return this.db.householdRepository.getInvite(inviteId);
  }

  /**
   * Allows a user to respond to an invite (accept or decline).
   *
   * @param inviteId - The ID of the invite.
   * @param response - The user's response to the invite (true for accept, false for decline).
   * @param userId - The ID of the user responding to the invite.
   * @returns {Promise<Household | null>} - The updated household document or null if the operation fails.
   * @throws A {@link InvalidInviteError} error if the invite is invalid.
   * @throws A {@link InvalidUserError} error if the user invited does not exist.
   * @throws An {@link AlreadyMemberError} error if the user is already a member of the household.
   */
  public async respondToInvite(
    inviteId: ObjectIdOrString,
    response: boolean,
  ): Promise<Household | null> {
    await this.db.connect();

    // get the invite
    const h = await this.db.householdRepository.getHouseholdByInvite(inviteId);

    if (!h) {
      throw new InvalidInviteError();
    }

    // check if the user exists
    if (!(await this.db.userRepository.userExists(h.owner))) {
      // remove the invite if the user does not exist
      try {
        await this.db.householdRepository.revokeInvite(inviteId);
      } catch (e) {
        log.error('error removing invite:', e);
      }
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }

    const invite = h.invites.find(
      (i) => i.id.toString() === inviteId.toString(),
    );

    if (!invite) {
      throw new InvalidInviteError();
    }

    // check if the user is already a member
    if (
      h.owner.toString() === invite.id ||
      h.members.find((m) => m.id.toString() === invite.id.toString())
    ) {
      // remove the invite if the user is already a member
      try {
        await this.db.householdRepository.revokeInvite(inviteId);
      } catch (e) {
        log.error('error removing invite:', e);
      }
      throw new AlreadyMemberError();
    }

    if (response) {
      // accept the invite
      // first get it and revoke it
      const household =
        await this.db.householdRepository.getHouseholdByInvite(inviteId);
      if (!household || !household.invites) {
        return null;
      }

      // revoke invite
      const rS = await this.db.householdRepository.revokeInvite(inviteId);

      if (!rS) return null;

      const inv = household.invites.find(
        (i) => i.id.toString() === inviteId.toString(),
      );
      if (!inv) return null;

      // add the user to the household
      const newH = await this.db.householdRepository.addMember(
        household._id!,
        memberSchema.parse(inv),
      );

      if (!newH) return null;
      return householdSchema.parse(newH);
    } else {
      // decline the invite
      const s = await this.db.householdRepository.revokeInvite(inviteId);
      if (s) {
        return await this.db.householdRepository.getHouseholdById(h._id!);
      } else {
        return null;
      }
    }
  }

  /**
   * Transfers household ownership from current owner to a new owner with transaction support
   * This ensures atomicity and prevents race conditions like the new owner being deleted during transfer
   *
   * @param householdId - The ID of the household
   * @param newOwner - The ID of the new owner (must be an existing household member)
   * @returns The updated household document after ownership transfer
   * @throws InvalidHouseholdError if the household doesn't exist
   * @throws InvalidUserError if the new owner is not a member of the household
   */
  public async transferOwnership(
    householdId: ObjectIdOrString,
    newOwner: ObjectIdOrString,
  ): Promise<Household | null> {
    await this.db.connect();

    // Use a transaction to ensure atomicity of the ownership transfer
    const { result: updatedHousehold, committed } =
      await this.db.withTransaction(
        async (session) => {
          // First verify household exists and get its data within transaction
          const household =
            await this.db.householdRepository.getHouseholdById(householdId);
          if (!household) {
            throw new InvalidHouseholdError(
              InvalidHouseholdType.DOES_NOT_EXIST,
            );
          }

          // Verify new owner exists and is a member of the household
          // This locks the user document for reading, preventing concurrent deletion
          const userExists = await this.db.userRepository.userExists(
            newOwner,
            session,
          );
          if (!userExists) {
            throw new InvalidUserError({
              type: InvalidUserType.DOES_NOT_EXIST,
            });
          }

          // Verify user is a member of the household
          if (
            !household.members.find(
              (m) => m.id.toString() === newOwner.toString(),
            )
          ) {
            throw new InvalidUserError({
              type: InvalidUserType.DOES_NOT_EXIST,
            });
          }

          // Perform the actual ownership transfer in the transaction
          return await this.db.householdRepository.transferOwnership(
            householdId,
            newOwner,
            session,
          );
        },
        // Transaction validator to ensure we got valid results
        // eslint-disable-next-line @typescript-eslint/require-await
        async (result) => {
          return !!result && result.owner.toString() === newOwner.toString();
        },
      );

    if (!committed) {
      throw new Error('Failed to transfer household ownership');
    }

    return updatedHousehold;
  }

  public async getHouseholdByDevice(
    deviceId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    const householdId =
      await this.db.deviceInfoRepository.getDevicePairedHousehold(deviceId);
    if (!householdId) {
      return null;
    }
    // get the household
    const household =
      await this.db.householdRepository.getHouseholdById(householdId);
    if (!household) {
      return null;
    }
    return householdSchema.parse(household);
  }

  public async getHouseholdsByDevices(
    deviceIds: string[],
  ): Promise<Household[]> {
    await this.db.connect();
    const householdIds =
      await this.db.deviceInfoRepository.getHouseholdsByDeviceIds(deviceIds);
    const households = await Promise.all(
      householdIds.map(async (id) => {
        const household =
          await this.db.householdRepository.getHouseholdById(id);
        return householdSchema.parse(household);
      }),
    );
    return households;
  }

  /**
   * Pairs devices to a household with transaction support to ensure atomicity.
   * @param householdId - The ID of the household to pair devices to
   * @param devices - The devices to pair with the household
   */
  public async pairDevicesToHousehold(
    householdId: ObjectIdOrString,
    devices: HouseholdDevice[],
  ): Promise<void> {
    await this.db.connect();

    const household = await this.getHousehold(householdId);
    // check if the household exists
    if (!household) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    // check if the devices are already paired to a household
    const householdIds = await this.getHouseholdsByDevices(
      devices.map((d) => d.id),
    );

    if (householdIds.length > 0) {
      throw new DeviceAlreadyPairedError();
    }

    // Use a transaction to ensure atomicity
    await this.db.withTransaction(async (session) => {
      // Add devices to household in the transaction
      await this.db.deviceInfoRepository.addDevicesToHousehold(
        householdId,
        devices,
        session,
      );
    });
  }

  public async unpairDeviceFromHousehold(
    householdId: ObjectIdOrString,
    deviceIds: string[],
  ): Promise<void> {
    await this.db.connect();
    await this.db.deviceInfoRepository.removeDevicesFromHousehold(
      householdId,
      deviceIds,
    );
  }

  /**
   * Changes the rooms of devices in a household.
   * @param householdId - the household id
   * @param devices - the devices to move
   * @returns the updated household
   */
  /**
   * Changes the room assignment for multiple devices with transaction support.
   * @param householdId - The household ID
   * @param deviceIds - Array of device IDs to move
   * @param roomId - The new room ID to assign
   */
  public async changeDeviceRooms(
    householdId: ObjectIdOrString,
    deviceIds: string[],
    roomId: string,
  ): Promise<void> {
    await this.db.connect();

    const household = await this.getHousehold(householdId);

    if (!household) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    // check the devices are being assigned to rooms that exist
    const rooms = household.rooms.map((r) => r.id);
    if (!rooms.includes(roomId)) {
      throw new InvalidRoomsError();
    }

    await this.db.withTransaction(async (session) => {
      await this.db.deviceInfoRepository.updateDeviceRooms(
        householdId,
        roomId,
        deviceIds,
        session,
      );
    });
  }

  public async getHouseholdDevices(householdId: ObjectIdOrString) {
    await this.db.connect();
    return this.db.deviceInfoRepository.getHouseholdDevices(householdId);
  }
}
