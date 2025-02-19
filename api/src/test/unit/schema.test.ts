import {
  coordinatesSchema,
  householdSchema,
  householdRequestDataSchema,
  memberSchema,
  memberPermissionsSchema,
  memberRoleSchema,
  householdRoomSchema,
  roomRequestDataSchema,
} from '../../schemas/household';

describe('Coordinates Schema Validation', () => {
  test('should validate correct coordinates', () => {
    const coordinates = { lat: 37.7749, long: -122.4194 };
    expect(() => coordinatesSchema.parse(coordinates)).not.toThrow();
  });

  test('should reject invalid latitude', () => {
    const coordinates = { lat: 100, long: -122.4194 };
    expect(() => coordinatesSchema.parse(coordinates)).toThrow();
  });

  test('should reject invalid longitude', () => {
    const coordinates = { lat: 37.7749, long: -200 };
    expect(() => coordinatesSchema.parse(coordinates)).toThrow();
  });
});

describe('Member Role Schema Validation', () => {
  test('should accept valid roles', () => {
    expect(() => memberRoleSchema.parse('owner')).not.toThrow();
    expect(() => memberRoleSchema.parse('admin')).not.toThrow();
    expect(() => memberRoleSchema.parse('dweller')).not.toThrow();
  });

  test('should reject invalid roles', () => {
    expect(() => memberRoleSchema.parse('guest')).toThrow();
  });
});

describe('Member Permissions Schema Validation', () => {
  test('should validate correct permissions', () => {
    const permissions = {
      appliances: true,
      health: false,
      security: true,
      energy: false,
    };
    expect(() => memberPermissionsSchema.parse(permissions)).not.toThrow();
  });

  test('should reject missing permissions', () => {
    const invalidPermissions = { appliances: true, health: false };
    expect(() => memberPermissionsSchema.parse(invalidPermissions)).toThrow();
  });

  test('should reject incorrect data types', () => {
    const invalidPermissions = {
      appliances: 'yes',
      health: false,
      security: 'no',
      energy: 1,
    };
    expect(() => memberPermissionsSchema.parse(invalidPermissions)).toThrow();
  });
});

describe('Household Member Schema Validation', () => {
  test('should accept a valid owner member', () => {
    const member = { id: '507f1f77bcf86cd799439011', role: 'owner' };
    expect(() => memberSchema.parse(member)).not.toThrow();
  });

  test('should accept a valid dweller with permissions', () => {
    const member = {
      id: '507f1f77bcf86cd799439012',
      role: 'dweller',
      permissions: {
        appliances: true,
        health: true,
        security: false,
        energy: true,
      },
    };
    expect(() => memberSchema.parse(member)).not.toThrow();
  });

  test('should reject a dweller without permissions', () => {
    const member = { id: '507f1f77bcf86cd799439013', role: 'dweller' };
    expect(() => memberSchema.parse(member)).toThrow();
  });

  test('should reject an invalid role', () => {
    const member = { id: '507f1f77bcf86cd799439014', role: 'visitor' };
    expect(() => memberSchema.parse(member)).toThrow();
  });
});

describe('Household Request Schema Validation', () => {
  test('should validate a correct household request', () => {
    const householdData = {
      name: 'My Smart Home',
      coordinates: { lat: 40.7128, long: -74.006 },
      floors: 2,
      floorsOffset: -1,
    };
    expect(() => householdRequestDataSchema.parse(householdData)).not.toThrow();
  });

  test('should reject a household request with negative floors', () => {
    const invalidHouseholdData = {
      name: 'Invalid Home',
      floors: -3,
    };
    expect(() =>
      householdRequestDataSchema.parse(invalidHouseholdData),
    ).toThrow();
  });

  test('should accept a household request without coordinates', () => {
    const householdData = { name: 'Minimal Home', floors: 1 };
    expect(() => householdRequestDataSchema.parse(householdData)).not.toThrow();
  });
});

describe('Household Schema Validation', () => {
  test('should accept a fully defined household', () => {
    const household = {
      _id: '507f1f77bcf86cd799439015',
      name: 'Main Residence',
      coordinates: { lat: 51.5074, long: -0.1278 },
      floors: 3,
      owner: '507f1f77bcf86cd799439016',
      members: [
        {
          id: '507f1f77bcf86cd799439017',
          role: 'admin',
        },
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
    };
    expect(() => householdSchema.parse(household)).not.toThrow();
  });

  test('should reject a household without an owner', () => {
    const household = {
      _id: '507f1f77bcf86cd799439019',
      name: 'House Without Owner',
      floors: 2,
      members: [],
    };
    expect(() => householdSchema.parse(household)).toThrow();
  });

  test('should reject a household with an invalid member role', () => {
    const household = {
      _id: '507f1f77bcf86cd799439020',
      name: 'Strange House',
      floors: 1,
      owner: '507f1f77bcf86cd799439021',
      members: [
        {
          id: '507f1f77bcf86cd799439022',
          role: 'ghost',
        },
      ],
    };
    expect(() => householdSchema.parse(household)).toThrow();
  });
});

describe('Room Schema Validation', () => {
  test('should validate a correct room', () => {
    const room = { name: 'Master Bedroom', type: 'bedroom', floor: 2 };
    expect(() => householdRoomSchema.parse(room)).not.toThrow();
  });

  test('should reject a room with an invalid type', () => {
    const room = { name: 'Random Room', type: 'garage', floor: 1 };
    expect(() => householdRoomSchema.parse(room)).toThrow();
  });

  test('should reject a room without a name', () => {
    const room = { type: 'living', floor: 1 };
    expect(() => householdRoomSchema.parse(room)).toThrow();
  });
});

describe('Room Request Schema Validation', () => {
  test('should validate a correct room request', () => {
    const roomRequest = { type: 'kitchen', name: 'Main Kitchen', floor: 1 };
    expect(() => roomRequestDataSchema.parse(roomRequest)).not.toThrow();
  });

  test('should reject a room request with missing fields', () => {
    const roomRequest = { type: 'bathroom' };
    expect(() => roomRequestDataSchema.parse(roomRequest)).toThrow();
  });
});
