import { z } from 'zod';

/// Schemas

/** The supported device sources/manufacturers */
export const deviceSourceSchema = z.enum(['acme']);

/** Basic capability types that can be used as both device capabilities and action arguments */
export const basicCapabilityTypesSchema = z.enum([
  'value', // string value
  'switch', // boolean value
  'range', // number with min/max bounds
  'number', // number with optional single bound
  'mode', // enumerated string values
  'date', // date as a string
  'image', // image as bytes
]);

export const capabilitySubtypesSchema = z.object({
  swtich: z.enum(['power', 'lock', 'mute']),
  number: z.enum(['timer']),
  multirange: z.enum(['color']),
  multivalue: z.enum(['list']),
});

/** All capability types a device can have, extending basic types with multi-variants and actions */
export const deviceCapabilityTypesSchema = z.enum([
  // basic capabilities
  ...basicCapabilityTypesSchema.options,
  // multi-value capabilities (arrays of basic types)
  'multiswitch',
  'multimode', // array of modes
  'multirange', // array of ranges
  'multinumber', // array of numbers
  'multivalue', // array of values
  'action', // action with basic capability arguments
]);

const iconSchema = z.string();

/** The base device capability schema
 *
 * contains properties shared by all capabilities
 */
const baseCapabilitySchema = z
  .object({
    /** The capability's id */
    id: z.string().min(1),
    /** The capability  */
    type: deviceCapabilityTypesSchema,
    /** The extension type */
    extensionType: z.string().optional(),
    /** Human readable name */
    name: z.string().optional(),
    /** Whether the capability is readonly */
    readonly: z.boolean().optional(),
    /** The capability's icon */
    icon: iconSchema.optional(),
  })
  .strict();

/** Schema for basic capabilities that can be used as action arguments or device capabilities */
export const basicCapabilitySchema = z
  .discriminatedUnion('type', [
    baseCapabilitySchema
      .extend({
        type: z.literal(basicCapabilityTypesSchema.enum.switch),
      })
      .strict(),

    baseCapabilitySchema
      .extend({
        type: z.literal(basicCapabilityTypesSchema.enum.range),
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
        type: z.literal(basicCapabilityTypesSchema.enum.number),
        bound: z
          .object({
            type: z.enum(['min', 'max']),
            value: z.number(),
          })
          .optional(),
        step: z.number().optional(),
        unit: z.string().optional(),
      })
      .strict(),

    baseCapabilitySchema
      .extend({
        type: z.literal(basicCapabilityTypesSchema.enum.mode),
        modes: z.array(z.coerce.string()).nonempty(),
      })
      .strict(),

    baseCapabilitySchema
      .extend({
        type: z.literal(basicCapabilityTypesSchema.enum.value),
      })
      .strict(),
    baseCapabilitySchema
      .extend({
        type: z.literal(basicCapabilityTypesSchema.enum.date),
      })
      .strict(),
  ])
  .refine(
    (capability) => {
      switch (capability.type) {
        case 'range':
          // Validate maximum is greater than minimum
          if (capability.max <= capability.min) {
            return false;
          }
          // If step is provided, validate it's positive
          if (capability.step !== undefined && capability.step <= 0) {
            return false;
          }
          return true;

        case 'number':
          // If step is provided, validate it's positive
          if (capability.step !== undefined && capability.step <= 0) {
            return false;
          }
          return true;

        case 'mode': {
          // Check mode uniqueness and ensure no objects
          if (
            !Array.isArray(capability.modes) ||
            capability.modes.length === 0
          ) {
            return false;
          }
          const seen = new Set<string>();
          return capability.modes.every((m) => {
            if (
              m.toLowerCase() === '[object Object]'.toLowerCase() ||
              seen.has(m)
            ) {
              return false;
            }
            seen.add(m);
            return true;
          });
        }

        default:
          return true;
      }
    },
    {
      message:
        'Invalid capability configuration: ranges must have max > min, steps must be positive, and modes must be unique strings',
    },
  )
  .refine((capability) => {
    switch (capability.type) {
      case 'range':
        // Validate that max is greater than min
        if (capability.max <= capability.min) {
          return false;
        }
        // If step is provided, validate it divides the range cleanly
        if (capability.step !== undefined) {
          const range = capability.max - capability.min;
          const steps = range / capability.step;
          return Math.abs(Math.round(steps) - steps) <= Number.EPSILON;
        }
        return true;

      case 'number':
        // If step is provided, validate it's positive
        if (capability.step !== undefined && capability.step <= 0) {
          return false;
        }
        return true;

      case 'mode': {
        // Additional safety check for modes (though also handled by the schema)
        if (!Array.isArray(capability.modes) || capability.modes.length === 0) {
          return false;
        }
        // Check for uniqueness (case-sensitive)
        const uniqueModes = new Set(capability.modes);
        if (uniqueModes.size !== capability.modes.length) {
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  }, 'Invalid capability configuration: ranges must have max > min, steps must divide ranges cleanly, and modes must be unique');

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
        type: z.literal(deviceCapabilityTypesSchema.enum.value),
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

    baseCapabilitySchema.extend({
      type: z.literal(deviceCapabilityTypesSchema.enum.multiswitch),
      /** Optional fixed length requirement */
      length: z.number().optional(),
    }),

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

    baseCapabilitySchema
      .extend({
        type: z.literal(deviceCapabilityTypesSchema.enum.action),
        /** Arguments for the action */
        arguments: z.array(basicCapabilitySchema).nonempty(),
        /** Fields that are locked during this action */
        lockedFields: z.array(z.string()).nonempty(),
      })
      .strict(),
    baseCapabilitySchema
      .extend({
        type: z.literal(basicCapabilityTypesSchema.enum.date),
      })
      .strict(),
    baseCapabilitySchema
      .extend({
        type: z.literal(basicCapabilityTypesSchema.enum.image),
        bytes: z.array(z.number()).nonempty(),
      })
      .strict(),
  ])
  .refine(
    (capability) => {
      switch (capability.type) {
        case 'range':
          // Validate maximum is greater than minimum
          if (capability.max <= capability.min) {
            return false;
          }
          // If step is provided, validate it's positive
          if (capability.step !== undefined && capability.step <= 0) {
            return false;
          }
          return true;

        case 'number':
          // If step is provided, validate it's positive
          if (capability.step !== undefined && capability.step <= 0) {
            return false;
          }
          return true;

        case 'mode': {
          // Check mode uniqueness and ensure no objects
          if (
            !Array.isArray(capability.modes) ||
            capability.modes.length === 0
          ) {
            return false;
          }
          const seen = new Set<string>();
          return capability.modes.every((m) => {
            if (
              m.toLowerCase() === '[object Object]'.toLowerCase() ||
              seen.has(m)
            ) {
              return false;
            }
            seen.add(m);
            return true;
          });
        }

        default:
          return true;
      }
    },
    {
      message:
        'Invalid capability configuration: ranges must have max > min, steps must be positive, and modes must be unique strings',
    },
  )
  .refine((capability) => {
    switch (capability.type) {
      case 'range':
        // Validate that max is greater than min
        if (capability.max <= capability.min) {
          return false;
        }
        // If step is provided, validate it divides the range cleanly
        if (capability.step !== undefined) {
          const range = capability.max - capability.min;
          const steps = range / capability.step;
          return Math.abs(Math.round(steps) - steps) <= Number.EPSILON;
        }
        return true;

      case 'number':
        // If step is provided, validate it's positive
        if (capability.step !== undefined && capability.step <= 0) {
          return false;
        }
        return true;

      case 'mode': {
        // Additional safety check for modes (though also handled by the schema)
        if (!Array.isArray(capability.modes) || capability.modes.length === 0) {
          return false;
        }
        // Check for uniqueness (case-sensitive)
        const uniqueModes = new Set(capability.modes);
        if (uniqueModes.size !== capability.modes.length) {
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  }, 'Invalid capability configuration: ranges must have max > min, steps must divide ranges cleanly, and modes must be unique')
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
  id: z.string().min(1),
  /** The device's name */
  name: z.string().optional(),
  /** The device's description */
  description: z.string().optional(),
  /** The source of the device (manufacturer) */
  source: deviceSourceSchema,
  /** The device's icon */
  icon: iconSchema.optional(),
  /** Device capabilities */
  capabilities: z
    .array(deviceCapabilitySchema)
    .nonempty()
    .refine(
      (capabilities) => {
        const ids = new Set();
        return capabilities.every((cap) => {
          if (ids.has(cap.id)) {
            return false;
          }
          ids.add(cap.id);
          return true;
        });
      },
      { message: 'Capability IDs must be unique' },
    ),
});

/** The schema for a device's state or action state */
export const stateSchema = z.record(z.string(), z.unknown());

/** The schema for tracking ongoing actions */
export const actionStateSchema = z.record(
  z.string(),
  z.object({
    /** The action being performed */
    actionId: z.string(),
    /** The progress description */
    progress: z.string(),
    /** Start time of the action */
    startTime: z.date(),
    /** Optional data specific to this action */
    data: z.record(z.string(), z.unknown()).optional(),
  }),
);

/** An IoT device with its state */
export const deviceWithStateSchema = deviceSchema
  .extend({
    state: stateSchema,
    /** Optional active actions and their states */
    actionStates: actionStateSchema.optional(),
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
      return Object.entries(d.state ?? {}).every(([key, value]) => {
        const capability = d.capabilities.find((c) => c.id === key);
        if (!capability) return false;

        switch (capability.type) {
          case 'action':
            return value === null; // Action capabilities should have null state
          case 'value':
            return typeof value === 'string';
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
              // Use a more lenient epsilon for floating point comparisons
              const FLOAT_EPSILON = 1e-10;
              if (Math.abs(Math.round(steps) - steps) > FLOAT_EPSILON)
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
              // Use a more lenient epsilon for floating point comparisons
              const FLOAT_EPSILON = 1e-10;
              if (Math.abs(Math.round(steps) - steps) > FLOAT_EPSILON)
                return false;
            }
            return true;
          case 'mode':
            return capability.modes.includes(String(value));
          case 'date':
            try {
              if (typeof value !== 'number') {
                return false;
              }
              const d = new Date(value);

              return !isNaN(d.getTime());
            } catch (_) {
              return false;
            }
          case 'multiswitch':
            return (
              Array.isArray(value) &&
              (capability.length === undefined ||
                value.length === capability.length) &&
              value.every((v) => typeof v === 'boolean')
            );
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
                // Use a more lenient epsilon for floating point comparisons
                const FLOAT_EPSILON = 1e-10;
                return Math.abs(Math.round(steps) - steps) <= FLOAT_EPSILON;
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
                // Use a more lenient epsilon for floating point comparisons
                const FLOAT_EPSILON = 1e-10;
                return Math.abs(Math.round(steps) - steps) <= FLOAT_EPSILON;
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

/** An IoT device with partial state */
export const deviceWithPartialStateSchema = deviceSchema
  .extend({
    state: stateSchema.optional().default({}),
    /** Optional active actions and their states */
    actionStates: actionStateSchema.optional(),
  })
  .refine(
    (d) => {
      // Validate that any state keys provided correspond to capabilities
      return Object.keys(d.state ?? {}).every((key) =>
        d.capabilities.some((c) => c.id === key),
      );
    },
    {
      message: 'State contains keys not in capabilities',
    },
  )
  .refine(
    (d) => {
      // Validate that each state value matches its capability type
      return Object.entries(d.state).every(([key, value]) => {
        const capability = d.capabilities.find((c) => c.id === key);
        if (!capability) return false;

        switch (capability.type) {
          case 'action':
            return value === null; // Action capabilities should have null state
          case 'value':
            return typeof value === 'string';
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
          case 'date':
            try {
              if (typeof value !== 'number') {
                return false;
              }
              const d = new Date(value);

              return !isNaN(d.getTime());
            } catch (_) {
              return false;
            }
          case 'multiswitch':
            return (
              Array.isArray(value) &&
              (capability.length === undefined ||
                value.length === capability.length) &&
              value.every((v) => typeof v === 'boolean')
            );
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

/** The state of an ongoing action */
export type ActionState = z.infer<typeof actionStateSchema>;

/** A device with its state */
export type DeviceWithState = z.infer<typeof deviceWithStateSchema>;

/** An IoT device with partial state */
export type DeviceWithPartialState = z.infer<
  typeof deviceWithPartialStateSchema
>;
