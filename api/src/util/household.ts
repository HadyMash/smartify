import { HouseholdRoom } from '../schemas/household';
import { log } from './log';

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

    // Group rooms by floor
    const floorRooms = new Map<number, HouseholdRoom[]>();
    for (const room of rooms) {
      if (!floorRooms.has(room.floor)) {
        floorRooms.set(room.floor, []);
      }
      floorRooms.get(room.floor)!.push(room);
    }

    // Check connectivity within each floor separately
    for (const [floor, roomsOnFloor] of floorRooms.entries()) {
      if (roomsOnFloor.length === 0) continue;

      // Use BFS to check connectivity within this floor
      const visited = new Set<string>();
      const queue: string[] = [roomsOnFloor[0].id];
      visited.add(roomsOnFloor[0].id);

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

      // Check if all rooms on this floor are connected
      if (visited.size !== roomsOnFloor.length) {
        errors.push(
          `Grid on floor ${floor} is not fully connected. Only ${visited.size} of ${roomsOnFloor.length} rooms are connected.`,
        );
      }
    }

    for (const [floor, roomsOnFloor] of floorRooms.entries()) {
      if (roomsOnFloor.length === 0) continue;

      const roomPositions = new Map<string, { x: number; y: number }>();

      // Assign relative positions starting from the first room on this floor
      assignGridPositions(
        roomsOnFloor[0].id,
        0,
        0,
        roomMap,
        roomPositions,
        new Set<string>(),
      );

      // Check for overlapping positions on this floor
      const positionMap = new Map<string, string>();
      for (const [roomId, position] of roomPositions.entries()) {
        const posKey = `${position.x},${position.y}`;
        if (positionMap.has(posKey)) {
          errors.push(
            `Rooms ${roomId} and ${positionMap.get(posKey)} overlap at position (${position.x}, ${position.y}) on floor ${floor}`,
          );
        } else {
          positionMap.set(posKey, roomId);
        }
      }

      // Check for non-grid arrangements (rooms not aligned in a grid) on this floor
      validateGridAlignment(roomPositions, errors, floor);
    }
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
    floor?: number,
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
        const floorInfo = floor !== undefined ? ` on floor ${floor}` : '';
        errors.push(
          `Gap detected in x-axis between positions ${xValues[i - 1]} and ${xValues[i]}${floorInfo}`,
        );
      }
    }

    for (let i = 1; i < yValues.length; i++) {
      if (yValues[i] - yValues[i - 1] > 1) {
        const floorInfo = floor !== undefined ? ` on floor ${floor}` : '';
        errors.push(
          `Gap detected in y-axis between positions ${yValues[i - 1]} and ${yValues[i]}${floorInfo}`,
        );
      }
    }
  }

  const result = validateRoomGrid(rooms);

  if (!result.valid) {
    log.debug('invalid rooms:', result.errors);
  }
  return result.valid;
}
