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

app.use('/api', router);

async function start() {
  const db = new DatabaseService();

  await Promise.all([
    db.accessBlacklistRepository.loadBlacklistToCache(),
    db.mfaBlacklistRepository.loadBlacklistToCache(),
    db.srpSessionRepository.loadSessionsToCache(),
  ]);

  console.log('Blacklists loaded');

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('\n\n\n');
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
