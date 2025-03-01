import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { logMiddleware } from './middleware/log';
import { authRouter } from './routes/auth';
import { householdRouter } from './routes/household';
import { parseAuth } from './middleware/auth';
import { bigIntToHexMiddleware } from './middleware/bigint';
// eslint-disable-next-line no-restricted-imports
import { DatabaseService } from './services/db/db';
import { SRP } from './services/auth/auth';
import { modPow } from './services/auth/srp-utils';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);
app.use(parseAuth);
app.use(bigIntToHexMiddleware);

const router = express.Router();

router.get('/health', (_, res) => {
  res.send('OK');
});

router.use('/auth', authRouter);
router.use('/households', householdRouter);

app.use('/api', router);

async function start() {
  const db = new DatabaseService();
  await Promise.all([
    db.accessBlacklistRepository.loadBlacklistToCache(),
    db.mfaBlacklistRepository.loadBlacklistToCache(),
    db.srpSessionRepository.loadSessionsToCache(),
  ]);

  console.log('Blacklists loaded');

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('\n\n\n');
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testSRP() {
  const email = 'hady@gmail.com';
  const password = 'password';
  const salt = 'e6eb7979923ebb117785a56ab84f94ff';
  let verifier: bigint;

  {
    const x = SRP.calculateX(email, password, salt);
    //g.modPow(x, N)
    verifier = modPow(SRP.g, x, SRP.N);
  }

  console.log('verifier:', verifier.toString(16));

  // server keys
  const { b, B } = SRP.generateServerKeys(verifier);
  //const bString =
  //  '39083a31e24251fae9fa74a3f2f9ea9cc3827eb18179c2563333cd3cfc0cae1e';
  //const BString =
  //  '586d9483b54b8c09f987ee5e1c49e6053c8b5289aedf25176ff84280bd5faa8d6a357f1757165d8292926268fde0d4e0774db44d4a2e1babf96197df397a655377bd870f5dbede11cb00b16bb33350c58b6d10300cb4ffc8d83f7a3637616bbcf1f0d66a04b16674be9b6a7df64c8337fc4c07a6315934292d5e453db68dfe751b1c902fb5190aff696af17023a1b7159cc04c8ae5d28bdfd5b9a682e4762b15c28ac795416dc33254393a41584b34d8c8717cc2398621630375dc1e43e34c0a1c63f23efc57a07a363df4663693a0e2eae5c047f8fb2d1cdfe61fef47ccfc72ab96013272bc2a8aff184e94a77e95b393eccb37aa89dfdc24d3412a9a473643';
  //const b = BigInt('0x' + bString);
  //const B = BigInt('0x' + BString);

  console.log('b:', b.toString(16));
  console.log('B:', B.toString(16));

  // client keys
  const a = SRP.generateRandomBigInt(32);
  //const aString =
  //  'f1397a8f372866bf49ddf9a661e27e9612f88866ed7be78e741b90abcbb6ee77';
  //const a = BigInt('0x' + aString);
  console.log('a:', a.toString(16));

  // simulate client calculating proof
  const { A, M } = SRP.simulateDartClientProof(email, password, salt, a, B);

  console.log('test A:', A.toString(16));

  // verify proof on server
  SRP.verifyClientProof({ email, salt, verifier, A, b, B, Mc: M });

  console.log('\n\n\n');
}

//testSRP();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testSRP2() {
  const email = 'hady@gmail.com';
  const password = 'password';
  const salt = 'e231b0fd7f9106a2ca2cc2fc81167495';
  let verifier: bigint;

  {
    const x = SRP.calculateX(email, password, salt);
    //g.modPow(x, N)
    verifier = modPow(SRP.g, x, SRP.N);
  }

  console.log('');
  console.log('verifier:', verifier.toString(16));
  console.log('');

  // server keys
  const { b, B } = SRP.generateServerKeys(verifier);
  //const bString =
  //  '39083a31e24251fae9fa74a3f2f9ea9cc3827eb18179c2563333cd3cfc0cae1e';
  //const BString =
  //  '586d9483b54b8c09f987ee5e1c49e6053c8b5289aedf25176ff84280bd5faa8d6a357f1757165d8292926268fde0d4e0774db44d4a2e1babf96197df397a655377bd870f5dbede11cb00b16bb33350c58b6d10300cb4ffc8d83f7a3637616bbcf1f0d66a04b16674be9b6a7df64c8337fc4c07a6315934292d5e453db68dfe751b1c902fb5190aff696af17023a1b7159cc04c8ae5d28bdfd5b9a682e4762b15c28ac795416dc33254393a41584b34d8c8717cc2398621630375dc1e43e34c0a1c63f23efc57a07a363df4663693a0e2eae5c047f8fb2d1cdfe61fef47ccfc72ab96013272bc2a8aff184e94a77e95b393eccb37aa89dfdc24d3412a9a473643';
  //const b = BigInt('0x' + bString);
  //const B = BigInt('0x' + BString);

  console.log('b:', b.toString(16));
  console.log('B:', B.toString(16));
  console.log('');

  // client keys
  //const a = SRP.generateRandomBigInt(32);
  const aString =
    '31fbe9b30e7a5037f37137483b0909e0dce1c4ac4de47a269879e4481044d282';
  const a = BigInt('0x' + aString);
  console.log('a:', a.toString(16));
  console.log('');

  // simulate client calculating proof
  const { A, M } = SRP.simulateDartClientProof(email, password, salt, a, B);

  console.log('');
  console.log('test A:', A.toString(16));
  console.log('');

  // verify proof on server
  console.log('');
  SRP.verifyClientProof({ email, salt, verifier, A, b, B, Mc: M });
  console.log('');

  console.log('\n\n\n');
}

//testSRP2();
