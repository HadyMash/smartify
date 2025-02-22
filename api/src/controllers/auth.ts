import { Request, Response } from 'express';
import { createUserSchema } from '../schemas/auth/user';
import { DatabaseService } from '../services/db/db';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      // validate body
      const data = req.body;
      try {
        createUserSchema.parse(data);
      } catch (_) {
        res.status(400).send('Invalid Request');
        return;
      }

      const db = new DatabaseService();

      // create user
      //const result
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
      return;
    }
  }
}
