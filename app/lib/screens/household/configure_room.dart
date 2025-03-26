import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smartify/dashboard_screen.dart';
import 'dart:math' show Random;
import 'package:smartify/services/auth.dart';
import 'package:smartify/services/household.dart'; // Import HouseholdService, HouseholdRoom, and RoomConnections

class ConfigureRoomScreen extends StatefulWidget {
  final int floorCount;
  final int finalOffset;
  final String householdName;

  const ConfigureRoomScreen({
    super.key,
    required this.floorCount,
    required this.finalOffset,
    required this.householdName,
  });

  @override
  _ConfigureRoomScreenState createState() => _ConfigureRoomScreenState();
}

class _ConfigureRoomScreenState extends State<ConfigureRoomScreen> {
  double _x = 100;
  double _y = 100;
  final double boxWidth = 200.0;
  final double boxHeight = 150.0;
  final double spacing = 0.5;

  int _selectedFloorIndex = 0;
  late Map<int, List<HouseholdRoom>> floorRooms;
  bool _isSidebarOpen = false;
  bool _isLoading = false; // Track loading state
  HouseholdService? _householdService; // HouseholdService instance

  @override
  void initState() {
    super.initState();
    floorRooms = {
      for (int i = 0; i < widget.floorCount; i++)
        i: [
          HouseholdRoom(
            id: 'room_${i}_0',
            name: "Main Room",
            type: "living",
            floor: i,
            connectedRooms: const RoomConnections(), // Ensure this uses the imported RoomConnections from household.dart
          ),
        ]
    };
    _initializeHouseholdService(); // Initialize HouseholdService
  }

  Future<void> _initializeHouseholdService() async {
    setState(() => _isLoading = true);
    _householdService = await HouseholdService.create();
    setState(() => _isLoading = false);
  }

  List<String> calculateFloorNames(int finalOffset, int floorCount) {
    List<String> floorNames = [];
    for (int i = 0; i < floorCount; i++) {
      int floorNumber = finalOffset + i;
      if (floorNumber == 0) {
        floorNames.add("G");
      } else if (floorNumber > 0) {
        floorNames.add("L$floorNumber");
      } else {
        floorNames.add("B${-floorNumber}");
      }
    }
    return floorNames;
  }

void _showAddRoomDialog(String connectingRoomId, String connectingSide) {
  String roomName = "";
  String roomType = "kitchen"; // Default to a valid backend value
  List<String> roomTypes = [
    "living",
    "kitchen",
    "bathroom",
    "bedroom",
    "other"
  ];

  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text("Add Room"),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            decoration: InputDecoration(
              labelText: "Room Name",
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onChanged: (value) => roomName = value,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            decoration: InputDecoration(
              labelText: "Type",
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            value: roomType,
            items: roomTypes.map((type) {
              return DropdownMenuItem(value: type, child: Text(type));
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                roomType = value;
              }
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text("Cancel"),
        ),
        ElevatedButton(
          onPressed: () {
            if (roomName.isNotEmpty) {
              _addRoom(connectingRoomId, connectingSide, roomName, roomType);
              Navigator.pop(context);
            }
          },
          child: const Text("Add Room"),
        ),
      ],
    ),
  );
}

void _showEditRoomDialog(int index) {
  TextEditingController roomNameController =
      TextEditingController(text: floorRooms[_selectedFloorIndex]![index].name);
  String roomType = floorRooms[_selectedFloorIndex]![index].type;
  List<String> roomTypes = [
    "living",
    "kitchen",
    "bathroom",
    "bedroom",
    "other"
  ];

  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text("Change Room Details"),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: roomNameController,
            decoration: InputDecoration(
              labelText: "Room Name",
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            decoration: InputDecoration(
              labelText: "Type",
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            value: roomType,
            items: roomTypes.map((type) {
              return DropdownMenuItem(value: type, child: Text(type));
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                roomType = value;
              }
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text("Cancel"),
        ),
        ElevatedButton(
          onPressed: () {
            setState(() {
              floorRooms[_selectedFloorIndex]![index] = HouseholdRoom(
                id: floorRooms[_selectedFloorIndex]![index].id,
                name: roomNameController.text,
                type: roomType,
                floor: floorRooms[_selectedFloorIndex]![index].floor,
                connectedRooms: floorRooms[_selectedFloorIndex]![index].connectedRooms,
              );
            });
            Navigator.pop(context);
          },
          child: const Text("Save Changes"),
        ),
      ],
    ),
  );
}




  void _addRoom(String connectingRoomId, String connectingSide, String roomName, String roomType) {
    setState(() {
      final currentFloorRooms = floorRooms[_selectedFloorIndex]!;
      final newRoomId = 'room_${_selectedFloorIndex}_${currentFloorRooms.length}';

      final connectingRoomIndex = currentFloorRooms.indexWhere((r) => r.id == connectingRoomId);
      if (connectingRoomIndex != -1) {
        final connectingRoom = currentFloorRooms[connectingRoomIndex];
        RoomConnections updatedConnections;
        switch (connectingSide) {
          case "top":
            updatedConnections = RoomConnections(
              top: newRoomId,
              bottom: connectingRoom.connectedRooms.bottom,
              left: connectingRoom.connectedRooms.left,
              right: connectingRoom.connectedRooms.right,
            );
            break;
          case "bottom":
            updatedConnections = RoomConnections(
              top: connectingRoom.connectedRooms.top,
              bottom: newRoomId,
              left: connectingRoom.connectedRooms.left,
              right: connectingRoom.connectedRooms.right,
            );
            break;
          case "left":
            updatedConnections = RoomConnections(
              top: connectingRoom.connectedRooms.top,
              bottom: connectingRoom.connectedRooms.bottom,
              left: newRoomId,
              right: connectingRoom.connectedRooms.right,
            );
            break;
          case "right":
            updatedConnections = RoomConnections(
              top: connectingRoom.connectedRooms.top,
              bottom: connectingRoom.connectedRooms.bottom,
              left: connectingRoom.connectedRooms.left,
              right: newRoomId,
            );
            break;
          default:
            updatedConnections = connectingRoom.connectedRooms;
        }
        currentFloorRooms[connectingRoomIndex] = HouseholdRoom(
          id: connectingRoom.id,
          name: connectingRoom.name,
          type: connectingRoom.type,
          floor: connectingRoom.floor,
          connectedRooms: updatedConnections,
        );
      }

      RoomConnections newRoomConnections;
      switch (connectingSide) {
        case "top":
          newRoomConnections = RoomConnections(bottom: connectingRoomId);
          break;
        case "bottom":
          newRoomConnections = RoomConnections(top: connectingRoomId);
          break;
        case "left":
          newRoomConnections = RoomConnections(right: connectingRoomId);
          break;
        case "right":
          newRoomConnections = RoomConnections(left: connectingRoomId);
          break;
        default:
          newRoomConnections = const RoomConnections();
      }

      currentFloorRooms.add(HouseholdRoom(
        id: newRoomId,
        name: roomName,
        type: roomType,
        floor: _selectedFloorIndex,
        connectedRooms: newRoomConnections,
      ));
    });
  }

  Map<String, double> _calculateRoomPosition(HouseholdRoom room, List<HouseholdRoom> rooms) {
    if (room.name == "Main Room") {
      return {"dx": 0.0, "dy": 0.0};
    }

    for (var otherRoom in rooms) {
      if (otherRoom.connectedRooms.top == room.id) {
        final parentPos = _calculateRoomPosition(otherRoom, rooms);
        return {
          "dx": parentPos["dx"]!,
          "dy": parentPos["dy"]! - boxHeight - spacing,
        };
      } else if (otherRoom.connectedRooms.bottom == room.id) {
        final parentPos = _calculateRoomPosition(otherRoom, rooms);
        return {
          "dx": parentPos["dx"]!,
          "dy": parentPos["dy"]! + boxHeight + spacing,
        };
      } else if (otherRoom.connectedRooms.left == room.id) {
        final parentPos = _calculateRoomPosition(otherRoom, rooms);
        return {
          "dx": parentPos["dx"]! - boxWidth - spacing,
          "dy": parentPos["dy"]!,
        };
      } else if (otherRoom.connectedRooms.right == room.id) {
        final parentPos = _calculateRoomPosition(otherRoom, rooms);
        return {
          "dx": parentPos["dx"]! + boxWidth + spacing,
          "dy": parentPos["dy"]!,
        };
      }
    }

    return {"dx": 0.0, "dy": 0.0};
  }

  Future<void> _confirmAndCreateHousehold() async {
    if (_householdService == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Service not initialized")),
      );
      return;
    }

    setState(() => _isLoading = true);

    final rooms = floorRooms.values.expand((r) => r).toList();
    final household = await _householdService!.createHousehold(
      widget.householdName,
      widget.floorCount,
      rooms,
      widget.finalOffset,
    );

    setState(() => _isLoading = false);

    if (household != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Household '${household.name}' created successfully!")),
      );
      final authService = Provider.of<AuthService>(context, listen: false);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => DashboardScreen(authService: authService),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to create household")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final floorNames = calculateFloorNames(widget.finalOffset, widget.floorCount);
    final authService = Provider.of<AuthService>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Configure Room - ${floorNames[_selectedFloorIndex]}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () {
              setState(() {
                _isSidebarOpen = !_isSidebarOpen;
              });
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          Row(
            children: [
              Sidebar(
                isOpen: _isSidebarOpen,
                floorNames: floorNames,
                selectedFloorIndex: _selectedFloorIndex,
                onClose: () {
                  setState(() {
                    _isSidebarOpen = false;
                  });
                },
                onFloorSelected: (index) {
                  setState(() {
                    _selectedFloorIndex = index;
                    _x = 100;
                    _y = 100;
                  });
                },
              ),
              Expanded(
                child: GestureDetector(
                  onPanUpdate: (details) {
                    setState(() {
                      _x += details.delta.dx;
                      _y += details.delta.dy;
                    });
                  },
                  child: Stack(
                    children: floorRooms[_selectedFloorIndex]!.map((room) {
                      final pos = _calculateRoomPosition(room, floorRooms[_selectedFloorIndex]!);
                      return Positioned(
                        left: _x + pos["dx"]!,
                        top: _y + pos["dy"]!,
                        child: RoomBox(
                          room: room,
                          index: floorRooms[_selectedFloorIndex]!.indexOf(room),
                          onEdit: () => _showEditRoomDialog(floorRooms[_selectedFloorIndex]!.indexOf(room)),
                          onAddRoom: _showAddRoomDialog,
                          boxWidth: boxWidth,
                          boxHeight: boxHeight,
                          spacing: spacing,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ],
          ),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton(
          onPressed: _isLoading ? null : _confirmAndCreateHousehold,
          child: const Text('Confirm'),
        ),
      ),
    );
  }
}

// Sidebar Widget
class Sidebar extends StatelessWidget {
  final bool isOpen;
  final List<String> floorNames;
  final int selectedFloorIndex;
  final VoidCallback onClose;
  final Function(int) onFloorSelected;

  const Sidebar({
    super.key,
    required this.isOpen,
    required this.floorNames,
    required this.selectedFloorIndex,
    required this.onClose,
    required this.onFloorSelected,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: isOpen ? 100 : 0,
      color: Colors.blueGrey[900],
      child: isOpen
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: onClose,
                ),
                for (int i = 0; i < floorNames.length; i++)
                  ListTile(
                    title: Text(
                      floorNames[i],
                      style: TextStyle(
                        color: selectedFloorIndex == i ? Colors.blue : Colors.white,
                        fontWeight: selectedFloorIndex == i ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    onTap: () => onFloorSelected(i),
                  ),
              ],
            )
          : null,
    );
  }
}

// RoomBox Widget
class RoomBox extends StatelessWidget {
  final HouseholdRoom room;
  final int index;
  final VoidCallback onEdit;
  final Function(String, String) onAddRoom;
  final double boxWidth;
  final double boxHeight;
  final double spacing;

  const RoomBox({
    super.key,
    required this.room,
    required this.index,
    required this.onEdit,
    required this.onAddRoom,
    required this.boxWidth,
    required this.boxHeight,
    required this.spacing,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 180,
      height: 130,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Align(
            alignment: Alignment.center,
            child: Container(
              width: boxWidth,
              height: boxHeight,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black, width: 0.5),
                borderRadius: BorderRadius.circular(8),
                color: Colors.transparent,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(room.name,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(room.type, style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
          Positioned(
            top: 5,
            right: 5,
            child: GestureDetector(
              onTap: onEdit,
              child: const Icon(Icons.edit, size: 20, color: Colors.blue),
            ),
          ),
          if (room.connectedRooms.top == null)
            AddButton(
              alignment: const Alignment(0.0, -1.1),
              connectingRoomId: room.id,
              connectingSide: "top",
              onAddRoom: onAddRoom,
            ),
          if (room.connectedRooms.bottom == null)
            AddButton(
              alignment: const Alignment(0.0, 1.1),
              connectingRoomId: room.id,
              connectingSide: "bottom",
              onAddRoom: onAddRoom,
            ),
          if (room.connectedRooms.left == null)
            AddButton(
              alignment: const Alignment(-1.1, 0.0),
              connectingRoomId: room.id,
              connectingSide: "left",
              onAddRoom: onAddRoom,
            ),
          if (room.connectedRooms.right == null)
            AddButton(
              alignment: const Alignment(1.1, 0.0),
              connectingRoomId: room.id,
              connectingSide: "right",
              onAddRoom: onAddRoom,
            ),
        ],
      ),
    );
  }
}

// AddButton Widget
class AddButton extends StatelessWidget {
  final Alignment alignment;
  final String connectingRoomId;
  final String connectingSide;
  final Function(String, String) onAddRoom;

  const AddButton({
    super.key,
    required this.alignment,
    required this.connectingRoomId,
    required this.connectingSide,
    required this.onAddRoom,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: InkWell(
        onTap: () => onAddRoom(connectingRoomId, connectingSide),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: Colors.grey[400],
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.add, color: Colors.black, size: 24),
        ),
      ),
    );
  }
}

// Removed duplicate HouseholdRoom class. Use the one from household.dart.

// Removed duplicate RoomConnections class. Use the one from household.dart.

// Placeholder classes for Household (adjust as per your actual implementation)
class Household {
  final String id;
  final String name;
  final String ownerId;
  final int floors;
  final int? floorsOffset;
  final List<HouseholdRoom> rooms;
  final List<HouseholdMember> members;
  final List<HouseholdInvite> invites;

  Household({
    required this.id,
    required this.name,
    required this.ownerId,
    required this.floors,
    this.floorsOffset,
    required this.rooms,
    required this.members,
    required this.invites,
  });
}

class HouseholdMember {
  final String id;
  final String name;
  final String role;
  final HouseholdPermissions permissions;

  HouseholdMember({
    required this.id,
    required this.name,
    required this.role,
    required this.permissions,
  });
}

class HouseholdPermissions {
  final bool appliances;
  final bool health;
  final bool security;
  final bool energy;

  HouseholdPermissions({
    required this.appliances,
    required this.health,
    required this.security,
    required this.energy,
  });
}

class HouseholdInvite {
  final String inviteId;
  final String userId;
  final String householdName;
  final String senderName;

  HouseholdInvite({
    required this.inviteId,
    required this.userId,
    required this.householdName,
    required this.senderName,
  });
}
