import { Response } from 'express';
import { z } from 'zod';
import { HouseholdRoom } from './schemas/household';

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
    console.log(_);

    res.status(400).send({ error: 'Invalid Request' });
    return undefined;
  }
}

/**
 * Try's to run a controller, and sends a 500 response if it fails.
 * @param res - The response object
 * @param controller - the controller to run
 * @param customErrorHandling - A function to add custom error handling. It
 * returns a true if the error was handled, and false otherwise. This function
 * will be called before the default error handling.
 */
export function tryAPIController(
  res: Response,
  controller: () => Promise<void>,
  customErrorHandling?: (err: unknown) => boolean,
) {
  const handleError = (err: unknown) => {
    if (customErrorHandling && customErrorHandling(err)) {
      return;
    }
    console.log('err caught in tryAPIController');
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  };
  try {
    controller().catch(handleError);
  } catch (e) {
    handleError(e);
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

export function validateRooms(rooms: HouseholdRoom[]): boolean {
  /**
   * Validates if a list of rooms forms a correct grid structure
   * @param rooms List of household rooms to validate
   * @returns An object with validation result and any error messages
   */
  function validateRoomGrid(rooms: HouseholdRoom[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Skip validation if there are no rooms
    if (rooms.length === 0) {
      return { valid: true, errors: [] };
    }

    // Create a map of room IDs to rooms for easy lookup
    const roomMap = new Map(rooms.map((room) => [room.id, room]));

    // Check for duplicate room IDs
    if (roomMap.size !== rooms.length) {
      errors.push('Duplicate room IDs detected');
    }

    // Validate all room connections
    for (const room of rooms) {
      const { id, connectedRooms } = room;

      // Check that connected rooms exist
      for (const [direction, connectedId] of Object.entries(connectedRooms)) {
        if (connectedId) {
          // Check if the connected room exists
          if (!roomMap.has(connectedId)) {
            errors.push(
              `Room ${id} is connected to non-existent room ${connectedId} on ${direction}`,
            );
            continue;
          }

          // Check for bidirectional consistency
          const connectedRoom = roomMap.get(connectedId)!;
          const oppositeDirection = getOppositeDirection(
            direction as keyof typeof connectedRooms,
          );

          if (connectedRoom.connectedRooms[oppositeDirection] !== id) {
            errors.push(
              `Inconsistent connection: Room ${id} connects to ${connectedId} on ${direction}, ` +
                `but room ${connectedId} doesn't connect back on ${oppositeDirection}`,
            );
          }

          // check they are on the same floor
          if (room.floor !== connectedRoom.floor) {
            errors.push(
              `Rooms ${id} and ${connectedId} are on different floors`,
            );
          }
        }
      }
    }

    // Validate grid structure (no overlaps or gaps)
    validateGridStructure(rooms, roomMap, errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Returns the opposite direction for bidirectional validation
   */
  function getOppositeDirection(
    direction: keyof HouseholdRoom['connectedRooms'],
  ): keyof HouseholdRoom['connectedRooms'] {
    switch (direction) {
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
    }
  }

  /**
   * Validates the overall grid structure to ensure rooms form a proper grid
   * with no overlaps or disconnected sections
   */
  function validateGridStructure(
    rooms: HouseholdRoom[],
    roomMap: Map<string, HouseholdRoom>,
    errors: string[],
  ): void {
    // Check if the grid forms a connected component
    if (rooms.length === 0) return;

    // Use BFS to check connectivity
    const visited = new Set<string>();
    const queue: string[] = [rooms[0].id];
    visited.add(rooms[0].id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentRoom = roomMap.get(currentId)!;

      // Add all connected rooms to the queue
      for (const connectedId of Object.values(currentRoom.connectedRooms)) {
        if (connectedId && !visited.has(connectedId)) {
          visited.add(connectedId);
          queue.push(connectedId);
        }
      }
    }

    // Check if all rooms are connected
    if (visited.size !== rooms.length) {
      errors.push(
        `Grid is not fully connected. Only ${visited.size} of ${rooms.length} rooms are connected.`,
      );
    }

    // Check for grid consistency (each room's connections should form a proper grid)
    const roomPositions = new Map<string, { x: number; y: number }>();

    // Assign relative positions starting from an arbitrary room
    assignGridPositions(
      rooms[0].id,
      0,
      0,
      roomMap,
      roomPositions,
      new Set<string>(),
    );

    // Check for overlapping positions
    const positionMap = new Map<string, string>();
    for (const [roomId, position] of roomPositions.entries()) {
      const posKey = `${position.x},${position.y}`;
      if (positionMap.has(posKey)) {
        errors.push(
          `Rooms ${roomId} and ${positionMap.get(posKey)} overlap at position (${position.x}, ${position.y})`,
        );
      } else {
        positionMap.set(posKey, roomId);
      }
    }

    // Check for non-grid arrangements (rooms not aligned in a grid)
    validateGridAlignment(roomPositions, errors);
  }

  /**
   * Recursively assigns x,y positions to rooms based on their connections
   */
  function assignGridPositions(
    roomId: string,
    x: number,
    y: number,
    roomMap: Map<string, HouseholdRoom>,
    positions: Map<string, { x: number; y: number }>,
    visited: Set<string>,
  ): void {
    // Mark current room as visited and assign position
    visited.add(roomId);
    positions.set(roomId, { x, y });

    const room = roomMap.get(roomId)!;

    // Process each direction
    if (room.connectedRooms.right && !visited.has(room.connectedRooms.right)) {
      assignGridPositions(
        room.connectedRooms.right,
        x + 1,
        y,
        roomMap,
        positions,
        visited,
      );
    }

    if (room.connectedRooms.left && !visited.has(room.connectedRooms.left)) {
      assignGridPositions(
        room.connectedRooms.left,
        x - 1,
        y,
        roomMap,
        positions,
        visited,
      );
    }

    if (room.connectedRooms.top && !visited.has(room.connectedRooms.top)) {
      assignGridPositions(
        room.connectedRooms.top,
        x,
        y - 1,
        roomMap,
        positions,
        visited,
      );
    }

    if (
      room.connectedRooms.bottom &&
      !visited.has(room.connectedRooms.bottom)
    ) {
      assignGridPositions(
        room.connectedRooms.bottom,
        x,
        y + 1,
        roomMap,
        positions,
        visited,
      );
    }
  }

  /**
   * Validates that rooms are aligned in a proper grid formation
   */
  function validateGridAlignment(
    positions: Map<string, { x: number; y: number }>,
    errors: string[],
  ): void {
    // Extract all unique x and y coordinates
    const xCoords = new Set<number>();
    const yCoords = new Set<number>();

    for (const pos of positions.values()) {
      xCoords.add(pos.x);
      yCoords.add(pos.y);
    }

    const xValues = Array.from(xCoords).sort((a, b) => a - b);
    const yValues = Array.from(yCoords).sort((a, b) => a - b);

    // Check for gaps in the grid
    for (let i = 1; i < xValues.length; i++) {
      if (xValues[i] - xValues[i - 1] > 1) {
        errors.push(
          `Gap detected in x-axis between positions ${xValues[i - 1]} and ${xValues[i]}`,
        );
      }
    }

    for (let i = 1; i < yValues.length; i++) {
      if (yValues[i] - yValues[i - 1] > 1) {
        errors.push(
          `Gap detected in y-axis between positions ${yValues[i - 1]} and ${yValues[i]}`,
        );
      }
    }
  }

  const result = validateRoomGrid(rooms);

  if (!result.valid) {
    console.log('invalid rooms:', result.errors);
  }
  return result.valid;
}
