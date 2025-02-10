import { Request, Response } from 'express';
import {
  requestUserSchema,
  RequestUser,
  userSchema,
  User,
} from '../../schemas/user';
import { AuthSerice } from '../../services/auth/auth';
//TODO: Add comments and documentation
export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      let data: RequestUser;
      try {
        console.log('parsing the schema');
        data = requestUserSchema.parse(req.body);
      } catch (_) {
        console.log('Invalid user data');
        res.status(400).send({
          error: 'Invalid user data',
          message: 'Please provide a valid email and password',
        });
        return;
      }
      console.log('creating as');
      const as = new AuthSerice();
      console.log('calling the auth service');
      const user = await as.register(
        data.email,
        data.password,
        data.dob,
        data.gender,
      );
      res.status(201).send(user);
      return;
    } catch (e) {
      console.error('error registering', e);
      res.status(500).send({
        error: 'Internal Server Error',
        message: 'Please try again later',
      });
      return;
    }
  }
}
