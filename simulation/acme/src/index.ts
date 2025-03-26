import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin';
import { logMiddleware } from './middleware/log';
import { externalAPIRouter } from './routes/external';
import { DBService } from './services/db-service';
import { DeviceSimulator } from './services/device-simulation';
import fs from 'fs';
import path, { resolve } from 'path';
import { randomUUID } from 'crypto';

const app: Express = express();
let port = 3001;
let dbFileName: string | undefined;
let writeToFile = false;
let defaultFile = false;

// Parse command line arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--port' && i + 1 < args.length) {
    port = parseInt(args[i + 1]);
    i++; // Skip the next argument
  } else if (arg === '--db-file' && i + 1 < args.length) {
    dbFileName = args[i + 1];
    i++; // Skip the next argument
  } else if (arg === '--write-to-file') {
    writeToFile = true;
  } else if (arg === '--default-file') {
    defaultFile = true;
  }
}

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

app.use('/', adminRouter);
app.use('/api', externalAPIRouter);

async function start() {
  let finalDbFileName = dbFileName;

  if (finalDbFileName) {
    try {
      const sourcePath = path.resolve(finalDbFileName);
      const dataDir = path.join(__dirname, 'data');

      await fs.promises.access(sourcePath).catch(() => {
        throw new Error(`Database file "${sourcePath}" not found`);
      });

      // If --write-to-file is set, use the source file directly
      if (writeToFile) {
        console.log(`Using database file directly: ${sourcePath}`);
        finalDbFileName = sourcePath;
      }
      // If --default-file is set, use a fixed filename
      else if (defaultFile) {
        const fixedFileName = path.join(dataDir, 'sim_default.json');
        await fs.promises.mkdir(dataDir, { recursive: true });
        await fs.promises.copyFile(sourcePath, fixedFileName);
        console.log(`Database initialized at ${fixedFileName} (default file)`);
        finalDbFileName = fixedFileName;
      }
      // Otherwise use the original random UUID approach
      else {
        const dbCopyFileName = path.join(dataDir, `sim_${randomUUID()}.json`);
        await fs.promises.mkdir(dataDir, { recursive: true });
        await fs.promises.copyFile(sourcePath, dbCopyFileName);
        console.log(`Database initialized at ${dbCopyFileName}`);
        finalDbFileName = dbCopyFileName;
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      process.exit(1);
    }
  } else if (defaultFile) {
    // If no db file is specified but --default-file is set, create an empty default file
    const dataDir = path.join(__dirname, 'data');
    const fixedFileName = path.join(dataDir, 'sim_default.json');

    try {
      await fs.promises.mkdir(dataDir, { recursive: true });

      // Check if the default file exists, if not create an empty one
      try {
        await fs.promises.access(fixedFileName);
      } catch {
        await fs.promises.writeFile(fixedFileName, '{}');
      }

      console.log(`Using default database file: ${fixedFileName}`);
      finalDbFileName = fixedFileName;
    } catch (error) {
      console.error('Default database initialization failed:', error);
      process.exit(1);
    }
  }

  const dbService = new DBService(finalDbFileName);
  // Start the device simulator

  const simulator = DeviceSimulator.getInstance();
  await simulator.startSimulation();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();
