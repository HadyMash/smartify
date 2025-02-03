import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin';
import { DBService } from './services/db-service';
import { logMiddleware } from './middleware/log';
import { externalAPIRouter } from './routes/external';

const app: Express = express();
//const port = process.env.PORT ?? 3000;
const port = 3001;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

app.use('/', adminRouter);
app.use('/api', externalAPIRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
