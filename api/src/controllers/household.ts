import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/user';

// TODO: proper error handling (maybe implement custom error classes)
export class HouseholdController {
  public static async createHousehold(
    req: AuthenticatedRequest,
    res: Response,
  ) {}
}
