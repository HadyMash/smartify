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
  requestResetPasswordSchema,
  RequestResetPassword,
  resetPasswordSchema,
  ResetPassword,
} from '../../schemas/user';
import { AuthService } from '../../services/auth/auth';
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
      const as = new AuthService();
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
      res.status(400).send({
        error: 'User already exists',
        message: 'Please type a different email',
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
      const as = new AuthService();
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
      //Making a variable with the schema of Change Password
      let data: ChangePassword;
      try {
        data = changePasswordSchema.parse(req.body);
        console.log(data);
        try {
          const as = new AuthService();
          const user = await as.changePassword(
            data.email,
            data.password,
            data.newPassword,
          );
          res.status(200).send('Password successfully changed!');
        } catch (e) {
          res.status(400).send({
            error: 'Email associated with this account was not found',
            message: 'Please provide a valid email',
          });
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
      data = deleteAccountSchema.parse(req.body);
      console.log(data);
      try {
        const as = new AuthService();
        const user = await as.deleteAccount(data.email);
        res.status(200).send('Account deleted successfully!');
      } catch (_) {
        res.status(500).send({
          error: 'Internal Server Error',
          message: 'Please try again later',
        });
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
  public static async requestReset(req: Request, res: Response) {
    //TODO: Validate the request reset method
    let data: RequestResetPassword;

    try {
      console.log('Starting the parsing');
      data = requestResetPasswordSchema.parse(req.body);
      console.log(data);
      const as = new AuthService();
      const reset = await as.requestResetPassword(data.email);
      console.log(reset);
      res
        .status(200)
        .send('Reset Password request sent. Here is your code: ' + reset);
    } catch (_) {
      console.error('Error requesting reset');
      res.status(400).send({
        error: 'User with that email not found',
        message: 'Please provide a valid email',
      });
    }
  }
  public static async resetPassword(req: Request, res: Response) {
    let data: ResetPassword;
    try {
      data = resetPasswordSchema.parse(req.body);
      console.log(data);
      try {
        const as = new AuthService();
        const reset = await as.resetPassword(
          data.email,
          data.code,
          data.newPassword,
        );
        res.status(200).send('Password successfully reset!');
      } catch (_) {
        res.status(500).send({
          error: 'Internal Server Error',
          message: 'Please try again later',
        });
        console.error('Error resetting password');
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
