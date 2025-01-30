import { Collection, Db, ObjectId } from 'mongodb';

export class DeleteUserById {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('users');
  }

  public async deleteOne(userId: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({
        _id: new ObjectId(userId),
      });
      return result.deletedCount === 1;
    } catch (error) {
      console.error(error);
      throw new Error('Database error when deleting the user.');
    }
  }
}
