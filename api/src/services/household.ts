import { Email } from '../schemas/auth/auth';
import { InvalidUserError, InvalidUserType } from '../schemas/auth/user';
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
} from '../schemas/household';
import { ObjectIdOrString } from '../schemas/obj-id';
import { DatabaseService } from './db/db';

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
    if (!household) {
      return null;
    }

    if (!getMembers) {
      // return household without members
      return uiHouseholdSchema.parse(household);
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
    return this.db.householdRepository.removeMember(householdId, memberId);
  }

  /**
   * Deletes a household.
   * @param id - The ID of the household to delete.
   */
  public async deleteHousehold(id: ObjectIdOrString): Promise<void> {
    await this.db.connect();
    // check if the household exists
    if (!(await this.db.householdRepository.householdExists(id))) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    await this.db.householdRepository.deleteHousehold(id);
  }

  public static validateRooms(rooms: HouseholdRoom[]): boolean {
    /**
     * Validates if a list of rooms forms a correct grid structure
     * @param rooms List of household rooms to validate
     * @returns An object with validation result and any error messages
     */
    function validateRoomGrid(rooms: HouseholdRoom[]): {
      valid: boolean;
      errors: string[];
    } {
      const errors: string[] = [];

      // Skip validation if there are no rooms
      if (rooms.length === 0) {
        return { valid: true, errors: [] };
      }

      // Create a map of room IDs to rooms for easy lookup
      const roomMap = new Map(rooms.map((room) => [room.id, room]));

      // Check for duplicate room IDs
      if (roomMap.size !== rooms.length) {
        errors.push('Duplicate room IDs detected');
      }

      // Validate all room connections
      for (const room of rooms) {
        const { id, connectedRooms } = room;

        // Check that connected rooms exist
        for (const [direction, connectedId] of Object.entries(connectedRooms)) {
          if (connectedId) {
            // Check if the connected room exists
            if (!roomMap.has(connectedId)) {
              errors.push(
                `Room ${id} is connected to non-existent room ${connectedId} on ${direction}`,
              );
              continue;
            }

            // Check for bidirectional consistency
            const connectedRoom = roomMap.get(connectedId)!;
            const oppositeDirection = getOppositeDirection(
              direction as keyof typeof connectedRooms,
            );

            if (connectedRoom.connectedRooms[oppositeDirection] !== id) {
              errors.push(
                `Inconsistent connection: Room ${id} connects to ${connectedId} on ${direction}, ` +
                  `but room ${connectedId} doesn't connect back on ${oppositeDirection}`,
              );
            }

            // check they are on the same floor
            if (room.floor !== connectedRoom.floor) {
              errors.push(
                `Rooms ${id} and ${connectedId} are on different floors`,
              );
            }
          }
        }
      }

      // Validate grid structure (no overlaps or gaps)
      validateGridStructure(rooms, roomMap, errors);

      return {
        valid: errors.length === 0,
        errors,
      };
    }

    /**
     * Returns the opposite direction for bidirectional validation
     */
    function getOppositeDirection(
      direction: keyof HouseholdRoom['connectedRooms'],
    ): keyof HouseholdRoom['connectedRooms'] {
      switch (direction) {
        case 'top':
          return 'bottom';
        case 'bottom':
          return 'top';
        case 'left':
          return 'right';
        case 'right':
          return 'left';
      }
    }

    /**
     * Validates the overall grid structure to ensure rooms form a proper grid
     * with no overlaps or disconnected sections
     */
    function validateGridStructure(
      rooms: HouseholdRoom[],
      roomMap: Map<string, HouseholdRoom>,
      errors: string[],
    ): void {
      // Check if the grid forms a connected component
      if (rooms.length === 0) return;

      // Use BFS to check connectivity
      const visited = new Set<string>();
      const queue: string[] = [rooms[0].id];
      visited.add(rooms[0].id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentRoom = roomMap.get(currentId)!;

        // Add all connected rooms to the queue
        for (const connectedId of Object.values(currentRoom.connectedRooms)) {
          if (connectedId && !visited.has(connectedId)) {
            visited.add(connectedId);
            queue.push(connectedId);
          }
        }
      }

      // Check if all rooms are connected
      if (visited.size !== rooms.length) {
        errors.push(
          `Grid is not fully connected. Only ${visited.size} of ${rooms.length} rooms are connected.`,
        );
      }

      // Check for grid consistency (each room's connections should form a proper grid)
      const roomPositions = new Map<string, { x: number; y: number }>();

      // Assign relative positions starting from an arbitrary room
      assignGridPositions(
        rooms[0].id,
        0,
        0,
        roomMap,
        roomPositions,
        new Set<string>(),
      );

      // Check for overlapping positions
      const positionMap = new Map<string, string>();
      for (const [roomId, position] of roomPositions.entries()) {
        const posKey = `${position.x},${position.y}`;
        if (positionMap.has(posKey)) {
          errors.push(
            `Rooms ${roomId} and ${positionMap.get(posKey)} overlap at position (${position.x}, ${position.y})`,
          );
        } else {
          positionMap.set(posKey, roomId);
        }
      }

      // Check for non-grid arrangements (rooms not aligned in a grid)
      validateGridAlignment(roomPositions, errors);
    }

    /**
     * Recursively assigns x,y positions to rooms based on their connections
     */
    function assignGridPositions(
      roomId: string,
      x: number,
      y: number,
      roomMap: Map<string, HouseholdRoom>,
      positions: Map<string, { x: number; y: number }>,
      visited: Set<string>,
    ): void {
      // Mark current room as visited and assign position
      visited.add(roomId);
      positions.set(roomId, { x, y });

      const room = roomMap.get(roomId)!;

      // Process each direction
      if (
        room.connectedRooms.right &&
        !visited.has(room.connectedRooms.right)
      ) {
        assignGridPositions(
          room.connectedRooms.right,
          x + 1,
          y,
          roomMap,
          positions,
          visited,
        );
      }

      if (room.connectedRooms.left && !visited.has(room.connectedRooms.left)) {
        assignGridPositions(
          room.connectedRooms.left,
          x - 1,
          y,
          roomMap,
          positions,
          visited,
        );
      }

      if (room.connectedRooms.top && !visited.has(room.connectedRooms.top)) {
        assignGridPositions(
          room.connectedRooms.top,
          x,
          y - 1,
          roomMap,
          positions,
          visited,
        );
      }

      if (
        room.connectedRooms.bottom &&
        !visited.has(room.connectedRooms.bottom)
      ) {
        assignGridPositions(
          room.connectedRooms.bottom,
          x,
          y + 1,
          roomMap,
          positions,
          visited,
        );
      }
    }

    /**
     * Validates that rooms are aligned in a proper grid formation
     */
    function validateGridAlignment(
      positions: Map<string, { x: number; y: number }>,
      errors: string[],
    ): void {
      // Extract all unique x and y coordinates
      const xCoords = new Set<number>();
      const yCoords = new Set<number>();

      for (const pos of positions.values()) {
        xCoords.add(pos.x);
        yCoords.add(pos.y);
      }

      const xValues = Array.from(xCoords).sort((a, b) => a - b);
      const yValues = Array.from(yCoords).sort((a, b) => a - b);

      // Check for gaps in the grid
      for (let i = 1; i < xValues.length; i++) {
        if (xValues[i] - xValues[i - 1] > 1) {
          errors.push(
            `Gap detected in x-axis between positions ${xValues[i - 1]} and ${xValues[i]}`,
          );
        }
      }

      for (let i = 1; i < yValues.length; i++) {
        if (yValues[i] - yValues[i - 1] > 1) {
          errors.push(
            `Gap detected in y-axis between positions ${yValues[i - 1]} and ${yValues[i]}`,
          );
        }
      }
    }

    const result = validateRoomGrid(rooms);

    if (!result.valid) {
      console.log('invalid rooms:', result.errors);
    }
    return result.valid;
  }

  public async updateRooms(
    id: ObjectIdOrString,
    rooms: HouseholdRoom[],
  ): Promise<Household | null> {
    await this.db.connect();

    // check household exists first and rooms are different
    const household = await this.db.householdRepository.getHouseholdById(id);

    if (!household) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    // verify rooms valid
    if (!HouseholdService.validateRooms(rooms)) {
      throw new InvalidRoomsError();
    }

    await this.db.householdRepository.updateRooms(id, rooms);

    // return updated household
    return await this.db.householdRepository.getHouseholdById(id);
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
          console.error('error getting invite:', e);
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
        console.error('error removing invite:', e);
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
        console.error('error removing invite:', e);
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

  public async transferOwnership(
    householdId: ObjectIdOrString,
    newOwner: ObjectIdOrString,
  ): Promise<Household | null> {
    await this.db.connect();
    const household =
      await this.db.householdRepository.getHouseholdById(householdId);
    if (!household) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }
    if (
      !household.members.find((m) => m.id.toString() === newOwner.toString())
    ) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }
    return this.db.householdRepository.transferOwnership(householdId, newOwner);
  }
}
