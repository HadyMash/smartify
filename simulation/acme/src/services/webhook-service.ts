import { Device } from '../schemas/device';
import { APIKey } from '../schemas/api-key';

export class WebhookService {
  private static instance: WebhookService;

  private constructor() {}

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  //private generateSignature(payload: string, secret: string): string {
  //  return crypto
  //    .createHmac('sha256', secret)
  //    .update(payload)
  //    .digest('hex');
  //}

  private calculateStateDelta(
    previousState: Partial<Device>,
    newState: Partial<Device>,
  ): Record<string, any> {
    const delta: Record<string, any> = {};

    // Only include values that have changed
    Object.keys(newState).forEach((key) => {
      if (
        JSON.stringify(previousState[key as keyof Device]) !==
        JSON.stringify(newState[key as keyof Device])
      ) {
        delta[key] = newState[key as keyof Device];
      }
    });

    return delta;
  }

  public async notifyWebhook(
    apiKey: APIKey,
    device: Device,
    previousState: Partial<Device>,
    newState: Partial<Device>,
  ): Promise<boolean> {
    if (!apiKey.webhookUrl) {
      return false;
    }

    try {
      const stateDelta = this.calculateStateDelta(previousState, newState);

      const payload = {
        deviceId: device.id,
        deviceType: device.type,
        timestamp: new Date().toISOString(),
        changes: stateDelta,
      };

      const stringifiedPayload = JSON.stringify(payload);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey.key,
      };

      const response = await fetch(apiKey.webhookUrl, {
        method: 'POST',
        headers,
        body: stringifiedPayload,
      });

      return response.ok;
    } catch (error) {
      console.warn(`Failed to send webhook notification: ${error}`);
      return false;
    }
  }
}
