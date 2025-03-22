import { Request, Response, NextFunction } from 'express';

/**
 * Recursively converts any BigInt values in an object to base-16 strings
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertBigIntsToHex(obj: unknown): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return `0x${obj.toString(16)}`;
  }

  if (Array.isArray(obj)) {
    // Only create a new array if there are BigInts to convert
    const converted = obj.map(convertBigIntsToHex);
    return obj.some((item) => typeof item === 'bigint') ? converted : obj;
  }

  if (obj && typeof obj === 'object' && !Buffer.isBuffer(obj)) {
    // Only create a new object if there are BigInts to convert
    const entries = Object.entries(obj);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const convertedEntries = entries.map(([key, value]) => [
      key,
      convertBigIntsToHex(value),
    ]);

    // Check if any values were actually converted
    const hasChanges = convertedEntries.some(
      ([_, value], index) => value !== entries[index][1],
    );

    return hasChanges ? Object.fromEntries(convertedEntries) : obj;
  }

  return obj;
}

/**
 * Express middleware that converts BigInt values to hex strings before JSON serialization
 */
export function bigIntToHexMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Store the original send function
  const originalSend = res.send;

  // Override the send function
  res.send = function (body: unknown): Response {
    try {
      // Convert any BigInts in the response body to hex strings
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const convertedBody = convertBigIntsToHex(body);

      // Call the original send with the converted body
      return originalSend.call(this, convertedBody);
    } catch (error) {
      console.error('Error in bigIntToHexMiddleware:', error);
      return originalSend.call(this, body);
    }
  };

  next();
}
