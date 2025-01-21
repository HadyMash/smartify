import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/user';
import {
  Household,
  HouseholdRequestData,
  householdRequestDataSchema,
  householdSchema,
} from '../schemas/household';
import { DatabaseService } from '../services/db/db';
import { ObjectId } from 'mongodb';
import { HouseholdService } from '../services/household';

// TODO: proper error handling (maybe implement custom error classes)
export class HouseholdController {
  public static async createHousehold(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      // validate data
      let householdRequestData: HouseholdRequestData;
      try {
        householdRequestData = householdRequestDataSchema.parse(req.body.data);
      } catch (e) {
        res.status(400).send({ error: 'Invalid data' });
        return;
      }

      const householdData: Omit<Household, '_id'> = {
        ...householdRequestData,
        owner: req.user?._id,
        members: [],
      };

      try {
        // validate
        householdSchema.parse(householdData);
      } catch (_) {
        res.status(400).send({ error: 'Invalid data' });
        return;
      }

      // create household
      const hs = new HouseholdService();
      const household = await hs.createHousehold(householdData);
      res.status(201).send(household);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error');
      return;
    }
  }
}
