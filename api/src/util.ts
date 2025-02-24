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
    res.status(400).send('Invalid Request');
    return undefined;
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

// test bigintmodpow
export function testBigIntModPow() {
  console.log(bigIntModPow(BigInt(2), BigInt(3), BigInt(5))); // Should output 3n (2^3 = 8, 8 mod 5 = 3)
  console.log(bigIntModPow(BigInt(3), BigInt(4), BigInt(7))); // Should output 4n (3^4 = 81, 81 mod 7 = 4)
}
