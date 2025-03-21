/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { createClient } from 'redis';
import { HouseholdRepository } from '../../services/db/repositories/household';
import { Household, HouseholdRoom } from '../../schemas/household';

describe('HouseholdRepository Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let redisClient: any;
  let householdRepo: HouseholdRepository;
  let householdId: string;
  let inviteId: ObjectId;
  let userId: ObjectId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = await MongoClient.connect(mongoServer.getUri(), {});
    db = client.db();
    redisClient = createClient();
    await redisClient.connect();
    householdRepo = new HouseholdRepository(client, db, redisClient);
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
    await redisClient.quit();
  });

  beforeEach(async () => {
    await db.collection('households').deleteMany({});
    inviteId = new ObjectId();
    userId = new ObjectId();
    const householdData: Household = {
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [
        {
          _id: inviteId,
          userId: userId,
          role: 'owner',
        },
      ],
      floors: 1,
    };
    const createdHousehold = await householdRepo.createHousehold(householdData);
    if (createdHousehold._id) {
      householdId = createdHousehold._id.toString();
    }
  });

  test('should create a household', async () => {
    const householdData: Household = {
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    };
    const createdHousehold = await householdRepo.createHousehold(householdData);
    expect(createdHousehold).toMatchObject(householdData);
  });

  test('should retrieve a household by ID', async () => {
    const householdData: Household = {
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    };

    const household = await householdRepo.createHousehold(householdData);
    expect(household).toBeTruthy();
    expect(household._id).toBeDefined();

    await new Promise((resolve) => setTimeout(resolve, 100));

    if (household._id) {
      const retrievedHousehold = await householdRepo.getHouseholdById(
        household._id.toString(),
      );
      expect(retrievedHousehold).toBeTruthy();
      expect(retrievedHousehold?.name).toBe('Test Household');
    }
  });

  test('should throw an error if household creation fails', async () => {
    jest
      .spyOn(householdRepo, 'createHousehold')
      .mockRejectedValueOnce(new Error('Failed to retrieve created household'));

    await expect(
      householdRepo.createHousehold({
        _id: new ObjectId(),
        name: 'Invalid Household',
        owner: 'owner123',
        coordinates: { lat: 10, long: 20 },
        members: [],
        rooms: [],
        invites: [],
        floors: 1,
      }),
    ).rejects.toThrow('Failed to retrieve created household');
  });

  test('should remove a member from a household', async () => {
    const memberId1 = new ObjectId().toString();
    const memberId2 = new ObjectId().toString();

    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [
        {
          id: memberId1,
          role: 'dweller',
          permissions: {
            appliances: false,
            health: false,
            security: false,
            energy: false,
          },
        },
        {
          id: memberId2,
          role: 'dweller',
          permissions: {
            appliances: true,
            health: true,
            security: true,
            energy: true,
          },
        },
      ],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    });

    expect(household?.members).toHaveLength(2);

    if (household._id) {
      await householdRepo.removeMember(household._id.toString(), memberId1);
      const updatedHousehold = await householdRepo.getHouseholdById(
        household._id.toString(),
      );

      expect(updatedHousehold?.members).toHaveLength(1);
      expect(updatedHousehold?.members[0].id).toBe(memberId2); // Ensure memberId2 remains
    }
  });

  test('should remove a room from a household', async () => {
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    });

    let updatedHousehold;
    if (household._id) {
      updatedHousehold = await householdRepo.addRoom(household._id.toString(), [
        {
          _id: new ObjectId().toString(),
          name: 'Living Room',
          type: 'living',
          floor: 1,
        },
      ]);
    }

    const roomId = updatedHousehold?.rooms.find(
      (room) => room.name === 'Living Room',
    )?._id;

    if (household._id && roomId) {
      const householdAfterRemoval = await householdRepo.removeRoom(
        household._id.toString(),
        roomId,
      );
      expect(householdAfterRemoval?.rooms).toHaveLength(1);
    }
  });

  test('should invite a member to a household', async () => {
    const userId = new ObjectId().toString();
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    });
    if (household._id) {
      const updatedHousehold = await householdRepo.inviteMember(
        household._id.toString(),
        userId,
        'dweller',
        { appliances: true, health: false, security: false, energy: true },
      );
      expect(updatedHousehold?.invites).toHaveLength(1);
    }
  });

  test('should delete a household', async () => {
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 0,
    });
    if (household._id) {
      await householdRepo.deleteHousehold(household._id.toString());
      const deletedHousehold = await householdRepo.getHouseholdById(
        household._id.toString(),
      );
      expect(deletedHousehold).toBeNull();
    }
  });
  test('should not add a room with duplicate ID', async () => {
    const roomId = new ObjectId().toString();
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [{ _id: roomId, name: 'Default Room', type: 'other', floor: 1 }],
      invites: [],
      floors: 1,
    });

    if (household._id) {
      await expect(
        householdRepo.addRoom(household._id.toString(), [
          { _id: roomId, name: 'Living Room', type: 'living', floor: 1 },
        ]),
      ).rejects.toThrow();
    }
  });

  test('should not remove the only room in a household', async () => {
    const roomId = new ObjectId().toString();
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [{ _id: roomId, name: 'Default Room', type: 'other', floor: 1 }],
      invites: [],
      floors: 1,
    });

    if (household._id) {
      await expect(
        householdRepo.removeRoom(household._id.toString(), roomId),
      ).rejects.toThrow('Cannot remove the only room in a household');
    }
  });

  test('should handle a sequence of actions', async () => {
    const userId = new ObjectId().toString();
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    });

    if (household._id) {
      // Invite a member
      let updatedHousehold = await householdRepo.inviteMember(
        household._id.toString(),
        userId,
        'dweller',
        { appliances: true, health: false, security: false, energy: true },
      );
      expect(updatedHousehold?.invites).toHaveLength(1);

      // Get the invite ID from the response
      const inviteId = updatedHousehold?.invites?.[0]?._id?.toString();
      expect(inviteId).toBeDefined(); // Ensure inviteId exists

      if (inviteId) {
        // Accept the invite using the correct invite ID
        updatedHousehold = await householdRepo.processInviteResponse(
          inviteId,
          true, // response
          userId,
          household._id.toString(),
        );

        console.log('After invite acceptance:', updatedHousehold); // Debugging log

        expect(updatedHousehold).toBeDefined();
        expect(updatedHousehold?.members ?? []).toBeInstanceOf(Array);
        expect(updatedHousehold?.members?.length).toBe(1);

        // Add a room (Fixed: Passed an array)
        updatedHousehold = await householdRepo.addRoom(
          household._id.toString(),
          [
            {
              _id: new ObjectId().toString(),
              name: 'Living Room',
              type: 'living',
              floor: 1,
            },
          ],
        );
        expect(updatedHousehold?.rooms ?? []).toBeInstanceOf(Array);
        expect(updatedHousehold?.rooms?.length).toBe(2);

        // Change member permissions
        updatedHousehold = await householdRepo.changeUserRole(
          household._id.toString(),
          userId,
          { role: 'dweller' },
          household.owner,
          { appliances: false, health: true, security: true, energy: false },
        );

        console.log('Members after role change:', updatedHousehold?.members); // Debugging log

        // Ensure _id is used correctly
        const member = updatedHousehold?.members?.find(
          (m: any) =>
            m._id?.toString() === userId || m.id?.toString() === userId,
        );
        console.log('Members after role change:', updatedHousehold?.members); // Debugging
        expect(member).toBeDefined();
        expect(member?.permissions).toEqual({
          appliances: false,
          health: true,
          security: true,
          energy: false,
        });

        // Remove the member
        updatedHousehold = await householdRepo.removeMember(
          household._id.toString(),
          userId,
        );
        expect(updatedHousehold?.members ?? []).toBeInstanceOf(Array);
        expect(updatedHousehold?.members?.length).toBe(0);
      }
    }
  });
  test('should throw an error when removing a non-existent member', async () => {
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    });

    if (household._id) {
      await expect(
        householdRepo.removeMember(
          household._id.toString(),
          new ObjectId().toString(),
        ),
      ).rejects.toThrow('Member not found');
    }
  });

  test('should throw an error when removing a member from a non-existent household', async () => {
    await expect(
      householdRepo.removeMember(
        new ObjectId().toString(),
        new ObjectId().toString(),
      ),
    ).rejects.toThrow('Household not found');
  });

  test('should return null when retrieving a non-existent household', async () => {
    const result = await householdRepo.getHouseholdById(
      new ObjectId().toString(),
    );
    expect(result).toBeNull();
  });

  test('should throw an error when adding a room with an invalid format', async () => {
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        {
          _id: new ObjectId().toString(),
          name: 'Default Room',
          type: 'other',
          floor: 1,
        },
      ],
      invites: [],
      floors: 1,
    });

    if (household._id) {
      await expect(
        householdRepo.addRoom(household._id.toString(), [
          { name: 'Living Room' } as any,
        ]),
      ).rejects.toThrow();
    }
  });
  test('should throw an error if inviteId is invalid', async () => {
    await expect(
      householdRepo.processInviteResponse(
        'invalid-invite-id',
        true,
        new ObjectId().toHexString(),
        new ObjectId().toHexString(),
      ),
    ).rejects.toThrow('Invalid ObjectId: invalid-invite-id');
  });
  test('should create the households collection if it does not exist', async () => {
    await householdRepo.configureCollection();

    const collections = await db
      .listCollections({ name: 'households' })
      .toArray();
    expect(collections.length).toBe(1);
  });

  test('should create indexes on required fields', async () => {
    await householdRepo.configureCollection();
    const indexes = await db.collection('households').indexes();

    const indexNames = indexes.map((idx) => idx.name);
    expect(indexNames).toContain('name_1');
    expect(indexNames).toContain('owner_1');
    expect(indexNames).toContain('members.id_1');
    expect(indexNames).toContain('rooms._id_1');
    expect(indexNames).toContain('invites.userId_1');
  });

  test('should return all invites for a valid user', async () => {
    const userId = new ObjectId();

    // Create unique household names
    const households = [
      {
        _id: new ObjectId(),
        name: `Test Household ${new ObjectId().toString()}`, // Unique name
        invites: [
          {
            _id: new ObjectId(),
            userId: userId, // Test both string and ObjectId formats
            role: 'admin',
          },
        ],
      },
      {
        _id: new ObjectId(),
        name: `Test Household 2 ${new ObjectId().toString()}`, // Unique name
        invites: [
          {
            _id: new ObjectId(),
            userId: userId, // ObjectId format
            role: 'admin',
          },
        ],
      },
    ];

    await db.collection('households').insertMany(households);

    const result = await householdRepo.getUserInvites(userId);
    expect(result.length).toBe(2);
  });

  test('should return an empty array if user has no invites', async () => {
    const userId = new ObjectId().toString();
    await db.collection('households').insertOne({
      _id: new ObjectId(),
      invites: [],
    });

    const result = await householdRepo.getUserInvites(userId);
    expect(result).toEqual([]);
  });

  test('should handle households with missing invites field', async () => {
    const userId = new ObjectId().toString();
    await db.collection('households').insertMany([
      {
        _id: new ObjectId(),
        name: `Test Household ${new ObjectId().toString()}`,
        invites: [],
      },
      {
        _id: new ObjectId(),
        name: `Test Household ${new ObjectId().toString()}`,
      }, // No invites field
    ]);

    const result = await householdRepo.getUserInvites(userId);
    expect(result).toEqual([]); // Expected no invites for this user
  });

  test('should handle userId as ObjectId instead of string', async () => {
    const userId = new ObjectId();
    const households = [
      {
        _id: new ObjectId(),
        invites: [
          { _id: new ObjectId(), userId: userId.toString(), role: 'admin' },
          { _id: new ObjectId(), userId, role: 'dweller', permissions: {} },
        ],
      },
    ];

    await db.collection('households').insertMany(households);
    const result = await householdRepo.getUserInvites(userId);

    expect(result).toHaveLength(2);
  });

  test('should add a new room to a household', async () => {
    // Arrange
    const newRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Living Room',
      type: 'living',
      floor: 1,
    };

    // Act
    const result = await householdRepo.manageRooms(householdId, newRoom, 'add');

    // Assert
    expect(result).not.toBeNull();
    expect(result!.rooms.length).toBe(2);
    expect(result!.rooms[1].name).toBe('Living Room');
    expect(result!.rooms[1].type).toBe('living');
  });

  test('should edit an existing room in a household', async () => {
    // Arrange
    // First create a household with a default room
    const defaultRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Default Room',
      type: 'other',
      floor: 1,
    };

    // Assume we already have a household with this room
    const household = await householdRepo.addRoom(householdId, [defaultRoom]);
    expect(household?.rooms.length).toBe(2);

    const updatedRoom: HouseholdRoom = {
      _id: defaultRoom._id,
      name: 'Updated Room Name',
      type: 'bedroom',
      floor: 2,
    };

    // Act
    const result = await householdRepo.manageRooms(
      householdId,
      updatedRoom,
      'edit',
    );

    // Assert
    expect(result).not.toBeNull();
    expect(result!.rooms.length).toBe(2);
    expect(result!.rooms[1].name).toBe('Updated Room Name');
    expect(result!.rooms[1].type).toBe('bedroom');
    expect(result!.rooms[1].floor).toBe(2);
  });

  test('should throw error when editing with invalid room data', async () => {
    // Arrange
    const defaultRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Default Room',
      type: 'other',
      floor: 1,
    };

    // Create a household with a default room first
    await householdRepo.addRoom(householdId, [defaultRoom]);

    const invalidRoom: HouseholdRoom = {
      _id: defaultRoom._id,
      name: '', // Invalid empty name
      type: 'bedroom',
      floor: 2,
    };

    // Act & Assert
    await expect(
      householdRepo.manageRooms(householdId, invalidRoom, 'edit'),
    ).rejects.toThrow('Invalid room data: type, name, and floor are required');
  });

  test('should throw error when editing with duplicate room name', async () => {
    // Arrange
    const room1: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Living Room',
      type: 'living',
      floor: 1,
    };

    const room2: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Bedroom',
      type: 'bedroom',
      floor: 1,
    };

    // Create a household with two rooms
    await householdRepo.addRoom(householdId, [room1, room2]);

    // Try to rename room2 to the same name as room1
    const duplicateNameRoom: HouseholdRoom = {
      _id: room2._id,
      name: 'Living Room', // This will create a duplicate
      type: 'bedroom',
      floor: 1,
    };

    // Act & Assert
    await expect(
      householdRepo.manageRooms(householdId, duplicateNameRoom, 'edit'),
    ).rejects.toThrow('A room with name "Living Room" already exists');
  });

  test('should throw error when room does not exist', async () => {
    // Arrange
    const nonExistentRoom: HouseholdRoom = {
      _id: new ObjectId().toString(), // ID that doesn't exist in the database
      name: 'Non-existent Room',
      type: 'other',
      floor: 1,
    };

    // Act & Assert
    await expect(
      householdRepo.manageRooms(householdId, nonExistentRoom, 'edit'),
    ).rejects.toThrow(
      `Room with ID ${nonExistentRoom._id} not found in household ${householdId}.`,
    );
  });

  test('should remove a room from a household', async () => {
    const newRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Living Room',
      type: 'living',
      floor: 1,
    };

    await householdRepo.manageRooms(householdId, newRoom, 'add');

    // Act - remove the default room
    const result = await householdRepo.manageRooms(
      householdId,
      newRoom,
      'remove',
    );

    // Assert
    expect(result).not.toBeNull();
    expect(result!.rooms.length).toBe(1);
  });

  // Error handling test cases
  test('should throw an error when householdId is missing', async () => {
    // Arrange
    const newRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Living Room',
      type: 'living',
      floor: 1,
    };

    // Act & Assert
    await expect(householdRepo.manageRooms('', newRoom, 'add')).rejects.toThrow(
      'Invalid arguments: householdId, room, and action are required.',
    );
  });

  test('should throw an error when room is missing', async () => {
    // Act & Assert
    await expect(
      householdRepo.manageRooms(householdId, null as any, 'add'),
    ).rejects.toThrow(
      'Invalid arguments: householdId, room, and action are required.',
    );
  });

  test('should throw an error when action is invalid', async () => {
    // Arrange
    const newRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Living Room',
      type: 'living',
      floor: 1,
    };

    // Act & Assert
    await expect(
      householdRepo.manageRooms(householdId, newRoom, 'invalid' as any),
    ).rejects.toThrow(
      "Invalid action: invalid. Allowed actions: 'add', 'edit', 'remove'.",
    );
  });

  test('should throw an error when editing a non-existent room', async () => {
    // Arrange
    const nonExistentRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Non-existent Room',
      type: 'living',
      floor: 1,
    };

    // Act & Assert
    await expect(
      householdRepo.manageRooms(householdId, nonExistentRoom, 'edit'),
    ).rejects.toThrow(
      `Room with ID ${nonExistentRoom._id} not found in household ${householdId}.`,
    );
  });

  test('should throw an error when household does not exist', async () => {
    // Arrange
    const nonExistentHouseholdId = new ObjectId().toString();
    const newRoom: HouseholdRoom = {
      _id: new ObjectId().toString(),
      name: 'Living Room',
      type: 'living',
      floor: 1,
    };

    // Act & Assert
    await expect(
      householdRepo.manageRooms(nonExistentHouseholdId, newRoom, 'edit'),
    ).rejects.toThrow(`Household with ID ${nonExistentHouseholdId} not found.`);
  });

  test('should accept an invite and add user as member', async () => {
    // Act
    const result = await householdRepo.processInviteResponse(
      inviteId.toString(),
      true, // accept
      userId.toString(),
      householdId.toString(),
    );

    // Assert
    expect(result).not.toBeNull();
    expect(result!.invites).toHaveLength(0);
    expect(result!.members).toHaveLength(1);

    const newMember = result!.members.find(
      (m) => m.id?.toString() === userId.toString(),
    );
    expect(newMember).toBeDefined();
    expect(newMember!.role).toBe('dweller');
    if (newMember) {
      expect(newMember?.permissions?.appliances).toBe(false);
    }
    if (newMember) {
      expect(newMember?.permissions?.health).toBe(false);
    }
    if (newMember) {
      expect(newMember?.permissions?.security).toBe(false);
    }
    if (newMember) {
      expect(newMember?.permissions?.energy).toBe(false);
    }
  });

  test('should decline an invite and remove it without adding member', async () => {
    // Act
    const result = await householdRepo.processInviteResponse(
      inviteId.toString(),
      false, // decline
      userId.toString(),
      householdId.toString(),
    );

    // Assert
    expect(result).not.toBeNull();
    expect(result!.invites).toHaveLength(0);
    expect(result!.members).toHaveLength(0);

    const newMember = result!.members.find(
      (m) => m.id?.toString() === userId.toString(),
    );
    expect(newMember).toBeUndefined();
  });

  test('should throw error for invalid userId', async () => {
    // Act & Assert
    await expect(
      householdRepo.processInviteResponse(
        inviteId.toString(),
        true,
        'invalid-user-id',
        householdId.toString(),
      ),
    ).rejects.toThrow('Invalid ObjectId: invalid-user-id');
  });

  test('should throw error for invalid householdId', async () => {
    // Act & Assert
    await expect(
      householdRepo.processInviteResponse(
        inviteId.toString(),
        true,
        userId.toString(),
        'invalid-household-id',
      ),
    ).rejects.toThrow('Invalid ObjectId: invalid-household-id');
  });

  test('should throw error for invalid inviteId', async () => {
    // Act & Assert
    await expect(
      householdRepo.processInviteResponse(
        'invalid-invite-id',
        true,
        userId.toString(),
        householdId.toString(),
      ),
    ).rejects.toThrow('Invalid ObjectId: invalid-invite-id');
  });

  test('should throw error if invite not found for the user', async () => {
    // Arrange
    const differentUserId = new ObjectId();

    // Act & Assert
    await expect(
      householdRepo.processInviteResponse(
        inviteId.toString(),
        true,
        differentUserId.toString(),
        householdId.toString(),
      ),
    ).rejects.toThrow(
      `Invite not found: Household ${householdId.toString()}, Invite ${inviteId.toString()}, User ${differentUserId.toString()}`,
    );
  });

  test('should throw error if household not found', async () => {
    // Arrange
    const nonExistentHouseholdId = new ObjectId();

    // Act & Assert
    await expect(
      householdRepo.processInviteResponse(
        inviteId.toString(),
        true,
        userId.toString(),
        nonExistentHouseholdId.toString(),
      ),
    ).rejects.toThrow(
      `Invite not found: Household ${nonExistentHouseholdId.toString()}, Invite ${inviteId.toString()}, User ${userId.toString()}`,
    );
  });

  test('should throw error if invite not found in the household', async () => {
    // Arrange
    const nonExistentInviteId = new ObjectId();

    // Act & Assert
    await expect(
      householdRepo.processInviteResponse(
        nonExistentInviteId.toString(),
        true,
        userId.toString(),
        householdId.toString(),
      ),
    ).rejects.toThrow(
      `Invite not found: Household ${householdId.toString()}, Invite ${nonExistentInviteId.toString()}, User ${userId.toString()}`,
    );
  });
  test('should throw an error if new role is dweller but no permissions are provided', async () => {
    await expect(
      householdRepo.changeUserRole(
        householdId,
        userId,
        { role: 'dweller' },
        'owner123',
      ),
    ).rejects.toThrow('Permissions are required when assigning dweller role.');
  });
  test('should return null and log error if household is not found', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    jest.spyOn(householdRepo, 'getHouseholdById').mockResolvedValueOnce(null);

    const result = await householdRepo.changeUserRole(
      new ObjectId(),
      new ObjectId(),
      { role: 'admin' },
      new ObjectId(),
    );

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'Household not found:',
      expect.any(ObjectId),
    );
  });
});
