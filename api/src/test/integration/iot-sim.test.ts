import { spawn, ChildProcess, exec } from 'child_process';
import { resolve } from 'path';
import { AcmeIoTAdapter } from '../../services/iot/acme-adapter';
import {
  DeviceNotFoundError,
  InvalidAPIKeyError,
  MissingAPIKeyError,
} from '../../schemas/devices';

describe('AcmeIoTAdapter (with simulation)', () => {
  // Set Jest timeout to ensure we have enough time for cleanup
  jest.setTimeout(30000);
  let child: ChildProcess | null = null;
  let projectDir: string;

  const DEVICE1ID = 'bbb39b3a-bc96-4144-9c7d-ea1f816b65cb';
  const DEVICE2ID = '9405e5f6-66a9-4941-97d0-7c462eff857e';

  async function inintialize(
    file: 'example-db-no-key.json' | 'example-db-keys.json',
  ) {
    process.env.ACME_API_URL = 'http://localhost:3009/api';
    // Start the simulator
    child = spawn(
      'npm',
      ['run', 'start', '--', '--port', '3009', '--db-file', file],
      {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      },
    );

    // Wait for simulator to start up
    let startupTimeout: NodeJS.Timeout | undefined;
    await new Promise<void>((resolve) => {
      let serverStarted = false;

      if (child!.stdout) {
        child!.stdout.on('data', (data) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const output = data.toString().trim();
          //console.log(`[Simulator stdout]: ${output}`);

          // Resolve once server has started
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          if (output.includes('Server running on port') && !serverStarted) {
            serverStarted = true;
            // Clear the timeout before resolving
            clearTimeout(startupTimeout);
            resolve();
          }
        });
        const readyTimeout = setTimeout(resolve, 500);
        // Ensure this timeout is cleared if the test terminates
        readyTimeout.unref();

        if (child!.stderr) {
          child!.stderr.on('data', (data) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            console.error(`[Simulator stderr]: ${data.toString().trim()}`);
          });
        }

        startupTimeout = setTimeout(() => {
          if (!serverStarted) {
            console.warn(
              '[Test] Simulator may not have started properly, continuing anyway',
            );
            resolve();
          }
        }, 5000);
      }
    });

    // Clear the timeout just in case it wasn't cleared above
    if (startupTimeout) {
      clearTimeout(startupTimeout);
    }
  }

  beforeAll(async () => {
    projectDir = resolve('..', 'simulation', 'acme');

    await new Promise<void>((resolve, reject) => {
      exec('npm install', { cwd: projectDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Install error: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`Install stderr: ${stderr}`);
        }
        console.log(`Install output: ${stdout}`);
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
  });

  afterEach(async () => {
    // terminate the child process properly
    if (child) {
      return new Promise<void>((resolve) => {
        // Set up exit handler before sending kill signal
        child!.on('exit', () => {
          child = null;
          resolve();
        });

        // Send SIGTERM signal
        child!.kill('SIGTERM');

        // Fallback in case process doesn't exit
        // Make sure to call resolve only if child hasn't already exited
        const killTimeout = setTimeout(() => {
          console.warn('[Test] Force-killing simulator process');
          if (child) {
            child.kill('SIGKILL'); // Force kill if SIGTERM didn't work
            child = null;
            resolve();
          }
        }, 2000);

        // Make sure to clear the timeout when the child process exits
        child!.on('exit', () => {
          clearTimeout(killTimeout);
        });
      });
    }
  });

  describe('Health check', () => {
    describe('Successful startup', () => {
      beforeEach(async () => {
        await inintialize('example-db-no-key.json');
      });

      test('health check successful', async () => {
        const adapter = new AcmeIoTAdapter();
        if (adapter.isHealthCheck()) {
          const health = await adapter.healthCheck();
          expect(health).toBe(true);
          return;
        } else {
          // skip this test
          test.skip("server doesn't support health checks", () => {});
        }
      });
    });

    describe('Failed/no startup', () => {
      test('health check unsuccessful', async () => {
        const adapter = new AcmeIoTAdapter();
        if (adapter.isHealthCheck()) {
          const health = await adapter.healthCheck();
          expect(health).toBe(false);
          return;
        } else {
          // skip this test
          test.skip("server doesn't support health checks", () => {});
        }
      });
    });
  });

  describe('Should reject without an api key', () => {
    beforeEach(async () => {
      await inintialize('example-db-no-key.json');
      process.env.ACME_API_KEY = undefined;
    });

    test('get device', async () => {
      const adapter = new AcmeIoTAdapter();

      try {
        await adapter.getDevice('eab2c1f6-d95b-48d3-a19b-267f19cd18c7');
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('device that does not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('eab2c1f6-d95b-48d3-a19b-267f19cd18c5');
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('get devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['eab2c1f6-d95b-48d3-a19b-267f19cd18c7']);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
      try {
        await adapter.getDevices([
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7',
          '90cd8c96-ac3a-4ee2-9549-50a905511c14',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('devices that do not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        // id doesn't exist
        await adapter.getDevices(['eab2c1f6-d95b-48d3-a19b-267f19cd18c5']);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
      try {
        // id doesn't exist
        await adapter.getDevices([
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c5',
          '90cd8c96-ac3a-4ee2-9549-50a905511c13',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('discover devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.discoverDevices();
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('pair device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices(['eab2c1f6-d95b-48d3-a19b-267f19cd18c7']);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('pair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices([
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7',
          '90cd8c96-ac3a-4ee2-9549-50a905511c14',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('unpair device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.unpairDevices([DEVICE1ID]);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('unpair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.unpairDevices([DEVICE1ID, DEVICE2ID]);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('set device state', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceState('eab2c1f6-d95b-48d3-a19b-267f19cd18c7', {
          on: true,
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    test('set devices states', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceStates({
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7': { on: true },
          '90cd8c96-ac3a-4ee2-9549-50a905511c14': { brightness: 50 },
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('Should reject an invalid api key', () => {
    beforeEach(async () => {
      await inintialize('example-db-keys.json');
      // invalid key
      process.env.ACME_API_KEY =
        'afb4caf79357d8336340f203535d267d88a8f6352711ecac90d9c0770ff8bf0a';
    });

    test('get device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('eab2c1f6-d95b-48d3-a19b-267f19cd18c7');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('device that does not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('eab2c1f6-d95b-48d3-a19b-267f19cd18c5');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('get devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['eab2c1f6-d95b-48d3-a19b-267f19cd18c7']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
      try {
        await adapter.getDevices([
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7',
          '90cd8c96-ac3a-4ee2-9549-50a905511c14',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('devices that do not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['12e5a67b-be59-4b79-a12b-59b057ad9555']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
      try {
        await adapter.getDevices([
          '12e5a67b-be59-4b79-a12b-59b057ad9555',
          'a9c97031-53cc-404f-be69-968fe6de9553',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('discover devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.discoverDevices();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('pair device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices(['eab2c1f6-d95b-48d3-a19b-267f19cd18c7']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('pair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices([
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7',
          '90cd8c96-ac3a-4ee2-9549-50a905511c14',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('set device state', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceState('eab2c1f6-d95b-48d3-a19b-267f19cd18c7', {
          on: true,
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    test('set devices states', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceStates({
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7': { on: true },
          '90cd8c96-ac3a-4ee2-9549-50a905511c14': { brightness: 50 },
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('Should reject a disabled api key', () => {
    beforeEach(async () => {
      await inintialize('example-db-keys.json');
      // invalid key
      process.env.ACME_API_KEY =
        '7f873c3465155251979680d2156d0264c52d5c1bdb38ba4feef146979a26170d';
    });

    test('get device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('eab2c1f6-d95b-48d3-a19b-267f19cd18c7');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('device that does not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('eab2c1f6-d95b-48d3-a19b-267f19cd18c5');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('get devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['eab2c1f6-d95b-48d3-a19b-267f19cd18c7']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
      try {
        await adapter.getDevices([
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7',
          '90cd8c96-ac3a-4ee2-9549-50a905511c14',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('devices that do not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['12e5a67b-be59-4b79-a12b-59b057ad9555']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
      try {
        await adapter.getDevices([
          '12e5a67b-be59-4b79-a12b-59b057ad9555',
          'a9c97031-53cc-404f-be69-968fe6de9553',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('discover devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.discoverDevices();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('pair device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices(['eab2c1f6-d95b-48d3-a19b-267f19cd18c7']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('pair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices([
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7',
          '90cd8c96-ac3a-4ee2-9549-50a905511c14',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('unpair device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.unpairDevices([DEVICE1ID]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('unpair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.unpairDevices([DEVICE1ID, DEVICE2ID]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('set device state', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceState('eab2c1f6-d95b-48d3-a19b-267f19cd18c7', {
          on: true,
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    test('set devices states', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceStates({
          'eab2c1f6-d95b-48d3-a19b-267f19cd18c7': { on: true },
          '90cd8c96-ac3a-4ee2-9549-50a905511c14': { brightness: 50 },
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('Valid api key', () => {
    beforeEach(async () => {
      await inintialize('example-db-keys.json');
      // invalid key
      process.env.ACME_API_KEY =
        'afb4caf79357d8336340f203535d267d88a8f6352711ecac90d9c0770ff8bf0c';
    });

    test('disover devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        const devices = await adapter.discoverDevices();
        console.log('discover devices', devices);
        expect(devices).not.toHaveLength(0);
      } catch (error) {
        console.error('error:', error);
        throw error;
      }
    });

    test('should not get unpaired device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        const devices = await adapter.discoverDevices();
        console.log('discover devices', devices);
        if (!devices || devices.length === 0) {
          expect(devices).toBeDefined();
          expect(devices).not.toHaveLength(0);
        }
        const device = await adapter.getDevice(devices![0].id);
        console.log('device:', device);
        expect(device).toBeUndefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('pair device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        const devices = await adapter.discoverDevices();
        console.log('discover devices', devices);
        if (!devices || devices.length === 0) {
          expect(devices).toBeDefined();
          expect(devices).not.toHaveLength(0);
        }
        const firstDevice = devices![0];
        console.log('first device:', firstDevice);
        await adapter.pairDevices([devices![0].id]);
        console.log('paired device:', devices![0].id);
        // try getting the device
        const device = await adapter.getDevice(devices![0].id);
        console.log('device:', device);
        expect(device).toBeDefined();
        expect(device?.id).toBe(devices![0].id);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    });

    test('pair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        const devices = await adapter.discoverDevices();
        console.log('discover devices', devices);
        if (!devices || devices.length === 0) {
          expect(devices).toBeDefined();
          expect(devices).not.toHaveLength(0);
        }
        if (devices!.length < 2) {
          test.skip('not enough devices to pair', () => {});
        }

        const firstDevice = devices![0];
        console.log('first device:', firstDevice);
        const secondDevice = devices![1];
        console.log('second device:', secondDevice);
        await adapter.pairDevices([devices![0].id, devices![1].id]);

        console.log('paired device:', devices![0].id);
        console.log('paired device:', devices![1].id);
        // try getting the device
        const device1 = await adapter.getDevice(devices![0].id);
        console.log('device:', device1);
        expect(device1).toBeDefined();
        expect(device1?.id).toBe(devices![0].id);
        const device2 = await adapter.getDevice(devices![1].id);
        console.log('device:', device2);
        expect(device2).toBeDefined();
        expect(device2?.id).toBe(devices![1].id);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    });

    test('unpair device', async () => {
      const adapter = new AcmeIoTAdapter();

      // check it's paired first
      const device = await adapter.getDevice(DEVICE1ID);
      expect(device).toBeDefined();
      expect(device!.id).toBe(DEVICE1ID);

      // unpair
      await adapter.unpairDevices([DEVICE1ID]);
      try {
        const device = await adapter.getDevice(DEVICE1ID);
        expect(device).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('unpair devices', async () => {
      const adapter = new AcmeIoTAdapter();

      // check it's paired first
      const device1 = await adapter.getDevice(DEVICE1ID);
      expect(device1).toBeDefined();
      expect(device1!.id).toBe(DEVICE1ID);

      const device2 = await adapter.getDevice(DEVICE2ID);
      expect(device2).toBeDefined();
      expect(device2!.id).toBe(DEVICE2ID);

      // unpair
      await adapter.unpairDevices([DEVICE1ID, DEVICE2ID]);
      try {
        const device = await adapter.getDevice(DEVICE1ID);
        expect(device).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }

      try {
        const device = await adapter.getDevice(DEVICE2ID);
        expect(device).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('get paired device', async () => {
      const adapter = new AcmeIoTAdapter();
      const device1 = await adapter.getDevice(DEVICE1ID);
      const device2 = await adapter.getDevice(DEVICE2ID);
      expect(device1).toBeDefined();
      expect(device1!.id).toBe(DEVICE1ID);
      expect(device2).toBeDefined();
      expect(device2!.id).toBe(DEVICE2ID);
    });

    test('pair device and get', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        // pair
        const devices = await adapter.discoverDevices();
        console.log('discover devices', devices);
        if (!devices || devices.length === 0) {
          expect(devices).toBeDefined();
          expect(devices).not.toHaveLength(0);
        }
        const firstDevice = devices![0];
        console.log('first device:', firstDevice);
        await adapter.pairDevices([devices![0].id]);
        console.log('paired device:', devices![0].id);
        // try getting the device
        const device = await adapter.getDevice(devices![0].id);
        console.log('device:', device);
        expect(device).toBeDefined();
        expect(device?.id).toBe(devices![0].id);

        // get device
        const device1 = await adapter.getDevice(devices![0].id);
        expect(device1).toBeDefined();
        expect(device1!.id).toBe(devices![0].id);
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    });

    test('get devices', async () => {
      const adapter = new AcmeIoTAdapter();
      const devices = await adapter.getDevices([DEVICE1ID, DEVICE2ID]);
      expect(devices).toBeDefined();
      expect(devices).toHaveLength(2);
      expect(devices![0].id).toBe(DEVICE1ID);
      expect(devices![1].id).toBe(DEVICE2ID);
    });

    test('expect non existent device to be undefined', async () => {
      try {
        const adapter = new AcmeIoTAdapter();
        const device = await adapter.getDevice(
          'bbb39b3a-bc96-4144-9c7d-ea1f816b65c0',
        );
        expect(device).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(DeviceNotFoundError);
      }
    });

    test('expect non existent devices to be undefined', async () => {
      try {
        const adapter = new AcmeIoTAdapter();
        const devices = await adapter.getDevices([
          'bbb39b3a-bc96-4144-9c7d-ea1f816b65c0',
          '9405e5f6-66a9-4941-97d0-7c462eff8570',
        ]);
        expect(devices).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('expect get device to have state', async () => {
      const adapter = new AcmeIoTAdapter();
      const device1 = await adapter.getDevice(DEVICE1ID);
      const device2 = await adapter.getDevice(DEVICE2ID);

      expect(device1).toHaveProperty('capabilities');
      expect(device1).toHaveProperty('state');
      expect(device1!.state).toHaveProperty('on');
      console.log('device2:', device2);
      expect(typeof device2!.state.on).toBe('boolean');
      expect(device2).toBeDefined();
      expect(device2).toHaveProperty('capabilities');
      expect(device2).toHaveProperty('state');
      expect(device2!.state).toHaveProperty('on');
      expect(device2!.state).toHaveProperty('rgb');
      expect(device2!.state).toHaveProperty('brightness');
      expect(typeof device2!.state.brightness).toBe('number');
      expect(typeof device2!.state.on).toBe('boolean');
      expect(typeof device2!.state.rgb).toBe('object');
      expect(device2!.state.rgb).toHaveLength(3);
      expect(typeof (device2!.state.rgb as number[])[0]).toBe('number');
      expect(typeof (device2!.state.rgb as number[])[1]).toBe('number');
      expect(typeof (device2!.state.rgb as number[])[2]).toBe('number');
    });

    test('set device state', async () => {
      const adapter = new AcmeIoTAdapter();

      // on off bulb
      const device1 = await adapter.getDevice(DEVICE1ID);
      expect(device1).toBeDefined();
      expect(device1!.id).toBe(DEVICE1ID);

      // toggle the state
      await adapter.setDeviceState(device1!.id, {
        on: !device1!.state.on,
      });

      // get device to double check
      const device1new = await adapter.getDevice(DEVICE1ID);
      expect(device1new).toBeDefined();
      expect(device1new!.id).toBe(DEVICE1ID);
      expect(device1new!.state.on).toBe(!device1!.state.on);

      // rgb bulb
      const device2 = await adapter.getDevice(DEVICE2ID);
      expect(device2).toBeDefined();
      expect(device2!.id).toBe(DEVICE2ID);

      // toggle the state
      await adapter.setDeviceState(device2!.id, {
        on: !device2!.state.on,
      });

      // get device to double check
      const device2new = await adapter.getDevice(DEVICE2ID);
      expect(device2new).toBeDefined();
      expect(device2new!.id).toBe(DEVICE2ID);
      expect(device2new!.state.on).toBe(!device2!.state.on);
    });

    test('setting multiple states at once for a single device', async () => {
      const adapter = new AcmeIoTAdapter();

      // rgb bulb
      const device2 = await adapter.getDevice(DEVICE2ID);
      expect(device2).toBeDefined();
      expect(device2!.id).toBe(DEVICE2ID);

      // toggle the state
      const newRGB = [123, 145, 189];
      await adapter.setDeviceState(device2!.id, {
        on: !device2!.state.on,
        rgb: newRGB,
      });

      // get device to double check
      const device2new = await adapter.getDevice(DEVICE2ID);
      expect(device2new).toBeDefined();
      expect(device2new!.id).toBe(DEVICE2ID);
      expect(device2new!.state.on).toBe(!device2!.state.on);
      expect((device2new!.state.rgb as number[])[0]).toEqual(newRGB[0]);
      expect((device2new!.state.rgb as number[])[1]).toEqual(newRGB[1]);
      expect((device2new!.state.rgb as number[])[2]).toEqual(newRGB[2]);
    });

    test('should not accept inavlid state when setting', async () => {
      const adapter = new AcmeIoTAdapter();

      // rgb bulb
      const device2 = await adapter.getDevice(DEVICE2ID);
      expect(device2).toBeDefined();
      expect(device2!.id).toBe(DEVICE2ID);

      // toggle the state
      const newRGB = [123, 145];
      try {
        await adapter.setDeviceState(device2!.id, {
          on: !device2!.state.on,
          rgb: newRGB,
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
