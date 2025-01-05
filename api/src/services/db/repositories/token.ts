import assert from 'assert';
import { randomUUID } from 'crypto';
import { Collection, Db, ObjectId } from 'mongodb';

const COLLECTION_NAME = 'tokens';

/**
 * Token generation id document. There may be multiple toke
 *
 * The current one will have blacklisted as false and no expiry
 * The previous ones will have an expiry set
 *
 * The blacklisted ones will have blacklisted as true and an expiry
 */
interface TokenGenIdDoc {
  /**
   * The user who the token generation ID is for
   */
  userId: ObjectId;
  /**
   * The token generation ID
   */
  tokenGenerationId: string;
  /**
   * When the generation id was created
   */
  created: Date;
  /**
   * When the generation id is set to expire
   */
  expiry?: Date | undefined;
  /**
   * If this generation id is blacklisted
   */
  blacklisted: boolean;
}

// TODO: implement redis
// TODO: integrate with token service to remove lifespan parameter

/* revoked access tokens are stored in redis (some sort of version
 * included in payload so if server crashes it invalidates all access tokens
 * that way no revoked access tokens get unrevoked) */
export class TokenRepository {
  private readonly collection: Collection<TokenGenIdDoc>;

  constructor(db: Db) {
    this.collection = db.collection<TokenGenIdDoc>(COLLECTION_NAME);
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
   * @param accessLifespanSeconds - The lifespan of the access token in seconds
   * @returns The user's token generation ID or null if it doesn't exist
   */
  public async getUserTokenGenerationId(
    userId: string,
    accessLifespanSeconds: number,
  ): Promise<string | undefined>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param accessLifespanSeconds - The lifespan of the access token in seconds
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID or null if it doesn't exist and upsert is false
   */
  public async getUserTokenGenerationId(
    userId: string,
    accessLifespanSeconds: number,
    upsert: false,
  ): Promise<string | undefined>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param accessLifespanSeconds - The lifespan of the access token in seconds
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID
   * */
  public async getUserTokenGenerationId(
    userId: string,
    accessLifespanSeconds: number,
    upsert: true,
  ): Promise<string>;

  /**
   * Get a user's token generation ID and optionally generate a new one if it doesn't exist
   * @param userId - The user's ID
   * @param accessLifespanSeconds - The lifespan of the access token in seconds
   * @param [upsert] - Whether to create a new token generation ID if one does not exist (a new one is created if this value is true). Defaults to false.
   * @returns The user's token generation ID or null if it doesn't exist and upsert is false
   */
  public async getUserTokenGenerationId(
    userId: string,
    accessLifespanSeconds: number,
    upsert?: boolean,
  ): Promise<string | undefined> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    // always get the latest token generation id
    const doc = await this.collection.findOne(
      {
        userId: new ObjectId(userId),
        blacklisted: false,
        $or: [{ expiry: { $exists: false } }, { expiry: undefined }],
      },
      { sort: { created: -1 } },
    );

    // create if it doesn't exist (or blacklisted)
    if ((doc === null || !doc.tokenGenerationId) && upsert) {
      return await this.changeUserTokenGenerationId(
        userId,
        accessLifespanSeconds,
      );
    }

    // if blacklisted and upsert is false return undefined, otherwise return
    // whatever the value is
    return doc?.tokenGenerationId;
  }

  /**
   * Change's the user's token generation ID
   * @param userId - The user's ID
   * @param accessLifespanSeconds - The lifespan of the access token in seconds
   * @returns the new token generation ID
   */
  public async changeUserTokenGenerationId(
    userId: string,
    accessLifespanSeconds: number,
  ): Promise<string> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    const expiry = new Date(Date.now() + accessLifespanSeconds * 1000);

    // update the latest document
    await this.collection.updateMany(
      {
        userId: new ObjectId(userId),
        $or: [{ expiry: { $exists: false } }, { expiry: undefined }],
      },
      { $set: { expiry } },
    );

    // create a new document
    const genId = this.generateTokenGenerationId();

    const doc: TokenGenIdDoc = {
      userId: new ObjectId(userId),
      tokenGenerationId: genId,
      created: new Date(),
      blacklisted: false,
    };

    const result = await this.collection.insertOne(doc);

    if (!result.acknowledged) {
      throw new Error('Failed to update token generation ID');
    }

    return genId;
  }

  /**
   * @param docs - The documents to cache
   */
  private async cacheBlacklist(
    docs: Pick<TokenGenIdDoc, 'tokenGenerationId' | 'expiry'>[],
  ) {
    console.warn('Not implemented');

    docs.forEach(async (doc) => {
      // TODO: add to redis
    });

    return;
  }

  /**
   * Blacklist a token generation ID to prevent all of it's tokens from being used including access tokens. This method will also change the user's token generation ID.
   * @param genId - The token generation ID to blacklist
   * @param accessLifespanSeconds - The lifespan of the access token in seconds
   */
  public async blacklistTokenGenerationId(
    userId: string,
    accessLifespanSeconds: number,
  ): Promise<void> {
    const expiry = new Date(Date.now() + accessLifespanSeconds * 1000);

    // begin blacklisting all tokens in the db but don't wait
    this.collection
      .updateMany(
        { userId: new ObjectId(userId), blacklisted: false },
        [
          {
            $set: {
              blacklisted: true,
              expiry: {
                $cond: {
                  if: { $ifNull: ['$expiry', false] }, // Check if expiry exists and is not null/undefined
                  then: '$expiry', // Keep the existing expiry value if it exists
                  else: expiry, // Set the new expiry value if it doesn't exist
                },
              },
            },
          },
        ],
        { upsert: false },
      )
      .then((result) => {
        console.log(
          'Acknowledged:',
          result.acknowledged,
          ', Blacklisted',
          result.modifiedCount,
          'tokens',
        );
      });

    // get all of them as well to blacklist in redis
    const docs = await this.collection
      .find(
        { userId: new ObjectId(userId) },
        { projection: { tokenGenerationId: 1, expiry: 1 } },
      )
      .toArray();

    await this.cacheBlacklist(docs);
  }

  /**
   * Checks if a token generation ID is blacklisted
   * @param genId - The generation id to check
   * @returns True if blacklisted, false otherwise
   */
  public async isTokenGenerationIdBlacklisted(genId: string): Promise<boolean> {
    // TODO: check redis cache first

    // not found in redis, check db
    //const doc = await this.blacklistCollection.findOne({
    //  tokenGenerationId: genId,
    //});
    const doc = await this.collection.findOne({
      tokenGenerationId: genId,
      blacklisted: true, // fewer blacklisted tokens, faster query
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
