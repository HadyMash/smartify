import {
  coordinatesSchema,
  householdSchema,
  memberPermissionsSchema,
  memberRoleSchema,
  householdRoomSchema,
  roomRequestDataSchema,
  inviteSchema,
} from '../../schemas/household';

describe('Coordinates Schema Validation', () => {
  test('should validate correct coordinates', () => {
    expect(() =>
      coordinatesSchema.parse({ lat: 37.7749, long: -122.4194 }),
    ).not.toThrow();
  });

  test('should reject invalid latitude', () => {
    expect(() =>
      coordinatesSchema.parse({ lat: 100, long: -122.4194 }),
    ).toThrow();
  });

  test('should reject invalid longitude', () => {
    expect(() =>
      coordinatesSchema.parse({ lat: 37.7749, long: -200 }),
    ).toThrow();
  });

  test('should reject non-object values', () => {
    expect(() => coordinatesSchema.parse(null)).toThrow();
    expect(() => coordinatesSchema.parse(undefined)).toThrow();
    expect(() => coordinatesSchema.parse([])).toThrow();
    expect(() => coordinatesSchema.parse(42)).toThrow();
    expect(() => coordinatesSchema.parse('string')).toThrow();
  });

  test('should reject missing lat or long', () => {
    expect(() => coordinatesSchema.parse({ lat: 37.7749 })).toThrow();
    expect(() => coordinatesSchema.parse({ long: -122.4194 })).toThrow();
  });
});

describe('Member Role Schema Validation', () => {
  test('should accept valid roles', () => {
    ['owner', 'admin', 'dweller'].forEach((role) => {
      expect(() => memberRoleSchema.parse(role)).not.toThrow();
    });
  });

  test('should reject invalid roles', () => {
    expect(() => memberRoleSchema.parse('guest')).toThrow();
    expect(() => memberRoleSchema.parse('Owner')).toThrow();
    expect(() => memberRoleSchema.parse('')).toThrow();
    expect(() => memberRoleSchema.parse(123)).toThrow();
  });
});

describe('Member Permissions Schema Validation', () => {
  test('should validate correct permissions', () => {
    expect(() =>
      memberPermissionsSchema.parse({
        appliances: true,
        health: false,
        security: true,
        energy: false,
      }),
    ).not.toThrow();
  });

  test('should reject incorrect data types', () => {
    expect(() =>
      memberPermissionsSchema.parse({
        appliances: 'yes',
        health: false,
        security: 'no',
        energy: 1,
      }),
    ).toThrow();
  });

  test('should reject missing or extra fields', () => {
    expect(() =>
      memberPermissionsSchema.parse({ appliances: true, health: false }),
    ).toThrow();
    expect(() =>
      memberPermissionsSchema.parse({
        appliances: true,
        health: false,
        security: true,
        energy: false,
        extra: true,
      }),
    ).toThrow();
  });
});

describe('Household Schema Validation', () => {
  test('should accept a fully defined household', () => {
    expect(() =>
      householdSchema.parse({
        _id: '507f1f77bcf86cd799439015',
        name: 'Main Residence',
        coordinates: { lat: 51.5074, long: -0.1278 },
        floors: 3,
        owner: '507f1f77bcf86cd799439016',
        members: [
          { id: '507f1f77bcf86cd799439017', role: 'admin' },
          {
            id: '507f1f77bcf86cd799439018',
            role: 'dweller',
            permissions: {
              appliances: true,
              health: false,
              security: true,
              energy: false,
            },
          },
        ],
        invites: [
          {
            _id: '507f1f77bcf86cd799439039',
            userId: '507f1f77bcf86cd799439040',
            role: 'dweller',
            permissions: {
              appliances: false,
              health: true,
              security: false,
              energy: true,
            },
          },
        ],
      }),
    ).not.toThrow();
  });

  test('should reject a household without an owner', () => {
    expect(() =>
      householdSchema.parse({
        _id: '507f1f77bcf86cd799439019',
        name: 'No Owner Home',
        floors: 2,
        members: [],
      }),
    ).toThrow();
  });

  test('should reject invalid member roles', () => {
    expect(() =>
      householdSchema.parse({
        _id: '507f1f77bcf86cd799439020',
        name: 'Strange House',
        floors: 1,
        owner: '507f1f77bcf86cd799439021',
        members: [{ id: '507f1f77bcf86cd799439022', role: 'ghost' }],
      }),
    ).toThrow();
  });
});

describe('Room Schema Validation', () => {
  test('should validate a correct room', () => {
    expect(() =>
      householdRoomSchema.parse({
        name: 'Master Bedroom',
        type: 'bedroom',
        floor: 2,
      }),
    ).not.toThrow();
  });

  test('should reject invalid room types', () => {
    expect(() =>
      householdRoomSchema.parse({
        name: 'Random Room',
        type: 'garage',
        floor: 1,
      }),
    ).toThrow();
  });

  test('should reject rooms without a name', () => {
    expect(() =>
      householdRoomSchema.parse({ type: 'living', floor: 1 }),
    ).toThrow();
  });

  test('should reject non-integer floor values', () => {
    expect(() =>
      householdRoomSchema.parse({
        name: 'Kitchen',
        type: 'kitchen',
        floor: 'second',
      }),
    ).toThrow();
    expect(() =>
      householdRoomSchema.parse({
        name: 'Kitchen',
        type: 'kitchen',
        floor: 2.5,
      }),
    ).toThrow();
  });
});

describe('Room Request Schema Validation', () => {
  test('should validate a correct room request', () => {
    expect(() =>
      roomRequestDataSchema.parse({
        type: 'kitchen',
        name: 'Main Kitchen',
        floor: 1,
      }),
    ).not.toThrow();
  });

  test('should reject a room request with missing fields', () => {
    expect(() => roomRequestDataSchema.parse({ type: 'bathroom' })).toThrow();
  });
});

describe('Invite Schema Validation', () => {
  test('should validate a correct invite', () => {
    expect(() =>
      inviteSchema.parse({
        _id: '507f1f77bcf86cd799439030',
        userId: '507f1f77bcf86cd799439031',
        role: 'admin',
        permissions: {
          appliances: true,
          health: false,
          security: true,
          energy: false,
        },
      }),
    ).not.toThrow();
  });

  test('should reject invite with invalid role', () => {
    expect(() =>
      inviteSchema.parse({
        _id: '507f1f77bcf86cd799439032',
        userId: '507f1f77bcf86cd799439033',
        role: 'guest',
        permissions: {
          appliances: true,
          health: false,
          security: true,
          energy: false,
        },
      }),
    ).toThrow();
  });

  test('should reject invite with missing userId', () => {
    expect(() =>
      inviteSchema.parse({
        _id: '507f1f77bcf86cd799439034',
        role: 'dweller',
        permissions: {
          appliances: true,
          health: false,
          security: true,
          energy: false,
        },
      }),
    ).toThrow();
  });

  test('should reject invite with missing permissions for dweller role', () => {
    expect(() =>
      inviteSchema.parse({
        _id: '507f1f77bcf86cd799439035',
        userId: '507f1f77bcf86cd799439036',
        role: 'dweller',
      }),
    ).toThrow();
  });

  test('should allow invite without permissions for admin role', () => {
    expect(() =>
      inviteSchema.parse({
        _id: '507f1f77bcf86cd799439037',
        userId: '507f1f77bcf86cd799439038',
        role: 'admin',
      }),
    ).not.toThrow();
  });
});
