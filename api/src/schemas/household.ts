import { z } from 'zod';
import {
  objectIdOrStringSchema,
  objectIdSchema,
  objectIdStringSchema,
} from './obj-id';

export const coordinatesSchema = z.object({
  lat: z.number().min(-89).max(90),
  long: z.number().min(-180).max(180),
});

export type Coordinates = z.infer<typeof coordinatesSchema>;

export const householdRoleSchema = z.enum(['owner', 'admin', 'dweller']);

export type HouseholdRole = z.infer<typeof householdRoleSchema>;

export const householdMemberSchema = z.object({
  id: objectIdOrStringSchema.optional(),
  role: householdRoleSchema,
});

export type HouseholdMember = z.infer<typeof householdMemberSchema>;

export const householdRequestDataSchema = z.object({
  name: z.string(),
  coordinates: coordinatesSchema.optional(),
});

export type HouseholdRequestData = z.infer<typeof householdRequestDataSchema>;

export const householdSchema = householdRequestDataSchema.extend({
  _id: objectIdOrStringSchema.optional(),
  owner: objectIdOrStringSchema,
  members: z.array(householdMemberSchema),
  //devices:
});

export type Household = z.infer<typeof householdSchema>;
