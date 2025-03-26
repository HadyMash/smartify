import { Request, Response, NextFunction } from 'express';
import { DBService } from '../services/db-service';

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey) {
    res.status(401).json({ error: 'API key is required in X-API-Key header' });
    console.log('API key is required in X-API-Key header, request rejected');

    return;
  }

  const dbService = new DBService();
  const keyData = await dbService.getApiKey(apiKey);

  if (!keyData) {
    res.status(401).json({ error: 'Invalid api key' });
    console.log('Invalid api key, request rejected');
    return;
  }
  if (!keyData.isActive) {
    res.status(403).json({ error: 'Inactive API key' });
    console.log('inactive API key, request rejected');
    return;
  }

  // Add API key to request for later use
  (req as any).apiKey = apiKey;
  next();
};

export const validateDevicePairing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = (req as any).apiKey;
  const deviceId = req.params.deviceId;

  if (!deviceId) {
    res.status(400).json({ error: 'Device ID is required' });
    console.log('Device ID is required, request rejected');

    return;
  }

  const dbService = new DBService();
  const device = await dbService.getDevice(deviceId);

  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    console.log('Device not found, request rejected');

    return;
  }

  if (!device.connected) {
    res.status(503).json({ error: 'Device is offline' });
    console.log('Device is offline, request rejected');

    return;
  }

  if (!device.pairedApiKeys.includes(apiKey)) {
    res.status(403).json({ error: 'API key not authorized for this device' });
    console.log('API key not authorized for this device, request rejected');

    return;
  }

  next();
};
