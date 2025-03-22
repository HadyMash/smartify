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
  InvalidInvite,
  memberSchema,
  AlreadyInvitedError,
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
    return this.db.householdRepository.createHousehold(data);
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
    invitee: HouseholdMember,
  ): Promise<HouseholdInvite> {
    await this.db.connect();
    // check if the household exists and if the invitee is already a member
    const h = await this.getHousehold(householdId);
    if (!h) {
      throw new InvalidHouseholdError(InvalidHouseholdType.DOES_NOT_EXIST);
    }

    if (h.members.find((m) => m.id.toString() === invitee.id.toString())) {
      throw new AlreadyMemberError();
    }

    // check if user is already invited
    if (h.invites) {
      const invite = h.invites.find((i) => i.id.toString() === invitee.id);
      if (invite) {
        throw new AlreadyInvitedError();
      }
    }

    return this.db.householdRepository.inviteMember(householdId, invitee);
  }

  /**
   * Retrieves the pending invites for a user.
   *
   * @param userId - The ID of the user.
   * @returns {Promise<HouseholdInvite[]>} - An array of invites for the user.
   */
  public async getUserInvites(
    userId: ObjectIdOrString,
  ): Promise<HouseholdInvite[]> {
    await this.db.connect();

    // check user exists
    if (!(await this.db.userRepository.userExists(userId))) {
      throw new InvalidUserError({ type: InvalidUserType.DOES_NOT_EXIST });
    }

    return this.db.householdRepository.getUserInvites(userId);
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
   * @throws A {@link InvalidInvite} error if the invite is invalid.
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
      throw new InvalidInvite();
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

    // check if the user is already a member
    if (h.members.find((m) => m.id.toString() === h.owner.toString())) {
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
}
