import dotenv from 'dotenv';
// eslint-disable-next-line no-restricted-imports
import { DatabaseService } from './services/db/db';
dotenv.config();

async function run() {
  const db = new DatabaseService();

  await db.configureCollections();
}

run()
  .then(() => {
    console.log('Database collections configured');
    process.exit(0);
  })
  .catch((e) => {
    throw e;
  });
