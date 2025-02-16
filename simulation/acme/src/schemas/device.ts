import { z } from 'zod';
import { deviceActionSchema } from './capabilities';

export const deviceTypeSchema = z.enum([
  'BULB_ON_OFF',
  'BULB_RGB_BRIGHTNESS',
  'BULB_LIMITED_COLOR_BRIGHTNESS',
  'BULB_LIMITED_COLOR',
  'CURTAIN',
  'AC',
  'GARAGE_DOOR',
  'SOLAR_PANEL',
  'THERMOMETER',
  'HUMIDITY_SENSOR',
  'POWER_METER',
]);

// Base device schema with required type and id fields
const baseDeviceSchema = z.object({
  id: z.string(),
  type: deviceTypeSchema,
  connected: z.boolean(),
  pairedApiKeys: z.array(z.string()).default([]),
  activeActions: z.record(deviceActionSchema).default({}),
});

// bulbs

// Device type-specific schemas
export const onOffBulbSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.BULB_ON_OFF),
  on: z.boolean(),
});

export const rgbBulbSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS),
  on: z.boolean(),
  rgb: z.tuple([
    z.number().min(0).max(255),
    z.number().min(0).max(255),
    z.number().min(0).max(255),
  ]),
  brightness: z.number().min(0).max(100),
});

export const limitedColorBrightnessBulbSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS),
  on: z.boolean(),
  color: z.enum(['warm', 'neutral', 'cool']),
  brightness: z.number().min(0).max(100),
});

export const limitedColorBulbSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.BULB_LIMITED_COLOR),
  on: z.boolean(),
  color: z.enum(['warm', 'neutral', 'cool']),
});

// empty device schemas
export const curtainSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.CURTAIN),
});

export const acSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.AC),
});

export const garageDoorSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.GARAGE_DOOR),
});

export const solarPanelSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.SOLAR_PANEL),
  currentPowerOutput: z.number().min(0),
  totalDailyOutput: z.number().min(0),
  isExportingToGrid: z.boolean(),
});

export const thermometerSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.THERMOMETER),
  temperature: z.number(),
  lastUpdated: z.string().datetime(),
});

export const humiditySchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.HUMIDITY_SENSOR),
  humidity: z.number().min(0).max(100),
  lastUpdated: z.string().datetime(),
});

export const powerMeterSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.POWER_METER),
  currentConsumption: z.number().min(0),
  totalConsumption: z.number().min(0),
  lastUpdated: z.string().datetime(),
});

export const deviceSchema = z.union([
  onOffBulbSchema,
  rgbBulbSchema,
  limitedColorBrightnessBulbSchema,
  limitedColorBulbSchema,
  curtainSchema,
  acSchema,
  garageDoorSchema,
  solarPanelSchema,
  thermometerSchema,
  humiditySchema,
  powerMeterSchema,
]);

// Types
export type DeviceType = z.infer<typeof deviceTypeSchema>;
export type Device = z.infer<typeof deviceSchema>;

// Specific device types
export type OnOffBulb = z.infer<typeof onOffBulbSchema>;
export type RGBBulb = z.infer<typeof rgbBulbSchema>;
export type LimitedColorBrightnessBulb = z.infer<
  typeof limitedColorBrightnessBulbSchema
>;
export type LimitedColorBulb = z.infer<typeof limitedColorBulbSchema>;
export type Curtain = z.infer<typeof curtainSchema>;
export type AC = z.infer<typeof acSchema>;
export type GarageDoor = z.infer<typeof garageDoorSchema>;
export type SolarPanel = z.infer<typeof solarPanelSchema>;
export type Thermometer = z.infer<typeof thermometerSchema>;
export type HumiditySensor = z.infer<typeof humiditySchema>;
export type PowerMeter = z.infer<typeof powerMeterSchema>;

// Read-only fields per device type
export const readOnlyFields: Record<DeviceType, string[]> = {
  BULB_ON_OFF: [],
  BULB_RGB_BRIGHTNESS: [],
  BULB_LIMITED_COLOR_BRIGHTNESS: [],
  BULB_LIMITED_COLOR: [],
  CURTAIN: [],
  AC: [],
  GARAGE_DOOR: [],
  SOLAR_PANEL: ['currentPowerOutput', 'totalDailyOutput', 'isExportingToGrid'],
  THERMOMETER: ['temperature', 'lastUpdated'],
  HUMIDITY_SENSOR: ['humidity', 'lastUpdated'],
  POWER_METER: ['currentConsumption', 'totalConsumption', 'lastUpdated'],
};

// Default states for device creation
export const defaultStates: Record<DeviceType, any> = {
  BULB_ON_OFF: { on: false, connected: true, pairedApiKeys: [] },
  BULB_RGB_BRIGHTNESS: {
    on: false,
    rgb: [255, 255, 255],
    brightness: 100,
    connected: true,
    pairedApiKeys: [],
  },
  BULB_LIMITED_COLOR_BRIGHTNESS: {
    on: false,
    color: 'neutral',
    brightness: 100,
    connected: true,
    pairedApiKeys: [],
  },
  BULB_LIMITED_COLOR: {
    on: false,
    color: 'neutral',
    connected: true,
    pairedApiKeys: [],
  },
  CURTAIN: { connected: true, pairedApiKeys: [] },
  AC: { connected: true, pairedApiKeys: [] },
  GARAGE_DOOR: { connected: true, pairedApiKeys: [] },
  SOLAR_PANEL: {
    connected: true,
    pairedApiKeys: [],
    currentPowerOutput: 0,
    totalDailyOutput: 0,
    isExportingToGrid: false,
  },
  THERMOMETER: {
    connected: true,
    pairedApiKeys: [],
    temperature: 20,
    lastUpdated: new Date().toISOString(),
  },
  HUMIDITY_SENSOR: {
    connected: true,
    pairedApiKeys: [],
    humidity: 50,
    lastUpdated: new Date().toISOString(),
  },
  POWER_METER: {
    connected: true,
    pairedApiKeys: [],
    currentConsumption: 0,
    totalConsumption: 0,
    lastUpdated: new Date().toISOString(),
  },
};

// Type guards
export const isOnOffBulb = (device: Device): device is OnOffBulb =>
  device.type === deviceTypeSchema.enum.BULB_ON_OFF;
export const isRGBBulb = (device: Device): device is RGBBulb =>
  device.type === deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS;
export const isLimitedColorBrightnessBulb = (
  device: Device,
): device is LimitedColorBrightnessBulb =>
  device.type === deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS;
export const isLimitedColorBulb = (
  device: Device,
): device is LimitedColorBulb =>
  device.type === deviceTypeSchema.enum.BULB_LIMITED_COLOR;
export const isCurtain = (device: Device): device is Curtain =>
  device.type === deviceTypeSchema.enum.CURTAIN;
export const isAC = (device: Device): device is AC =>
  device.type === deviceTypeSchema.enum.AC;
export const isGarageDoor = (device: Device): device is GarageDoor =>
  device.type === deviceTypeSchema.enum.GARAGE_DOOR;
export const isSolarPanel = (device: Device): device is SolarPanel =>
  device.type === deviceTypeSchema.enum.SOLAR_PANEL;
