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

/**
 * Try's to run a controller, and sends a 500 response if it fails.
 * @param res - The response object
 * @param controller - the controller to run
 * @param customErrorHandling - A function to add custom error handling. It
 * returns a true if the error was handled, and false otherwise. This function
 * will be called before the default error handling.
 */
export function tryAPIController(
  res: Response,
  controller: () => Promise<void>,
  customErrorHandling?: (err: unknown) => boolean,
) {
  const handleError = (err: unknown) => {
    if (customErrorHandling && customErrorHandling(err)) {
      return;
    }
    console.log('err caught in tryAPIController');
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  };
  try {
    controller().catch(handleError);
  } catch (e) {
    handleError(e);
  }
}

export function bigIntModPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = BigInt(1);
  base = base % mod;
  while (exp > BigInt(0)) {
    if (exp % BigInt(2) === BigInt(1)) {
      result = (result * base) % mod;
    }
    exp = exp >> BigInt(1);
    base = (base * base) % mod;
  }
  return result;
}

//// test bigintmodpow
//export function testBigIntModPow() {
//  console.log(bigIntModPow(BigInt(2), BigInt(3), BigInt(5))); // Should output 3n (2^3 = 8, 8 mod 5 = 3)
//  console.log(bigIntModPow(BigInt(3), BigInt(4), BigInt(7))); // Should output 4n (3^4 = 81, 81 mod 7 = 4)
//}
