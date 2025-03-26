import { z } from 'zod';
import { objectIdOrStringSchema } from './obj-id';
import { randomUUID } from 'crypto';
import { emailSchema } from './auth/auth';
import { deviceSchema, deviceSourceSchema } from './devices';
import { validateRooms } from '../util';

/**
 * Coordinates using longitude and latitude
 */
export const coordinatesSchema = z.object({
  /** Latitude */
  lat: z.number().min(-89).max(90),
  /** Longitude */
  long: z.number().min(-180).max(180),
});

/** Coordinates in the format [latitude, longitude] */
export type Coordinates = z.infer<typeof coordinatesSchema>;

/**
 * The role of a household member.
 * - owner: The owner of the household. Can do anything
 * - admin: Has elevated permissions.
 * - dweller: A regular member of the household.
 */
export const memberRoleSchema = z.enum(['owner', 'admin', 'dweller']);

/**
 * The role of a household member.
 * - owner: The owner of the household. Can do anything
 * - admin: Has elevated permissions.
 * - dweller: A regular member of the household.
 */
export type MemberRole = z.infer<typeof memberRoleSchema>;

// TODO: update the permissions to allow for more granular control such as
// setting permissions per room or per device (or exceptions at that level as well)

/**
 * A household dweller's permissions
 */
export const memberPermissionsSchema = z
  .object({
    // TODO : add per device permissions

    /** Whether the user permissions to view and control appliances */
    appliances: z.boolean(),
    /**
     * Whether the user has permissions to view other member's health devices.
     * It's important to note that users can always view their own health devices
     */
    health: z.boolean(),
    /** Whether the user has permissions to view and control security devices */
    security: z.boolean(),
    /** Whether the user has permissions to view and control energy devices */
    energy: z.boolean(),
  })
  .strict();

/** A household dweller's permissions */
export type MemberPermissions = z.infer<typeof memberPermissionsSchema>;

const _memberSchema = z.object({
  /** Member's User ID */
  id: objectIdOrStringSchema,
  /** Member's role */
  role: memberRoleSchema,
  /**
   * Member's permissions.
   *
   * This is only required if the user is a dweller
   */
  permissions: memberPermissionsSchema.optional(),
});

/** Household member schema */
export const memberSchema = _memberSchema.refine(
  ({ role, permissions }) => {
    if (role === 'dweller') {
      return !!permissions;
    }
    return true;
  },
  {
    path: ['permissions'],
    message: 'Permissions are required for dwellers',
  },
);

export type Member = z.infer<typeof memberSchema>;

// TODO: add more room types
export const householdRoomTypeSchema = z.enum([
  'living',
  'kitchen',
  'bathroom',
  'bedroom',
  'other',
]);

/** Household room schema */
export const householdRoomSchema = z.object({
  id: z.string(),
  /** Room name */
  name: z
    .string()
    .min(1, { message: 'Room name cannot be empty' }) // Prevent empty strings
    .trim(),
  /** Room type */
  type: householdRoomTypeSchema,
  /** Room floor */
  floor: z.number().int(),
  /**
   * Rooms connected to this room. This is used for laying out rooms in the app
   */
  connectedRooms: z.object({
    top: z.string().optional(),
    bottom: z.string().optional(),
    left: z.string().optional(),
    right: z.string().optional(),
  }),
});
export type HouseholdRoom = z.infer<typeof householdRoomSchema>;

export type HouseholdMember = z.infer<typeof memberSchema>;

export const householdCreateRequestDataSchema = z.object({
  /** Household name */
  name: z.string(),
  /** Household long and lat coordinates */
  coordinates: coordinatesSchema.optional(),
  /** Number of floors */
  floors: z.number().int().min(1),
  /**
   * Floors offset, for example if there's a basement then the offset would be
   * -1. If there are multiple basements then the offset would be -2, etc.
   * or if the first floor is above ground and so on.
   */
  floorsOffset: z.number().int().default(0),
  /** Household's rooms */
  rooms: z.array(householdRoomSchema).min(1),
});

export const householdInviteSchema = _memberSchema
  .extend({
    inviteId: objectIdOrStringSchema,
  })
  .refine(
    ({ role, permissions }) => {
      if (role === 'dweller' && !permissions) {
        return false;
      }
      return true;
    },
    {
      path: ['permissions'],
      message: 'Permissions are required for dweller role',
    },
  );

export type HouseholdInvite = z.infer<typeof householdInviteSchema>;

export const uiHouseholdInvite = z.object({
  inviteId: objectIdOrStringSchema,
  householdName: z.string().optional(),
  ownerName: z.string().optional(),
});

export type UIHouseholdInvite = z.infer<typeof uiHouseholdInvite>;

export type HouseholdRequestData = z.infer<
  typeof householdCreateRequestDataSchema
>;

export const householdDeviceSchema = deviceSchema.extend({
  /** The room the device is assigned to */
  roomId: z.string(),
});

export type HouseholdDevice = z.infer<typeof householdDeviceSchema>;

const defaultRoom: HouseholdRoom = {
  id: randomUUID(),
  type: 'living',
  floor: 0,
  name: 'Living Room',
  connectedRooms: {},
};

const _householdSchema = householdCreateRequestDataSchema.extend({
  _id: objectIdOrStringSchema.optional(),
  owner: objectIdOrStringSchema,
  members: z.array(memberSchema),
  invites: z.array(householdInviteSchema),
  rooms: z.array(householdRoomSchema).default([defaultRoom]),
  floors: z.number().int().min(1).max(500),
  floorsOffset: z.number().int().optional(),
  devices: z.array(householdDeviceSchema).default([]),
});

export const householdSchema = _householdSchema.superRefine((data, ctx) => {
  // room configuration
  if (!validateRooms(data.rooms)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid room configuration',
      path: ['rooms'],
      fatal: true,
    });
  }

  const roomMap = new Map<string, HouseholdRoom>();

  data.rooms.forEach((room) => {
    roomMap.set(room.id, room);
    if (room.floor < 0 || room.floor >= data.floors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid room floor',
        path: ['rooms', room.id],
        fatal: true,
      });
    }
  });

  // check devices
  for (const device of data.devices) {
    if (!roomMap.has(device.roomId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Device is assigned to a non-existent room',
        fatal: true,
        path: ['devices', device.id],
      });
    }
  }
});

export type Household = z.infer<typeof householdSchema>;

export const householdInfoSchema = _householdSchema
  .pick({
    _id: true,
    name: true,
    owner: true,
    floors: true,
    coordinates: true,
  })
  .extend({
    /** The number of members in the household */
    members: z.number().int(),
  });

export type HouseholdInfo = z.infer<typeof householdInfoSchema>;

export const uiMemberSchema = z.object({
  id: objectIdOrStringSchema,
  name: z.string().nonempty(),
  role: memberRoleSchema,
  permissions: memberPermissionsSchema.optional(),
});

export type UIMember = z.infer<typeof uiMemberSchema>;

export const uiInvitedMember = uiMemberSchema.extend({
  inviteId: objectIdOrStringSchema,
});

export type UIInvitedMember = z.infer<typeof uiInvitedMember>;

export const uiHouseholdSchema = _householdSchema.extend({
  members: z.array(uiMemberSchema).optional(),
  invites: z.array(uiInvitedMember).optional(),
});

export type UIHousehold = z.infer<typeof uiHouseholdSchema>;

export function householdToInfo(h: Household) {
  const x: HouseholdInfo = {
    _id: h._id,
    name: h.name,
    owner: h.owner,
    floors: h.floors,
    members: h.members.length,
  };

  return householdInfoSchema.parse({ x });
}

export const roomRequestDataSchema = z.object({
  rooms: z.array(householdRoomSchema).min(1),
});
export type RoomRequestData = z.infer<typeof roomRequestDataSchema>;

const _invMemberSchema = z.object({
  householdId: objectIdOrStringSchema,
  memberId: objectIdOrStringSchema,
  email: emailSchema,
  role: memberRoleSchema,
  permissions: memberPermissionsSchema.optional(),
});

export const inviteMemberSchema = _invMemberSchema
  .omit({
    memberId: true,
    householdId: true,
  })
  .refine(
    ({ role, permissions }) => {
      if (role === 'dweller' && !permissions) {
        return false;
      }
      return true;
    },
    {
      path: ['permissions'],
      message: 'Permissions are required for dweller role',
    },
  );
export type InviteMember = z.infer<typeof inviteMemberSchema>;

export const modifyMemberSchema = _invMemberSchema
  .omit({
    householdId: true,
    email: true,
  })
  .refine(
    ({ role, permissions }) => {
      if (role === 'dweller' && !permissions) {
        return false;
      }
      return true;
    },
    {
      path: ['permissions'],
      message: 'Permissions are required for dweller role',
    },
  );

export type ModifyMember = z.infer<typeof modifyMemberSchema>;

export const respondToInviteDataSchema = z.object({
  inviteId: objectIdOrStringSchema,
  response: z.boolean(),
});

export const transferSchema = z.object({
  newOwnerId: objectIdOrStringSchema,
});

export const pairDeviceSchema = z.object({
  devices: z.array(
    z.object({
      id: z.string().nonempty(),
      source: deviceSourceSchema,
      roomId: z.string().nonempty(),
    }),
  ),
});

/* Error types */

export enum InvalidHouseholdType {
  DOES_NOT_EXIST,
  INVALID_ID,
}

export class InvalidHouseholdError extends Error {
  public readonly type: InvalidHouseholdType;
  constructor(type: InvalidHouseholdType, message?: string) {
    super(
      `Invalid Household${message ? `: ${message}` : type === InvalidHouseholdType.INVALID_ID ? 'Invalid household Id' : 'Household does not exist'}`,
    );
    this.name = 'InvalidHouseholdError';
    this.type = type;
    Object.setPrototypeOf(this, InvalidHouseholdError.prototype);
  }
}

export class MissingPermissionsError extends Error {
  constructor() {
    super('Household member permissions are missing');
    this.name = 'MissingPermissionsError';
    Object.setPrototypeOf(this, MissingPermissionsError.prototype);
  }
}

export class AlreadyMemberError extends Error {
  constructor() {
    super('User is already a member of the household');
    this.name = 'AlreadyMemberError';
    Object.setPrototypeOf(this, AlreadyMemberError.prototype);
  }
}

export class AlreadyInvitedError extends Error {
  constructor() {
    super('User is already invited to the household');
    this.name = 'AlreadyInvitedError';
    Object.setPrototypeOf(this, AlreadyInvitedError.prototype);
  }
}

export class InvalidInviteError extends Error {
  constructor() {
    super('Invalid invite');
    this.name = 'InvalidInvite';
    Object.setPrototypeOf(this, InvalidInviteError.prototype);
  }
}

export class InvalidRoomsError extends Error {
  constructor() {
    super('Invalid rooms');
    this.name = 'InvalidRoomsError';
    Object.setPrototypeOf(this, InvalidRoomsError.prototype);
  }
}

export class DeviceAlreadyPairedError extends Error {
  constructor() {
    super('Device is already paired to another household');
    this.name = 'DeviceAlreadyPairError';
    Object.setPrototypeOf(this, DeviceAlreadyPairedError.prototype);
  }
}
