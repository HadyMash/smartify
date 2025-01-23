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
}
