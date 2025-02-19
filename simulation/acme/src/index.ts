import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin';
import { logMiddleware } from './middleware/log';
import { externalAPIRouter } from './routes/external';
import { ActionManager } from './services/action-manager';

const app: Express = express();
//const port = process.env.PORT ?? 3000;
const port = 3001;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

app.use('/', adminRouter);
app.use('/api', externalAPIRouter);

async function start() {
  // Handle any incomplete actions from previous session
  try {
    await ActionManager.getInstance().handleIncompleteActions();
    console.log(
      'Completed processing of incomplete actions from previous session',
    );
  } catch (error) {
    console.error('Failed to process incomplete actions:', error);
    return;
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();
