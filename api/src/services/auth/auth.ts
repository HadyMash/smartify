import { DatabaseService } from '../db/db';
import { RequestUser, userSchema, User } from '../../schemas/user';

//TODO: Add comments and documentation
export class AuthSerice {
  protected readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  public async register(
    email: string,
    password: string,
    dob: Date | undefined,
    gender: string | undefined,
  ): Promise<RequestUser> {
    // if (await this.db.userRepository.userExists()) {
    //   throw new Error('User already exists');
    // }

    const newUser = await this.db.userRepository.createUser(
      email,
      password,
      dob,
      gender,
    );
    return { email, password, dob, gender };
  }
}
