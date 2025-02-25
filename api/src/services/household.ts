import {
  Household,
  HouseholdMember,
  HouseholdRoom,
  Invite,
} from '../schemas/household';
import { DatabaseService } from './db/db';

export class HouseholdService {
  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }
  /**
   * Creates a new household.
   * @param data - The household data (excluding the _id field).
   * @returns The created household document.
   */
  public async createHousehold(
    data: Omit<Household, '_id'>,
  ): Promise<Household> {
    return this.db.householdRepository.createHousehold(data);
  }

  /**
   * Get a household by its ID
   * @param id - The household's ID
   * @returns
   */
  public async getHousehold(id: string): Promise<Household | null> {
    return this.db.householdRepository.getHouseholdById(id);
  }

  /**
   * Removes a member from a household.
   * @param householdId - The ID of the household.
   * @param memberId - The ID of the member to be removed.
   * @returns The updated household document or null if the operation fails.
   */
  public async removeMember(
    householdId: string,
    memberId: string,
  ): Promise<Household | null> {
    return this.db.householdRepository.removeMember(householdId, memberId);
  }

  /**
   * Deletes a household.
   * @param householdId - The ID of the household to delete.
   */
  public async deleteHousehold(householdId: string): Promise<void> {
    await this.db.householdRepository.deleteHousehold(householdId);
  }
  /**
   * Adds a new room to a household.
   * @param householdId - The ID of the household.
   * @param roomData - The details of the room to be added.
   * @returns The updated household document or null if the operation fails.
   */
  public async addRoom(
    householdId: string,
    roomData: HouseholdRoom,
  ): Promise<Household | null> {
    return this.db.householdRepository.addRoom(householdId, roomData);
  }
  /**
   * Removes a room from a household.
   * @param householdId - The ID of the household.
   * @param roomId - The ID of the room to be removed.
   * @returns The updated household document or null if the operation fails.
   */
  public async removeRoom(
    householdId: string,
    roomId: string,
  ): Promise<Household | null> {
    return this.db.householdRepository.removeRoom(householdId, roomId);
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
    householdId: string,
    memberId: string,
    newRole: HouseholdMember,
    ownerId: string,
    permissions?: {
      appliances: boolean;
      health: boolean;
      security: boolean;
      energy: boolean;
    },
  ): Promise<Household | null> {
    if (newRole.role === 'dweller' && !permissions) {
      throw new Error(
        'Permissions must be provided when setting a member as dweller.',
      );
    }
    return this.db.householdRepository.changeUserRole(
      householdId,
      memberId,
      newRole,
      ownerId,
      permissions,
    );
  }
  /**
   * Manages rooms in a household (add or remove).
   * @param householdId - The ID of the household.
   * @param roomId - The ID of the room.
   * @param action - The action to perform ('add' or 'remove').
   * @returns The updated household document or null if the operation fails.
   */
  public async manageRooms(
    householdId: string,
    roomId: string,
    action: 'add' | 'remove',
  ): Promise<Household | null> {
    return this.db.householdRepository.manageRooms(householdId, roomId, action);
  }
  //TODO: public async userPermissions(){}

  /**
   * Sends an invite to a user to join a household.
   *
   * @param householdId - The ID of the household.
   * @param userId - The ID of the user to invite.
   * @param role - The role to assign to the invited user (default is 'dweller').
   * @param permissions - (Optional) The permissions to assign to the user (default is { appliances: false, health: false, security: false, energy: false }).
   * @returns {Promise<Household | null>} - The updated household document or null if the operation fails.
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
    return this.db.householdRepository.inviteMember(
      householdId,
      userId,
      role,
      permissions,
    );
  }
  /**
   * Retrieves the pending invites for a user.
   *
   * @param userId - The ID of the user.
   * @returns {Promise<Invite[]>} - An array of invites for the user.
   */
  public async getUserInvites(userId: string): Promise<Invite[]> {
    return this.db.householdRepository.getUserInvites(userId);
  }

  /**
   * Allows a user to respond to an invite (accept or decline).
   *
   * @param inviteId - The ID of the invite.
   * @param response - The user's response to the invite (true for accept, false for decline).
   * @param userId - The ID of the user responding to the invite.
   * @returns {Promise<Household | null>} - The updated household document or null if the operation fails.
   */
  public async respondToInvite(
    inviteId: string,
    response: boolean,
    userId: string,
  ): Promise<Household | null> {
    return this.db.householdRepository.processInviteResponse(
      inviteId,
      response,
      userId,
    );
  }
}
