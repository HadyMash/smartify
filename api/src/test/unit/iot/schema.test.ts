import {
  basicCapabilitySchema,
  DeviceCapability,
  deviceCapabilitySchema,
  deviceSchema,
  DeviceSource,
  deviceSourceSchema,
  deviceWithStateSchema,
} from '../../../schemas/devices';

describe('IoT Device Schema Tests', () => {
  // Base capability schema edge cases
  describe('Base capability schema', () => {
    test('should not parse empty id', () => {
      const capability = {
        type: 'switch',
        id: '',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should not parse missing id', () => {
      const capability = {
        type: 'switch',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should parse capability with both name and readonly', () => {
      const capability = {
        type: 'switch',
        id: 'test',
        name: 'Test Switch',
        readonly: true,
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
    });

    test('should parse id with special characters', () => {
      const capability = {
        type: 'switch',
        id: 'test-123_@.',
        name: 'Test Switch',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
    });

    test('should parse very long id', () => {
      const capability = {
        type: 'switch',
        id: 'a'.repeat(1000),
        name: 'Test Switch',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
    });
  });

  // Range capability edge cases
  describe('Range capability edge cases', () => {
    test('should not parse when max < min', () => {
      const capability = {
        type: 'range',
        id: 'test',
        min: 100,
        max: 0,
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should not parse zero step', () => {
      const capability = {
        type: 'range',
        id: 'test',
        min: 0,
        max: 100,
        step: 0,
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should not parse negative step', () => {
      const capability = {
        type: 'range',
        id: 'test',
        min: 0,
        max: 100,
        step: -1,
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should parse very small step', () => {
      const capability = {
        type: 'range',
        id: 'test',
        min: 0,
        max: 1,
        step: 0.0001,
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
    });

    test('should parse float and integer steps', () => {
      const intCapability = {
        type: 'range',
        id: 'test',
        min: 0,
        max: 100,
        step: 1,
      };
      const floatCapability = {
        type: 'range',
        id: 'test',
        min: 0,
        max: 100,
        step: 0.5,
      };
      expect(() => deviceCapabilitySchema.parse(intCapability)).not.toThrow();
      expect(() => deviceCapabilitySchema.parse(floatCapability)).not.toThrow();
    });
  });

  // Mode capability edge cases
  describe('Mode capability edge cases', () => {
    test('should not parse empty modes array', () => {
      const capability = {
        type: 'mode',
        id: 'test',
        modes: [],
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should not parse duplicate modes', () => {
      const capability = {
        type: 'mode',
        id: 'test',
        modes: ['mode1', 'mode1'],
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should parse modes with special characters', () => {
      const capability = {
        type: 'mode',
        id: 'test',
        modes: ['mode-1', 'mode_2', 'mode@3'],
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
    });

    test('should parse very long mode strings', () => {
      const capability = {
        type: 'mode',
        id: 'test',
        modes: ['a'.repeat(1000)],
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
    });
  });

  // Action capability edge cases
  describe('Action capability edge cases', () => {
    test('should not parse empty arguments array', () => {
      const capability = {
        type: 'action',
        id: 'test',
        arguments: [],
        lockedFields: ['power'],
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should not parse empty locked fields array', () => {
      const capability = {
        type: 'action',
        id: 'test',
        arguments: [
          {
            type: 'mode',
            id: 'mode1',
            modes: ['on', 'off'],
          },
        ],
        lockedFields: [],
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
    });

    test('should parse with duplicate locked fields', () => {
      const capability = {
        type: 'action',
        id: 'test',
        arguments: [
          {
            type: 'mode',
            id: 'mode1',
            modes: ['on', 'off'],
          },
        ],
        lockedFields: ['power', 'power'],
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
    });

    test('should validate null state for action capability', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'action',
            id: 'test',
            arguments: [
              {
                type: 'mode',
                id: 'mode1',
                modes: ['on', 'off'],
              },
            ],
            lockedFields: ['power'],
          },
        ],
        state: {
          test: null,
        },
      };
      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
    });

    test('should not validate non-null state for action capability', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'action',
            id: 'test',
            arguments: [
              {
                type: 'mode',
                id: 'mode1',
                modes: ['on', 'off'],
              },
            ],
            lockedFields: ['power'],
          },
        ],
        state: {
          test: true,
        },
      };
      expect(() => deviceWithStateSchema.parse(device)).toThrow();
    });
  });

  // Device schema edge cases
  describe('Device schema edge cases', () => {
    test('should not parse duplicate capability IDs', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
          {
            type: 'switch',
            id: 'power',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).toThrow();
    });

    test('should not parse empty device ID', () => {
      const device = {
        id: '',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).toThrow();
    });

    test('should parse device ID with special characters', () => {
      const device = {
        id: 'device-123_@.',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).not.toThrow();
    });
  });
  describe('Device source schema', () => {
    test('valid source should parse', () => {
      const source: DeviceSource = 'acme';
      expect(() => deviceSourceSchema.parse(source)).not.toThrow();
      expect(deviceSourceSchema.parse(source)).toBe(source);
      expect(deviceSourceSchema.safeParse(source).success).toBe(true);
    });
    test("invalid source shouldn't parse", () => {
      const source = 'invalid';
      expect(() => deviceSourceSchema.parse(source)).toThrow();
      expect(deviceSourceSchema.safeParse(source).success).toBe(false);
    });
  });

  describe('Device capability schema', () => {
    test('valid switch capability should parse', () => {
      const capability: DeviceCapability = {
        type: 'switch',
        id: 'on',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
    });

    test('valid readonly switch capability should parse', () => {
      const capability: DeviceCapability = {
        type: 'switch',
        id: 'on',
        readonly: true,
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
    });
    test('valid switch capability with name should parse', () => {
      const capability: DeviceCapability = {
        type: 'switch',
        id: 'on',
        name: 'Power',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
    });
    test("switch capability with missing fields shouldn't parse", () => {
      const capability = {
        type: 'switch',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(false);
    });
    test("invalid switch capability shouldn't parse", () => {
      const capability = {
        type: 'switch',
        id: 'on',
        min: 0,
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(false);
    });
    test("additional fields aren't accepted", () => {
      const capability = {
        type: 'switch',
        id: 'on',
        extraField: 'extra',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(false);
    });
    describe('range capability', () => {
      test('normal range should parse', () => {
        const capability: DeviceCapability = {
          type: 'range',
          id: 'brightness',
          min: 0,
          max: 1,
        };
        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('range with step should parse', () => {
        const capability: DeviceCapability = {
          type: 'range',
          id: 'brightness',
          min: 0,
          max: 1,
          step: 0.01,
        };
        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('range with unit should parse', () => {
        const capability: DeviceCapability = {
          type: 'range',
          id: 'brightness',
          min: 0,
          max: 1,
          unit: '%',
        };
        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('range with step and unit should parse', () => {
        const capability: DeviceCapability = {
          type: 'range',
          id: 'brightness',
          min: 0,
          max: 1,
          step: 0.01,
          unit: '%',
        };
        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test("range without type shouldn't parse", () => {
        const capability = {
          id: 'brightness',
          min: 0,
          max: 1,
          step: 0.01,
          unit: '%',
        };
        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
      test("range without min shouldn't parse", () => {
        const capability = {
          type: 'range',
          id: 'brightness',
          max: 1,
          step: 0.01,
          unit: '%',
        };
        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
      test("range without max shouldn't parse", () => {
        const capability = {
          type: 'range',
          id: 'brightness',
          min: 0,
          step: 0.01,
          unit: '%',
        };
        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
    });
    describe('number capability', () => {
      test('normal number capability should parse', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with single bound (min) should parse', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          bound: {
            type: 'min',
            value: 0,
          },
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with single bound (max) should parse', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          bound: {
            type: 'max',
            value: 0,
          },
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with step should parse', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          step: 0.1,
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with unit should parse', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          unit: '°C',
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with step and unit should parse', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          step: 0.1,
          unit: '°C',
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test("number with invalid bound type shouldn't parse", () => {
        const capability = {
          id: 'temperature',
          type: 'number',
          bound: {
            type: 'invalid',
            value: 0,
          },
        };

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
    });
    describe('mode capability', () => {
      test('normal mode should parse', () => {
        const capability = {
          type: 'mode',
          id: 'speed',
          modes: ['auto', 'low', 'medium', 'high'],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test("mode without modes shouldn't parse", () => {
        const capability = {
          type: 'mode',
          id: 'speed',
        };

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
      test('mode with non-object non-string modes should parse', () => {
        const capability = {
          type: 'mode',
          id: 'speed',
          modes: [0, 1, 2, 3],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test("mode with object modes shouldn't parse", () => {
        const capability = {
          type: 'mode',
          id: 'speed',
          modes: [
            { speed: 'auto' },
            { speed: 'low' },
            { speed: 'medium' },
            { speed: 'high' },
          ],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
    });
  });

  describe('Device schema', () => {
    test("missing id shouldn't parse", () => {
      const device = {
        source: 'acme' as const,
        capabilities: [
          {
            type: 'invalid-type',
            id: 'invalid',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).toThrow();
      expect(deviceSchema.safeParse(device).success).toBe(false);
    });

    test("missing source shouldn't parse", () => {
      const device = {
        id: 'device-1',
        capabilities: [
          {
            type: 'invalid-type',
            id: 'invalid',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).toThrow();
      expect(deviceSchema.safeParse(device).success).toBe(false);
    });

    test("missing capabilities shouldn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme' as const,
      };
      expect(() => deviceSchema.parse(device)).toThrow();
      expect(deviceSchema.safeParse(device).success).toBe(false);
    });

    test("invalid capabilities shouldn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme' as const,
        capabilities: [
          {
            type: 'invalid-type',
            id: 'invalid',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).toThrow();
      expect(deviceSchema.safeParse(device).success).toBe(false);
    });

    test("invalid source shouldn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'invalid-source',
        capabilities: [
          {
            type: 'invalid-type',
            id: 'invalid',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).toThrow();
      expect(deviceSchema.safeParse(device).success).toBe(false);
    });

    test('valid device should parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme' as const,
        capabilities: [
          {
            type: 'switch' as const,
            id: 'power',
          },
          {
            type: 'range' as const,
            id: 'brightness',
            min: 0,
            max: 100,
            unit: '%',
          },
        ],
      };
      expect(() => deviceSchema.parse(device)).not.toThrow();
      expect(deviceSchema.safeParse(device).success).toBe(true);
    });

    test("device with empty capabilities array shouldn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme' as const,
        capabilities: [],
      };
      expect(() => deviceSchema.parse(device)).toThrow();
      expect(deviceSchema.safeParse(device).success).toBe(false);
    });
  });

  describe('Device with state and actions schema', () => {
    test("doesn't parse without state", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test("empty state  doesn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: {},
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test("invalid state type (string) doesn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: 'x',
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test("invalid state type (number) doesn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: 0,
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test("invalid state type (array) doesn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: [],
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test("missing state keys doesn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
          {
            type: 'mode',
            id: 'speed',
            modes: ['auto', 'low', 'medium', 'high'],
          },
        ],
        state: {
          power: true,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test("invalid state key doesn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: {
          invalid: 'x',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test("all state keys present with invalid states (invalid types) doesn't parse", () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: {
          power: 'x',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });
    test('valid state parses', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: {
          power: true,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    // Switch capability state tests
    test('valid switch states parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: {
          power: false, // Testing both true and false
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('invalid switch state (number) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: {
          power: 1,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('invalid switch state (string) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
        ],
        state: {
          power: 'on',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    // Range capability state tests
    test('valid range states parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
          },
        ],
        state: {
          brightness: 50,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('valid range states with readonly parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
            readonly: true,
          },
        ],
        state: {
          brightness: 50,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('valid range states with step parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
            step: 0.5,
          },
        ],
        state: {
          brightness: 99.5,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('invalid range state (not matching step) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
            step: 0.5,
          },
        ],
        state: {
          brightness: 50.7,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('invalid range state (below min) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
          },
        ],
        state: {
          brightness: -1,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('invalid range state (above max) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
          },
        ],
        state: {
          brightness: 101,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('invalid range state (wrong type) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
          },
        ],
        state: {
          brightness: '50',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    // Number capability state tests
    test('valid number states parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
          },
        ],
        state: {
          temperature: 22.5,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('valid readonly number states parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            readonly: true,
          },
        ],
        state: {
          temperature: 22.5,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('valid number states with step parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            step: 0.5,
          },
        ],
        state: {
          temperature: 22.5,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('invalid number state (not matching step) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            step: 0.5,
          },
        ],
        state: {
          temperature: 22.7,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('valid number states with step and min bound parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            step: 0.5,
            bound: {
              type: 'min',
              value: 0,
            },
          },
        ],
        state: {
          temperature: 22.5,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('valid number state with min bound parses', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            bound: {
              type: 'min',
              value: 0,
            },
          },
        ],
        state: {
          temperature: 1,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('invalid number state (below min bound) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            bound: {
              type: 'min',
              value: 0,
            },
          },
        ],
        state: {
          temperature: -1,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('valid number state with max bound parses', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            bound: {
              type: 'max',
              value: 100,
            },
          },
        ],
        state: {
          temperature: 99,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('invalid number state (above max bound) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
            bound: {
              type: 'max',
              value: 100,
            },
          },
        ],
        state: {
          temperature: 101,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('invalid number state (wrong type) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'number',
            id: 'temperature',
          },
        ],
        state: {
          temperature: '22.5',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    // Mode capability state tests
    test('valid mode states parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'mode',
            id: 'speed',
            modes: ['auto', 'low', 'medium', 'high'],
          },
        ],
        state: {
          speed: 'auto',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('invalid mode state (not in modes list) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'mode',
            id: 'speed',
            modes: ['auto', 'low', 'medium', 'high'],
          },
        ],
        state: {
          speed: 'turbo',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('invalid mode state (wrong type) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'mode',
            id: 'speed',
            modes: ['auto', 'low', 'medium', 'high'],
          },
        ],
        state: {
          speed: 1,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    // Validation refinement tests
    describe('Validation refinements', () => {
      describe('Range validation', () => {
        test('should validate step divides range cleanly', () => {
          const device = {
            id: 'device-1',
            source: 'acme',
            capabilities: [
              {
                type: 'range',
                id: 'temp',
                min: 0,
                max: 100,
                step: 0.5, // Divides cleanly into range
              },
            ],
            state: {
              temp: 50,
            },
          };
          expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        });

        test('should not validate when step does not divide range cleanly', () => {
          const device = {
            id: 'device-1',
            source: 'acme',
            capabilities: [
              {
                type: 'range',
                id: 'temp',
                min: 0,
                max: 100,
                step: 0.3, // Does not divide cleanly into range
              },
            ],
            state: {
              temp: 50,
            },
          };
          expect(() => deviceWithStateSchema.parse(device)).toThrow();
        });
      });

      describe('Mode validation', () => {
        test('should validate case-sensitive unique modes', () => {
          const device = {
            id: 'device-1',
            source: 'acme',
            capabilities: [
              {
                type: 'mode',
                id: 'mode',
                modes: ['Auto', 'auto', 'LOW'], // Different cases are considered unique
              },
            ],
            state: {
              mode: 'Auto',
            },
          };
          expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        });

        test('should not validate duplicate modes (case-sensitive)', () => {
          const device = {
            id: 'device-1',
            source: 'acme',
            capabilities: [
              {
                type: 'mode',
                id: 'mode',
                modes: ['auto', 'low', 'auto'], // Exact duplicate
              },
            ],
            state: {
              mode: 'auto',
            },
          };
          expect(() => deviceWithStateSchema.parse(device)).toThrow();
        });

        test('should not validate empty modes array', () => {
          const device = {
            id: 'device-1',
            source: 'acme',
            capabilities: [
              {
                type: 'mode',
                id: 'mode',
                modes: [], // Empty array
              },
            ],
            state: {
              mode: 'auto',
            },
          };
          expect(() => deviceWithStateSchema.parse(device)).toThrow();
        });

        test('should not validate non-array modes', () => {
          const device = {
            id: 'device-1',
            source: 'acme',
            capabilities: [
              {
                type: 'mode',
                id: 'mode',
                modes: 'auto', // String instead of array
              },
            ],
            state: {
              mode: 'auto',
            },
          };
          expect(() => deviceWithStateSchema.parse(device)).toThrow();
        });
      });
    });

    // Basic capability refinement tests
    describe('Basic capability refinements', () => {
      describe('Range capability validation', () => {
        test('should reject range when max is less than min', () => {
          const capability = {
            type: 'range' as const,
            id: 'temp',
            min: 100,
            max: 50, // Invalid: max < min
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
        });

        test('should reject range with negative step', () => {
          const capability = {
            type: 'range' as const,
            id: 'temp',
            min: 0,
            max: 100,
            step: -1, // Invalid: negative step
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
        });

        test('should reject range with zero step', () => {
          const capability = {
            type: 'range' as const,
            id: 'temp',
            min: 0,
            max: 100,
            step: 0, // Invalid: zero step
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
        });
      });

      describe('Number capability validation', () => {
        test('should reject number with negative step', () => {
          const capability = {
            type: 'number' as const,
            id: 'count',
            step: -1, // Invalid: negative step
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
          expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        });

        test('should reject number with zero step', () => {
          const capability = {
            type: 'number' as const,
            id: 'count',
            step: 0, // Invalid: zero step
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
          expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        });

        test('should accept number with positive step', () => {
          const capability = {
            type: 'number' as const,
            id: 'count',
            step: 1,
          };
          expect(() => basicCapabilitySchema.parse(capability)).not.toThrow();
          expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        });

        test('should accept number with undefined step', () => {
          const capability = {
            type: 'number' as const,
            id: 'count',
          };
          expect(() => basicCapabilitySchema.parse(capability)).not.toThrow();
          expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        });

        test('should accept number with small positive step', () => {
          const capability = {
            type: 'number' as const,
            id: 'count',
            step: 0.0001,
          };
          expect(() => basicCapabilitySchema.parse(capability)).not.toThrow();
          expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        });

        test('should reject number with very small negative step', () => {
          const capability = {
            type: 'number' as const,
            id: 'count',
            step: -0.0001,
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
          expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        });
      });

      describe('Mode capability validation', () => {
        test('should reject non-array modes', () => {
          const capability = {
            type: 'mode' as const,
            id: 'mode',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            modes: 'not-an-array' as any,
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
        });

        test('should reject empty modes array', () => {
          const capability = {
            type: 'mode' as const,
            id: 'mode',
            modes: [],
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
        });

        test('should reject modes with object string representation', () => {
          const capability = {
            type: 'mode' as const,
            id: 'mode',
            modes: ['[object Object]'],
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
        });

        test('should reject duplicate modes', () => {
          const capability = {
            type: 'mode' as const,
            id: 'mode',
            modes: ['auto', 'heat', 'auto'], // Duplicate 'auto'
          };
          expect(() => basicCapabilitySchema.parse(capability)).toThrow();
        });

        test('should accept valid unique modes', () => {
          const capability = {
            type: 'mode' as const,
            id: 'mode',
            modes: ['auto', 'heat', 'cool'],
          };
          expect(() => basicCapabilitySchema.parse(capability)).not.toThrow();
        });

        test('should accept case-sensitive unique modes', () => {
          const capability = {
            type: 'mode' as const,
            id: 'mode',
            modes: ['Auto', 'auto', 'AUTO'], // Different cases are considered unique
          };
          expect(() => basicCapabilitySchema.parse(capability)).not.toThrow();
        });
      });
    });

    // Multiple capabilities state tests
    test('valid multiple capabilities states parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
          },
          {
            type: 'mode',
            id: 'speed',
            modes: ['auto', 'low', 'medium', 'high'],
          },
        ],
        state: {
          power: true,
          brightness: 75,
          speed: 'medium',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('invalid multiple capabilities states (one invalid) does not parse', () => {
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'switch',
            id: 'power',
          },
          {
            type: 'range',
            id: 'brightness',
            min: 0,
            max: 100,
          },
          {
            type: 'mode',
            id: 'speed',
            modes: ['auto', 'low', 'medium', 'high'],
          },
        ],
        state: {
          power: true,
          brightness: 'full', // Invalid
          speed: 'medium',
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('valid device with actionStates should parse', () => {
      const device = {
        id: 'coffee-maker-1',
        source: 'acme' as const,
        capabilities: [
          {
            type: 'switch' as const,
            id: 'power',
          },
          {
            type: 'action' as const,
            id: 'brew',
            arguments: [
              {
                type: 'mode' as const,
                id: 'strength',
                modes: ['light', 'medium', 'strong'],
              },
            ],
            lockedFields: ['power'],
          },
        ],
        state: {
          power: true,
          brew: null, // Adding state for the action capability
        },
        actionStates: {
          'brew-1': {
            actionId: 'brew',
            progress: 'Heating water',
            startTime: new Date(),
            data: {
              strength: 'medium',
            },
          },
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
    });

    test('device with invalid actionStates should not parse', () => {
      const device = {
        id: 'coffee-maker-1',
        source: 'acme' as const,
        capabilities: [
          {
            type: 'switch' as const,
            id: 'power',
          },
        ],
        state: {
          power: true,
        },
        actionStates: {
          'brew-1': {
            // Missing required fields
            data: {
              strength: 'medium',
            },
          },
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('device with invalid actionStates date should not parse', () => {
      const device = {
        id: 'coffee-maker-1',
        source: 'acme' as const,
        capabilities: [
          {
            type: 'switch' as const,
            id: 'power',
          },
        ],
        state: {
          power: true,
        },
        actionStates: {
          'brew-1': {
            actionId: 'brew',
            progress: 'Heating water',
            startTime: 'invalid-date', // Should be a Date object
            data: {
              strength: 'medium',
            },
          },
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    test('device with unknown capability type in state validation does not parse', () => {
      // Create a device with a capability that has an unknown type
      const device = {
        id: 'device-1',
        source: 'acme',
        capabilities: [
          {
            type: 'unknown-type', // This is not one of the known types
            id: 'test',
          },
        ],
        state: {
          test: true,
        },
      };

      expect(() => deviceWithStateSchema.parse(device)).toThrow();
      expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
    });

    // Multimode capability state tests
    describe('multimode capability', () => {
      test('valid multimode states parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multimode',
              id: 'zones',
              modes: ['off', 'eco', 'comfort'],
            },
          ],
          state: {
            zones: ['eco', 'comfort'],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('invalid multimode state (non-array) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multimode',
              id: 'zones',
              modes: ['off', 'eco', 'comfort'],
            },
          ],
          state: {
            zones: 'eco',
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('invalid multimode state (invalid mode) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multimode',
              id: 'zones',
              modes: ['off', 'eco', 'comfort'],
            },
          ],
          state: {
            zones: ['eco', 'invalid'],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });
    });

    // Multirange capability state tests
    describe('multirange capability', () => {
      test('valid multirange states parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multirange',
              id: 'rgb',
              min: [0, 0, 0],
              max: [255, 255, 255],
            },
          ],
          state: {
            rgb: [128, 64, 255],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('valid multirange with single min/max parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multirange',
              id: 'rgb',
              min: 0,
              max: 255,
            },
          ],
          state: {
            rgb: [128, 64, 255],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('valid multirange with step and length parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multirange',
              id: 'rgb',
              min: [0, 0, 0],
              max: [255, 255, 255],
              step: 1,
              length: 3,
            },
          ],
          state: {
            rgb: [128, 64, 255],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('invalid multirange state (non-array) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multirange',
              id: 'rgb',
              min: [0, 0, 0],
              max: [255, 255, 255],
            },
          ],
          state: {
            rgb: 128,
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('invalid multirange state (wrong length) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multirange',
              id: 'rgb',
              min: [0, 0, 0],
              max: [255, 255, 255],
              length: 3,
            },
          ],
          state: {
            rgb: [128, 64],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });
    });

    // Multinumber capability state tests
    describe('multinumber capability', () => {
      test('valid multinumber states parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
              bound: [
                { type: 'min', value: -90 },
                { type: 'min', value: -180 },
              ],
            },
          ],
          state: {
            coords: [45, 90],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('valid multinumber with shared min bound parses', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
              bound: {
                type: 'min',
                value: 0,
              },
            },
          ],
          state: {
            coords: [45, 90],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('invalid multinumber with shared min bound does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
              bound: {
                type: 'min',
                value: 0,
              },
            },
          ],
          state: {
            coords: [-45, 90], // First value violates min bound
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('valid multinumber with shared max bound parses', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
              bound: {
                type: 'max',
                value: 100,
              },
            },
          ],
          state: {
            coords: [45, 90],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('invalid multinumber with shared max bound does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
              bound: {
                type: 'max',
                value: 100,
              },
            },
          ],
          state: {
            coords: [45, 150], // Second value violates max bound
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('valid multinumber with step and length parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
              step: 0.5,
              length: 2,
            },
          ],
          state: {
            coords: [45.5, 90.0],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('invalid multinumber state (non-array) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
            },
          ],
          state: {
            coords: 45,
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('invalid multinumber state (wrong length) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multinumber',
              id: 'coords',
              length: 2,
            },
          ],
          state: {
            coords: [45],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });
    });

    // Multivalue capability state tests
    // Action capability tests
    describe('action capability', () => {
      test('valid action capability should parse', () => {
        const capability: DeviceCapability = {
          type: 'action',
          id: 'brew',
          arguments: [
            {
              type: 'mode',
              id: 'strength',
              modes: ['light', 'medium', 'strong'],
            },
            {
              type: 'range',
              id: 'temperature',
              min: 85,
              max: 100,
              unit: '°C',
            },
          ],
          lockedFields: ['power', 'water_level'],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });

      test('valid action capability with name should parse', () => {
        const capability: DeviceCapability = {
          type: 'action',
          id: 'brew',
          name: 'Brew Coffee',
          arguments: [
            {
              type: 'mode',
              id: 'strength',
              modes: ['light', 'medium', 'strong'],
            },
          ],
          lockedFields: ['power'],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });

      test('action capability without arguments should not parse', () => {
        const capability = {
          type: 'action',
          id: 'brew',
          lockedFields: ['power'],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });

      test('action capability without lockedFields should not parse', () => {
        const capability = {
          type: 'action',
          id: 'brew',
          arguments: [
            {
              type: 'mode',
              id: 'strength',
              modes: ['light', 'medium', 'strong'],
            },
          ],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });

      test('action capability with invalid argument type should not parse', () => {
        const capability = {
          type: 'action',
          id: 'brew',
          arguments: [
            {
              type: 'invalid',
              id: 'strength',
            },
          ],
          lockedFields: ['power'],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });

      test('action capability with invalid lockedFields type should not parse', () => {
        const capability = {
          type: 'action',
          id: 'brew',
          arguments: [
            {
              type: 'mode',
              id: 'strength',
              modes: ['light', 'medium', 'strong'],
            },
          ],
          lockedFields: 'power', // should be an array
        };

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
    });

    // Multiswitch capability state tests
    describe('multiswitch capability', () => {
      test('valid multiswitch states parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multiswitch',
              id: 'outlets',
            },
          ],
          state: {
            outlets: [true, false, true],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('valid multiswitch with length parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multiswitch',
              id: 'outlets',
              length: 2,
            },
          ],
          state: {
            outlets: [true, false],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('invalid multiswitch state (non-array) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multiswitch',
              id: 'outlets',
            },
          ],
          state: {
            outlets: true,
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('invalid multiswitch state (wrong length) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multiswitch',
              id: 'outlets',
              length: 2,
            },
          ],
          state: {
            outlets: [true, false, true],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('invalid multiswitch state (non-boolean values) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multiswitch',
              id: 'outlets',
            },
          ],
          state: {
            outlets: [true, 1, false],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });
    });

    describe('multivalue capability', () => {
      test('valid multivalue states parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multivalue',
              id: 'tags',
            },
          ],
          state: {
            tags: ['home', 'office', 'kitchen'],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('valid multivalue with length parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multivalue',
              id: 'tags',
              length: 3,
            },
          ],
          state: {
            tags: ['home', 'office', 'kitchen'],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).not.toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(true);
      });

      test('invalid multivalue state (non-array) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multivalue',
              id: 'tags',
            },
          ],
          state: {
            tags: 'home',
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('invalid multivalue state (wrong length) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multivalue',
              id: 'tags',
              length: 2,
            },
          ],
          state: {
            tags: ['home', 'office', 'kitchen'],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });

      test('invalid multivalue state (non-string values) does not parse', () => {
        const device = {
          id: 'device-1',
          source: 'acme',
          capabilities: [
            {
              type: 'multivalue',
              id: 'tags',
            },
          ],
          state: {
            tags: ['home', 42, 'kitchen'],
          },
        };

        expect(() => deviceWithStateSchema.parse(device)).toThrow();
        expect(deviceWithStateSchema.safeParse(device).success).toBe(false);
      });
    });
  });
});
