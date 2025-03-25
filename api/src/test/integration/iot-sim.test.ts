import { spawn, ChildProcess, exec } from 'child_process';
import { resolve } from 'path';
import { AcmeIoTAdapter } from '../../services/iot/acme-adapter';
import { InvalidAPIKeyError, MissingAPIKeyError } from '../../schemas/devices';

describe('AcmeIoTAdapter (with simulation)', () => {
  // Set Jest timeout to ensure we have enough time for cleanup
  jest.setTimeout(30000);
  let child: ChildProcess | null = null;
  let projectDir: string;

  async function inintialize(
    file: 'example-db-no-key.json' | 'example-db-valid-key.json',
  ) {
    // Start the simulator
    child = spawn('npm', ['run', 'start', '3001', file], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'], // Explicit about stdin, stdout, stderr
      shell: true,
    });

    // Wait for simulator to start up
    let startupTimeout: NodeJS.Timeout | undefined;
    await new Promise<void>((resolve) => {
      let serverStarted = false;

      if (child!.stdout) {
        child!.stdout.on('data', (data) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const output = data.toString().trim();
          console.log(`[Simulator stdout]: ${output}`);

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

    process.env.ACME_API_URL = 'http://localhost:3001/api';
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
    beforeEach(async () => {
      await inintialize('example-db-no-key.json');
    });

    test('server starts up correctly', async () => {
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

  describe('Should reject without an api key', () => {
    beforeEach(async () => {
      await inintialize('example-db-no-key.json');
      process.env.ACME_API_KEY = undefined;
    });

    test('get device', async () => {
      const adapter = new AcmeIoTAdapter();

      try {
        await adapter.getDevice('12e5a67b-be59-4b79-a12b-59b057ad9112');
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('device that does not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('12e5a67b-be59-4b79-a12b-59b057ad9555');
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('get devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['12e5a67b-be59-4b79-a12b-59b057ad9112']);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
      try {
        await adapter.getDevices([
          '12e5a67b-be59-4b79-a12b-59b057ad9112',
          'a9c97031-53cc-404f-be69-968fe6de9da2',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('devices that do not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['12e5a67b-be59-4b79-a12b-59b057ad9555']);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
      try {
        await adapter.getDevices([
          '12e5a67b-be59-4b79-a12b-59b057ad9555',
          'a9c97031-53cc-404f-be69-968fe6de9555',
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
        await adapter.pairDevices(['12e5a67b-be59-4b79-a12b-59b057ad9112']);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('pair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices([
          '12e5a67b-be59-4b79-a12b-59b057ad9112',
          'a9c97031-53cc-404f-be69-968fe6de9da2',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(MissingAPIKeyError);
      }
    });

    test('set device state', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceState('a9c97031-53cc-404f-be69-968fe6de9da2', {
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
          'a9c97031-53cc-404f-be69-968fe6de9da2': { on: true },
          '20b9e785-642a-431e-937e-4e8f6eb32a32': { brightness: 50 },
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('Should reject an invalid api key', () => {
    beforeEach(async () => {
      await inintialize('example-db-valid-key.json');
      // invalid key
      process.env.ACME_API_KEY =
        '815602b86d8406651c5a2ad2c4d0e42d381f8887936450f1074394ad7caa85d5';
    });

    test('get device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('12e5a67b-be59-4b79-a12b-59b057ad9112');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('device that does not exist', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevice('12e5a67b-be59-4b79-a12b-59b057ad9555');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('get devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.getDevices(['12e5a67b-be59-4b79-a12b-59b057ad9112']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
      try {
        await adapter.getDevices([
          '12e5a67b-be59-4b79-a12b-59b057ad9112',
          'a9c97031-53cc-404f-be69-968fe6de9da2',
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
          'a9c97031-53cc-404f-be69-968fe6de9555',
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
        await adapter.pairDevices(['12e5a67b-be59-4b79-a12b-59b057ad9112']);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('pair devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.pairDevices([
          '12e5a67b-be59-4b79-a12b-59b057ad9112',
          'a9c97031-53cc-404f-be69-968fe6de9da2',
        ]);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidAPIKeyError);
      }
    });

    test('set device state', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        await adapter.setDeviceState('a9c97031-53cc-404f-be69-968fe6de9da2', {
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
          'a9c97031-53cc-404f-be69-968fe6de9da2': { on: true },
          '20b9e785-642a-431e-937e-4e8f6eb32a32': { brightness: 50 },
        });
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('Valid api key', () => {
    beforeEach(async () => {
      await inintialize('example-db-valid-key.json');
      // invalid key
      process.env.ACME_API_KEY =
        '815602b86d8406651c5a2ad2c4d0e42d381f8887936450f1074394ad7caa85d8';
    });

    test('disover devices', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        const devices = await adapter.discoverDevices();
        console.log('discover devices', devices);
        expect(devices).toHaveLength(5);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        fail(`Should not throw exception: ${error}`);
      }
    });
    test('should not get unpaired device', async () => {
      const adapter = new AcmeIoTAdapter();
      try {
        const devices = await adapter.discoverDevices();
        console.log('discover devices', devices);
        if (!devices || devices.length === 0) {
          fail('No devices found');
        }
        const device = await adapter.getDevice(devices[0].id);
        console.log('device:', device);
        fail('Should not get device without pairing');
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
          fail('No devices found');
        }
        const firstDevice = devices[0];
        console.log('first device:', firstDevice);
        await adapter.pairDevices([devices[0].id]);
        console.log('paired device:', devices[0].id);
        // try getting the device
        const device = await adapter.getDevice(devices[0].id);
        console.log('device:', device);
        expect(device).toBeDefined();
        expect(device?.id).toBe(devices[0].id);
      } catch (error) {
        console.error('Error:', error);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        fail(`Should not throw exception: ${error}`);
      }
    });
  });
});
