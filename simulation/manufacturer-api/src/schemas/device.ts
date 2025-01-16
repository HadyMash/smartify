import { z } from 'zod';

export const deviceTypeSchema = z.enum([
  'bulb-on-off',
  'bulb-rgb-brightness',
  'bulb-limited-color-brightneses',
  'bulb-limited-color',
  'curtain',
  'ac',
  'coffee-machine',
  'garage-door',
  'solar-panel',
]);

export type DeviceType = z.infer<typeof deviceTypeSchema>;

export const deviceNoIdSchema = z.object({
  type: deviceTypeSchema,
});

export type DeviceNoId = z.infer<typeof deviceNoIdSchema>;

export const deviceSchema = deviceNoIdSchema.extend({
  id: z.string(),
});

export type Device = z.infer<typeof deviceSchema>;
