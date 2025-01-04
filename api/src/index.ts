import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logMiddleware from './middleware/log';
import { TokenService } from './services/token';
import { DatabaseService } from './services/db/db';
import { User, UserSchema } from './schemas/user';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

const router = express.Router();

router.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ! temp
async function test() {
  const db = new DatabaseService();

  const userId = await db.userRepository.createUser();
  const userObj = await db.userRepository.getUserById(userId);
  if (userObj === null) {
    throw new Error('User is null');
  }

  const user: User = UserSchema.parse(userObj);

  console.log('created user');

  const ts = new TokenService();
  const { refreshToken, accessToken, idToken } =
    await ts.generateAllTokens(user);
  console.log('created all tokens');

  console.log('\n\nRefresh token:', refreshToken);
  console.log('\n\nAccess token:', accessToken);
  console.log('\n\nID token:', idToken);

  console.log('\n');

  const accessResult = await ts.verifyToken(accessToken);

  if (accessResult.valid) {
    console.log('access token valid, payload:', accessResult.payload);
  } else {
    console.error('access token invalid:', accessResult);
  }

  const refreshResult = await ts.verifyToken(refreshToken);
  if (refreshResult.valid) {
    console.log('refresh token valid, payload:', refreshResult.payload);
  } else {
    console.error('refresh token invalid:', refreshResult);
  }

  const idResult = await ts.verifyToken(idToken);
  if (idResult.valid) {
    console.log('id token valid, payload:', idResult.payload);
  } else {
    console.error('id token invalid:', idResult);
  }

  // validate fake token
  const fakeResult = await ts.verifyToken('asdf.asdf.asdf');

  if (fakeResult.valid) {
    console.log('fake token valid, payload:', fakeResult.payload);
  } else {
    console.error('fake token invalid:', fakeResult);
  }

  const newAcces = await ts.refreshAccessToken(refreshToken);

  console.log('new access token:', newAcces);

  // verify new access
  const newAccessResult = await ts.verifyToken(newAcces);
  if (newAccessResult.valid) {
    console.log('new access token valid, payload:', newAccessResult.payload);
  } else {
    console.error('new access token invalid:', newAccessResult);
  }

  if (accessResult.valid) {
    console.log('access token valid, payload:', accessResult.payload);
  } else {
    console.error('access token invalid:', accessResult);
  }

  console.log('revoking tokens normally');

  // revoke the refresh token
  await ts.revokeRefreshTokens(user._id);

  // try verifying the tokens again
  const accessResultTwo = await ts.verifyToken(accessToken);

  if (accessResultTwo.valid) {
    console.log('access token valid, payload:', accessResultTwo.payload);
  } else {
    console.error('access token invalid:', accessResultTwo);
  }

  const refreshResultTwo = await ts.verifyToken(refreshToken);
  if (refreshResultTwo.valid) {
    console.log('refresh token valid, payload:', refreshResultTwo.payload);
  } else {
    console.error('refresh token invalid:', refreshResultTwo);
  }
}

test();
