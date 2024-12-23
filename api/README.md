# API Service

This is the API backend service for Smartify. It's a Node.js Express server written with TypeScript. It's responsible for handling all the API requests from the Flutter app, as well as the other services. Furthermore, it's also responsible for authentication, and database operations.

# Prerequisites

You need to have Node.js installed. It's recommended you have the latest LTS version installed. You also need to have MongoDB installed locally.

# Conventions

All code should be written in TypeScript and be well documented using JSDoc comments. You should also comment your code as needed. Don't write unnecessary comments, and don't write comments that just repeat the code. Your comments should explain the logic behind the code or why you wrote something or do something, so it's easy to follow and understand your reasoning.

**IMPORTANT:** You should not hard code or commit any sensitive information, such as API keys, passwords, etc. You should use environment variables for these. You should also not commit any `.env` files or any other sensitive information.

## Routers

All routers should be under the `src/routes` directory. Each route should export a router which you can use in the `index.ts` file. Below is an example:

_templateRouter.ts_

```typescript
import { Router } from 'express';

const templateRouter = Router();

templateRouter.get('/', (req, res) => {
  res.send('Hello World!');
});

templateRouter.post('/something', (req, res) => {
  res.send('Something');
});

export default templateRouter;
```

_index.ts_

```typescript
...
const app = express();
...
// This is how you include your router
router.use('/template', templateRouter);
...
```

## Services

All services should be under the `src/services` directory.

## Middleware

You may need to write middleware for your routes, such as authentication middleware (to check the auth status, etc.). All middleware should be under the `src/middleware` directory. You should also document your middleware and explain how to use it, what it does and so on.
