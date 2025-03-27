import { z, ZodObject, ZodSchema } from 'zod';
//import { deviceActionSchema } from './capabilities';

export const deviceTypeSchema = z.enum([
  'BULB_ON_OFF',
  'BULB_RGB_BRIGHTNESS',
  'BULB_LIMITED_COLOR_BRIGHTNESS',
  'BULB_LIMITED_COLOR',
  'BULB_TEMP_COLOR',
  'CURTAIN',
  'AC',
  'SOLAR_PANEL',
  'THERMOMETER',
  'HUMIDITY_SENSOR',
  'POWER_METER',
  'SECURITY_LOCK',
  'SECURITY_CAMERA',
]);



// Base device schema with required type and id fields
const baseDeviceSchema = z.object({
  id: z.string(),
  type: deviceTypeSchema,
  connected: z.boolean(),
  pairedApiKeys: z.array(z.string()).default([]),
  //activeActions: z.record(deviceActionSchema).default({}),
});

export const securityLockSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.SECURITY_LOCK),
  locked: z.boolean(),
  batteryLevel: z.number().min(0).max(100),
});

export const securityCameraSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.SECURITY_CAMERA),
  recording: z.boolean(),
  resolution: z.enum(['720p', '1080p', '4K']),
  batteryLevel: z.number().min(0).max(100).optional(),
  isNightVisionEnabled: z.boolean().default(false),
  motionDetected: z.boolean().default(false),
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

// Complete device schemas
export const curtainSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.CURTAIN),
  position: z.number().min(0).max(100), // 0 = fully closed, 100 = fully open
});

export const acSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.AC),
  on: z.boolean(),
  targetTemperature: z.number().min(16).max(30),
  currentTemperature: z.number(),
  mode: z.enum(['cool', 'heat', 'fan']),
  fanSpeed: z.enum(['low', 'medium', 'high', 'auto']),
});

//export const garageDoorSchema = baseDeviceSchema.extend({
//  type: z.literal(deviceTypeSchema.enum.GARAGE_DOOR),
//});
//
export const solarPanelSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.SOLAR_PANEL),
  currentPowerOutput: z.number().min(0),
  totalDailyOutput: z.number().min(0),
  isExportingToGrid: z.boolean(),
});

export const thermometerSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.THERMOMETER),
  temperature: z.number(),
});

export const humiditySchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.HUMIDITY_SENSOR),
  humidity: z.number().min(0).max(100),
});

export const powerMeterSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.POWER_METER),
  currentConsumption: z.number().min(0),
  totalConsumption: z.number().min(0),
});

export const tempColorBulbSchema = baseDeviceSchema.extend({
  type: z.literal(deviceTypeSchema.enum.BULB_TEMP_COLOR),
  on: z.boolean(),
  rgb: z.tuple([
    z.number().min(0).max(255),
    z.number().min(0).max(255),
    z.number().min(0).max(255),
  ]),
  temperature: z.number(),
});

//export const coffeeMachineSchema = baseDeviceSchema.extend({
//  type: z.literal(deviceTypeSchema.enum.COFFEE_MACHINE),
//  on: z.boolean(),
//  waterLevel: z.number().min(0).max(100),
//  beansLevel: z.number().min(0).max(100),
//  lastMaintenance: z.string().datetime(),
//});

export const deviceSchema = z.union([
  onOffBulbSchema,
  rgbBulbSchema,
  limitedColorBrightnessBulbSchema,
  limitedColorBulbSchema,
  curtainSchema,
  acSchema,
  //garageDoorSchema,
  solarPanelSchema,
  thermometerSchema,
  humiditySchema,
  powerMeterSchema,
  tempColorBulbSchema,
  //coffeeMachineSchema,
  securityLockSchema,
  securityCameraSchema,
]);

export type SecurityLock = z.infer<typeof securityLockSchema>;
export type SecurityCamera = z.infer<typeof securityCameraSchema>;

// Types
export type DeviceType = z.infer<typeof deviceTypeSchema>;
export type Device = z.infer<typeof deviceSchema>;

export const deviceSchemaMap: Record<DeviceType, ZodObject<any>> = {
  [deviceTypeSchema.enum.BULB_ON_OFF]: onOffBulbSchema,
  [deviceTypeSchema.enum.BULB_RGB_BRIGHTNESS]: rgbBulbSchema,
  [deviceTypeSchema.enum.BULB_LIMITED_COLOR_BRIGHTNESS]:
    limitedColorBrightnessBulbSchema,
  [deviceTypeSchema.enum.BULB_LIMITED_COLOR]: limitedColorBulbSchema,
  [deviceTypeSchema.enum.CURTAIN]: curtainSchema, // Using onOffBulbSchema as base, might need curtainSchema
  [deviceTypeSchema.enum.AC]: acSchema, // Using onOffBulbSchema as base, might need acSchema
  //[deviceTypeSchema.enum.GARAGE_DOOR]: garageDoorSchema, // Using onOffBulbSchema as base, might need garageDoorSchema
  [deviceTypeSchema.enum.SOLAR_PANEL]: solarPanelSchema, // Using onOffBulbSchema as base, might need solarPanelSchema
  [deviceTypeSchema.enum.THERMOMETER]: thermometerSchema, // Using onOffBulbSchema as base, might need thermometerSchema
  [deviceTypeSchema.enum.HUMIDITY_SENSOR]: humiditySchema, // Using onOffBulbSchema as base, might need humiditySchema
  [deviceTypeSchema.enum.POWER_METER]: powerMeterSchema, // Using onOffBulbSchema as base, might need powerMeterSchema
  [deviceTypeSchema.enum.BULB_TEMP_COLOR]: tempColorBulbSchema, // Using limitedColorBulbSchema as it's most similar
  //[deviceTypeSchema.enum.COFFEE_MACHINE]: coffeeMachineSchema, // Using onOffBulbSchema as base, might need coffeeMachineSchema
  [deviceTypeSchema.enum.SECURITY_LOCK]: securityLockSchema,
  [deviceTypeSchema.enum.SECURITY_CAMERA]: securityCameraSchema,
};

// Specific device types
export type OnOffBulb = z.infer<typeof onOffBulbSchema>;
export type RGBBulb = z.infer<typeof rgbBulbSchema>;
export type LimitedColorBrightnessBulb = z.infer<
  typeof limitedColorBrightnessBulbSchema
>;
export type LimitedColorBulb = z.infer<typeof limitedColorBulbSchema>;
export type TempColorBulb = z.infer<typeof tempColorBulbSchema>;
export type Curtain = z.infer<typeof curtainSchema>;
export type AC = z.infer<typeof acSchema>;
//export type GarageDoor = z.infer<typeof garageDoorSchema>;
export type SolarPanel = z.infer<typeof solarPanelSchema>;
export type Thermometer = z.infer<typeof thermometerSchema>;
export type HumiditySensor = z.infer<typeof humiditySchema>;
export type PowerMeter = z.infer<typeof powerMeterSchema>;

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
  CURTAIN: {
    connected: true,
    pairedApiKeys: [],
    position: 0,
  },
  AC: {
    connected: true,
    pairedApiKeys: [],
    on: false,
    targetTemperature: 22,
    currentTemperature: 24,
    mode: 'cool',
    fanSpeed: 'auto',
  },
  //GARAGE_DOOR: { connected: true, pairedApiKeys: [] },
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
  },
  HUMIDITY_SENSOR: {
    connected: true,
    pairedApiKeys: [],
    humidity: 50,
  },
  POWER_METER: {
    connected: true,
    pairedApiKeys: [],
    currentConsumption: 0,
    totalConsumption: 0,
  },
  BULB_TEMP_COLOR: {
    on: false,
    rgb: [255, 255, 255], // Default to white
    temperature: 20,
    connected: true,
    pairedApiKeys: [],
  },
  //COFFEE_MACHINE: {
  //  on: false,
  //  waterLevel: 100,
  //  beansLevel: 100,
  //  lastMaintenance: new Date().toISOString(),
  //  connected: true,
  //  pairedApiKeys: [],
  //},

  SECURITY_LOCK: {
    connected: true,
    pairedApiKeys: [],
    locked: true,
    batteryLevel: 100,
  },
  SECURITY_CAMERA: {
    connected: true,
    pairedApiKeys: [],
    recording: false,
    resolution: '1080p',
    batteryLevel: 100,
    isNightVisionEnabled: false,
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
export const isTempColorBulb = (device: Device): device is TempColorBulb =>
  device.type === deviceTypeSchema.enum.BULB_TEMP_COLOR;
export const isCurtain = (device: Device): device is Curtain =>
  device.type === deviceTypeSchema.enum.CURTAIN;
export const isAC = (device: Device): device is AC =>
  device.type === deviceTypeSchema.enum.AC;
//export const isGarageDoor = (device: Device): device is GarageDoor =>
//  device.type === deviceTypeSchema.enum.GARAGE_DOOR;
export const isSolarPanel = (device: Device): device is SolarPanel =>
  device.type === deviceTypeSchema.enum.SOLAR_PANEL;

export const isSecurityLock = (device: Device): device is SecurityLock =>
  device.type === deviceTypeSchema.enum.SECURITY_LOCK;
export const isSecurityCamera = (device: Device): device is SecurityCamera =>
  device.type === deviceTypeSchema.enum.SECURITY_CAMERA;
