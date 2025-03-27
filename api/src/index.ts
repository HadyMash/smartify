import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logMiddleware } from './middleware/log';
import { authRouter } from './routes/auth';
import { householdRouter } from './routes/household';
import { parseAuth } from './middleware/auth';
import { bigIntToHexMiddleware } from './middleware/bigint';
// eslint-disable-next-line no-restricted-imports
import { DatabaseService } from './services/db/db';
import { webhookRouter } from './routes/webhook';
import { log } from './util/log';
import { iotRouter } from './routes/iot';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);
app.use(parseAuth);
app.use(bigIntToHexMiddleware);

const router = express.Router();

router.get('/health', (_, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);
router.use('/households', householdRouter);
router.use('/iot', iotRouter);
router.use('/webhooks', webhookRouter);

app.use('/api', router);

async function start() {
  const db = new DatabaseService();

  await db.connect();

  await Promise.all([
    db.accessBlacklistRepository.loadBlacklistToCache(),
    db.mfaBlacklistRepository.loadBlacklistToCache(),
    db.srpSessionRepository.loadSessionsToCache(),
  ]);

  log.info('Blacklists loaded');

  app.listen(port, () => {
    log.info(`Server running on port ${port}`);
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
