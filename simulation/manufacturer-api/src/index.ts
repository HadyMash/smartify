import express, { Express } from 'express';
import cookieParser from 'cookie-parser';

const app: Express = express();
//const port = process.env.PORT ?? 3000;
const port = 3000;

app.use(express.json());
app.use(cookieParser());

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
