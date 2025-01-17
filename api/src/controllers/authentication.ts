import { Response, Request } from 'express';
import { UserType, userSchema } from '../schemas/users';
import {
  createUser,
  findByEmail,
  verifyPassword,
} from '../services/authentication';

export class registrationController {
  public static register = async (req: Request, res: Response) => {
    try {
      if (!verifyPassword) {
        return res.status(400).json({ message: 'Invalid password' });
      }
      const newUser = await createUser(req.body);

      res.status(201).send('User successfully registered');
      return newUser;
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}
export class loginController {
  public static login = async (req: Request, res: Response) => {
    try {
      res.status(200).send('Login successful');
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}

export class forgotPassswordController {
  public static forgotPassword = async (req: Request, res: Response) => {
    const forgotMessage =
      'If a user is registered with that email a password reset link will be sent to your inbox.';
    const user = await findByEmail({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    try {
      res.status(200).send(forgotMessage);
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}

export class changePasswordController {
  public static changePassword = async (req: Request, res: Response) => {
    const newPassword = req.body.newPassword;
    try {
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}
