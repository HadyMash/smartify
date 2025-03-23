import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin';
import { logMiddleware } from './middleware/log';
import { externalAPIRouter } from './routes/external';
import { DBService } from './services/db-service';

const app: Express = express();
//const port = process.env.PORT ?? 3000;
const port = 3001;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

app.use('/', adminRouter);
app.use('/api', externalAPIRouter);

async function start() {
  const dbService = new DBService();
  // Start the device simulator
  const { DeviceSimulator } = require('./services/device-simulation');
  const simulator = DeviceSimulator.getInstance();
  await simulator.startSimulation();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();
