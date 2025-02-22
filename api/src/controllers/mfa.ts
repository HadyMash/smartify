//import { Response } from 'express';
//import { DatabaseService, MFAService } from '../services/auth/mfa';
//import { MFAToken, mfaTokenSchema } from '../schemas/auth/mfa';
//import { AuthenticatedRequest } from '../schemas/auth/user';
//
//// TODO: proper error handling (maybe implement custom error classes)
//export class MFAController {
//  public static async initMFA(req: AuthenticatedRequest, res: Response) {
//    if (!req.user) {
//      console.log('Unauthorized');
//
//      res.status(401).send('Unauthorized');
//      return;
//    }
//
//    const db = new DatabaseService();
//    const mfa = new MFAService(db);
//
//    try {
//      const result = await mfa.initUserMFA(req.user.id);
//      console.log('MFA setup initiated');
//
//      res.status(201).send(result);
//      return;
//    } catch (e: any) {
//      console.log('Internal Server Error:', e.message);
//      res.status(500).send({
//        error: 'Internal Server Error',
//        message: 'Please try again later',
//      });
//      return;
//    }
//  }
//
//  public static async confirmMFA(req: AuthenticatedRequest, res: Response) {
//    if (!req.user) {
//      console.log('Unauthorized');
//
//      res
//        .status(401)
//        .send({ error: 'Unauthorized', message: 'User must be authenticated' });
//      return;
//    }
//    let mfaToken: MFAToken;
//    try {
//      //const userToken = req.body.token;
//      mfaToken = mfaTokenSchema.parse(req.body.token);
//    } catch (_) {
//      console.log('Invalid token');
//
//      res.status(400).send({
//        error: 'Invalid token',
//        message: 'Token must be a 6 digit number',
//      });
//      return;
//    }
//
//    const db = new DatabaseService();
//    const mfa = new MFAService(db);
//
//    try {
//      const confirmed = await mfa.finishInitMFASetup(req.user.id, mfaToken);
//      if (confirmed) {
//        console.log('MFA setup confirmed');
//
//        res.status(200).send({
//          message: 'MFA setup confirmed',
//        });
//      } else {
//        console.log('MFA setup not confirmed because code is incorrect');
//        res.status(400).send({
//          error: 'Incorrect Code',
//          message: 'Please enter the correct code',
//        });
//      }
//
//      return;
//    } catch (e: any) {
//      console.log('Internal Server Error:', e.message);
//
//      res.status(500).send({
//        error: 'Internal Server Error',
//        message: 'Please try again later',
//      });
//      return;
//    }
//  }
//
//  public static async verifyMFA(req: AuthenticatedRequest, res: Response) {
//    if (!req.user) {
//      console.log('Unauthorized');
//
//      res
//        .status(401)
//        .send({ error: 'Unauthorized', message: 'User must be authenticated' });
//      return;
//    }
//    let mfaToken: MFAToken;
//    try {
//      mfaToken = mfaTokenSchema.parse(req.body.token);
//    } catch (_) {
//      console.log('Invalid token');
//
//      res.status(400).send({
//        error: 'Invalid token',
//        message: 'Token must be a 6 digit number',
//      });
//      return;
//    }
//    const db = new DatabaseService();
//    const mfa = new MFAService(db);
//    try {
//      const confirmed = await mfa.verifyMFA(req.user.id, mfaToken);
//
//      // TODO: update this to be integrated with authentication instead of just
//      // returning true/false
//
//      if (confirmed) {
//        console.log('MFA code correct');
//
//        res.status(200).send();
//        return;
//      } else {
//        console.log('MFA code incorrect');
//        res.status(400).send({
//          error: 'Incorrect Code',
//          message: 'Please enter the correct code',
//        });
//        return;
//      }
//    } catch (e: any) {
//      console.log('Internal Server Error:', e.message);
//      res.status(500).send({
//        error: 'Internal Server Error',
//        message: e.message,
//      });
//      return;
//    }
//  }
//
//  public static async testRoute(req: AuthenticatedRequest, res: Response) {
//    const userId = req.params.id;
//
//    const db = new DatabaseService();
//    const mfa = new MFAService(db);
//
//    const result = await db.userRepository.getUserMFAformattedKey(
//      userId.toString(),
//    );
//
//    if (!result) {
//      res.status(404).send('User not found');
//      return;
//    }
//
//    res.status(200).send(result);
//    return;
//  }
//}
