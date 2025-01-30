import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/user';
import {
  Household,
  HouseholdRequestData,
  RoomRequestData,
  roomRequestDataSchema,
  householdRequestDataSchema,
  householdSchema,
} from '../schemas/household';
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
        householdRequestData = householdRequestDataSchema.parse(
          (req.body as { data?: unknown }).data,
        );
      } catch (_) {
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

  public static async getHousehold(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }

      // validate id
      const id = req.params.id;

      try {
        householdSchema.shape._id.parse(id);
      } catch (_) {
        res.status(400).send({ error: 'Invalid id' });
        return;
      }

      // get household
      const hs = new HouseholdService();
      const household = await hs.getHousehold(id);

      if (!household) {
        res.status(404).send({ error: 'Not found' });
        return;
      }

      res.status(200).send(household);
      return;
    } catch (e) {
      console.error(e);
      res.status(500).send('An error');
      return;
    }
  }
  public static async inviteMember(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      const { householdId, memberId } = req.body;

      const hs = new HouseholdService();

      const updatedHousehold = await hs.inviteMember(householdId, memberId, req.user._id);

      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred');
    }
  }

  public static async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      const { householdId, memberId } = req.body;
      
      const hs = new HouseholdService();
      const updatedHousehold = await hs.removeMember(householdId, memberId, req.user._id);
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred');
    }
  }

  public static async deleteHousehold(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      const { householdId } = req.params;

      const hs = new HouseholdService();
      await hs.deleteHousehold(householdId, req.user._id);
      res.status(200).send({ message: 'Household deleted' });
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred');
    }
  }

  public static async addRoom(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      let roomRequestData: RoomRequestData;
      try {
        roomRequestData = roomRequestDataSchema.parse(req.body.data);
      } catch (_) {
        res.status(400).send({ error: 'Invalid data' });
        return;
      }

      const { householdId } = req.params;
      const hs = new HouseholdService();
      const updatedHousehold = await hs.addRoom(householdId, roomRequestData, req.user._id);
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred');
    }
  }

  public static async getHouseholdInfo(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      const { householdId } = req.params;

      const hs = new HouseholdService();
      const household = await hs.getHousehold(householdId);
      
      if (!household) {
        res.status(404).send({ error: 'Household not found' });
        return;
      }

      res.status(200).send(household);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred');
    }
  }

  public static async changeUserPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      const { householdId, memberId, newRole } = req.body;
      
      const hs = new HouseholdService();
      const updatedHousehold = await hs.changeUserPermissions(householdId, memberId, newRole, req.user._id);
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred');
    }
  }

  public static async manageRooms(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
      }
      const { householdId, roomId, action } = req.body;
      
      const hs = new HouseholdService();
      const updatedHousehold = await hs.manageRooms(householdId, roomId, action, req.user._id);
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred');
    }
  }
}
