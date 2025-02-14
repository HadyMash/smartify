import { z } from 'zod';
import { DeviceType } from './device';

export const capabilityTypeSchema = z.enum([
  'POWER', // Can be turned on/off
  'BRIGHTNESS', // Can set brightness level
  'RGB_COLOR', // Can set RGB color
  'LIMITED_COLOR', // Can set predefined colors only
]);

export type CapabilityType = z.infer<typeof capabilityTypeSchema>;

export interface BaseCapability {
  type: CapabilityType;
  isReadOnly?: boolean;
}

export interface PowerCapability extends BaseCapability {
  type: 'POWER';
}

export interface BrightnessCapability extends BaseCapability {
  type: 'BRIGHTNESS';
  minValue: number;
  maxValue: number;
}

export interface RGBColorCapability extends BaseCapability {
  type: 'RGB_COLOR';
  minValue: number;
  maxValue: number;
}

export interface LimitedColorCapability extends BaseCapability {
  type: 'LIMITED_COLOR';
  availableColors: ['warm', 'neutral', 'cool'];
}

export type DeviceCapability =
  | PowerCapability
  | BrightnessCapability
  | RGBColorCapability
  | LimitedColorCapability;

// Map device types to their capabilities
export const deviceCapabilityMap: Record<DeviceType, DeviceCapability[]> = {
  BULB_ON_OFF: [{ type: 'POWER' }],
  BULB_RGB_BRIGHTNESS: [
    { type: 'POWER' },
    { type: 'BRIGHTNESS', minValue: 0, maxValue: 100 },
    { type: 'RGB_COLOR', minValue: 0, maxValue: 255 },
  ],
  BULB_LIMITED_COLOR_BRIGHTNESS: [
    { type: 'POWER' },
    { type: 'BRIGHTNESS', minValue: 0, maxValue: 100 },
    { type: 'LIMITED_COLOR', availableColors: ['warm', 'neutral', 'cool'] },
  ],
  BULB_LIMITED_COLOR: [
    { type: 'POWER' },
    { type: 'LIMITED_COLOR', availableColors: ['warm', 'neutral', 'cool'] },
  ],
  CURTAIN: [
    { type: 'POWER' }, // For open/close functionality
    { type: 'BRIGHTNESS', minValue: 0, maxValue: 100 }, // For position percentage
  ],
  AC: [
    { type: 'POWER' }, // For on/off
    { type: 'BRIGHTNESS', minValue: 16, maxValue: 30 }, // For temperature control
  ],
  GARAGE_DOOR: [
    { type: 'POWER' }, // For open/close functionality
  ],
  SOLAR_PANEL: [{ type: 'POWER', isReadOnly: true }],
  THERMOMETER: [], // Pure sensor, no controllable capabilities
  HUMIDITY_SENSOR: [], // Pure sensor, no controllable capabilities
  POWER_METER: [], // Pure sensor, no controllable capabilities
};
