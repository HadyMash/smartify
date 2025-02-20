import { Response } from 'express';
import { AuthenticatedRequest } from '../schemas/auth';
import { BaseIotAdapter } from '../services/iot/base-adapter';
import { AcmeIoTAdapter } from '../services/iot/acme-adapter';

export class IoTController {
  // eslint-disable-next-line @typescript-eslint/require-await
  public static async updateDevice(req: AuthenticatedRequest, res: Response) {
    try {
      // TODO check authenticated request to check user has permission to update the device

      // TODO: check device info in db to figure out adapter type etc and make sure it exists

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const adapter: BaseIotAdapter = new AcmeIoTAdapter();

      // TODO: update device state
      //await adapter.setDeviceState()

      res.status(200).send({ message: 'Device updated' });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
}
