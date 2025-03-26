import { ObjectId } from 'mongodb';
import {
  coordinatesSchema,
  householdSchema,
  memberPermissionsSchema,
  memberRoleSchema,
  householdRoomSchema,
  roomRequestDataSchema,
  inviteMemberSchema,
  modifyMemberSchema,
  HouseholdRoom,
} from '../../schemas/household';
import { validateRooms } from '../../util/household';

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

  test('should reject null as a role', () => {
    expect(() => memberRoleSchema.parse(null)).toThrow();
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

  test('should reject empty permissions object', () => {
    expect(() => memberPermissionsSchema.parse({})).toThrow();
  });

  test('should reject missing boolean values', () => {
    expect(() =>
      memberPermissionsSchema.parse({
        appliances: true,
        health: undefined,
        security: false,
        energy: true,
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
            inviteId: '507f1f77bcf86cd799439039',
            id: '507f1f77bcf86cd799439040',
            role: 'dweller',
            permissions: {
              appliances: false,
              health: true,
              security: false,
              energy: true,
            },
          },
        ],
        rooms: [
          {
            id: '507f1f77bcf86cd799439050',
            name: 'Living Room',
            type: 'living',
            floor: 1,
            devices: [],
            connectedRooms: {},
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

  test('should reject additional unexpected properties in household', () => {
    expect(() =>
      householdSchema.parse({
        _id: new ObjectId().toString(),
        name: 'Extra Fields House',
        floors: 2,
        owner: new ObjectId().toString(),
        extraField: 'invalid',
      }),
    ).toThrow();
  });
});

describe('Room Schema Validation', () => {
  test('should validate a correct room', () => {
    expect(() =>
      householdRoomSchema.parse({
        id: new ObjectId().toString(),
        name: 'Master Bedroom',
        type: 'bedroom',
        floor: 2,
        connectedRooms: {},
        devices: [],
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

  test('should allow valid additional room types (if applicable)', () => {
    expect(() =>
      householdRoomSchema.parse({
        id: new ObjectId().toString(),
        name: 'Library',
        type: 'other',
        floor: 1,
        connectedRooms: {},
        devices: [],
      }),
    ).not.toThrow();
  });
});

describe('Room Request Schema Validation', () => {
  //test('should validate a correct room request', () => {
  //  expect(() =>
  //    roomRequestDataSchema.parse({
  //      type: 'kitchen',
  //      name: 'Main Kitchen',
  //      floor: 1,
  //    }),
  //  ).not.toThrow();
  //});

  test('should reject a room request with missing fields', () => {
    expect(() => roomRequestDataSchema.parse({ type: 'bathroom' })).toThrow();
  });
});

describe('inviteMemberSchema Validation', () => {
  const validHouseholdId = '60d21b4667d0d8992e610c85'; // Example valid ObjectId string
  const validMemberId = '60d21b4667d0d8992e610c86';

  const validPermissions = {
    appliances: true,
    health: false,
    security: true,
    energy: false,
  };

  test('should accept a valid invite for admin without permissions', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'example@domain.com',
      householdId: validHouseholdId,
      memberId: validMemberId,
      role: 'admin',
    });
    expect(result.success).toBe(true);
  });

  test('should accept a valid invite for dweller with permissions', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      email: 'example@domain.com',
      role: 'dweller',
      permissions: validPermissions,
    });
    expect(result.success).toBe(true);
  });

  test('should reject invite for dweller without permissions', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      email: 'example@domain.com',
      role: 'dweller',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.format()).toHaveProperty('permissions');
      expect(result.error.format().permissions?._errors).toContain(
        'Permissions are required for dweller role',
      );
    }
  });

  test('should reject invite with an invalid householdId format', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: 'invalid-id', // Invalid format
      memberId: validMemberId,
      role: 'admin',
    });

    expect(result.success).toBe(false);
  });

  test('should reject invite with an invalid memberId format', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      memberId: 1234, // Invalid type
      role: 'admin',
    });

    expect(result.success).toBe(false);
  });

  test('should reject invite with an invalid role', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      memberId: validMemberId,
      role: 'guest', // Not allowed
    });

    expect(result.success).toBe(false);
  });

  test('should reject invite with extra unexpected properties', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      memberId: validMemberId,
      role: 'admin',
      extraField: 'unexpected',
    });

    expect(result.success).toBe(false);
  });

  test('should reject empty object', () => {
    const result = inviteMemberSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test('should reject missing householdId', () => {
    const result = inviteMemberSchema.safeParse({
      memberId: validMemberId,
      role: 'admin',
    });
    expect(result.success).toBe(false);
  });

  test('should reject missing memberId', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      role: 'admin',
    });
    expect(result.success).toBe(false);
  });

  test('should reject missing role', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      memberId: validMemberId,
    });
    expect(result.success).toBe(false);
  });

  test('should reject if permissions contain invalid fields', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: validHouseholdId,
      memberId: validMemberId,
      role: 'dweller',
      permissions: {
        appliances: true,
        invalidField: 'not allowed', // Invalid property
      },
    });

    expect(result.success).toBe(false);
  });

  test('should accept householdId and memberId as valid ObjectId strings', () => {
    const result = modifyMemberSchema.safeParse({
      householdId: '507f1f77bcf86cd799439011',
      memberId: '507f1f77bcf86cd799439012',
      role: 'admin',
    });

    expect(result.success).toBe(true);
  });

  test('should accept householdId and memberId as valid hex strings', () => {
    const result = modifyMemberSchema.safeParse({
      householdId: 'abcdef123456abcdef123456',
      memberId: 'abcdef654321abcdef654321',
      role: 'admin',
    });

    expect(result.success).toBe(true);
  });

  test('should reject householdId or memberId if they are invalid hex strings', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: 'xyz123', // Invalid hex format
      memberId: validMemberId,
      role: 'admin',
    });

    expect(result.success).toBe(false);
  });

  test('should reject householdId or memberId if they contain spaces', () => {
    const result = inviteMemberSchema.safeParse({
      householdId: '507 f1f77bcf86cd799439011', // Invalid because of space
      memberId: validMemberId,
      role: 'admin',
    });

    expect(result.success).toBe(false);
  });
});

describe('Room adjacency test', () => {
  test('should accept a single room', () => {
    const rooms: HouseholdRoom[] = [
      {
        id: '507f1f77bcf86cd799439011',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {},
      },
    ];

    expect(validateRooms(rooms)).toBe(true);
  });

  test('should accept two connected rooms', () => {
    const rooms: HouseholdRoom[] = [
      {
        id: '1',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          bottom: '2',
        },
      },
      {
        id: '2',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          top: '1',
        },
      },
    ];

    expect(validateRooms(rooms)).toBe(true);
  });

  test('should not accept connected rooms on different floors', () => {
    const rooms: HouseholdRoom[] = [
      {
        id: '1',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          bottom: '2',
        },
      },
      {
        id: '2',
        name: 'Living Room',
        type: 'living',
        floor: 2,
        connectedRooms: {
          top: '1',
        },
      },
    ];

    expect(validateRooms(rooms)).toBe(false);
  });

  test('should accept multiple connected rooms', () => {
    const rooms: HouseholdRoom[] = [
      {
        id: 'a',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          left: 'b',
          right: 'c',
        },
      },
      {
        id: 'b',
        name: 'Kitchen',
        type: 'kitchen',
        floor: 1,
        connectedRooms: {
          right: 'a',
          top: 'd',
        },
      },
      {
        id: 'c',
        name: 'Bedroom',
        type: 'bedroom',
        floor: 1,
        connectedRooms: {
          left: 'a',
          top: 'e',
        },
      },
      {
        id: 'd',
        name: 'Bathroom',
        type: 'bathroom',
        floor: 1,
        connectedRooms: {
          bottom: 'b',
        },
      },
      {
        id: 'e',
        name: 'Office',
        type: 'other',
        floor: 1,
        connectedRooms: {
          bottom: 'c',
        },
      },
    ];

    expect(validateRooms(rooms)).toBe(true);
  });

  test('should not accept multiple rooms connected to the same place', () => {
    const rooms: HouseholdRoom[] = [
      {
        id: '1',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          bottom: '2',
          right: '3',
        },
      },
      {
        id: '2',
        name: 'Kitchen',
        type: 'kitchen',
        floor: 1,
        connectedRooms: {
          top: '1',
        },
      },
      {
        id: '3',
        name: 'Bedroom',
        type: 'bedroom',
        floor: 1,
        connectedRooms: {
          left: '1',
        },
      },
      {
        id: '4',
        name: 'Bathroom',
        type: 'bathroom',
        floor: 1,
        connectedRooms: {
          bottom: '3',
        },
      },
      {
        id: '5',
        name: 'Office',
        type: 'other',
        floor: 1,
        connectedRooms: {
          right: '3',
        },
      },
    ];

    expect(validateRooms(rooms)).toBe(false);
  });

  test('should not accept overlapping rooms', () => {
    const rooms: HouseholdRoom[] = [
      {
        id: '1',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          left: '2',
          top: '5',
        },
      },
      {
        id: '2',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          right: '1',
          top: '3',
        },
      },
      {
        id: '3',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          bottom: '2',
          right: '4',
        },
      },
      {
        id: '4',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          left: '3',
        },
      },
      {
        id: '5',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {
          bottom: '1',
        },
      },
    ];

    expect(validateRooms(rooms)).toBe(false);
  });

  test('should not accept disconnected rooms', () => {
    const rooms: HouseholdRoom[] = [
      {
        id: '1',
        name: 'Living Room',
        type: 'living',
        floor: 1,
        connectedRooms: {},
      },
      {
        id: '2',
        name: 'Kitchen',
        type: 'kitchen',
        floor: 1,
        connectedRooms: {},
      },
    ];
    expect(validateRooms(rooms)).toBe(false);
  });
});
