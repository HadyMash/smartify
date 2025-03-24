import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logMiddleware } from './middleware/log.ts';
import { authRouter } from './routes/auth.ts';
import { webhookRouter } from './routes/webhook.ts';
import { AIService } from './services/ai.ts';
import { Device, deviceSchema } from './schemas/devices.ts';
import { randomUUID } from 'crypto';

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
router.use('/webhooks', webhookRouter);

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function test() {
  const ai = new AIService();
  const device: Device = {
    id: randomUUID(),
    source: 'acme',
    name: 'ACME Fan',
    capabilities: [
      //{
      //  id: 'heartrate',
      //  type: 'number',
      //  name: 'Heart Rate',
      //  unit: 'bpm',
      //  readonly: true,
      //},
      //{
      //  id: 'bloodpressure',
      //  type: 'number',
      //  unit: 'mmHg',
      //  readonly: true,
      //},
      {
        id: 'on',
        type: 'switch',
      },
      {
        id: 'speed',
        type: 'mode',
        modes: ['low', 'medium', 'high'],
      },
      {
        id: 'swing',
        type: 'switch',
        name: 'Horizontal Swing',
      },
    ],
  };
  deviceSchema.parse(device);
  await ai.pickDeviceIcon(device);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
test();
