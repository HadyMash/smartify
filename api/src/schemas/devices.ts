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

/** A device's capability and the capability's parameters */
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

/** An IoT device without state */
export const deviceSchema = z.object({
  /** Device ID */
  id: z.string(),
  /** The source of the device (manufacturer) */
  source: deviceSourceSchema,
  /** Device capabilities */
  capabilities: z.array(deviceCapabilitySchema).nonempty(),
});

/** The schema for a device's state */
export const stateSchema = z.record(z.string(), z.unknown());

/** An IoT device with its state */
export const deviceWithStateSchema = deviceSchema
  .extend({
    state: stateSchema,
  })
  .refine(
    (d) => {
      return Object.keys(d.state).every((key) =>
        d.capabilities.some((c) => c.id === key),
      );
    },
    {
      message: 'State contains keys not in capabilities',
    },
  )
  .refine(
    (d) => {
      return d.capabilities.every((c) => Object.keys(d.state).includes(c.id));
    },
    { message: 'Missing state keys' },
  )
  .refine(
    (d) => {
      // Validate that each state value matches its capability type
      return Object.entries(d.state).every(([key, value]) => {
        const capability = d.capabilities.find((c) => c.id === key);
        if (!capability) return false;

        switch (capability.type) {
          case 'switch':
            return typeof value === 'boolean';
          case 'range':
            if (
              typeof value !== 'number' ||
              value < capability.min ||
              value > capability.max
            )
              return false;

            if (capability.step !== undefined) {
              const steps = (value - capability.min) / capability.step;
              // Check if steps is very close to a whole number to handle floating point imprecision
              if (Math.abs(Math.round(steps) - steps) > Number.EPSILON)
                return false;
            }
            return true;
          case 'number':
            if (typeof value !== 'number') return false;

            // Check bounds
            if (capability.bound) {
              if (
                capability.bound.type === 'min' &&
                value < capability.bound.value
              )
                return false;
              if (
                capability.bound.type === 'max' &&
                value > capability.bound.value
              )
                return false;
            }

            // Check step
            if (capability.step !== undefined) {
              const reference = capability.bound?.value ?? 0;
              const steps = (value - reference) / capability.step;
              // Check if steps is very close to a whole number to handle floating point imprecision
              if (Math.abs(Math.round(steps) - steps) > Number.EPSILON)
                return false;
            }
            return true;
          case 'mode':
            return capability.modes.includes(String(value));
          default:
            return false;
        }
      });
    },
    {
      message:
        'State values do not match their capability types or are out of bounds',
    },
  );

/// Types

/** The supported device sources/manufacturers */
export type DeviceSource = z.infer<typeof deviceSourceSchema>;

/** The types of capabilities a device can have */
export type DeviceCapabilityTypes = z.infer<typeof deviceCapabilityTypesSchema>;

/** A capability of a device */
export type DeviceCapability = z.infer<typeof deviceCapabilitySchema>;

/** An IoT Device (without it's state) */
export type Device = z.infer<typeof deviceSchema>;

/** A device's state */
export type State = z.infer<typeof stateSchema>;

/** A device with its state */
export type DeviceWithState = z.infer<typeof deviceWithStateSchema>;
