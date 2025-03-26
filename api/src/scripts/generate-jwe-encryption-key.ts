import crypto from 'crypto';

/**
 * Generates a cryptographically secure random 256-bit key for JWE encryption
 * and returns it as a Base64URL encoded string (the format used in JWE)
 *
 * @returns {string} Base64URL encoded 256-bit encryption key
 */
export function generateJweEncryptionKey(): string {
  // Generate 32 bytes (256 bits) of random data
  const key = crypto.randomBytes(32);

  // Convert to Base64URL encoding (Base64 with URL-safe characters)
  // This replaces '+' with '-', '/' with '_', and removes padding '='
  const base64Key = key
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64Key;
}

// When this script is run directly, generate and log a new key
if (require.main === module) {
  const encryptionKey = generateJweEncryptionKey();
  console.log('Generated 256-bit JWE Encryption Key:');
  console.log(encryptionKey);
  console.log('\nStore this key securely in your environment variables.');
}
