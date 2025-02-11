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
  const discoveredDevices = await adapter.discoverDevices();
  console.log('devices found:', discoveredDevices?.length ?? 0);

  if (!discoveredDevices) {
    return;
  }

  // pair the first device
  if ((discoveredDevices.length ?? 0) > 0) {
    //await adapter.pairDevices([devices[0]]);
  }

  // get a list of paired devices
  const devices = await adapter.getDevices([
    '1c9b7e04-c216-48ae-9cf8-8a49cfd50de1',
    'eb7edc76-9b00-42e0-bcaa-372c5c977bb0',
  ]);
  console.log('devices:', devices);

  // get a particular device
  const device = await adapter.getDevice(
    '1c9b7e04-c216-48ae-9cf8-8a49cfd50de1',
  );
  console.log('device:', device);

  // toggle the state of a device
  if (devices?.length ?? 0 > 0) {
    console.log('device:', devices![0].id, 'state:', devices![0].state);

    await adapter.setDeviceState(devices![0].id, { on: !devices![0].state.on });

    const newDevice = await adapter.getDevice(devices![0].id);

    if (!newDevice) {
      console.warn('device not found');
    } else {
      console.log('device:', newDevice.id, 'state:', newDevice.state);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
test();
