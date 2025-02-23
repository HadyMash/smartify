import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logMiddleware } from './middleware/log';
import { authRouter } from './routes/auth';
import { householdRouter } from './routes/household';
import { parseAuth } from './middleware/auth';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);
app.use(parseAuth);

const router = express.Router();

router.get('/health', (_, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);
router.use('/households', householdRouter);

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
