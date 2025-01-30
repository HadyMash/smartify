import { Response, Request } from 'express';
import { UserType, userSchema } from '../schemas/users';
import { AuthenticationService } from '../services/authentication';

export class RegistrationController {
  public static register = async (req: Request, res: Response) => {
    const createUserService = new AuthenticationService();
    try {
      //   if (!AuthenticationService.validatePassword(req.body.password)) {
      //     return res.status(400).json({ message: 'Invalid password' });
      //   }
      //   const newUser = await createUserService.createUser(req.body);

      //   res.status(201).send('User successfully registered');
      //   return newUser;
      const validData = userSchema.parse(req.body);
    } catch (error) {
      console.error(error);
      return error;
    }
  };
  public static login = async (req: Request, res: Response) => {
    try {
      res.status(200).send('Login successful');
    } catch (error) {
      console.error(error);
      return error;
    }
    try {
      const userData = req.body;
      //const result = await AuthenticationService.login(userData);
      res.status(200).json({
        message: 'Login successful',
        //user: result,
      });
    } catch (error) {
      res.status(400).json(error);
    }
  };
  public static forgotPassword = async (req: Request, res: Response) => {
    const forgotMessage =
      'If a user is registered with that email a password reset link will be sent to your inbox.';
    // TODO: Requires merging with MFA for database
    // const user = await findByEmail({ email: req.body.email });
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found!' });
    // }

    try {
      res.status(200).send(forgotMessage);
    } catch (error) {
      console.error(error);
      return error;
    }
  };
  public static changePassword = async (req: Request, res: Response) => {
    const newPassword = req.body.newPassword;
    try {
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}
