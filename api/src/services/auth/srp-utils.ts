/**
 * Helper utilities for SRP protocol implementation
 */

import crypto from 'crypto';

/**
 * Extension for BigInt to add modPow operation
 * Calculates (base^exponent) % modulus efficiently
 */
export function modPow(
  base: bigint,
  exponent: bigint,
  modulus: bigint,
): bigint {
  if (modulus === BigInt(1)) return BigInt(0);

  let result = BigInt(1);
  base = base % modulus;

  while (exponent > BigInt(0)) {
    if (exponent % BigInt(2) === BigInt(1)) {
      result = (result * base) % modulus;
    }
    exponent = exponent >> BigInt(1);
    base = (base * base) % modulus;
  }

  return result;
}

/**
 * Generate cryptographically secure random bytes as BigInt
 */
export function generateSecureRandomBigInt(byteLength: number): bigint {
  const bytes = crypto.randomBytes(byteLength);
  return BigInt('0x' + bytes.toString('hex'));
}

/**
 * Hash a string using SHA-256
 */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Convert a BigInt to a byte array
 */
export function bigIntToBytes(value: bigint): Buffer {
  let hex = value.toString(16);
  // Ensure even length for hex string
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Convert a byte array to a BigInt
 */
export function bytesToBigInt(bytes: Buffer): bigint {
  return BigInt('0x' + bytes.toString('hex'));
}

/**
 * Perform security validation for SRP parameters
 */
export function validateSrpParameters(
  A: bigint,
  B: bigint,
  N: bigint,
): boolean {
  // Check that A and B are not zero modulo N
  if (A % N === BigInt(0) || B % N === BigInt(0)) {
    return false;
  }

  return true;
}
