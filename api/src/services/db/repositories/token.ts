import assert from 'assert';
import { randomUUID } from 'crypto';
import { Collection, Db, ObjectId } from 'mongodb';

const COLLECTION_NAME = 'tokens';
const BLACKLIST_COLLECTION_NAME = 'tokenBlacklist';

interface TokenDoc {
  _id: ObjectId;
  tokenGenerationId: string | undefined;
}

interface BlacklistDoc {
  tokenGenerationId: string;
  expiry: Date;
}

// TODO: combine this with user collection or move into token service, there's
// no need for this to be a public repository as it's only used by the token
// service
// TODO: implement redis
// TODO: change so that only refresh tokens are stored in db
/* revoked access tokens are stored in redis (some sort of version
 * included in payload so if server crashes it invalidates all access tokens
 * that way no revoked access tokens get unrevoked) */
export class TokenRepository {
  private readonly collection: Collection<TokenDoc>;
  private readonly blacklistCollection: Collection<BlacklistDoc>;

  constructor(db: Db) {
    this.collection = db.collection<TokenDoc>(COLLECTION_NAME);
    this.blacklistCollection = db.collection<BlacklistDoc>(
      BLACKLIST_COLLECTION_NAME,
    );
  }

  /**
   * Generates a new token generation ID
   * @returns A new token generation ID
   */
  private generateTokenGenerationId(): string {
    return randomUUID();
  }

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @returns The user's token generation ID or null if it doesn't exist
   */
  public async getUserTokenGenerationId(
    userId: string,
  ): Promise<string | undefined>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID or null if it doesn't exist and upsert is false
   */
  public async getUserTokenGenerationId(
    userId: string,
    upsert: false,
  ): Promise<string | undefined>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID
   * */
  public async getUserTokenGenerationId(
    userId: string,
    upsert: true,
  ): Promise<string>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID or null if it doesn't exist and upsert is false
   */
  public async getUserTokenGenerationId(
    userId: string,
    upsert?: boolean,
  ): Promise<string | undefined> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    const objId: ObjectId = new ObjectId(userId);
    const doc = await this.collection.findOne({ _id: objId });
    if ((doc === null || !doc.tokenGenerationId) && upsert) {
      return await this.changeUserTokenGenerationId(userId);
    }

    return doc?.tokenGenerationId;
  }

  /**
   * Change's the user's token generation ID
   * @param userId - The user's ID
   * @returns the new token generation ID
   */
  public async changeUserTokenGenerationId(userId: string): Promise<string> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');
    const objId: ObjectId = new ObjectId(userId);

    const genId = this.generateTokenGenerationId();

    const result = await this.collection.updateOne(
      { _id: objId },
      { $set: { tokenGenerationId: genId } },
      { upsert: true },
    );

    if (
      !result.acknowledged ||
      (result.modifiedCount !== 1 && result.upsertedCount !== 1)
    ) {
      throw new Error('Failed to update token generation ID');
    }

    return genId;
  }

  /**
   * Blacklist a token generation ID to prevent all of it's tokens from being used including access tokens. This method will also change the user's token generation ID.
   * @param genId - The token generation ID to blacklist
   */
  public async blacklistTokenGenerationId(
    userId: string,
    genId: string,
  ): Promise<void> {
    // don't await, we want to blacklist as soon as possible
    this.changeUserTokenGenerationId(userId);

    // TODO: implement redis blacklist

    // write to db as well in case in memory cache is lost

    // don't enforce it being defined here so it doesn't throw an error
    const refreshLifespanString = process.env.AUTH_TOKEN_REFRESH_EXPIRY_SECONDS;
    let refreshLifespan: number = parseInt(refreshLifespanString ?? '', 10);

    // fail safe, if the refresh lifespan is not a number, log an error but keep
    // going. #1 priority is blacklisting, so we can use a really long time if
    // it's NaN for now.
    if (isNaN(refreshLifespan)) {
      console.error('AUTH_TOKEN_REFRESH_EXPIRY_SECONDS is not a number');
      refreshLifespan = 1000 * 60 * 60 * 24 * 365; // 1 year
    }

    // add to blacklist
    await this.blacklistCollection.insertOne({
      tokenGenerationId: genId,
      expiry: new Date(Date.now() + refreshLifespan),
    });
  }

  public async isTokenGenerationIdBlacklisted(genId: string): Promise<boolean> {
    // TODO: check redis cache first

    // not found in redis, check db
    const doc = await this.blacklistCollection.findOne({
      tokenGenerationId: genId,
    });

    if (doc === null) {
      return false;
    }

    // doc not null, meaning it's expired.
    // TODO: add to redis cache to avoid another cache miss
    // this should be non blocking so don't await

    // and return
    return true;
  }
}
