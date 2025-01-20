import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/user';
import {
  HouseholdRequestData,
  householdRequestDataSchema,
} from '../schemas/household';
import { DatabaseService } from '../services/db/db';
import { ObjectId } from 'mongodb';

// TODO: proper error handling (maybe implement custom error classes)
export class HouseholdController {
  public static async createHousehold(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      // validate data
      let householdData: HouseholdRequestData;
      try {
        householdData = householdRequestDataSchema.parse(req.body.data);
      } catch (e) {
        res.status(400).send({ error: 'Invalid data' });
        return;
      }

      // create household
      const db = new DatabaseService();
      const household = await db.householdRepository.createHousehold({
        ownerId: new ObjectId(req.user!._id),
        name: householdData.name,
        coordinates: householdData.coordinates,
      });
      res.status(201).send(household);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error');
      return;
    }
  }
}
