import { Db, MongoClient, ObjectId } from 'mongodb';
import { UserRepository } from '../../authentication';
import { UserType } from '../../../schemas/users';
//Method for creating a user and inputting him into a databse
export class AuthUserRepository {
  private static db: Db;
  public async createUser(user: UserType): Promise<boolean> {
    try {
      AuthUserRepository.db.collection('users').insertOne({ user });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  public async updatePassword(user: UserType): Promise<boolean> {
    try {
      const userUpdated = await AuthUserRepository.db
        .collection('users')
        .updateOne({ user }, { $set: { password: user.password } });
      return userUpdated.modifiedCount > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async deleteUser(user: UserType): Promise<boolean> {
    try {
      const userDeleted = await AuthUserRepository.db
        .collection('users')
        .deleteOne({ user });
      return userDeleted.deletedCount > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
