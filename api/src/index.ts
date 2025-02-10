import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logMiddleware } from './middleware/log';
import { authRouter } from './routes/auth';
import { BaseIotAdapter, HealthCheck } from './services/iot/base-adapter';
import { AcmeIoTAdapter } from './services/iot/acme-adapter';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

const router = express.Router();

router.get('/health', (_, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function test() {
  const adapter: BaseIotAdapter = new AcmeIoTAdapter();

  // health check
  if (adapter.isHealthCheck()) {
    const health = await (adapter as HealthCheck).healthCheck();
    console.log('Health check:', health);
  } else {
    console.log('Adapter does not support health check');
  }

  // discover devices
  const devices = await adapter.discoverDevices();
  console.log('devices found:', devices?.length ?? 0);

  if (!devices) {
    return;
  }

  // pair the first device
  if ((devices.length ?? 0) > 0) {
    //await adapter.pairDevices([devices[0]]);
  }

  // get a list of paired devices
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
test();
