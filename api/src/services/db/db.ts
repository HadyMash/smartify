import { Db, MongoClient } from 'mongodb';
import { TokenRepository } from './repositories/token';
import { UserRepository } from './repositories/user';

const DB_NAME: string = 'smartify';

export class DatabaseService {
  private static uri: string = process.env.MONGO_URI!;

  private static client: MongoClient | undefined;
  private static db: Db;

  // Repositories
  private _userRepository: UserRepository;
  private _tokenRepository: TokenRepository;

  constructor() {
    if (!DatabaseService.client) {
      DatabaseService.client = new MongoClient(DatabaseService.uri, {
        // TODO: configure pool settings
      });
      DatabaseService.client
        .connect()
        .then(() => {
          console.log('Connected to MongoDB');
        })
        .catch((err) => {
          console.error('Error connecting to MongoDB', err);
        });
      DatabaseService.db = DatabaseService.client.db(DB_NAME);
    }

    // Initialize repositories
    this._userRepository = new UserRepository(DatabaseService.db);
    this._tokenRepository = new TokenRepository(DatabaseService.db);
  }

  get userRepository(): UserRepository {
    return this._userRepository;
  }

  get tokenRepository(): TokenRepository {
    return this._tokenRepository;
  }
}
