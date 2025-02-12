import { Request, Response } from 'express';
import {
  requestUserSchema,
  RequestUser,
  userSchema,
  User,
  changePasswordSchema,
  ChangePassword,
  deleteAccountSchema,
  DeleteAccount,
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
        console.log(data);
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
  public static async login(req: Request, res: Response) {
    //TODO: Check the schema and validate the login method
    try {
      let data: RequestUser;
      try {
        console.log('parsing the schema');
        data = requestUserSchema.parse(req.body);
        console.log(data);
      } catch (_) {
        console.log('Invalid user data');
        res.status(400).send({
          error: 'Invalid user data',
          message: 'Please provide a valid email and password',
        });
        return;
      }
      console.log('initializing the auth service');
      const as = new AuthSerice();
      const user = await as.login(data.email, data.password);
      res.status(200).send(user);
    } catch (_) {
      console.log('Invalid user data');
      res.status(400).send({
        error: 'Invalid user data',
        message: 'Please provide a valid email and password',
      });
      return;
    }
  }
  public static async changePassword(req: Request, res: Response) {
    //TODO: Check the schema and validate the change password method
    try {
      let data: ChangePassword;
      try {
        console.log('parsing the schema');
        data = changePasswordSchema.parse(req.body);
        console.log(data);
        try {
          console.log('initializing the auth service');
          const as = new AuthSerice();
          const user = await as.changePassword(data.email, data.password);
          res.status(200).send(user);
        } catch (e) {
          console.error('Error changing password', e);
        }
      } catch (_) {
        console.log('Invalid user data');
        res.status(400).send({
          error: 'Invalid user data',
          message: 'Please provide a valid email and password',
        });
        return;
      }
    } catch (_) {
      console.error('Error changing password');
      res.status(500).send({
        error: 'Internal Server Error',
        message: 'Please try again later',
      });
      return;
    }
  }
  public static async deleteAccount(req: Request, res: Response) {
    let data: DeleteAccount;
    try {
      console.log('parsing the schema');
      data = deleteAccountSchema.parse(req.body);
      console.log(data);
      try {
        console.log('initializing the auth service');
        const as = new AuthSerice();
        const user = await as.deleteAccount(data.email);
        res.status(200).send(user);
      } catch (_) {
        console.error('Error deleting account');
      }
    } catch (_) {
      console.log('Invalid user data');
      res.status(400).send({
        error: 'Invalid user data',
        message: 'Please provide a valid email and password',
      });
      return;
    }
  }
}
