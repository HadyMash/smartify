import {
  DeviceCapability,
  deviceCapabilitySchema,
  DeviceSource,
  deviceSourceSchema,
} from '../../../schemas/devices';

describe('IoT Device Schema Tests', () => {
  describe('Device source schema', () => {
    test('valid source', () => {
      const source: DeviceSource = 'acme';
      expect(() => deviceSourceSchema.parse(source)).not.toThrow();
      expect(deviceSourceSchema.parse(source)).toBe(source);
      expect(deviceSourceSchema.safeParse(source).success).toBe(true);
    });
    test('invalid source', () => {
      const source = 'invalid';
      expect(() => deviceSourceSchema.parse(source)).toThrow();
      expect(deviceSourceSchema.safeParse(source).success).toBe(false);
    });
  });

  describe('Device capability schema', () => {
    test('valid switch capability', () => {
      const capability: DeviceCapability = {
        type: 'switch',
        id: 'on',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
    });
    test('valid switch capability with name', () => {
      const capability: DeviceCapability = {
        type: 'switch',
        id: 'on',
        name: 'Power',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
    });
    test('switch capability with missing fields', () => {
      const capability = {
        type: 'switch',
      };
      expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
      expect(deviceCapabilitySchema.safeParse(capability).success).toBe(false);
    });
    test('invalid switch capability', () => {
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
      test('normal range', () => {
        const capability: DeviceCapability = {
          type: 'range',
          id: 'brightness',
          min: 0,
          max: 1,
        };
        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('range with step', () => {
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
      test('range with unit', () => {
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
      test('range with step and unit', () => {
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
      test('range without type', () => {
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
      test('range without min', () => {
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
      test('range without max', () => {
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
      test('normal number capability', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with single bound (min)', () => {
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
      test('number with single bound (max)', () => {
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
      test('number with step', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          step: 0.1,
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with unit', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          unit: '°C',
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with step and unit', () => {
        const capability: DeviceCapability = {
          id: 'temperature',
          type: 'number',
          step: 0.1,
          unit: '°C',
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('number with invalid bound type', () => {
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
      test('normal mode', () => {
        const capability = {
          type: 'mode',
          id: 'speed',
          modes: ['auto', 'low', 'medium', 'high'],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('mode without modes', () => {
        const capability = {
          type: 'mode',
          id: 'speed',
        };

        try {
          console.log(deviceCapabilitySchema.parse(capability));
          console.log('no issues');
        } catch (e) {
          console.log('error', e);
        }

        expect(() => deviceCapabilitySchema.parse(capability)).toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(
          false,
        );
      });
      test('mode with non-object non-string modes', () => {
        const capability = {
          type: 'mode',
          id: 'speed',
          modes: [0, 1, 2, 3],
        };

        expect(() => deviceCapabilitySchema.parse(capability)).not.toThrow();
        expect(deviceCapabilitySchema.safeParse(capability).success).toBe(true);
      });
      test('mode with object modes', () => {
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
});
