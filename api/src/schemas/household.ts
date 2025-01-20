import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { objectIdSchema } from './obj-id';

export const coordinatesSchema = z.object({
  lat: z.number().min(-89).max(90),
  long: z.number().min(-180).max(180),
});

export type Coordinates = z.infer<typeof coordinatesSchema>;

export const householdRoleSchema = z.enum(['owner', 'admin', 'dweller']);

export type HouseholdRole = z.infer<typeof householdRoleSchema>;

export const householdMemberSchema = z.object({
  id: objectIdSchema,
  role: householdRoleSchema,
});

export type HouseholdMember = z.infer<typeof householdMemberSchema>;

export const householdSchema = z.object({
  _id: objectIdSchema,
  name: z.string(),
  coordinates: coordinatesSchema.optional(),
  owner: objectIdSchema,
  members: z.array(householdMemberSchema),
});

export type Household = z.infer<typeof householdSchema>;
