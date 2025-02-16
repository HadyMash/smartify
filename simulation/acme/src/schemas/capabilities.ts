import { z } from 'zod';
import { DeviceType } from './device';

export const capabilityTypeSchema = z.enum([
  'POWER', // Can be turned on/off
  'BRIGHTNESS', // Can set brightness level
  'RGB_COLOR', // Can set RGB color
  'LIMITED_COLOR', // Can set predefined colors only
]);

export type CapabilityType = z.infer<typeof capabilityTypeSchema>;

export const baseCapabilitySchema = z.object({
  type: capabilityTypeSchema,
  isReadOnly: z.boolean().optional(),
});

export const powerCapabilitySchema = baseCapabilitySchema.extend({
  type: z.literal(capabilityTypeSchema.enum.POWER),
});

export const brightnessCapabilitySchema = baseCapabilitySchema.extend({
  type: z.literal(capabilityTypeSchema.enum.BRIGHTNESS),
  minValue: z.number(),
  maxValue: z.number(),
});

export const rgbColorCapabilitySchema = baseCapabilitySchema.extend({
  type: z.literal(capabilityTypeSchema.enum.RGB_COLOR),
  minValue: z.number(),
  maxValue: z.number(),
});

export const limitedColorCapabilitySchema = baseCapabilitySchema.extend({
  type: z.literal(capabilityTypeSchema.enum.LIMITED_COLOR),
  availableColors: z.tuple([
    z.literal('warm'),
    z.literal('neutral'),
    z.literal('cool'),
  ]),
});

export const deviceCapabilitySchema = z.discriminatedUnion('type', [
  powerCapabilitySchema,
  brightnessCapabilitySchema,
  rgbColorCapabilitySchema,
  limitedColorCapabilitySchema,
]);

export type BaseCapability = z.infer<typeof baseCapabilitySchema>;
export type PowerCapability = z.infer<typeof powerCapabilitySchema>;
export type BrightnessCapability = z.infer<typeof brightnessCapabilitySchema>;
export type RGBColorCapability = z.infer<typeof rgbColorCapabilitySchema>;
export type LimitedColorCapability = z.infer<
  typeof limitedColorCapabilitySchema
>;
export type DeviceCapability = z.infer<typeof deviceCapabilitySchema>;

// Map device types to their capabilities
export const deviceCapabilityMap: Record<
  DeviceType,
  z.infer<typeof deviceCapabilitySchema>[]
> = {
  BULB_ON_OFF: [{ type: capabilityTypeSchema.enum.POWER }],
  BULB_RGB_BRIGHTNESS: [
    { type: capabilityTypeSchema.enum.POWER },
    { type: capabilityTypeSchema.enum.BRIGHTNESS, minValue: 0, maxValue: 100 },
    { type: capabilityTypeSchema.enum.RGB_COLOR, minValue: 0, maxValue: 255 },
  ],
  BULB_LIMITED_COLOR_BRIGHTNESS: [
    { type: capabilityTypeSchema.enum.POWER },
    { type: capabilityTypeSchema.enum.BRIGHTNESS, minValue: 0, maxValue: 100 },
    {
      type: capabilityTypeSchema.enum.LIMITED_COLOR,
      availableColors: ['warm', 'neutral', 'cool'],
    },
  ],
  BULB_LIMITED_COLOR: [
    { type: capabilityTypeSchema.enum.POWER },
    {
      type: capabilityTypeSchema.enum.LIMITED_COLOR,
      availableColors: ['warm', 'neutral', 'cool'],
    },
  ],
  CURTAIN: [
    { type: capabilityTypeSchema.enum.POWER }, // For open/close functionality
    { type: capabilityTypeSchema.enum.BRIGHTNESS, minValue: 0, maxValue: 100 }, // For position percentage
  ],
  AC: [
    { type: capabilityTypeSchema.enum.POWER }, // For on/off
    { type: capabilityTypeSchema.enum.BRIGHTNESS, minValue: 16, maxValue: 30 }, // For temperature control
  ],
  GARAGE_DOOR: [
    { type: capabilityTypeSchema.enum.POWER }, // For open/close functionality
  ],
  SOLAR_PANEL: [{ type: capabilityTypeSchema.enum.POWER, isReadOnly: true }],
  THERMOMETER: [], // Pure sensor, no controllable capabilities
  HUMIDITY_SENSOR: [], // Pure sensor, no controllable capabilities
  POWER_METER: [], // Pure sensor, no controllable capabilities
};
