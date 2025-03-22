import { z } from 'zod';
import { objectIdOrStringSchema } from './obj-id';
import { randomUUID } from 'crypto';

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
    .trim()
    .regex(/^[a-zA-Z0-9\s]+$/, {
      message: 'Room name must contain only letters, numbers, and spaces',
    }),
  /** Room type */
  type: householdRoomTypeSchema,
  /** Room floor */
  floor: z.number().int(),
  /**
   * Rooms connected to this room. This is used for laying out rooms in the app
   */
  // connectedRooms:
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
  floorsOffset: z.number().int().optional(),
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

export type HouseholdRequestData = z.infer<
  typeof householdCreateRequestDataSchema
>;

const defaultRoom: HouseholdRoom = {
  id: randomUUID(),
  type: 'living',
  floor: 0,
  name: 'Living Room',
};

export const householdSchema = householdCreateRequestDataSchema.extend({
  _id: objectIdOrStringSchema.optional(),
  owner: objectIdOrStringSchema,
  members: z.array(memberSchema),
  invites: z.array(householdInviteSchema),
  rooms: z.array(householdRoomSchema).default([defaultRoom]),
  roomAdjacencyList: z
    .array(z.record(objectIdOrStringSchema, z.array(objectIdOrStringSchema)))
    .optional(),
  floors: z.number().int().min(1).max(500),
  floorsOffset: z.number().int().optional(),
});

export type Household = z.infer<typeof householdSchema>;

export const roomRequestDataSchema = z.object({
  rooms: z.array(householdRoomSchema).min(1),
  householdId: objectIdOrStringSchema,
});
export type RoomRequestData = z.infer<typeof roomRequestDataSchema>;

export const inviteMemberSchema = z
  .object({
    householdId: objectIdOrStringSchema,
    memberId: objectIdOrStringSchema,
    role: memberRoleSchema,
    permissions: memberPermissionsSchema.optional(),
  })
  .strict()
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

export const respondToInviteDataSchema = z.object({
  inviteId: objectIdOrStringSchema,
  response: z.boolean(),
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

export class InvalidInvite extends Error {
  constructor() {
    super('Invalid invite');
    this.name = 'InvalidInvite';
    Object.setPrototypeOf(this, InvalidInvite.prototype);
  }
}
