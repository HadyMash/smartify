import { Device, DeviceCapability } from '../schemas/devices';
import crypto from 'crypto';

/**
 * Maximum byte size for MongoDB document IDs to be efficiently indexed
 */
const MONGO_ID_MAX_BYTES = 800;

/**
 * Creates a deterministic hash/signature for a device based on its properties and capabilities.
 * This can be used to compare two devices for functional equivalence.
 *
 * @param device The device to generate a signature for
 * @returns A string hash that uniquely identifies the device's structure
 */
export function getDeviceSignature(device: Device): string {
  // Create a normalized object containing all relevant device properties
  const normalizedDevice = {
    id: device.id,
    description: device.description || '',
    source: device.source,
    accessType: device.accessType,
    icon: device.icon || '',
    // Sort capabilities by ID to ensure consistent ordering
    capabilities: [...device.capabilities]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(normalizeCapability),
  };

  // Convert to JSON string and create hash
  const deviceJson = JSON.stringify(normalizedDevice);
  return crypto.createHash('sha256').update(deviceJson).digest('hex');
}

/**
 * Creates a shorter hash suitable for use as a MongoDB document ID
 * while maintaining uniqueness with high probability.
 *
 * @param device The device to generate a MongoDB-safe ID for
 * @returns A shorter hash suitable for MongoDB document ID
 */
export function getDeviceMongoId(device: Device): string {
  // Use SHA-256 hash and take first 12 bytes (24 hex chars)
  // This is the same size as MongoDB's ObjectId
  return getDeviceSignature(device).substring(0, 24);
}

/**
 * Checks if the full device signature will fit within MongoDB's
 * document ID size limits.
 *
 * @param signature The full device signature to check
 * @returns True if the signature fits within MongoDB's document ID size limits
 */
export function isSignatureMongoByteSafe(signature: string): boolean {
  // Check if the byte length of the signature is within MongoDB's limits
  return Buffer.from(signature).length <= MONGO_ID_MAX_BYTES;
}

/**
 * Verifies if a device matches a given signature.
 * This can be used for comparison after filtering by the shorter MongoDB ID.
 *
 * @param device The device to check
 * @param signature The full signature to compare against
 * @returns True if the device matches the signature
 */
export function verifyDeviceSignature(
  device: Device,
  signature: string,
): boolean {
  return getDeviceSignature(device) === signature;
}

/**
 * Determines if two devices are functionally equivalent by comparing their signatures.
 *
 * @param device1 First device to compare
 * @param device2 Second device to compare
 * @returns True if the devices are functionally equivalent
 */
export function areDevicesEquivalent(
  device1: Device,
  device2: Device,
): boolean {
  return getDeviceSignature(device1) === getDeviceSignature(device2);
}

/**
 * Creates a normalized representation of a capability for consistent hashing
 */
function normalizeCapability(
  capability: DeviceCapability,
): Record<string, unknown> {
  // Create a base normalized capability
  const normalizedCapability: Record<string, unknown> = {
    id: capability.id,
    type: capability.type,
    name: capability.name || '',
    readonly: capability.readonly || false,
    icon: capability.icon || '',
    extensionType: capability.extensionType || '',
  };

  // Add type-specific properties
  switch (capability.type) {
    case 'range':
      normalizedCapability.min = capability.min;
      normalizedCapability.max = capability.max;
      normalizedCapability.step = capability.step || null;
      normalizedCapability.unit = capability.unit || '';
      break;

    case 'number':
      normalizedCapability.bound = capability.bound || null;
      normalizedCapability.step = capability.step || null;
      normalizedCapability.unit = capability.unit || '';
      break;

    case 'mode':
      // Sort modes to ensure consistent ordering
      normalizedCapability.modes = [...capability.modes].sort();
      break;

    case 'multiswitch':
      normalizedCapability.length = capability.length || null;
      break;

    case 'multimode':
      // Sort modes to ensure consistent ordering
      normalizedCapability.modes = [...capability.modes].sort();
      break;

    case 'multirange':
      normalizedCapability.min = Array.isArray(capability.min)
        ? capability.min
        : [capability.min];
      normalizedCapability.max = Array.isArray(capability.max)
        ? capability.max
        : [capability.max];
      normalizedCapability.step = capability.step || null;
      normalizedCapability.unit = capability.unit || '';
      normalizedCapability.length = capability.length || null;
      break;

    case 'multinumber':
      normalizedCapability.bound = capability.bound || null;
      normalizedCapability.step = capability.step || null;
      normalizedCapability.unit = capability.unit || '';
      normalizedCapability.length = capability.length || null;
      break;

    case 'multivalue':
      normalizedCapability.length = capability.length || null;
      break;

    case 'action':
      // Sort arguments by ID to ensure consistent ordering
      normalizedCapability.arguments = [...capability.arguments]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(normalizeCapability);

      // Sort locked fields for consistent ordering
      normalizedCapability.lockedFields = [...capability.lockedFields].sort();
      break;

    case 'date':
      // Date capability has no additional properties
      break;

    case 'image':
      // For image capabilities, we don't include the actual bytes in the signature
      // since we're comparing structure not content
      normalizedCapability.hasBytes = !!capability.bytes?.length;
      break;
  }

  return normalizedCapability;
}
