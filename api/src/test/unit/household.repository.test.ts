/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { createClient } from 'redis';
import { HouseholdRepository } from '../../services/db/repositories/household';
import { Household } from '../../schemas/household';

describe('HouseholdRepository Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let redisClient: any;
  let householdRepo: HouseholdRepository;

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
  });

  test('should create a household', async () => {
    const householdData: Household = {
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        { _id: new ObjectId(), name: 'Default Room', type: 'other', floor: 1 },
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
        { _id: new ObjectId(), name: 'Default Room', type: 'other', floor: 1 },
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

  test('should remove a member from a household', async () => {
    const memberId = new ObjectId().toString();
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [
        {
          id: memberId,
          role: 'dweller',
          permissions: {
            appliances: false,
            health: false,
            security: false,
            energy: false,
          },
        },
      ],
      rooms: [
        { _id: new ObjectId(), name: 'Default Room', type: 'other', floor: 1 },
      ],
      invites: [],
      floors: 1,
    });

    expect(household?.members).toHaveLength(1);
    if (household._id) {
      await householdRepo.removeMember(household._id.toString(), memberId);
      const updatedHousehold = await householdRepo.getHouseholdById(
        household._id.toString(),
      );
      expect(updatedHousehold?.members).toHaveLength(0);
    }
  });

  test('should add a room to a household', async () => {
    const household = await householdRepo.createHousehold({
      _id: new ObjectId(),
      name: 'Test Household',
      owner: 'owner123',
      coordinates: { lat: 10, long: 20 },
      members: [],
      rooms: [
        { _id: new ObjectId(), name: 'Default Room', type: 'other', floor: 1 },
      ],
      invites: [],
      floors: 1,
    });

    if (household._id) {
      const updatedHousehold = await householdRepo.addRoom(
        household._id.toString(),
        { _id: new ObjectId(), name: 'Living Room', type: 'living', floor: 1 },
      );
      expect(updatedHousehold?.rooms).toHaveLength(2);
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
        { _id: new ObjectId(), name: 'Default Room', type: 'other', floor: 1 },
      ],
      invites: [],
      floors: 1,
    });

    let updatedHousehold;
    if (household._id) {
      updatedHousehold = await householdRepo.addRoom(household._id.toString(), {
        _id: new ObjectId(),
        name: 'Living Room',
        type: 'living',
        floor: 1,
      });
    }

    const roomId = updatedHousehold?.rooms
      .find((room) => room.name === 'Living Room')
      ?._id?.toString();
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
        { _id: new ObjectId(), name: 'Default Room', type: 'other', floor: 1 },
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
        { _id: new ObjectId(), name: 'Default Room', type: 'other', floor: 1 },
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
});
