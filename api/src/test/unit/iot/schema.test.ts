import {
  DeviceCapability,
  deviceCapabilitySchema,
  deviceSchema,
  DeviceSource,
  deviceSourceSchema,
  deviceWithStateSchema,
} from '../../../schemas/devices';

describe('IoT Device Schema Tests', () => {
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

  describe('Device with state schema', () => {
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
  });
});
