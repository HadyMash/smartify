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
}
