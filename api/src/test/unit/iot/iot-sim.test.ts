/*import { spawn, ChildProcess, exec } from 'child_process';
import { resolve } from 'path';
import fs from 'fs';
import { AcmeIoTAdapter } from '../../../services/iot/acme-adapter';
import { deviceSourceSchema, deviceWithPartialStateSchema, deviceWithStateSchema } from '../../../schemas/devices';

const projectDir = resolve('..', 'simulation', 'acme');
const sampleFile = resolve(projectDir, 'src/example-devices-db-test.ts');

describe('AcmeIoTAdapter (with simulation)', () => {
  let adapter: AcmeIoTAdapter;
  let child: ChildProcess | null = null;

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      exec('npm run build', { cwd: projectDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Build error: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`Build stderr: ${stderr}`);
        }
        console.log(`Build output: ${stdout}`);
        resolve();
      });
    });
  });

  beforeEach(async () => {
    // Start the simulator
    child = spawn('npm', ['run', 'start', 'src/example-devices-db-test.ts'], {
      cwd: projectDir,
      stdio: 'inherit',
      shell: true,
    });

    // Wait for the sample file to be created
    await new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        if (fs.existsSync(sampleFile)) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);

      // Timeout if file isn't created in 15s
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Simulator did not generate the sample file in time.'));
      }, 15000);
    });

    // Initialize the adapter
    adapter = new AcmeIoTAdapter();
  });

  afterEach(() => {
    if (child) {
      child.kill();
      child = null;
    }
  });

  describe('mapCapability', () => {
    it('should return undefined for invalid capability without type', async () => {
      const result = adapter.mapCapability({});
      expect(result).toBeUndefined();
    });

    it('should map power capability correctly', async () => {
      const devices = await adapter.getDevices(['device-123']);
      const powerCapability = devices?.[0]?.capabilities.find(c => c.type === 'switch' && c.name === 'power');

      if (!powerCapability) {
        throw new Error('No power capability found in simulated devices');
      }

      const result = adapter.mapCapability(powerCapability);
      expect(result).toEqual({
        id: 'on',
        type: 'switch',
        name: 'power',
        readonly: powerCapability.readonly,
      });
    });

    it('should map brightness capability correctly', async () => {
      const devices = await adapter.getDevices(['device-123']);
      const brightnessCapability = devices?.[0]?.capabilities.find(c => c.type === 'range' && c.name === 'brightness');

      if (!brightnessCapability) {
        throw new Error('No brightness capability found in simulated devices');
      }

      if (!('min' in brightnessCapability)) {
        throw new Error('Brightness capability does not have min property');
      }
      const result = adapter.mapCapability(brightnessCapability);
      expect(result).toEqual({
        id: 'brightness',
        type: 'range',
        min: brightnessCapability.min ?? 0,
        max: brightnessCapability.max ?? 100,
        unit: '%',
        readonly: brightnessCapability.readonly,
      });
    });

    it('should return undefined for unknown capability type', async () => {
      const result = adapter.mapCapability({ type: 'unknown_capability' });
      expect(result).toBeUndefined();
    });
  });

  describe('mapDevice', () => {
    it('should correctly map a valid device', async () => {
      const devices = await adapter.getDevices(['device-123']);
      if (!devices || devices.length === 0) {
        throw new Error('No devices found for testing');
      }

      const mappedDevice = adapter.mapDevice(devices[0]);
      expect(mappedDevice).toBeDefined();
      expect(mappedDevice?.id).toBe(devices[0].id);
      expect(mappedDevice?.capabilities.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid device format', () => {
      const invalidDevice = {
        capabilities: [{ id: 'test', type: 'switch', readonly: false }],
      }; // Missing `id`

      expect(() => adapter.mapDevice(invalidDevice)).toThrow(
        'Device mapping failed: missing ID',
      );
    });

    it('should handle empty capabilities array', () => {
      const emptyDevice = {
        id: 'device-123',
        capabilities: [], // Explicit empty array
      };

      expect(() => adapter.mapDevice(emptyDevice)).toThrow(
        'Device mapping failed: capabilities array must not be empty',
      );
    });
  });
  describe('mapDeviceWithState', () => {
    it('should correctly map a device with state', async () => {
      jest
        .spyOn(deviceWithStateSchema, 'parse')
        .mockImplementation((device) => device as any);

      const devices = await adapter.getDevices(['device-123']);
      if (!devices || devices.length === 0) {
        throw new Error('No devices found for testing');
      }

      const simulatedDevice = { ...devices[0], state: { on: true, brightness: 75 } };
      const result = adapter.mapDeviceWithState(simulatedDevice);

      expect(result).toBeDefined();
      expect(result?.id).toBe('device-123');
      expect(result?.source).toBe(deviceSourceSchema.enum.acme);
      expect(result?.capabilities.length).toBeGreaterThan(0);
      expect(result?.state.on).toBe(true);
      expect(result?.state.brightness).toBe(75);

      (deviceWithStateSchema.parse as jest.Mock).mockRestore();
    });

    it('should return undefined when capabilities mapping fails', async () => {
      const result = adapter.mapDeviceWithState({
        id: 'device-123',
        capabilities: [{ type: 'unknown_type' }],
        state: { on: true },
      });
      expect(result).toBeUndefined();
    });

    it('should return undefined when schema validation fails', async () => {
      jest.spyOn(deviceWithStateSchema, 'parse').mockImplementation(() => {
        throw new Error('Validation error');
      });

      const result = adapter.mapDeviceWithState({
        id: 'device-123',
        capabilities: [{ type: 'power', isReadOnly: false }],
        state: { on: true },
      });

      expect(result).toBeUndefined();
      (deviceWithStateSchema.parse as jest.Mock).mockRestore();
    });
  });

  describe('mapDeviceWithPartialState', () => {
    it('should correctly map a device with partial state', async () => {
      jest
        .spyOn(deviceWithPartialStateSchema, 'parse')
        .mockImplementation((device) => device as any);

      const devices = await adapter.getDevices(['device-123']);
      if (!devices || devices.length === 0) {
        throw new Error('No devices found for testing');
      }

      const simulatedDevice = { ...devices[0], state: { on: true } };
      const result = adapter.mapDeviceWithPartialState(simulatedDevice);

      expect(result).toBeDefined();
      expect(result?.id).toBe('device-123');
      expect(result?.source).toBe(deviceSourceSchema.enum.acme);
      expect(result?.capabilities.length).toBeGreaterThan(0);
      expect(result?.state.on).toBe(true);
      expect(result?.state.brightness).toBeUndefined();

      (deviceWithPartialStateSchema.parse as jest.Mock).mockRestore();
    });

    it('should return undefined when capabilities mapping fails', async () => {
      const result = adapter.mapDeviceWithPartialState({
        id: 'device-123',
        capabilities: [{ type: 'unknown_type' }],
        state: { on: true },
      });
      expect(result).toBeUndefined();
    });
  });
  describe('discoverDevices', () => {
    it('should discover and map devices successfully', async () => {
      const devices = await adapter.discoverDevices();

      expect(devices).toBeDefined();
      expect(devices?.length).toBeGreaterThan(0);
      devices?.forEach((device) => {
        expect(device.id).toBeDefined();
        expect(device.capabilities.length).toBeGreaterThan(0);
      });
    });

    it('should handle API errors during discovery', async () => {
      jest.spyOn(adapter, 'discoverDevices').mockRejectedValue(new Error('API error'));

      try {
        await adapter.discoverDevices();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBe('API error');
      }
    });

    it('should handle non-200 status codes during discovery', async () => {
      jest.spyOn(adapter, 'discoverDevices').mockResolvedValue([]);

      const result = await adapter.discoverDevices();
      expect(result).toHaveLength(0);
    });
  });

  describe('pairDevices', () => {
    it('should pair devices successfully', async () => {
      const devices = await adapter.discoverDevices();
      expect(devices?.length).toBeGreaterThan(0);

      const deviceIds = devices?.map((d) => d.id);
      await adapter.pairDevices(deviceIds);

      deviceIds.forEach((id) => {
        expect(mockedAxiosInstance.post).toHaveBeenCalledWith(`/pair/${id}`);
      });
    });

    it('should handle errors during device pairing', async () => {
      jest.spyOn(adapter, 'pairDevices').mockRejectedValue(new Error('Pairing error'));

      try {
        await adapter.pairDevices(['device-123']);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBe('Pairing error');
      }
    });
  });

  describe('unpairDevices', () => {
    it('should unpair devices successfully', async () => {
      const devices = await adapter.discoverDevices();
      expect(devices.length).toBeGreaterThan(0);

      const deviceIds = devices.map((d) => d.id);
      await adapter.unpairDevices(deviceIds);

      deviceIds.forEach((id) => {
        expect(mockedAxiosInstance.delete).toHaveBeenCalledWith(`/pair/${id}`);
      });
    });

    it('should handle errors during device unpairing', async () => {
      jest.spyOn(adapter, 'unpairDevices').mockRejectedValue(new Error('Unpairing error'));

      try {
        await adapter.unpairDevices(['device-123']);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Unpairing error');
      }
    });
  });
  describe('getDevice', () => {
    it('should get and map a single device', async () => {
      const result = await adapter.getDevice('device-123');
      expect(result).toBeDefined();
      expect(result?.id).toBe('device-123');
    });

    it('should handle non-existent device', async () => {
      const result = await adapter.getDevice('device-999');
      expect(result).toBeUndefined();
    });
  });

  describe('getDevices', () => {
    it('should get and map multiple devices', async () => {
      const result = await adapter.getDevices(['device-123', 'device-456']);
      expect(result).toHaveLength(2);
      expect(result?.[0].id).toBe('device-123');
      expect(result?.[1].id).toBe('device-456');
    });
  });

  describe('setDeviceState', () => {
    it('should update device state successfully', async () => {
      await adapter.setDeviceState('device-123', { brightness: 75 });
      const updatedDevice = await adapter.getDevice('device-123');
      expect(updatedDevice?.state.brightness).toBe(75);
    });

    it('should throw error when modifying readonly capability', async () => {
      await expect(
        adapter.setDeviceState('device-456', { locked: false })
      ).rejects.toThrow('Cannot modify readonly capabilities');
    });

    it('should handle device not found error', async () => {
      await expect(
        adapter.setDeviceState('device-999', { brightness: 80 })
      ).rejects.toThrow('Device not found');
    });
  });
  describe('setDeviceStates (with simulation)', () => {
    it('should update multiple device states successfully', async () => {
      const adapter = new AcmeIoTAdapter();
      const devices = await adapter.getDevices(['device-1', 'device-2']);
  
      if (!devices) {
        throw new Error('Failed to fetch simulated devices');
      }
  
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
      const devices = await adapter.getDevices(['device-3']);
  
      if (!devices) {
        throw new Error('Failed to fetch simulated devices');
      }
  
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
      const devices = await adapter.getDevices(['device-5']);
  
      if (!devices) {
        throw new Error('Failed to fetch simulated devices');
      }
  
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
*/
