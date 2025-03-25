import { spawn, ChildProcess, exec } from 'child_process';
import { resolve } from 'path';
import { AcmeIoTAdapter } from '../../services/iot/acme-adapter';

describe('AcmeIoTAdapter (with simulation)', () => {
  // Set Jest timeout to ensure we have enough time for cleanup
  jest.setTimeout(30000);
  let adapter: AcmeIoTAdapter;
  let child: ChildProcess | null = null;
  let projectDir: string;
  //let sampleFile: string;

  beforeAll(async () => {
    projectDir = resolve('..', 'simulation', 'acme');
    //sampleFile = resolve(projectDir, 'example-devices-db-test.json');

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

  beforeEach(async () => {
    // Start the simulator
    child = spawn('npm', ['run', 'start', '3001', 'example-db.json'], {
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
            // Give a little time for server to be fully ready
            setTimeout(resolve, 500);
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

    // Initialize the adapter
    adapter = new AcmeIoTAdapter();

    // Wait for adapter to initialize
    await new Promise((resolve) => {
      const initTimeout = setTimeout(resolve, 500);
      // Ensure this timeout is cleared if the test terminates
      initTimeout.unref();
    });
    console.log('Adapter initialized');
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
  test('server starts up correctly', async () => {
    if (adapter.isHealthCheck()) {
      const health = await adapter.healthCheck();
      expect(health).toBe(true);
      return;
    } else {
      // skip this test
      test.skip("server doesn't support health checks", () => {});
    }
  }, 10000); // Add timeout to ensure the test has enough time to complete
  });
});
