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
const authenticationRouter = require('./routes/authentication');
const loginRouter = require('./routes/authentication');
router.get('/', (req, res, next) => {
  res.send('Hello World!');
});

// This is how you include your router
// router.use('/template', templateRouter);
app.use('/authentication', authenticationRouter);
app.use('/login', loginRouter);
app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
