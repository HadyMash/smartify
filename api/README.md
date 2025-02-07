# API Service

This is the API backend service for Smartify. It's a Node.js Express server written with TypeScript. It's responsible for handling all the API requests from the Flutter app, as well as the other services. Furthermore, it's also responsible for authentication, and database operations.

# Prerequisites

You need to have Node.js installed. It's recommended you have the latest LTS version installed. You also need to have MongoDB installed locally.

# How to run

To run the API service, run `npm run dev` in the `api` directory.

# Conventions

All code should be written in TypeScript and be well documented using JSDoc comments. You should also comment your code as needed. Don't write unnecessary comments, and don't write comments that just repeat the code. Your comments should explain the logic behind the code or why you wrote something or do something, so it's easy to follow and understand your reasoning.

**IMPORTANT:** You should not hard code or commit any sensitive information, such as API keys, passwords, etc. You should use environment variables for these. You should also not commit any `.env` files or any other sensitive information.

## Services

All services should be under the `src/services` directory. Services are responsible for handling the business logic of the application.

## Controllers

All controllers should be under the `src/controllers` directory. Controllers are responsible for handling the requests and responses. They should call the services to handle the business logic.

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

Routes should not contain the controllers, they should only contain the routes and the logic for the routes. The controllers should be called from the routes.

All routes need to be properly documented, including all the routes, what they do, what they take in, what they return, the meaning of each status code, etc.

## Middleware

You may need to write middleware for your routes, such as authentication middleware (to check the auth status, etc.). All middleware should be under the `src/middleware` directory. You should also document your middleware and explain how to use it, what it does and so on.

## Schemas

All schemas should be under the `src/schemas` directory. Schemas are responsible for defining the structure of the data that is being sent or received. You should use zod to define your schemas. Below is an example on how to create a schema:

```typescript
import { z } from 'zod';

export const templateSchema = z.object({
  key: z.string(),
});
export type templateType = z.infer<typeof templateSchema>;
```

You should also document your schemas and explain what each field is, what it does, what it should be, etc.

# Environment variables

Below are the environment variables

**`PORT`:** The port the Express server will listen to

**`JWT_SECRET`:** The JWT secret used to sign jwt tokens. This is a temporary
field until rotations are implemented.

**`JWT_ENCRYPTION_KEY`:** The encryption key used to encrypt the JWT tokens. It should be a A256GCM key.

**`AUTH_TOKEN_ACCESS_EXPIRY_SECONDS`:** The time in seconds for the access token expiry (how long it lives). This should be a short duration, typically 30 mins to a few hours.

**`AUTH_TOKEN_REFRESH_EXPIRY_SECONDS`:** The time in seconds for the refresh token expiry (how long it lives). The refresh token is used to refresh/create new access tokens.

**`AUTH_TOKEN_MFA_EXPIRY_SECONDS`:** The time in seconds for the MFA token to expire (how long it lives). This should be a very short duration, typically around 5 minutes.

**`MONGODB_URL`:** The MongoDB connection URL

**`REDIS_URL`:** The Redis cache server URL
