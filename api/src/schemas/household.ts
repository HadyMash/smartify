import { z } from 'zod';
import { objectIdOrStringSchema } from './obj-id';
import { ObjectId } from 'mongodb';

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

/** Household member schema */
export const memberSchema = z
  .object({
    /** Member's User ID */
    id: objectIdOrStringSchema.optional(),
    /** Member's role */
    role: memberRoleSchema,
    /**
     * Member's permissions.
     *
     * This is only required if the user is a dweller
     */
    permissions: memberPermissionsSchema.optional(),
  })
  .refine(
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
  _id: z.instanceof(ObjectId).refine((id) => ObjectId.isValid(id), {
    message: 'Input not instance of ObjectId',
  }),
  /** Room name */
  name: z.string(),
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
  // TODO: add rooms

  /** Household's rooms */
  //rooms: z.array(householdRoomSchema),
});

export const inviteSchema = z
  .object({
    _id: objectIdOrStringSchema.optional(),
    userId: objectIdOrStringSchema,
    role: memberRoleSchema,
    permissions: memberPermissionsSchema.optional(),
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

export type Invite = z.infer<typeof inviteSchema>;

export type HouseholdRequestData = z.infer<
  typeof householdCreateRequestDataSchema
>;

export const householdSchema = householdCreateRequestDataSchema.extend({
  _id: objectIdOrStringSchema.optional(),
  owner: objectIdOrStringSchema,
  members: z.array(memberSchema),
  invites: z.array(inviteSchema).optional(),
  rooms: z.array(householdRoomSchema).nonempty(),
  //roomAdjacencyList: z.record(z.string(), z.array(z.string())).optional(),
});

export type Household = z.infer<typeof householdSchema>;

export const roomRequestDataSchema = z.object({
  type: householdRoomTypeSchema,
  name: z.string(),
  floor: z.number(),
});
export type RoomRequestData = z.infer<typeof roomRequestDataSchema>;

export const inviteMemberSchema = z.object({
  householdId: z.string(),
  memberId: z.string(),
  role: z.string(),
  permissions: z.array(z.string()),
});
export type InviteMember = z.infer<typeof inviteMemberSchema>;
