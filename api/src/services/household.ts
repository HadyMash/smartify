import {
  Household,
  HouseholdMember,
  HouseholdRoom,
} from '../schemas/household';
import { DatabaseService } from './db/db';

export class HouseholdService {
  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  public async createHousehold(
    data: Omit<Household, '_id'>,
  ): Promise<Household> {
    await this.db.connect();
    return this.db.householdRepository.createHousehold(data);
  }

  /**
   * Get a household by its ID
   * @param id - The household's ID
   * @returns
   */
  public async getHousehold(id: string): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.getHouseholdById(id);
  }
  public async addMember(
    householdId: string,
    memberId: string,
    ownerId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.addMember(
      householdId,
      memberId,
      ownerId,
    );
  }

  public async removeMember(
    householdId: string,
    memberId: string,
    ownerId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.removeMember(
      householdId,
      memberId,
      ownerId,
    );
  }
  public async respondToInvite(
    inviteId: string,
    response: boolean,
    userId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.processInviteResponse(
      inviteId,
      response,
      userId,
    );
  }
  public async deleteHousehold(
    householdId: string,
    ownerId: string,
  ): Promise<void> {
    await this.db.connect();
    await this.db.householdRepository.deleteHousehold(householdId, ownerId);
  }
  public async addRoom(
    householdId: string,
    roomData: HouseholdRoom,
    ownerId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.addRoom(householdId, roomData, ownerId);
  }
  public async removeRoom(
    householdId: string,
    roomId: string,
    ownerId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.removeRoom(householdId, roomId, ownerId);
  }
  public async changeUserRole(
    householdId: string,
    memberId: string,
    newRole: HouseholdMember,
    ownerId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.changeUserRole(
      householdId,
      memberId,
      newRole,
      ownerId,
    );
  }
  public async manageRooms(
    householdId: string,
    roomId: string,
    action: 'add' | 'remove',
    ownerId: string,
  ): Promise<Household | null> {
    await this.db.connect();
    return this.db.householdRepository.manageRooms(
      householdId,
      roomId,
      action,
      ownerId,
    );
  }
  //TODO: public async userPermissions(){}
}
