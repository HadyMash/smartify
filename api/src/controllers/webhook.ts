import { Request, Response } from 'express';
import { DeviceSource, deviceSourceSchema } from '../schemas/devices';
import { log } from '../util/log';

export class WebhookController {
  /**
   * Identify webhook source
   * @param req - The request
   * @returns The source of the webhook or undefined if invalid
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static webhookSource(req: Request): DeviceSource | undefined {
    // TEMP
    return deviceSourceSchema.enum.acme;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  static async iotUpdate(req: Request, res: Response) {
    switch (this.webhookSource(req)) {
      case deviceSourceSchema.enum.acme: {
        const apiKey: string | undefined = req.headers['x-api-key'] as string;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const deviceId: string | undefined = req.body.deviceId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const changes: Record<string, any> | undefined = req.body.changes;

        if (!apiKey || !deviceId || !changes) {
          log.debug('Invalid request:', req.body);
          res.status(400).json({ error: 'Invalid request' });
          return;
        }

        log.debug(deviceId, 'changed:', changes);

        // TODO: do something with the webhook data
        break;
      }
      default:
        res.status(400).json({ error: 'Invalid source' });
        return;
        break;
    }

    res.status(200).json({ message: 'Webhook received' });
  }
}
