import { Household } from '../schemas/household';
import { DatabaseService } from './db/db';

export class HouseholdService {
  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

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
  public async inviteMember(householdId: string, memberId: string, ownerId: string): Promise<Household> {
    return this.db.householdRepository.addMember(householdId, memberId, ownerId);
  }

  public async removeMember(householdId: string, memberId: string, ownerId: string): Promise<Household> {
    return this.db.householdRepository.removeMember(householdId, memberId, ownerId);
  }

  public async deleteHousehold(householdId: string, ownerId: string): Promise<void> {
    return this.db.householdRepository.deleteHousehold(householdId, ownerId);
  }

  public async addRoom(householdId: string, roomData: any, ownerId: string): Promise<Household> {
    return this.db.householdRepository.addRoom(householdId, roomData, ownerId);
  }

  public async changeUserPermissions(householdId: string, memberId: string, newRole: string, ownerId: string): Promise<Household> {
    return this.db.householdRepository.changeUserRole(householdId, memberId, newRole, ownerId);
  }

  public async manageRooms(householdId: string, roomId: string, action: string, ownerId: string): Promise<Household> {
    return this.db.householdRepository.manageRooms(householdId, roomId, action, ownerId);
  }
}
