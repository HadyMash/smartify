import { Db, MongoClient } from 'mongodb';
const DB_NAME: string = 'smartify';

export class DatabaseService {
  private static db: Db;
  constructor() {
    if (!DatabaseService.db) {
      const client = new MongoClient(process.env.MONGODB_URL!, {
        // TODO: configure pool settings
      });
      client
        .connect()
        .then(() => {
          console.log('Connected to MongoDB');
        })
        .catch((err) => {
          console.error('Error connecting to MongoDB', err);
        });
      DatabaseService.db = client.db(DB_NAME);
    }
  }
}
