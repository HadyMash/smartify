/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from 'axios';
import { AxiosError } from 'axios';
import {
  Device,
  DeviceCapability,
  deviceCapabilitySchema,
  deviceSchema,
  deviceSourceSchema,
  deviceWithPartialStateSchema,
  DeviceWithState,
  deviceWithStateSchema,
  State,
  stateSchema,
} from '../../../schemas/devices.ts';
import { AcmeIoTAdapter } from '../../../services/iot/acme-adapter.ts';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};
const mockedCreate = jest.fn().mockReturnValue(mockedAxiosInstance);
mockedAxios.create = mockedCreate;

mockedAxios.isAxiosError = ((payload: any): payload is AxiosError<any, any> => {
  return payload instanceof Error && 'isAxiosError' in payload;
}) as jest.MockedFunction<typeof axios.isAxiosError>;
describe('AcmeIoTAdapter', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Setup environment variables for tests
    process.env = {
      ...originalEnv,
      ACME_API_URL: 'https://api.acme.com',
      ACME_API_KEY: 'test-api-key',
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should initialize with correct API URL and key', () => {
      const adapter = new AcmeIoTAdapter();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.acme.com',
        headers: {
          'x-api-key': 'test-api-key',
        },
      });
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.healthCheck();

      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.acme.com/health',
      );
    });

    it('should return false when API request fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.healthCheck();

      expect(result).toBe(false);
    });

    it('should return false when API returns non-200 status', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 500 });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('mapCapability', () => {
    it('should return undefined for invalid capability without type', () => {
      const adapter = new AcmeIoTAdapter();
      const result = adapter.mapCapability({});

      expect(result).toBeUndefined();
    });

    it('should map power capability correctly', () => {
      const adapter = new AcmeIoTAdapter();
      const mockCapability = {
        type: 'power',
        isReadOnly: false,
      };

      const expected: DeviceCapability = {
        id: 'on',
        type: 'switch',
        name: 'power',
        readonly: false,
      };

      const result = adapter.mapCapability(mockCapability);
      expect(result).toEqual(expected);
    });

    it('should map readonly power capability correctly', () => {
      const adapter = new AcmeIoTAdapter();
      const mockCapability = {
        type: 'power',
        isReadOnly: true,
      };

      const result = adapter.mapCapability(mockCapability);
      expect(result?.readonly).toBe(true);
    });

    it('should map brightness capability correctly', () => {
      const adapter = new AcmeIoTAdapter();
      const mockCapability = {
        type: 'brightness',
        min: 10,
        max: 90,
        isReadOnly: false,
      };

      const expected: DeviceCapability = {
        id: 'brightness',
        type: 'range',
        min: 10,
        max: 90,
        unit: '%',
        readonly: false,
      };

      const result = adapter.mapCapability(mockCapability);
      expect(result).toEqual(expected);
    });

    it('should use default min and max for brightness when not provided', () => {
      const adapter = new AcmeIoTAdapter();
      const mockCapability = {
        type: 'brightness',
        isReadOnly: false,
      };

      const result = adapter.mapCapability(mockCapability);
      if (result?.type === 'range') {
        expect(result.min).toBe(0);
        expect(result.max).toBe(100);
      }
    });

    it('should map rgb_color capability correctly', () => {
      const adapter = new AcmeIoTAdapter();
      const mockCapability = {
        type: 'rgb_color',
        isReadOnly: false,
      };

      const expected: DeviceCapability = {
        id: 'color',
        type: 'multirange',
        min: 0,
        max: 255,
        step: 1,
        length: 3,
        name: 'RGB Color',
        readonly: false,
      };

      const result = adapter.mapCapability(mockCapability);
      expect(result).toEqual(expected);
    });

    it('should map limited_color capability correctly', () => {
      const adapter = new AcmeIoTAdapter();
      const mockCapability = {
        type: 'limited_color',
        availableColors: ['red', 'green', 'blue'],
        isReadOnly: false,
      };

      const expected: DeviceCapability = {
        id: 'color',
        type: 'mode',
        modes: ['red', 'green', 'blue'],
        readonly: false,
      };

      const result = adapter.mapCapability(mockCapability);
      expect(result).toEqual(expected);
    });

    it('should return undefined for unknown capability type', () => {
      const adapter = new AcmeIoTAdapter();
      const mockCapability = {
        type: 'unknown_capability',
      };

      const result = adapter.mapCapability(mockCapability);
      expect(result).toBeUndefined();
    });
  });

  describe('mapDevice', () => {
    let adapter: AcmeIoTAdapter;

    beforeEach(() => {
      adapter = new AcmeIoTAdapter();
    });

    it('should correctly map a valid device', () => {
      const mockDevice = {
        id: 'device-123',
        capabilities: [
          { type: 'power', isReadOnly: false },
          { type: 'brightness', min: 0, max: 100, isReadOnly: false },
        ],
      };

      const result = adapter.mapDevice(mockDevice);

      expect(result).toBeDefined();
      expect(result?.id).toBe('device-123');
      expect(result?.source).toBe(deviceSourceSchema.enum.acme);
      expect(result?.capabilities.length).toBe(2);
      expect(result?.capabilities[0]?.id).toBe('on');
      expect(result?.capabilities[1]?.id).toBe('brightness');
    });

    it('should return undefined for invalid device format', () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevice = {
        capabilities: [{ id: 'test', type: 'switch', readonly: false }],
      }; // Missing `id`

      expect(() => adapter.mapDevice(mockDevice)).toThrow(
        'Device mapping failed: missing ID',
      );
    });

    it('should handle empty capabilities array', () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevice = {
        id: 'device-123',
        capabilities: [], // Explicit empty array
      };
      expect(() => adapter.mapDevice(mockDevice)).toThrow(
        'Device mapping failed: capabilities array must not be empty',
      );
    });
  });

  describe('mapDeviceWithState', () => {
    it('should correctly map a device with state', () => {
      // Mock schema validation
      jest
        .spyOn(deviceWithStateSchema, 'parse')
        .mockImplementation((device) => device as any);

      const adapter = new AcmeIoTAdapter();
      const mockDevice = {
        id: 'device-123',
        capabilities: [
          {
            type: 'power',
            isReadOnly: false,
          },
          {
            type: 'brightness',
            min: 0,
            max: 100,
            isReadOnly: false,
          },
        ],
        on: true,
        brightness: 75,
      };

      const result = adapter.mapDeviceWithState(mockDevice);

      expect(result).toBeDefined();
      expect(result?.id).toBe('device-123');
      expect(result?.source).toBe(deviceSourceSchema.enum.acme);
      expect(result?.capabilities.length).toBe(2);
      expect(result?.state.on).toBe(true);
      expect(result?.state.brightness).toBe(75);

      (deviceWithStateSchema.parse as jest.Mock).mockRestore();
    });

    it('should return undefined when capabilities mapping fails', () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevice = {
        id: 'device-123',
        capabilities: [
          {
            type: 'unknown_type',
          },
        ],
        on: true,
      };

      const result = adapter.mapDeviceWithState(mockDevice);
      expect(result).toBeUndefined();
    });

    it('should return undefined when schema validation fails', () => {
      jest.spyOn(deviceWithStateSchema, 'parse').mockImplementation(() => {
        throw new Error('Validation error');
      });

      const adapter = new AcmeIoTAdapter();
      const mockDevice = {
        id: 'device-123',
        capabilities: [{ type: 'power', isReadOnly: false }],
        on: true,
      };

      const result = adapter.mapDeviceWithState(mockDevice);
      expect(result).toBeUndefined();

      (deviceWithStateSchema.parse as jest.Mock).mockRestore();
    });
  });

  describe('mapDeviceWithPartialState', () => {
    it('should correctly map a device with partial state', () => {
      // Mock schema validation
      jest
        .spyOn(deviceWithPartialStateSchema, 'parse')
        .mockImplementation((device) => device as any);

      const adapter = new AcmeIoTAdapter();
      const mockDevice = {
        id: 'device-123',
        capabilities: [
          {
            type: 'power',
            isReadOnly: false,
          },
          {
            type: 'brightness',
            min: 0,
            max: 100,
            isReadOnly: false,
          },
        ],
        on: true,
        // brightness is missing from state
      };

      const result = adapter.mapDeviceWithPartialState(mockDevice);

      expect(result).toBeDefined();
      expect(result?.id).toBe('device-123');
      expect(result?.source).toBe(deviceSourceSchema.enum.acme);
      expect(result?.capabilities.length).toBe(2);
      expect(result?.state.on).toBe(true);
      expect(result?.state.brightness).toBeUndefined();

      (deviceWithPartialStateSchema.parse as jest.Mock).mockRestore();
    });

    it('should return undefined when capabilities mapping fails', () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevice = {
        id: 'device-123',
        capabilities: [
          {
            type: 'unknown_type',
          },
        ],
        on: true,
      };

      const result = adapter.mapDeviceWithPartialState(mockDevice);
      expect(result).toBeUndefined();
    });
  });

  describe('discoverDevices', () => {
    it('should discover and map devices successfully', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: 'device-123',
            capabilities: [{ type: 'power', isReadOnly: false }],
          },
          {
            id: 'device-456',
            capabilities: [
              { type: 'brightness', min: 0, max: 100, isReadOnly: false },
            ],
          },
        ],
      });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.discoverDevices();

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/discover');
      expect(result).toHaveLength(2);
      expect(result?.[0].id).toBe('device-123');
      expect(result?.[1].id).toBe('device-456');
    });

    it('should handle API errors during discovery', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      mockedAxiosInstance.get.mockRejectedValueOnce(new Error('API error'));

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.discoverDevices();

      expect(result).toBeUndefined();
      expect(console.log).toHaveBeenCalled();

      (console.log as jest.Mock).mockRestore();
    });

    it('should handle non-200 status codes during discovery', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 500,
        data: [],
      });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.discoverDevices();

      expect(result).toBeUndefined();
    });
  });

  describe('pairDevices', () => {
    it('should pair devices by ID array', async () => {
      mockedAxiosInstance.post.mockResolvedValue({ status: 200 });

      const adapter = new AcmeIoTAdapter();
      await adapter.pairDevices(['device-123', 'device-456']);

      expect(mockedAxiosInstance.post).toHaveBeenCalledTimes(2);
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/pair/device-123');
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/pair/device-456');
    });

    it('should pair devices by Device objects', async () => {
      mockedAxiosInstance.post.mockResolvedValue({ status: 200 });

      const adapter = new AcmeIoTAdapter();
      const devices: Device[] = [
        {
          id: 'device-123',
          capabilities: [{ id: 'test', type: 'switch' }],
          source: deviceSourceSchema.enum.acme,
        },
        {
          id: 'device-456',
          capabilities: [{ id: 'test', type: 'switch' }],
          source: deviceSourceSchema.enum.acme,
        },
      ];

      await adapter.pairDevices(devices);

      expect(mockedAxiosInstance.post).toHaveBeenCalledTimes(2);
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/pair/device-123');
      expect(mockedAxiosInstance.post).toHaveBeenCalledWith('/pair/device-456');
    });

    it('should handle errors during device pairing', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      mockedAxiosInstance.post.mockRejectedValue(new Error('Pairing error'));

      const adapter = new AcmeIoTAdapter();
      await adapter.pairDevices(['device-123']);

      expect(console.log).toHaveBeenCalled();

      (console.log as jest.Mock).mockRestore();
    });
  });

  describe('unpairDevices', () => {
    it('should unpair devices by ID array', async () => {
      mockedAxiosInstance.delete.mockResolvedValue({ status: 200 });

      const adapter = new AcmeIoTAdapter();
      await adapter.unpairDevices(['device-123', 'device-456']);

      expect(mockedAxiosInstance.delete).toHaveBeenCalledTimes(2);
      expect(mockedAxiosInstance.delete).toHaveBeenCalledWith(
        '/pair/device-123',
      );
      expect(mockedAxiosInstance.delete).toHaveBeenCalledWith(
        '/pair/device-456',
      );
    });

    it('should unpair devices by Device objects', async () => {
      mockedAxiosInstance.delete.mockResolvedValue({ status: 200 });

      const adapter = new AcmeIoTAdapter();
      const devices: Device[] = [
        {
          id: 'device-123',
          capabilities: [{ id: 'test', type: 'switch', readonly: false }],
          source: deviceSourceSchema.enum.acme,
        },
        {
          id: 'device-456',
          capabilities: [{ id: 'test', type: 'switch', readonly: false }],
          source: deviceSourceSchema.enum.acme,
        },
      ];

      await adapter.unpairDevices(devices);

      expect(mockedAxiosInstance.delete).toHaveBeenCalledTimes(2);
      expect(mockedAxiosInstance.delete).toHaveBeenCalledWith(
        '/pair/device-123',
      );
      expect(mockedAxiosInstance.delete).toHaveBeenCalledWith(
        '/pair/device-456',
      );
    });

    it('should handle errors during device unpairing', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      mockedAxiosInstance.delete.mockRejectedValue(
        new Error('Unpairing error'),
      );

      const adapter = new AcmeIoTAdapter();
      await adapter.unpairDevices(['device-123']);

      expect(console.log).toHaveBeenCalled();

      (console.log as jest.Mock).mockRestore();
    });
  });

  describe('getDevice', () => {
    it('should get and map a single device', async () => {
      // Mock schema validation
      jest
        .spyOn(deviceWithStateSchema, 'parse')
        .mockImplementation((device) => device as any);

      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        data: {
          id: 'device-123',
          capabilities: [{ type: 'power', isReadOnly: false }],
          on: true,
        },
      });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.getDevice('device-123');

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
        '/devices/device-123',
      );
      expect(result).toBeDefined();
      expect(result?.id).toBe('device-123');
      expect(result?.state.on).toBe(true);

      (deviceWithStateSchema.parse as jest.Mock).mockRestore();
    });

    it('should handle API errors when getting a device', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      mockedAxiosInstance.get.mockRejectedValueOnce(
        new Error('Get device error'),
      );

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.getDevice('device-123');

      expect(result).toBeUndefined();
      expect(console.log).toHaveBeenCalled();

      (console.log as jest.Mock).mockRestore();
    });

    it('should handle non-200 status codes when getting a device', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 404,
        data: null,
      });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.getDevice('device-123');

      expect(result).toBeUndefined();
    });
  });

  describe('getDevices', () => {
    it('should get and map multiple devices', async () => {
      // Mock schema validation
      jest
        .spyOn(deviceWithStateSchema, 'parse')
        .mockImplementation((device) => device as any);

      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: 'device-123',
            capabilities: [{ type: 'power', isReadOnly: false }],
            on: true,
          },
          {
            id: 'device-456',
            capabilities: [
              { type: 'brightness', min: 0, max: 100, isReadOnly: false },
            ],
            brightness: 75,
          },
          {
            id: 'device-789', // This one won't be in our request
            capabilities: [{ type: 'power', isReadOnly: false }],
            on: false,
          },
        ],
      });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.getDevices(['device-123', 'device-456']);

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/devices');
      expect(result).toHaveLength(2);
      expect(result?.[0].id).toBe('device-123');
      expect(result?.[1].id).toBe('device-456');

      (deviceWithStateSchema.parse as jest.Mock).mockRestore();
    });

    it('should handle API errors when getting devices', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      mockedAxiosInstance.get.mockRejectedValueOnce(
        new Error('Get devices error'),
      );

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.getDevices(['device-123']);

      expect(result).toBeUndefined();
      expect(console.log).toHaveBeenCalled();

      (console.log as jest.Mock).mockRestore();
    });

    it('should handle non-200 status codes when getting devices', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({
        status: 500,
        data: null,
      });

      const adapter = new AcmeIoTAdapter();
      const result = await adapter.getDevices(['device-123']);

      expect(result).toBeUndefined();
    });
  });
  describe('setDeviceState', () => {
    it('should successfully update device state', async () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevice: DeviceWithState = {
        id: 'device-123',
        capabilities: [{ id: 'brightness', type: 'switch', readonly: false }],
        state: { brightness: 50 },
        source: 'acme',
      };

      jest.spyOn(adapter, 'getDevice').mockResolvedValue(mockDevice);
      mockedAxiosInstance.patch.mockResolvedValueOnce({ status: 200 });

      await adapter.setDeviceState('device-123', { brightness: 75 });

      expect(mockedAxiosInstance.patch).toHaveBeenCalledWith(
        '/devices/device-123/state',
        { brightness: 75 },
      );
    });

    it('should throw error when trying to modify readonly capability', async () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevice: DeviceWithState = {
        id: 'device-456',
        capabilities: [{ id: 'locked', type: 'switch', readonly: true }],
        state: { locked: true },
        source: 'acme',
      };

      jest.spyOn(adapter, 'getDevice').mockResolvedValue(mockDevice);

      await expect(
        adapter.setDeviceState('device-456', { locked: false }),
      ).rejects.toThrow('Cannot modify readonly capabilities');
    });

    it('should throw error when device is not found', async () => {
      const adapter = new AcmeIoTAdapter();
      jest.spyOn(adapter, 'getDevice').mockResolvedValue(undefined);

      await expect(
        adapter.setDeviceState('device-789', { brightness: 80 }),
      ).rejects.toThrow('Device not found');

      expect(mockedAxiosInstance.patch).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevice: DeviceWithState = {
        id: 'device-123',
        capabilities: [
          { id: 'brightness', type: 'multiswitch', readonly: false },
        ],
        state: { brightness: 50 },
        source: 'acme',
      };

      jest.spyOn(adapter, 'getDevice').mockResolvedValue(mockDevice);
      mockedAxiosInstance.patch.mockRejectedValueOnce(new Error('API failure'));

      await expect(
        adapter.setDeviceState('device-123', { brightness: 90 }),
      ).rejects.toThrow('API failure');

      expect(mockedAxiosInstance.patch).toHaveBeenCalled();
    });
  });

  describe('setDeviceStates', () => {
    it('should update multiple device states successfully', async () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevices: DeviceWithState[] = [
        {
          id: 'device-1',
          capabilities: [{ id: 'brightness', type: 'switch', readonly: false }],
          state: { brightness: 50 },
          source: 'acme',
        },
        {
          id: 'device-2',
          capabilities: [{ id: 'power', type: 'switch', readonly: false }],
          state: { power: true },
          source: 'acme',
        },
      ];

      jest.spyOn(adapter, 'getDevices').mockResolvedValue(mockDevices);
      jest.spyOn(adapter, 'setDeviceState').mockResolvedValue(undefined);

      await adapter.setDeviceStates({
        'device-1': { brightness: 80 },
        'device-2': { power: false },
      });

      expect(adapter.setDeviceState).toHaveBeenCalledWith('device-1', {
        brightness: 80,
      });
      expect(adapter.setDeviceState).toHaveBeenCalledWith('device-2', {
        power: false,
      });
    });

    it('should throw an error if trying to modify readonly capabilities', async () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevices: DeviceWithState[] = [
        {
          id: 'device-3',
          capabilities: [{ id: 'temperature', type: 'number', readonly: true }],
          state: { temperature: 22 },
          source: 'acme',
        },
      ];

      jest.spyOn(adapter, 'getDevices').mockResolvedValue(mockDevices);

      await expect(
        adapter.setDeviceStates({ 'device-3': { temperature: 24 } }),
      ).rejects.toThrow(
        'Cannot modify readonly capabilities for device device-3',
      );
    });

    it('should throw an error when devices cannot be fetched', async () => {
      const adapter = new AcmeIoTAdapter();
      jest.spyOn(adapter, 'getDevices').mockResolvedValue(undefined);

      await expect(
        adapter.setDeviceStates({ 'device-4': { brightness: 60 } }),
      ).rejects.toThrow('Failed to fetch devices');
    });

    it('should skip state updates for devices that do not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      const mockDevices: DeviceWithState[] = [
        {
          id: 'device-5',
          capabilities: [{ id: 'speed', type: 'multivalue', readonly: false }],
          state: { speed: 3 },
          source: 'acme',
        },
      ];

      jest.spyOn(adapter, 'getDevices').mockResolvedValue(mockDevices);
      jest.spyOn(adapter, 'setDeviceState').mockResolvedValue(undefined);

      await adapter.setDeviceStates({
        'device-5': { speed: 5 },
        'device-6': { brightness: 100 }, // This device doesn't exist
      });

      expect(adapter.setDeviceState).toHaveBeenCalledWith('device-5', {
        speed: 5,
      });
      expect(adapter.setDeviceState).not.toHaveBeenCalledWith(
        'device-6',
        expect.anything(),
      );
    });
  });
});
