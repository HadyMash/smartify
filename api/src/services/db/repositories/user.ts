import assert from 'assert';
import { Collection, Db, ObjectId } from 'mongodb';
import { User } from '../../../schemas/user';

const COLLECTION_NAME = 'users';

// TODO: create type

export class UserRepository {
  private readonly collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection(COLLECTION_NAME);
  }

  // ! temp method
  // TODO: replace with actual methods
  public async getUserById(userId: string) {
    assert(ObjectId.isValid(userId), 'userId must be a valid ObjectId');

    const doc = await this.collection.findOne({ _id: new ObjectId(userId) });

    return doc;
  }
}
