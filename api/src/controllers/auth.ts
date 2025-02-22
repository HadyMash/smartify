import { Request, Response } from 'express';
import { CreateUserData, createUserSchema } from '../schemas/auth/user';

export class AuthController {
  // eslint-disable-next-line @typescript-eslint/require-await
  public static async register(req: Request, res: Response) {
    try {
      // validate body
      let data: CreateUserData;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data = createUserSchema.parse(req.body);
      } catch (_) {
        res.status(400).send('Invalid Request');
        return;
      }

      // create user
      //const result
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
      return;
    }
  }
}
