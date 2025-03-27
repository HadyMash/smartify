export function parseBool(value: string | boolean): boolean | null {
  if (typeof value === 'boolean') return value;
  const lower = value.toLowerCase();
  if (lower === 'true' || lower === '1') return true;
  if (lower === 'false' || lower === '0') return false;
  return null;
}
