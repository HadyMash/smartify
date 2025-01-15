import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logMiddleware } from './middleware/log';
import { authRouter } from './routes/auth';
import { DatabaseService } from './services/db/db';
import { TokenService } from './services/token';
import { User, UserSchema } from './schemas/user';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

const router = express.Router();

router.get('/health', (_, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);

app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ! temp
async function test() {
  const deviceId = 'test-device-id';

  const db = new DatabaseService();

  const userId = await db.userRepository.createUser();
  const userObj = await db.userRepository.getUserById(userId);
  if (userObj === null) {
    throw new Error('User is null');
  }

  const user: User = UserSchema.parse(userObj);

  console.log('created user');

  const ts = new TokenService();
  const { refreshToken, accessToken, idToken } = await ts.generateAllTokens(
    user,
    deviceId,
  );
  console.log('created all tokens');

  console.log('\n\nRefresh token:', refreshToken);
  console.log('\n\nAccess token:', accessToken);
  console.log('\n\nID token:', idToken);

  console.log('\n');

  const accessResult = await ts.verifyToken(accessToken, true);

  if (accessResult.valid) {
    console.log('access token valid, payload:', accessResult.payload);
  } else {
    console.error('access token invalid:', accessResult);
  }

  const refreshResult = await ts.verifyToken(refreshToken, true);
  if (refreshResult.valid) {
    console.log('refresh token valid, payload:', refreshResult.payload);
  } else {
    console.error('refresh token invalid:', refreshResult);
  }

  const idResult = await ts.verifyToken(idToken, false);
  if (idResult.valid) {
    console.log('id token valid, payload:', idResult.payload);
  } else {
    console.error('id token invalid:', idResult);
  }

  // validate fake token
  const fakeResultEncrypted = await ts.verifyToken('asdf.asdf.asdf', true);

  if (fakeResultEncrypted.valid) {
    console.log('fake token valid, payload:', fakeResultEncrypted.payload);
  } else {
    console.error('fake token encrypted invalid:', fakeResultEncrypted);
  }

  const fakeResultUnencrypted = await ts.verifyToken('asdf.asdf.asdf', false);

  if (fakeResultUnencrypted.valid) {
    console.log('fake token valid, payload:', fakeResultUnencrypted.payload);
  } else {
    console.error('fake token unencrypted invalid:', fakeResultUnencrypted);
  }

  const newTokens = await ts.refreshTokens(refreshToken, deviceId);

  console.log('new tokens:', newTokens);

  // verify new access
  const newTokensResult = await ts.verifyToken(newTokens.accessToken, true);
  if (newTokensResult.valid) {
    console.log('new access token valid, payload:', newTokensResult.payload);
  } else {
    console.error('new access token invalid:', newTokensResult);
  }

  if (accessResult.valid) {
    console.log('access token valid, payload:', accessResult.payload);
  } else {
    console.error('access token invalid:', accessResult);
  }

  console.log('revoking tokens normally');

  // revoke the refresh token
  await ts.revokeDeviceRefreshTokens(user._id, deviceId);

  // try verifying the tokens again
  const accessResultTwo = await ts.verifyToken(accessToken, true);

  if (accessResultTwo.valid) {
    console.log('access token valid, payload:', accessResultTwo.payload);
  } else {
    console.error('access token invalid:', accessResultTwo);
  }

  const refreshResultTwo = await ts.verifyToken(refreshToken, true);
  if (refreshResultTwo.valid) {
    console.log('refresh token valid, payload:', refreshResultTwo.payload);
  } else {
    console.error('refresh token invalid:', refreshResultTwo);
  }

  // try to refresh access token with revoked refresh token
  try {
    const newTokensTwo = await ts.refreshTokens(refreshToken, deviceId);
    console.log('tokens refersh:', newTokensTwo);
  } catch (e) {
    console.log("couldn't refresh tokens:", e);
  }

  console.log('blacklisting tokens (maybe account was hacked)');

  // revoke the refresh token
  await ts.revokeAllTokensImmediately(user._id);

  // try verifying the tokens again
  const accessResultThree = await ts.verifyToken(accessToken, true);

  if (accessResultThree.valid) {
    console.log('access token valid, payload:', accessResultThree.payload);
  } else {
    console.error('access token invalid:', accessResultThree);
  }

  const refreshResultThree = await ts.verifyToken(refreshToken, true);
  if (refreshResultThree.valid) {
    console.log('refresh token valid, payload:', refreshResultThree.payload);
  } else {
    console.error('refresh token invalid:', refreshResultThree);
  }

  // try to refresh access token with blacklisted refresh token
  try {
    const newTokensThree = await ts.refreshTokens(refreshToken, deviceId);
    console.log('tokens refersh:', newTokensThree);
  } catch (e) {
    console.log("couldn't refresh tokens:", e);
  }
}

test();
