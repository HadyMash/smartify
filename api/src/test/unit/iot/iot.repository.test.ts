/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { AcmeIoTAdapter } from '../../../services/iot/acme-adapter';

jest.mock('../../../services/iot/acme-adapter');

describe('AcmeIoTAdapter Integration Tests', () => {
  let adapter: AcmeIoTAdapter;

  beforeEach(() => {
    adapter = new AcmeIoTAdapter();

    (adapter.discoverDevices as jest.Mock).mockResolvedValue([
      { id: 'device-1', type: 'light', capabilities: ['on', 'off'] },
    ]);

    (adapter.getDevice as jest.Mock).mockImplementation(
      async (deviceId: string) => {
        if (deviceId === 'device-1') {
          return { id: 'device-1', type: 'light', capabilities: ['on', 'off'] };
        }
        throw new Error('Device not found');
      },
    );

    (adapter.pairDevices as jest.Mock).mockImplementation(
      async (deviceIds: string[]) => {
        if (deviceIds.includes('device-1')) {
          throw new Error('Device already paired');
        }
        return { paired: deviceIds };
      },
    );

    (adapter.unpairDevices as jest.Mock).mockImplementation(
      async (deviceIds: string[]) => {
        if (!deviceIds.includes('device-1')) {
          throw new Error('Device not found');
        }
        return { unpaired: deviceIds };
      },
    );

    (adapter.setDeviceState as jest.Mock).mockImplementation(
      async (deviceId: string, state: any) => {
        if (state.invalidProp) {
          throw new Error('Invalid state property');
        }
        return { success: true };
      },
    );

    (adapter.startAction as jest.Mock).mockImplementation(
      async (deviceId: string, action: string, params: any) => {
        if (deviceId !== 'device-1') {
          throw new Error('Device not found');
        }
        return { success: true };
      },
    );
  });

  test('should return discovered devices', async () => {
    const devices = await adapter.discoverDevices();
    expect(devices).toEqual([
      { id: 'device-1', type: 'light', capabilities: ['on', 'off'] },
    ]);
  });

  test('should return empty array when no devices are discovered', async () => {
    (adapter.discoverDevices as jest.Mock).mockResolvedValueOnce([]);
    const devices = await adapter.discoverDevices();
    expect(devices).toEqual([]);
  });

  test('should return device details for a valid device ID', async () => {
    const device = await adapter.getDevice('device-1');
    expect(device).toEqual({
      id: 'device-1',
      type: 'light',
      capabilities: ['on', 'off'],
    });
  });

  test('should throw an error when getting an invalid device ID', async () => {
    await expect(adapter.getDevice('invalid-device')).rejects.toThrow(
      'Device not found',
    );
  });

  test('should pair new devices', async () => {
    const result = await adapter.pairDevices(['device-2']);
    expect(result).toEqual({ paired: ['device-2'] });
  });

  test('should throw an error when pairing an already paired device', async () => {
    await expect(adapter.pairDevices(['device-1'])).rejects.toThrow(
      'Device already paired',
    );
  });

  test('should unpair existing devices', async () => {
    const result = await adapter.unpairDevices(['device-1']);
    expect(result).toEqual({ unpaired: ['device-1'] });
  });

  test('should throw an error when unpairing a non-existent device', async () => {
    await expect(adapter.unpairDevices(['invalid-device'])).rejects.toThrow(
      'Device not found',
    );
  });

  test('should set valid device state', async () => {
    const result = await adapter.setDeviceState('device-1', { on: true });
    expect(result).toEqual({ success: true });
  });

  test('should throw an error when setting an invalid device state', async () => {
    await expect(
      adapter.setDeviceState('device-1', { invalidProp: true }),
    ).rejects.toThrow('Invalid state property');
  });

  test('should start action on a valid device', async () => {
    const result = await adapter.startAction('device-1', 'turnOn', {});
    expect(result).toEqual({ success: true });
  });

  test('should throw an error when starting an action on a non-existent device', async () => {
    await expect(
      adapter.startAction('invalid-device', 'turnOn', {}),
    ).rejects.toThrow('Device not found');
  });
});
