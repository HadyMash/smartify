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
  'multimode',
  'multirange',
  'multinumber',
  'multivalue',
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

// TODO: make inclusive booleans for mins and maxes
/** A device's capability and the capability's parameters */
export const deviceCapabilitySchema = z
  .discriminatedUnion('type', [
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

    baseCapabilitySchema
      .extend({
        type: z.literal(deviceCapabilityTypesSchema.enum.multimode),
        /** The available modes that can be selected */
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

    baseCapabilitySchema
      .extend({
        type: z.literal(deviceCapabilityTypesSchema.enum.multirange),
        /** The minimum numbers in the range (inclusive) */
        min: z.union([z.number(), z.array(z.number()).nonempty()]),
        /** The maximum numbers in the range (inclusive) */
        max: z.union([z.number(), z.array(z.number()).nonempty()]),
        /** The step sizes */
        step: z.union([z.number(), z.array(z.number())]).optional(),
        /** The units of the ranges */
        unit: z.union([z.string(), z.array(z.string())]).optional(),
        /** Optional fixed length requirement */
        length: z.number().optional(),
      })
      .strict(),

    baseCapabilitySchema
      .extend({
        type: z.literal(deviceCapabilityTypesSchema.enum.multinumber),
        /**
         * Optional bounds on the numbers
         * If bounds on both ends are needed, use a range capability
         */
        bound: z
          .union([
            z.object({
              type: z.enum(['min', 'max']),
              value: z.number(),
            }),
            z.array(
              z
                .object({
                  type: z.enum(['min', 'max']),
                  value: z.number(),
                })
                .optional(),
            ),
          ])
          .optional(),
        /** The step sizes */
        step: z.union([z.number(), z.array(z.number())]).optional(),
        /** The units of the numbers */
        unit: z.union([z.string(), z.array(z.string())]).optional(),
        /** Optional fixed length requirement */
        length: z.number().optional(),
      })
      .strict(),

    baseCapabilitySchema
      .extend({
        type: z.literal(deviceCapabilityTypesSchema.enum.multivalue),
        /** Optional fixed length requirement */
        length: z.number().optional(),
      })
      .strict(),
  ])
  .refine(
    (capability) => {
      type BoundType = { type: 'min' | 'max'; value: number };
      type CapabilityValue =
        | number
        | string
        | boolean
        | BoundType
        | Array<number | string | BoundType | undefined>;

      // Helper function to get length of any field that might be an array
      const getLength = (
        field: CapabilityValue | undefined,
        defaultLength?: number,
      ): number | null => {
        if (field === undefined) return defaultLength ?? null;
        if (Array.isArray(field)) return field.length;
        return null;
      };

      // Helper function to validate all lengths match
      const validateLengths = (
        lengths: (number | null)[],
        requiredLength?: number,
      ): boolean => {
        const definedLengths = lengths.filter(
          (len): len is number => len !== null,
        );
        if (definedLengths.length === 0) return true;

        const referenceLength = requiredLength ?? definedLengths[0];

        if (!referenceLength) return true; // No arrays or length requirement
        return definedLengths.every((len) => len === referenceLength);
      };

      switch (capability.type) {
        case 'multirange': {
          const minLength = getLength(capability.min);
          const maxLength = getLength(capability.max);
          const stepLength = getLength(capability.step);
          const unitLength = getLength(capability.unit);

          return validateLengths(
            [minLength, maxLength, stepLength, unitLength],
            capability.length,
          );
        }

        case 'multinumber': {
          const boundLength = capability.bound
            ? Array.isArray(capability.bound)
              ? capability.bound.length
              : null
            : null;
          const stepLength = getLength(capability.step);
          const unitLength = getLength(capability.unit);

          return validateLengths(
            [boundLength, stepLength, unitLength],
            capability.length,
          );
        }

        case 'multimode':
        case 'multivalue': {
          // These types only have a length constraint which is already validated
          // by the state validation, but we could add more complex validation here
          // if needed in the future
          return true;
        }

        default:
          return true;
      }
    },
    {
      message:
        'All array parameters must have consistent lengths and match any specified length requirement',
    },
  );

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
          case 'multimode':
            return (
              Array.isArray(value) &&
              value.every(
                (mode) =>
                  typeof mode === 'string' && capability.modes.includes(mode),
              )
            );
          case 'multirange':
            if (!Array.isArray(value)) return false;
            if (
              capability.length !== undefined &&
              value.length !== capability.length
            )
              return false;

            return value.every((v, idx) => {
              if (typeof v !== 'number') return false;

              const min = Array.isArray(capability.min)
                ? capability.min[idx]
                : capability.min;
              const max = Array.isArray(capability.max)
                ? capability.max[idx]
                : capability.max;

              if (v < min || v > max) return false;

              if (capability.step !== undefined) {
                const step = Array.isArray(capability.step)
                  ? capability.step[idx]
                  : capability.step;
                const steps = (v - min) / step;
                return Math.abs(Math.round(steps) - steps) <= Number.EPSILON;
              }
              return true;
            });
          case 'multinumber':
            if (!Array.isArray(value)) return false;
            if (
              capability.length !== undefined &&
              value.length !== capability.length
            )
              return false;

            return value.every((v, idx) => {
              if (typeof v !== 'number') return false;

              if (Array.isArray(capability.bound)) {
                const bound = capability.bound[idx];
                if (bound) {
                  if (bound.type === 'min' && v < bound.value) return false;
                  if (bound.type === 'max' && v > bound.value) return false;
                }
              } else if (capability.bound) {
                if (
                  capability.bound.type === 'min' &&
                  v < capability.bound.value
                )
                  return false;
                if (
                  capability.bound.type === 'max' &&
                  v > capability.bound.value
                )
                  return false;
              }

              if (capability.step !== undefined) {
                const step = Array.isArray(capability.step)
                  ? capability.step[idx]
                  : capability.step;
                const reference = Array.isArray(capability.bound)
                  ? (capability.bound[idx]?.value ?? 0)
                  : (capability.bound?.value ?? 0);
                const steps = (v - reference) / step;
                return Math.abs(Math.round(steps) - steps) <= Number.EPSILON;
              }
              return true;
            });
          case 'multivalue':
            if (!Array.isArray(value)) return false;
            if (
              capability.length !== undefined &&
              value.length !== capability.length
            )
              return false;
            return value.every((v) => typeof v === 'string');
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
