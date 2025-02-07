import { z } from 'zod';

/// Schemas

/** The supported device sources/manufacturers */
export const deviceSourceSchema = z.enum(['acme']);

/* Types of capabilities a device can have */
export const deviceCapabilityTypesSchema = z.enum([
  // basic capabilities
  'switch',
  'range',
  'number',
  'mode',
  // TODO: add custom (color, etc)
]);

/** The base device capability schema
 *
 * contains properties shared by all capabilities
 */
const baseCapabilitySchema = z
  .object({
    /** The capability's id */
    id: z.string(),
    /** The capability  */
    type: deviceCapabilityTypesSchema,
    /** Human readable name */
    name: z.string().optional(),
  })
  .strict();

export const deviceCapabilitySchema = z.discriminatedUnion('type', [
  baseCapabilitySchema
    .extend({
      type: z.literal(deviceCapabilityTypesSchema.enum.switch),
    })
    .strict(),
  baseCapabilitySchema
    .extend({
      type: z.literal(deviceCapabilityTypesSchema.enum.range),
      /** The minimum number in the range (inclusive) */
      min: z.number(),
      /** The maximum number in the range (inclusive) */
      max: z.number(),
      /** The step size */
      step: z.number().optional(),
      /** The unit of the range */
      unit: z.string().optional(),
    })
    .strict(),
  baseCapabilitySchema
    .extend({
      type: z.literal(deviceCapabilityTypesSchema.enum.number),
      /**
       * An optional bound on one of the ends of the number
       * If a bound on both ends is needed, use a range capability
       */
      bound: z
        .object({
          type: z.enum(['min', 'max']),
          value: z.number(),
        })
        .optional(),
      /** The step size */
      step: z.number().optional(),
      /** The unit of the number */
      unit: z.string().optional(),
    })
    .strict(),
  baseCapabilitySchema
    .extend({
      type: z.literal(deviceCapabilityTypesSchema.enum.mode),
      /** The available modes */
      modes: z
        .array(z.coerce.string())
        .nonempty()
        .refine(
          (modes) =>
            modes.every(
              (m) => m.toLowerCase() !== '[object Object]'.toLowerCase(),
            ),
          { message: 'Modes cannot be objects' },
        ),
    })
    .strict(),
]);

export const deviceSchema = z.object({
  /** Device ID */
  id: z.string(),
  /** The source of the device (manufacturer) */
  source: deviceSourceSchema,
  /** Device capabilities */
  capabilities: z.array(deviceCapabilitySchema),
});

/** The schema for a device's state */
export const stateSchema = z.record(z.string(), z.object({}));

/** A device with its state */
export const deviceWithStateSchema = deviceSchema
  .extend({
    state: stateSchema,
  })
  .refine(
    (d) => {
      return Object.keys(d.state).some((key) =>
        d.capabilities.some((c) => c.id === key),
      );
    },
    {
      message: 'State contains keys not in capabilities',
    },
  );

/// Types

/** The supported device sources/manufacturers */
export type DeviceSource = z.infer<typeof deviceSourceSchema>;

/** The types of capabilities a device can have */
export type DeviceCapabilityTypes = z.infer<typeof deviceCapabilityTypesSchema>;

/** A capability of a device */
export type DeviceCapability = z.infer<typeof deviceCapabilitySchema>;

/** An IoT Device */
export type Device = z.infer<typeof deviceSchema>;

/** A device's state */
export type State = z.infer<typeof stateSchema>;

/** A device with its state */
export type DeviceWithState = z.infer<typeof deviceWithStateSchema>;
