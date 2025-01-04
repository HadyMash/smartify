import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logMiddleware from './middleware/log.middleware';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

const router = express.Router();
const registerRouter = require('./routes/registerRoute')
const loginRouter = require('./routes/loginRoute')
const deleteAccountRouter = require('./routes/deleteAccountRoute')
const changePasswordRouter = require('./routes/changePasswordRoute')
const resetPasswordRouter = require('./routes/resetPasswordRoute')
router.get('/', (req, res, next) => {
  res.send('Hello World!');
});

// This is how you include your router
// router.use('/template', templateRouter);
app.use('/delete', deleteAccountRouter);
app.use('/change-password', changePasswordRouter);
app.use('/reset-password', resetPasswordRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
