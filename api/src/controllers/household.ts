/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth/user';
import {
  Household,
  HouseholdRequestData,
  RoomRequestData,
  roomRequestDataSchema,
  householdCreateRequestDataSchema,
  householdSchema,
  HouseholdMember,
  inviteMemberSchema,
  HouseholdRoom,
} from '../schemas/household';
import { HouseholdService } from '../services/household';
import { TokenService } from '../services/token';
import { objectIdOrStringSchema } from '../schemas/obj-id';
import { ObjectId } from 'mongodb';

// TODO: proper error handling (maybe implement custom error classes)
export class HouseholdController {
  public static async createHousehold(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    // validate data
    let householdRequestData: HouseholdRequestData;
    try {
      householdRequestData = householdCreateRequestDataSchema.parse(
        (req.body as { data?: unknown }).data,
      );
    } catch (_) {
      res.status(400).send({ error: 'Invalid data' });
      return;
    }

    const householdData: Omit<Household, '_id'> = {
      ...householdRequestData,
      owner: req.user!._id,
      members: [],
      rooms: [
        {
          name: 'default',
          type: 'other',
          _id: new ObjectId(),
          floor: 1,
        },
      ],
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
    const createdHousehold = await hs.createHousehold(householdData);

    // validate and sanitize response
    let sanitizedHousehold;
    try {
      sanitizedHousehold = householdSchema.parse(createdHousehold);
    } catch (_) {
      res.status(500).send({ error: 'Failed to create household' });
      return;
    }

    res.status(201).send(sanitizedHousehold);
    const household = await hs.createHousehold(householdData);
    res.status(201).send(household);
  }

  public static async getHousehold(req: AuthenticatedRequest, res: Response) {
    try {
      // validate id
      const id = req.params.id;

      try {
        objectIdOrStringSchema.parse(id);
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
      let inviteRequestData;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inviteRequestData = inviteMemberSchema.parse(req.body);
      } catch (_) {
        res.status(400).send({ error: 'Invalid data' });
        return;
      }
      const { householdId, memberId, role, permissions } = req.body;
      const hs = new HouseholdService();
      const updatedHousehold = await hs.inviteMember(
        householdId,
        memberId,
        role,
        permissions,
      );
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).send('An error occurred while sending the invite');
    }
  }

  public static async getUserInvites(req: AuthenticatedRequest, res: Response) {
    try {
      const hs = new HouseholdService();
      const invites = await hs.getUserInvites(req.user?._id ?? '');
      res.status(200).send(invites);
    } catch (e) {
      console.error(e);
      res.status(500).json('An error occurred while fetching invites');
    }
  }

  public static async respondToInvite(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { inviteId, response } = req.body as {
        inviteId: string;
        response: boolean;
      };
      const hs = new HouseholdService();
      const updatedHousehold = await hs.respondToInvite(
        inviteId,
        response,
        req.user!._id,
      );
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).json('An error occurred while responding to the invite');
    }
  }

  //TODO: public static async userPermissions(){}

  public static async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, householdId } = req.body;
      try {
        objectIdOrStringSchema.parse(userId);
        objectIdOrStringSchema.parse(householdId);
      } catch (_) {
        res.status(400).json({ error: 'Invalid data' });
        return;
      }
      const hs = new HouseholdService();
      await hs.removeMember(householdId, userId);

      const blacklist = new TokenService();
      await blacklist.revokeAllTokensImmediately(userId);

      res.status(200).json({ message: 'User removed from household.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'failed to remove member' });
    }
  }

  public static async deleteHousehold(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { householdId } = req.params;
      const hs = new HouseholdService();
      const users = await hs.getHousehold(householdId);

      if (!users) {
        res.status(404).send({ error: 'empty' });
        return;
      }

      for (const user of users.members) {
        const blacklist = new TokenService();
        await blacklist.revokeAllTokensImmediately(user.id!.toString() ?? '');
      }

      await hs.deleteHousehold(householdId);
      res.status(200).json({ message: 'Household deleted.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'failed to delete household' });
    }
  }

  public static async addRoom(req: AuthenticatedRequest, res: Response) {
    try {
      let roomRequestData: RoomRequestData;
      try {
        roomRequestData = roomRequestDataSchema.parse(req.body);
      } catch (_) {
        res.status(400).send({ error: 'Invalid data' });
        return;
      }

      const { householdId } = req.params;
      const hs = new HouseholdService();
      const roomData = { ...roomRequestData, _id: new ObjectId() };
      const updatedHousehold = await hs.addRoom(householdId, roomData);
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).json('An error occurred');
    }
  }

  public static async getHouseholdInfo(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
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
      res.status(500).json('An error occurred');
    }
  }

  public static async changeUserPermissions(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { householdId, memberId, newRole } = req.body as {
        householdId: string;
        memberId: string;
        newRole: HouseholdMember;
      };

      const hs = new HouseholdService();
      const updatedHousehold = await hs.changeUserRole(
        householdId,
        memberId,
        newRole,
        req.user?._id ?? '',
      );
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).json('An error occurred');
    }
  }

  public static async manageRooms(req: AuthenticatedRequest, res: Response) {
    try {
      const { householdId, room, action } = req.body as {
        householdId: string;
        room: HouseholdRoom;
        action: 'add' | 'remove';
      };

      const hs = new HouseholdService();
      const updatedHousehold = await hs.manageRooms(householdId, room, action);
      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).json('An error occurred');
    }
  }
  public static async removeRoom(req: AuthenticatedRequest, res: Response) {
    try {
      const { householdId, roomId } = req.body as {
        householdId: string;
        roomId: string;
      };

      const hs = new HouseholdService();
      const updatedHousehold = await hs.removeRoom(householdId, roomId);

      res.status(200).send(updatedHousehold);
    } catch (e) {
      console.error(e);
      res.status(500).json('An error occurred');
    }
  }
}
