import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logMiddleware from './middleware/log';

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

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
