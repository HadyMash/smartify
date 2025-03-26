import { Response } from 'express';
import {
  Household,
  roomRequestDataSchema,
  householdCreateRequestDataSchema,
  householdSchema,
  inviteMemberSchema,
  respondToInviteDataSchema,
  InvalidHouseholdError,
  InvalidHouseholdType,
  AlreadyMemberError,
  AlreadyInvitedError,
  MissingPermissionsError,
  modifyMemberSchema,
  memberRoleSchema,
  InvalidInviteError,
  transferSchema,
  InvalidRoomsError,
  uiHouseholdSchema,
  householdInviteSchema,
  DeviceAlreadyPairedError,
  pairDevicesSchema,
  HouseholdDevice,
  unpairDevicesSchema,
  changeDeviceRoomsData,
} from '../schemas/household';
import { HouseholdService } from '../services/household';
import { TokenService } from '../services/auth/token';
import {
  objectIdOrStringSchema,
  objectIdStringSchema,
} from '../schemas/obj-id';
import { AuthenticatedRequest } from '../schemas/auth/auth';
import { tryAPIController } from '../util/controller';
import { validateSchema } from '../util/schema';
import { InvalidUserError, InvalidUserType } from '../schemas/auth/user';
import { AuthController } from './auth';
import { BaseIotAdapter } from '../services/iot/base-adapter';
import {
  BadRequestToDeviceError,
  DeviceNotFoundError,
  DeviceOfflineError,
  DeviceSource,
  ExternalServerError,
  InvalidAPIKeyError,
  MissingAPIKeyError,
} from '../schemas/devices';
import { getAdapter } from '../util/adapter';
import { log } from '../util/log';

export class HouseholdController {
  public static createHousehold(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      // get data from body
      const householdRequestData = validateSchema(
        res,
        householdCreateRequestDataSchema,
        req.body,
      );
      if (!householdRequestData) {
        return;
      }

      const householdData: Omit<Household, '_id'> = {
        ...householdRequestData,
        owner: req.user!._id,
        members: [],
        invites: [],
      };

      const d = validateSchema(res, householdSchema, householdData);
      if (!d) {
        log.debug('data invalid');
        return;
      }

      // create household
      const hs = new HouseholdService();
      const createdHousehold = await hs.createHousehold(householdData);

      try {
        const uiHousehold = await hs.transformToUIHousehold(
          createdHousehold,
          true,
        );
        if (!uiHousehold) {
          res.status(500).send({ error: 'Failed to create household' });
          return;
        }
        res.status(201).send(uiHousehold);
        return;
      } catch (_) {
        res.status(500).send({ error: 'Failed to create household' });
        return;
      }
    });
  }

  public static getHousehold(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        // validate id
        const id = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!id) {
          return;
        }

        // check user is a household member
        if (!(id.toString() in req.user!.households)) {
          res
            .status(403)
            .send({ error: "You don't have access to this household" });
          return;
        }

        // get household
        const hs = new HouseholdService();
        const isPrivileged =
          req.user!.households[id.toString()].role ===
            memberRoleSchema.enum.admin ||
          req.user!.households[id.toString()].role ===
            memberRoleSchema.enum.owner;
        const household = await hs.getUIHousehold(id, isPrivileged);

        if (!household) {
          res.status(404).send({ error: 'Not found' });
          return;
        }

        res.status(200).send(uiHouseholdSchema.parse(household));
        return;
      },
      (e) => {
        if (
          e instanceof InvalidHouseholdError &&
          e.type === InvalidHouseholdType.DOES_NOT_EXIST
        ) {
          res.status(404).send({ error: 'Household not found' });
          return true;
        }
        return false;
      },
    );
  }

  public static inviteMember(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const data = validateSchema(res, inviteMemberSchema, req.body);

        if (!data) {
          return;
        }

        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );
        if (!householdId) {
          return;
        }

        // get perms
        const perms = req.user!.households[householdId.toString()];
        // check user is an owner or admin
        if (
          !(
            [
              memberRoleSchema.enum.owner,
              memberRoleSchema.enum.admin,
            ] as string[]
          ).includes(perms.role as string)
        ) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const hs = new HouseholdService();
        const invite = await hs.inviteMember(
          householdId,
          {
            role: data.role,
            permissions: data.permissions,
          },
          data.email,
        );
        res.status(200).send(householdInviteSchema.parse(invite));
        return;
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof InvalidUserError) {
          if (e.type === InvalidUserType.DOES_NOT_EXIST) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            log.debug('Faking invite sent to:', req.body.email);
            res.status(200).send();
            return true;
          } else {
            res.status(400).send({ error: 'Invalid request' });
            return true;
          }
        }
        if (e instanceof AlreadyInvitedError) {
          res.status(409).send({ error: 'User is already invited' });
          return true;
        }
        return false;
      },
    );
  }

  public static getUserInvites(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      const hs = new HouseholdService();
      const invites = await hs.getUserInvites(req.user!._id);
      res.status(200).send(invites);
    });
  }

  public static respondToInvite(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const data = validateSchema(res, respondToInviteDataSchema, req.body);
        if (!data) {
          return;
        }
        const hs = new HouseholdService();

        const inv = await hs.getInvite(data.inviteId);

        if (!inv) {
          res.status(404).send({ error: 'Invite not found' });
          return;
        }

        if (inv.id.toString() !== req.user!._id.toString()) {
          // Don't tell the user another user was invited for privacy/security
          // reasons
          res.status(400).send({ error: 'Invalid invite' });
          return;
        }

        const updatedHousehold = await hs.respondToInvite(
          data.inviteId,
          data.response,
        );

        const isPrivileged =
          inv.role === memberRoleSchema.enum.admin ||
          inv.role === memberRoleSchema.enum.owner;

        const uiHousehold = await hs.transformToUIHousehold(
          updatedHousehold,
          isPrivileged,
        );

        // update the user's tokens
        try {
          const ts = new TokenService();
          const { refreshToken, accessToken, idToken } = await ts.refreshTokens(
            req.refreshToken!,
            req.deviceId!,
          );
          AuthController.writeAuthCookies(
            res,
            accessToken,
            refreshToken,
            idToken,
          );
        } catch (e) {
          log.error('Failed to revoke tokens:', e);
        }

        res.status(200).send(uiHousehold);
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof AlreadyMemberError) {
          res.status(409).send({ error: 'User is already a member' });
          return true;
        }
        if (e instanceof InvalidUserError) {
          log.error('invalid system generated user id:', e);
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof InvalidInviteError) {
          res.status(400).send({ error: 'Invalid invite' });
          return true;
        }
        return false;
      },
    );
  }

  public static removeMember(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const userId = validateSchema(
          res,
          objectIdStringSchema,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          req.body.userId,
        );
        if (!userId) {
          return;
        }

        const householdId = validateSchema(
          res,
          objectIdStringSchema,
          req.params.householdId,
        );
        if (!householdId) {
          return;
        }

        if (!(householdId.toString() in req.user!.households)) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const perms = req.user!.households[householdId.toString()];
        if (
          perms.role !== memberRoleSchema.enum.owner &&
          perms.role !== memberRoleSchema.enum.admin
        ) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const hs = new HouseholdService();
        const household = await hs.removeMember(householdId, userId);

        res.status(200).send(await hs.transformToUIHousehold(household, true));

        try {
          const ts = new TokenService();
          await ts.revokeAccessTokens(userId);
        } catch (e) {
          log.error('Failed to revoke tokens:', e);
        }
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        return false;
      },
    );
  }

  public static deleteHousehold(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        if (!(householdId.toString() in req.user!.households)) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const hs = new HouseholdService();
        const household = await hs.getHousehold(householdId);

        if (!household) {
          res.status(404).send({ error: 'Household not found' });
          return;
        }

        // check user is the owner of the household and can delete it
        if (household.owner.toString() !== req.user!._id.toString()) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        await hs.deleteHousehold(householdId);

        const ts = new TokenService();
        // update this user's tokens
        try {
          await ts.revokeAccessTokens(req.user!._id);
          // generate new tokens
          const { refreshToken, accessToken, idToken } = await ts.refreshTokens(
            req.refreshToken!,
            req.deviceId!,
          );

          AuthController.writeAuthCookies(
            res,
            accessToken,
            refreshToken,
            idToken,
          );
        } catch (e) {
          log.error('Failed to revoke tokens:', e);
        }

        res.status(200).json({ message: 'Household deleted' });

        try {
          const promises = [];

          for (const user of household.members) {
            promises.push(ts.revokeAccessTokens(user.id));
          }

          await Promise.all(promises);
        } catch (e) {
          log.error('Failed to revoke tokens:', e);
        }
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        return false;
      },
    );
  }

  public static updateRooms(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const data = validateSchema(res, roomRequestDataSchema, req.body);
        if (!data) {
          return;
        }

        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        const hs = new HouseholdService();
        const updatedHousehold = await hs.updateRooms(householdId, data.rooms);

        res
          .status(200)
          .send(await hs.transformToUIHousehold(updatedHousehold, true));
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof InvalidRoomsError) {
          res.status(400).send({ error: 'Invalid rooms' });
          return true;
        }
        return false;
      },
    );
  }

  public static getHouseholdInfo(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      const householdId = validateSchema(
        res,
        objectIdOrStringSchema,
        req.params.householdId,
      );
      if (!householdId) {
        return;
      }

      const hs = new HouseholdService();
      const household = await hs.getHouseholdInfo(householdId);

      if (!household) {
        res.status(404).send({ error: 'Household not found' });
        return;
      }

      res.status(200).send({ household });
    });
  }

  public static getUserHouseholds(req: AuthenticatedRequest, res: Response) {
    tryAPIController(res, async () => {
      const hs = new HouseholdService();
      const households = await hs.getUserHouseholds(req.user!._id);
      res.status(200).send(households);
    });
  }

  public static changeUserPermissions(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    tryAPIController(
      res,
      async () => {
        const data = validateSchema(res, modifyMemberSchema, req.body);

        if (!data) {
          return;
        }

        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        // check if user has the permissions to change permissions
        const perms = req.user!.households[householdId.toString()];
        if (perms.role === memberRoleSchema.enum.dweller) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const hs = new HouseholdService();
        const updatedHousehold = await hs.changeUserRole(
          householdId,
          data.memberId,
          data.role,
          data.permissions,
        );
        if (!updatedHousehold) {
          res.status(500).send({ error: 'Failed to update household' });
          return;
        }
        res
          .status(200)
          .send(await hs.transformToUIHousehold(updatedHousehold, true));
      },
      (e) => {
        if (e instanceof MissingPermissionsError) {
          res
            .status(400)
            .send({ error: 'Permissions are required for dwellers' });
        }
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof InvalidUserError) {
          if (e.type === InvalidUserType.INVALID_ID) {
            log.error('invalid system generated user id:', e);
            res.status(500).send({ error: 'Internal Server Error' });
            return true;
          } else if (e.type === InvalidUserType.DOES_NOT_EXIST) {
            res.status(400).send({ error: 'User does not exist' });
            return true;
          } else if (e.type === InvalidUserType.INVALID_EMAIL) {
            res.status(400).send({ error: 'Invalid email address' });
            return true;
          }
        }
        return false;
      },
    );
  }

  public static leaveHousehold(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        const hs = new HouseholdService();

        // check if user is already a member
        const household = await hs.getHousehold(householdId);
        if (!household) {
          res.status(404).send({ error: 'Household not found' });
          return;
        }

        if (!household.members.find((m) => m.id === req.user!._id)) {
          res
            .status(400)
            .send({ error: 'User is not a member of the household' });
          return;
        }

        await hs.removeMember(householdId, req.user!._id);

        // update tokens
        try {
          const ts = new TokenService();
          await ts.revokeAccessTokens(req.user!._id);

          // update the user's tokens
          const { refreshToken, accessToken, idToken } = await ts.refreshTokens(
            req.refreshToken!,
            req.deviceId!,
          );

          AuthController.writeAuthCookies(
            res,
            accessToken,
            refreshToken,
            idToken,
          );
        } catch (e) {
          log.error('Failed to revoke tokens:', e);
        }

        res.status(200).send({ message: 'Left household' });
      },

      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }

        if (e instanceof InvalidUserError) {
          if (e.type === InvalidUserType.INVALID_ID) {
            log.error('invalid system generated user id:', e);
            res.status(500).send({ error: 'Internal Server Error' });
            return true;
          } else if (e.type === InvalidUserType.DOES_NOT_EXIST) {
            res.status(400).send({ error: 'User does not exist' });
            return true;
          } else if (e.type === InvalidUserType.INVALID_EMAIL) {
            res.status(400).send({ error: 'Invalid email address' });
            return true;
          }
        }
        return false;
      },
    );
  }

  public static transferOwnership(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const data = validateSchema(res, transferSchema, req.body);

        if (!data) {
          return;
        }

        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        // check request is from owner
        if (!(householdId.toString() in req.user!.households)) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }
        if (
          req.user!.households[householdId.toString()].role !==
          memberRoleSchema.enum.owner
        ) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const hs = new HouseholdService();
        // get the household
        const h = await hs.getHousehold(householdId);

        if (!h) {
          res.status(404).send({ error: 'Household not found' });
          return;
        }

        // check the new owner is a member
        if (
          !h.members.find((m) => m.id.toString() === data.newOwnerId.toString())
        ) {
          res.status(400).send({ error: 'New owner is not a member' });
          return;
        }

        // transfer ownership
        const updatedHousehold = await hs.transferOwnership(
          householdId,
          data.newOwnerId,
        );

        const ts = new TokenService();
        // update current user's tokens, revoke the new owner's access tokens
        try {
          // revoke current user's tokens
          await ts.revokeAccessTokens(req.user!._id);

          // generate new tokens
          const { refreshToken, accessToken, idToken } = await ts.refreshTokens(
            req.refreshToken!,
            req.deviceId!,
          );
          AuthController.writeAuthCookies(
            res,
            accessToken,
            refreshToken,
            idToken,
          );
        } catch (e) {
          log.error('Failed to revoke tokens:', e);
        }

        res.status(200).send(updatedHousehold);

        try {
          await ts.revokeAccessTokens(data.newOwnerId);
        } catch (e) {
          log.error('Failed to revoke tokens:', e);
        }
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof InvalidUserError) {
          if (e.type === InvalidUserType.INVALID_ID) {
            log.error('invalid system generated user id:', e);
            res.status(500).send({ error: 'Internal Server Error' });
            return true;
          } else if (e.type === InvalidUserType.DOES_NOT_EXIST) {
            res.status(400).send({ error: 'Not a household member' });
            return true;
          } else if (e.type === InvalidUserType.INVALID_EMAIL) {
            res.status(400).send({ error: 'Invalid email address' });
            return true;
          }
        }
        return false;
      },
    );
  }

  public static pairDevices(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        const data = validateSchema(res, pairDevicesSchema, req.body);

        if (!data) {
          return;
        }

        // check the user has permission to add devices (owner or admin)
        if (!(householdId.toString() in req.user!.households)) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }
        if (
          !(
            [
              memberRoleSchema.enum.owner,
              memberRoleSchema.enum.admin,
            ] as string[]
          ).includes(req.user!.households[householdId.toString()].role)
        ) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const devicesBySource = new Map<DeviceSource, string[]>();

        for (const device of data.devices) {
          if (!devicesBySource.has(device.source)) {
            devicesBySource.set(device.source, []);
          }
          devicesBySource.get(device.source)!.push(device.id);
        }

        const mappedDevices: HouseholdDevice[] = [];
        for (const source of devicesBySource.keys()) {
          const adapter: BaseIotAdapter = getAdapter(source);

          // pair
          await adapter.pairDevices(devicesBySource.get(source)!);

          // get the devices
          const devs = await adapter.getDevices(devicesBySource.get(source)!);
          if (!devs) {
            res.status(400).send({ error: 'Failed to pair devices' });
            return;
          }

          const ds: HouseholdDevice[] = [];
          for (const d of devs) {
            ds.push({
              ...d,
              roomId: data.devices.find((dd) => dd.id === d.id)!.roomId,
            });
          }

          mappedDevices.push(...ds);
        }

        // pair with the household
        const hs = new HouseholdService();
        await hs.pairDevicesToHousehold(householdId, mappedDevices);

        // get updated household devices
        const devices = await hs.getHouseholdDevices(householdId);

        if (!devices) {
          res.status(500).send({ error: 'Failed to pair devices' });
          return;
        }

        res.status(200).send({ devices: devices });
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof DeviceAlreadyPairedError) {
          res.status(409).send({ error: 'Device already paired' });
          return true;
        }
        if (e instanceof MissingAPIKeyError) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof InvalidAPIKeyError) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof ExternalServerError) {
          res.status(502).send({ error: 'External Server Error' });
          return true;
        }
        if (e instanceof BadRequestToDeviceError) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof DeviceNotFoundError) {
          res.status(404).send({ error: 'Device not found' });
          return true;
        }
        if (e instanceof DeviceOfflineError) {
          res.status(503).send({ error: 'Device offline' });
          return true;
        }
        return false;
      },
    );
  }

  public static unpairDevices(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        const data = validateSchema(res, unpairDevicesSchema, req.body);

        if (!data) {
          return;
        }

        // check the user has permission to add devices (owner or admin)
        if (!(householdId.toString() in req.user!.households)) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }
        if (
          !(
            [
              memberRoleSchema.enum.owner,
              memberRoleSchema.enum.admin,
            ] as string[]
          ).includes(req.user!.households[householdId.toString()].role)
        ) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        // get household
        const hs = new HouseholdService();
        const householdDevices = await hs.getHouseholdDevices(householdId);

        const devicesBySource = new Map<DeviceSource, string[]>();

        for (const deviceId of data.devices) {
          const source = householdDevices.find(
            (d) => d._id === deviceId,
          )?.source;

          if (!source) {
            continue;
          }

          if (!devicesBySource.has(source)) {
            devicesBySource.set(source, []);
          }
          devicesBySource.get(source)!.push(deviceId);
        }

        // remove devices from household first
        await hs.unpairDeviceFromHousehold(householdId, data.devices);

        // return, then unpair from the adapter
        try {
          // get updated devices
          res
            .status(200)
            .send({ devices: await hs.getHouseholdDevices(householdId) });
        } catch (e) {
          log.error('Failed to map household:', e);
          res
            .status(500)
            .send({ error: 'Unpaired devices but failed to return household' });
        }

        for (const source of devicesBySource.keys()) {
          try {
            const adapter: BaseIotAdapter = getAdapter(source);
            // unpair
            await adapter.unpairDevices(devicesBySource.get(source)!);
          } catch (e) {
            log.error(`Failed to unpair ${source} devices:`, e);
          }
        }
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof DeviceAlreadyPairedError) {
          res.status(409).send({ error: 'Device already paired' });
          return true;
        }
        if (e instanceof MissingAPIKeyError) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof InvalidAPIKeyError) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof ExternalServerError) {
          res.status(502).send({ error: 'External Server Error' });
          return true;
        }
        if (e instanceof BadRequestToDeviceError) {
          res.status(500).send({ error: 'Internal Server Error' });
          return true;
        }
        if (e instanceof DeviceNotFoundError) {
          res.status(404).send({ error: 'Device not found' });
          return true;
        }
        if (e instanceof DeviceOfflineError) {
          res.status(503).send({ error: 'Device offline' });
          return true;
        }
        return false;
      },
    );
  }

  public static changeDeviceRooms(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        // check user has permissions to change device rooms
        if (!(householdId.toString() in req.user!.households)) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }
        if (
          !(
            [
              memberRoleSchema.enum.owner,
              memberRoleSchema.enum.admin,
            ] as string[]
          ).includes(req.user!.households[householdId.toString()].role)
        ) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        const data = validateSchema(res, changeDeviceRoomsData, req.body);

        if (!data) {
          return;
        }

        // get household
        const hs = new HouseholdService();

        // update the rooms
        await hs.changeDeviceRooms(householdId, data.deviceIds, data.roomId);

        // return updated devices
        const devices = await hs.getHouseholdDevices(householdId);

        res.status(200).send({ devices });
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        if (e instanceof DeviceNotFoundError) {
          res.status(404).send({ error: 'Device not found' });
          return true;
        }
        return false;
      },
    );
  }

  public static getHouseholdDevices(req: AuthenticatedRequest, res: Response) {
    tryAPIController(
      res,
      async () => {
        const householdId = validateSchema(
          res,
          objectIdOrStringSchema,
          req.params.householdId,
        );

        if (!householdId) {
          return;
        }

        // Check if user has access to this household
        if (!(householdId.toString() in req.user!.households)) {
          res.status(403).send({ error: 'Permission denied' });
          return;
        }

        // Get household devices
        const hs = new HouseholdService();
        const devices = await hs.getHouseholdDevices(householdId);

        if (!devices) {
          res.status(404).send({ error: 'No devices found' });
          return;
        }

        res.status(200).send({ devices });
      },
      (e) => {
        if (e instanceof InvalidHouseholdError) {
          if (e.type === InvalidHouseholdType.DOES_NOT_EXIST) {
            res.status(404).send({ error: 'Household not found' });
            return true;
          } else {
            res.status(400).send({ error: 'Invalid household id' });
            return true;
          }
        }
        return false;
      },
    );
  }
}
