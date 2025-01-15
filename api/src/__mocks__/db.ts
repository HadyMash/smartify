import { jest } from '@jest/globals';
import { TokenRepository } from '../services/db/repositories/token';
import { Db } from 'mongodb';
import { RedisClientType } from 'redis';
import { randomUUID } from 'crypto';

// ! this is not ready to use yet
export const createMockDatabaseService = () => {
  const tokenRepository: {
    [userId: string]: {
      [deviceId: string]: {
        tokenGenId: string;
        blacklisted?: boolean;
        expiry?: number;
      };
    };
  } = {};
  const mockTokenRepository = {
    //constructor: jest.fn().mockImplementation((db: Db, redis: RedisClientType) => {}),
    getUserTokenGenerationId: jest.fn(
      async (
        userId: string,
        deviceId: string,
        upsert?: boolean,
      ): Promise<string | undefined> => {
        if (tokenRepository[userId][deviceId]) {
          const obj = tokenRepository[userId][deviceId];
          if (!(obj.blacklisted || obj.expiry)) {
            return obj.tokenGenId;
          }
        }

        if (upsert) {
          if (!tokenRepository[userId]) {
            tokenRepository[userId] = {};
          }
          tokenRepository[userId][deviceId] = {
            tokenGenId: randomUUID(),
          };

          return tokenRepository[userId][deviceId].tokenGenId as string;
        }
      },
    ),
  } as unknown as jest.Mocked<TokenRepository>;

  // TODO: implement the other mock methods

  //const mockUserRepository = {
  //  // Add user repository methods you need to mock
  //} as jest.Mocked<UserRepository>;
  //
  //const mockDatabaseService = {
  //  tokenRepository: mockTokenRepository,
  //  userRepository: mockUserRepository,
  //} as jest.Mocked<DatabaseService>;
  //
  //return {
  //  mockDatabaseService,
  //  mockTokenRepository,
  //  mockUserRepository,
  //};
};
