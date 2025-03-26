import { Response } from 'express';
import { z } from 'zod';

/**
 * Validates the schema in a request, and returns the parsed object.
 * Will send a 400 response if the schema is invalid.
 * @returns The schema if valid, undefined if invalid
 */

export function validateSchema<T extends z.ZodType>(
  res: Response,
  schema: T,
  data: unknown,
): z.infer<T> | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(data);
  } catch (_) {
    console.log(_);

    res.status(400).send({ error: 'Invalid Request' });
    return undefined;
  }
}
