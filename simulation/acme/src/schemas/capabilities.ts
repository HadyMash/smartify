import { z } from 'zod';

export const capabilityTypeSchema = z.enum([
  'POWER', // Can be turned on/off
  'BRIGHTNESS', // Can set brightness level
  'RGB_COLOR', // Can set RGB color
  'LIMITED_COLOR', // Can set predefined colors only
]);

export type CapabilityType = z.infer<typeof capabilityTypeSchema>;

export interface PowerCapability {
  type: 'POWER';
}

export interface BrightnessCapability {
  type: 'BRIGHTNESS';
  minValue: number;
  maxValue: number;
}

export interface RGBColorCapability {
  type: 'RGB_COLOR';
  minValue: number;
  maxValue: number;
}

export interface LimitedColorCapability {
  type: 'LIMITED_COLOR';
  availableColors: ['warm', 'neutral', 'cool'];
}

export type DeviceCapability =
  | PowerCapability
  | BrightnessCapability
  | RGBColorCapability
  | LimitedColorCapability;
