// import express, { Express } from 'express';
// import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';

// dotenv.config();

// const app: Express = express();
// const port = process.env.PORT ?? 3000;

// app.use(express.json());
// app.use(cookieParser());

// const router = express.Router();

// router.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.use('/api', router);

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

function greet(name: string): void {
  console.log(`Hello, ${name}!`);
}

greet('TypeScript');
