import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logMiddleware } from './middleware/log';
import { authRouter } from './routes/auth';
import { webhookRouter } from './routes/webhook';

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
