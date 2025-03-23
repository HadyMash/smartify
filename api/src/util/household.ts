import { HouseholdRoom } from '../schemas/household';

/**
 * Validates a room configuration is valid and doesn't contain any errors
 * or things which don't make sense like overlaps, gaps, and connections across
 * floors
 *
 * @param rooms - List of rooms to validate
 * @returns A boolean indicating if the rooms are valid
 */
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

    // Map of floor number to rooms on that floor
    const floorToRooms = new Map<number, HouseholdRoom[]>();

    // Group rooms by floor
    for (const room of rooms) {
      if (!floorToRooms.has(room.floor)) {
        floorToRooms.set(room.floor, []);
      }
      floorToRooms.get(room.floor)!.push(room);
    }

    // Validate connectivity per floor
    for (const [floor, floorRooms] of floorToRooms.entries()) {
      if (floorRooms.length === 0) continue;

      // Skip connectivity check if there's only one room on this floor
      if (floorRooms.length === 1) continue;

      // Use BFS to check connectivity within this floor
      const visited = new Set<string>();
      const queue: string[] = [floorRooms[0].id];
      visited.add(floorRooms[0].id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentRoom = roomMap.get(currentId)!;

        // Add all connected rooms to the queue
        for (const connectedId of Object.values(currentRoom.connectedRooms)) {
          if (connectedId && !visited.has(connectedId)) {
            const connectedRoom = roomMap.get(connectedId)!;
            // Only add connected rooms on the same floor
            if (connectedRoom.floor === floor) {
              visited.add(connectedId);
              queue.push(connectedId);
            }
          }
        }
      }

      // Check if all rooms on this floor are connected
      if (visited.size !== floorRooms.length) {
        errors.push(
          `Floor ${floor} is not fully connected. Only ${visited.size} of ${floorRooms.length} rooms are connected.`,
        );
      }

      // For each floor, validate grid layout
      validateFloorGridLayout(floorRooms, roomMap, floor, errors);
    }
  }

  /**
   * Validates the grid layout for a specific floor
   */
  function validateFloorGridLayout(
    floorRooms: HouseholdRoom[],
    roomMap: Map<string, HouseholdRoom>,
    floor: number,
    errors: string[],
  ): void {
    if (floorRooms.length <= 1) return; // No need to validate single room

    // Check for grid consistency (each room's connections should form a proper grid)
    const roomPositions = new Map<string, { x: number; y: number }>();

    // Assign relative positions starting from an arbitrary room
    assignGridPositions(
      floorRooms[0].id,
      0,
      0,
      roomMap,
      roomPositions,
      new Set<string>(),
    );

    // Check for overlapping positions
    const positionMap = new Map<string, string>();
    for (const [roomId, position] of roomPositions.entries()) {
      const room = roomMap.get(roomId)!;
      // Only check rooms on the current floor
      if (room.floor !== floor) continue;

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
