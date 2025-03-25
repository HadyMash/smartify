import { z } from 'zod';
import { DeviceType } from './device';

//export const actionStatusSchema = z.enum([
//  'PENDING',
//  'IN_PROGRESS',
//  'COMPLETED',
//  'FAILED',
//]);
//
//export type ActionStatus = z.infer<typeof actionStatusSchema>;

//export const deviceActionSchema = z.object({
//  name: z.string().min(1),
//  status: actionStatusSchema,
//  startedAt: z.string().datetime().optional(),
//  completedAt: z.string().datetime().optional(),
//  error: z.string().optional(),
//});

//export type DeviceAction = z.infer<typeof deviceActionSchema>;

export const capabilityTypeSchema = z.enum([
  'POWER', // Can be turned on/off
  'RANGE', // Can set brightness level
  'RGB_COLOR', // Can set RGB color
  'LIMITED_COLOR', // Can set predefined colors only
  'ENERGY',
  //'ACTION', // Supports custom actions
]);

export type CapabilityType = z.infer<typeof capabilityTypeSchema>;

export const baseCapabilitySchema = z.object({
  name: z.string(),
  type: capabilityTypeSchema,
  isReadOnly: z.boolean().optional(),
  unit: z.string().optional(),
});

//// Define what properties an action can lock
//export const actionLockSchema = z.object({
//  properties: z.array(z.string()),
//  description: z.string().optional(),
//});

//// Define the hook context that will be passed to hooks
//export const hookContextSchema = z.object({
//  deviceId: z.string(),
//  actionName: z.string(),
//  currentState: z.record(z.any()),
//  updateState: z
//    .function()
//    .args(z.record(z.any()))
//    .returns(z.promise(z.void())),
//});

//export type HookContext = z.infer<typeof hookContextSchema>;

//// Updated hook schema with context
//export const actionHookSchema = z.object({
//  onStart: z
//    .function()
//    .args(hookContextSchema)
//    .returns(z.promise(z.void()))
//    .optional(),
//  onComplete: z
//    .function()
//    .args(hookContextSchema)
//    .returns(z.promise(z.void()))
//    .optional(),
//  onFail: z
//    .function()
//    .args(hookContextSchema)
//    .returns(z.promise(z.void()))
//    .optional(),
//});

//// Action configuration schema for dynamic configuration
//export const actionConfigSchema = z.object({
//  duration: z.number().min(0).optional(),
//  parameters: z.record(z.any()).optional(),
//});

//export const actionCapabilitySchema = baseCapabilitySchema.extend({
//  type: z.literal(capabilityTypeSchema.enum.ACTION),
//  name: z.string().min(1),
//  description: z.string().optional(),
//  defaultDuration: z.number().min(0), // Default duration in milliseconds
//  minDuration: z.number().min(0).optional(), // Minimum allowed duration
//  maxDuration: z.number().optional(), // Maximum allowed duration
//  parameters: z.record(z.any()).optional(), // Custom parameters schema
//  locks: actionLockSchema.optional(), // Properties this action locks
//  hooks: actionHookSchema.optional(),
//});

export const powerCapabilitySchema = baseCapabilitySchema.extend({
  type: z.literal(capabilityTypeSchema.enum.POWER),
});

export const brightnessCapabilitySchema = baseCapabilitySchema.extend({
  type: z.literal(capabilityTypeSchema.enum.RANGE),
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

export const energyCapabilitySchema = baseCapabilitySchema.extend({
  type: z.literal(capabilityTypeSchema.enum.ENERGY),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  unit: z.string().optional(),
});

export const deviceCapabilitySchema = z.discriminatedUnion('type', [
  powerCapabilitySchema,
  brightnessCapabilitySchema,
  rgbColorCapabilitySchema,
  limitedColorCapabilitySchema,
  energyCapabilitySchema,
  //actionCapabilitySchema,
]);

export type BaseCapability = z.infer<typeof baseCapabilitySchema>;
export type PowerCapability = z.infer<typeof powerCapabilitySchema>;
export type BrightnessCapability = z.infer<typeof brightnessCapabilitySchema>;
export type RGBColorCapability = z.infer<typeof rgbColorCapabilitySchema>;
export type LimitedColorCapability = z.infer<
  typeof limitedColorCapabilitySchema
>;
export type EnergyCapability = z.infer<typeof energyCapabilitySchema>;
export type DeviceCapability = z.infer<typeof deviceCapabilitySchema>;
//export type ActionCapability = z.infer<typeof actionCapabilitySchema>;

// Map device types to their capabilities
/**
 * Gets a list of read-only field names for a specific device type
 * based on its capabilities
 */
export function getReadOnlyFieldsForDeviceType(
  deviceType: DeviceType,
): string[] {
  const capabilities = deviceCapabilityMap[deviceType];
  if (!capabilities) return [];

  return capabilities
    .filter((cap) => cap.isReadOnly === true)
    .map((cap) => cap.name);
}

export const deviceCapabilityMap: Record<
  DeviceType,
  z.infer<typeof deviceCapabilitySchema>[]
> = {
  BULB_ON_OFF: [{ name: 'on', type: capabilityTypeSchema.enum.POWER }],
  BULB_RGB_BRIGHTNESS: [
    { name: 'on', type: capabilityTypeSchema.enum.POWER },
    {
      name: 'brightness',
      type: capabilityTypeSchema.enum.RANGE,
      minValue: 0,
      maxValue: 100,
    },
    {
      name: 'rgb',
      type: capabilityTypeSchema.enum.RGB_COLOR,
      minValue: 0,
      maxValue: 255,
    },
  ],
  BULB_LIMITED_COLOR_BRIGHTNESS: [
    { name: 'on', type: capabilityTypeSchema.enum.POWER },
    {
      name: 'brightness',
      type: capabilityTypeSchema.enum.RANGE,
      minValue: 0,
      maxValue: 100,
    },
    {
      name: 'color',
      type: capabilityTypeSchema.enum.LIMITED_COLOR,
      availableColors: ['warm', 'neutral', 'cool'],
    },
  ],
  BULB_LIMITED_COLOR: [
    { name: 'on', type: capabilityTypeSchema.enum.POWER },
    {
      name: 'color',
      type: capabilityTypeSchema.enum.LIMITED_COLOR,
      availableColors: ['warm', 'neutral', 'cool'],
    },
  ],
  CURTAIN: [
    { name: 'on', type: capabilityTypeSchema.enum.POWER }, // For open/close functionality
    {
      name: 'position',
      type: capabilityTypeSchema.enum.RANGE,
      minValue: 0,
      maxValue: 100,
    }, // For position percentage
  ],
  AC: [
    { name: 'on', type: capabilityTypeSchema.enum.POWER }, // For on/off
    {
      name: 'targetTemperature',
      type: capabilityTypeSchema.enum.RANGE,
      minValue: 16,
      maxValue: 30,
    }, // For temperature control
  ],
  //GARAGE_DOOR: [
  //  { type: capabilityTypeSchema.enum.POWER }, // For open/close functionality
  //  {
  //    type: capabilityTypeSchema.enum.ACTION,
  //    name: 'close',
  //    description: 'Close the garage door',
  //    duration: 15000, // 15 seconds
  //    hooks: {
  //      onStart: async () => {
  //        console.log('Starting garage door close');
  //      },
  //      onComplete: async () => {
  //        console.log('Garage door closed');
  //      },
  //      onFail: async () => {
  //        console.log('Garage door close failed');
  //      },
  //    },
  //  },
  //  {
  //    type: capabilityTypeSchema.enum.ACTION,
  //    name: 'open',
  //    description: 'Open the garage door',
  //    duration: 15000, // 15 seconds
  //    hooks: {
  //      onStart: async () => {
  //        console.log('Starting garage door open');
  //      },
  //      onComplete: async () => {
  //        console.log('Garage door opened');
  //      },
  //      onFail: async () => {
  //        console.log('Garage door open failed');
  //      },
  //    },
  //  },
  //],
  SOLAR_PANEL: [
    {
      name: 'currentPowerOutput',
      type: capabilityTypeSchema.enum.ENERGY,
      isReadOnly: true,
      unit: 'W',
    },
    {
      name: 'totalDailyOutput',
      type: capabilityTypeSchema.enum.ENERGY,
      isReadOnly: true,
      unit: 'kWh',
    },
    {
      name: 'isExportingToGrid',
      type: capabilityTypeSchema.enum.POWER,
      isReadOnly: true,
    },
  ],
  THERMOMETER: [
    {
      name: 'temperature',
      type: capabilityTypeSchema.enum.RANGE,
      isReadOnly: true,
      minValue: -50,
      maxValue: 100,
      unit: '°C',
    },
  ],
  HUMIDITY_SENSOR: [
    {
      name: 'humidity',
      type: capabilityTypeSchema.enum.RANGE,
      isReadOnly: true,
      minValue: 0,
      maxValue: 100,
      unit: '%',
    },
  ],
  POWER_METER: [
    {
      name: 'currentConsumption',
      type: capabilityTypeSchema.enum.ENERGY,
      isReadOnly: true,
      unit: 'W',
    },
    {
      name: 'totalConsumption',
      type: capabilityTypeSchema.enum.ENERGY,
      isReadOnly: true,
      unit: 'kWh',
    },
  ],
  BULB_TEMP_COLOR: [
    { name: 'on', type: capabilityTypeSchema.enum.POWER },
    {
      name: 'rgb',
      type: capabilityTypeSchema.enum.RGB_COLOR,
      minValue: 0,
      maxValue: 255,
      isReadOnly: true,
    },
    {
      name: 'temperature',
      type: capabilityTypeSchema.enum.RANGE,
      minValue: 16,
      maxValue: 30,
      unit: '°C',
    },
  ],
  //COFFEE_MACHINE: [
  //  { type: capabilityTypeSchema.enum.POWER },
  //  {
  //    type: capabilityTypeSchema.enum.ACTION,
  //    name: 'brew',
  //    description: 'Brew a cup of coffee',
  //    duration: 180000, // 3 minutes
  //    hooks: {
  //      onStart: async () => {
  //        console.log('Starting coffee brew');
  //      },
  //      onComplete: async () => {
  //        console.log('Coffee ready');
  //      },
  //      onFail: async () => {
  //        console.log('Brew failed');
  //      },
  //    },
  //  },
  //  {
  //    type: capabilityTypeSchema.enum.ACTION,
  //    name: 'clean',
  //    description: 'Run cleaning cycle',
  //    duration: 300000, // 5 minutes
  //    hooks: {
  //      onStart: async () => {
  //        console.log('Starting cleaning cycle');
  //      },
  //      onComplete: async () => {
  //        console.log('Cleaning complete');
  //      },
  //      onFail: async () => {
  //        console.log('Cleaning failed');
  //      },
  //    },
  //  },
  //],
};
