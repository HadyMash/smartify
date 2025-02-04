import { Request, Response, NextFunction } from 'express';
import { DBService } from '../services/db-service';

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.body.key;

  if (!apiKey) {
    res.status(401).json({ error: 'API key is required' });
    return;
  }

  const dbService = new DBService();
  const keyData = await dbService.getApiKey(apiKey);

  if (!keyData || !keyData.isActive) {
    res.status(401).json({ error: 'Invalid or inactive API key' });
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
    return;
  }

  const dbService = new DBService();
  const device = await dbService.getDevice(deviceId);

  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }

  if (!device.connected) {
    res.status(503).json({ error: 'Device is offline' });
    return;
  }

  if (!device.pairedApiKeys.includes(apiKey)) {
    res.status(403).json({ error: 'API key not authorized for this device' });
    return;
  }

  next();
};
