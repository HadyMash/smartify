import assert from 'assert';
import { Collection, Db, ObjectId } from 'mongodb';

const COLLECTION_NAME = 'tokens';

interface TokenDoc {
  _id: ObjectId;
  tokenGenerationId: string | undefined;
}

// TODO: implement redis
// TODO: change so that only refresh tokens are stored in db
/* revoked access tokens are stored in redis (some sort of version
 * included in payload so if server crashes it invalidates all access tokens
 * that way no revoked access tokens get unrevoked) */
export class TokenRepository {
  private readonly collection: Collection<TokenDoc>;

  constructor(db: Db) {
    this.collection = db.collection<TokenDoc>(COLLECTION_NAME);
  }

  /**
   * Get a user's token generation ID
   * @param userId - The user's ID
   * @param generateNewId - A function to generate a new token generation ID. This is used if the user doesn't have one
   * @returns The user's token generation ID
   */
  public async getUserTokenGenerationId(
    userId: string,
    generateNewId: () => string,
  ): Promise<string> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    const objId: ObjectId = new ObjectId(userId);
    const doc = await this.collection.findOne({ _id: objId });
    if (doc === null || !doc.tokenGenerationId) {
      const newId = generateNewId();
      await this.setUserTokenGenerationId(userId, newId);
      return newId;
    }

    return doc.tokenGenerationId;
  }

  /**
   * Set the user's token generation ID
   * @param userId - The user's ID
   * @param genId - The token generation ID to set
   */
  public async setUserTokenGenerationId(
    userId: string,
    genId: string,
  ): Promise<void> {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');
    const objId: ObjectId = new ObjectId(userId);

    await this.collection.updateOne(
      { _id: objId },
      { $set: { tokenGenerationId: genId } },
      { upsert: true },
    );
  }
}
