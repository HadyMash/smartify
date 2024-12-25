import { Router } from 'express';

const templateRouter = Router();

templateRouter.get('/', (req, res) => {
  res.send('Hello World!');
});

export default templateRouter;
