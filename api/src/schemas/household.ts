import { z } from 'zod';
import { objectIdOrStringSchema } from './obj-id';

export const coordinatesSchema = z.object({
  /** Latitude */
  lat: z.number().min(-89).max(90),
  /** Longitude */
  long: z.number().min(-180).max(180),
});

/** Coordinates in the format [latitude, longitude] */
export type Coordinates = z.infer<typeof coordinatesSchema>;

export const memberRoleSchema = z.enum(['owner', 'admin', 'dweller']);

export type MemberRole = z.infer<typeof memberRoleSchema>;

export const memberPermissionsSchema = z.object({});

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
      return role === memberRoleSchema.enum.dweller && !permissions;
    },
    () => ({
      path: ['permissions'],
      message: 'Permissions are required for dwellers',
    }),
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

export type HouseholdMember = z.infer<typeof memberSchema>;

export const householdRequestDataSchema = z.object({
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

export type HouseholdRequestData = z.infer<typeof householdRequestDataSchema>;

export const householdSchema = householdRequestDataSchema.extend({
  _id: objectIdOrStringSchema.optional(),
  owner: objectIdOrStringSchema,
  members: z.array(memberSchema),
  //devices:
});

export type Household = z.infer<typeof householdSchema>;
