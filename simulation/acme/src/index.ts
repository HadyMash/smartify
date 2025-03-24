import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin';
import { logMiddleware } from './middleware/log';
import { externalAPIRouter } from './routes/external';
import { DBService } from './services/db-service';
import {DeviceSimulator} from './services/device-simulation';
import fs from 'fs';
import path, { resolve } from 'path';
import { randomUUID } from 'crypto';


const app: Express = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
let dbFileName = process.argv[2];
app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

app.use('/', adminRouter);
app.use('/api', externalAPIRouter);

async function start() {
  if (dbFileName) {
    try {
      const sourcePath = path.resolve(dbFileName);
      const dataDir = path.join(__dirname, 'data');
      const dbCopyFileName = path.join(dataDir, `sim_${randomUUID()}.json`);

      await fs.promises.access(sourcePath).catch(() => {
        throw new Error(`Database file "${sourcePath}" not found`);
      });

      await fs.promises.mkdir(dataDir, { recursive: true });
      await fs.promises.copyFile(sourcePath, dbCopyFileName);
      
      console.log(`Database initialized at ${dbCopyFileName}`);
      dbFileName = dbCopyFileName;
    } catch (error) {
      console.error('Database initialization failed:', error);
      process.exit(1);
    }
  }

  const dbService = new DBService(dbFileName); 
  // Start the device simulator
  const { DeviceSimulator } = require('./services/device-simulation');
  const simulator = DeviceSimulator.getInstance();
  await simulator.startSimulation(dbFileName); // Pass filename to simulator

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();
