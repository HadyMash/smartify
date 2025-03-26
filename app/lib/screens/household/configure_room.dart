import 'package:flutter/material.dart';

class ConfigureRoomScreen extends StatefulWidget {
  final int floorCount;
  final int finalOffset;

  const ConfigureRoomScreen({
    super.key,
    required this.floorCount,
    required this.finalOffset,
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
  late Map<int, List<Map<String, dynamic>>> floorRooms;
  bool _isSidebarOpen = false;

  @override
  void initState() {
    super.initState();
    floorRooms = {
      for (int i = 0; i < widget.floorCount; i++)
        i: [
          {
            "dx": 0.0,
            "dy": 0.0,
            "roomName": "Main Room",
            "roomType": "Living Room",
            "connections": {
              "top": false,
              "bottom": false,
              "left": false,
              "right": false
            }
          }
        ]
    };
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

  void _showAddRoomDialog(double dx, double dy, String connectingSide) {
    String roomName = "";
    String roomType = "Kitchen";
    List<String> roomTypes = [
      "Kitchen",
      "Living Room",
      "Bedroom",
      "Bathroom",
      "Study Room"
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
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
              onChanged: (value) => roomName = value,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(
                labelText: "Type",
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8)),
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
                _addBox(dx, dy, connectingSide, roomName, roomType);
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
        TextEditingController(text: floorRooms[_selectedFloorIndex]![index]["roomName"]);
    String roomType = floorRooms[_selectedFloorIndex]![index]["roomType"];
    List<String> roomTypes = [
      "Kitchen",
      "Living Room",
      "Bedroom",
      "Bathroom",
      "Study Room"
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
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(
                labelText: "Type",
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8)),
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
                floorRooms[_selectedFloorIndex]![index]["roomName"] = roomNameController.text;
                floorRooms[_selectedFloorIndex]![index]["roomType"] = roomType;
              });
              Navigator.pop(context);
            },
            child: const Text("Save Changes"),
          ),
        ],
      ),
    );
  }

  void _addBox(double dx, double dy, String connectingSide, String roomName,
      String roomType) {
    setState(() {
      var currentFloorRooms = floorRooms[_selectedFloorIndex]!;

      for (var box in currentFloorRooms) {
        if (box["dx"] == dx && box["dy"] == dy) {
          box["connections"][connectingSide] = true;
        }
      }

      Map<String, bool> newConnections = {
        "top": connectingSide == "bottom",
        "bottom": connectingSide == "top",
        "left": connectingSide == "right",
        "right": connectingSide == "left",
      };

      for (var box in currentFloorRooms) {
        if (box["dx"] == dx && box["dy"] == dy - boxHeight - spacing) {
          newConnections["top"] = true;
          box["connections"]["bottom"] = true;
        } else if (box["dx"] == dx && box["dy"] == dy + boxHeight + spacing) {
          newConnections["bottom"] = true;
          box["connections"]["top"] = true;
        } else if (box["dx"] == dx - boxWidth - spacing && box["dy"] == dy) {
          newConnections["left"] = true;
          box["connections"]["right"] = true;
        } else if (box["dx"] == dx + boxWidth + spacing && box["dy"] == dy) {
          newConnections["right"] = true;
          box["connections"]["left"] = true;
        }
      }

      currentFloorRooms.add({
        "dx": dx,
        "dy": dy,
        "roomName": roomName,
        "roomType": roomType,
        "connections": newConnections,
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final floorNames = calculateFloorNames(widget.finalOffset, widget.floorCount);

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
      body: Row(
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
                children: floorRooms[_selectedFloorIndex]!.map((box) {
                  return Positioned(
                    left: _x + box["dx"],
                    top: _y + box["dy"],
                    child: RoomBox(
                      dx: box["dx"],
                      dy: box["dy"],
                      roomName: box["roomName"],
                      roomType: box["roomType"],
                      connections: box["connections"],
                      index: floorRooms[_selectedFloorIndex]!.indexOf(box),
                      onEdit: () => _showEditRoomDialog(floorRooms[_selectedFloorIndex]!.indexOf(box)),
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
  final double dx;
  final double dy;
  final String roomName;
  final String roomType;
  final Map<String, bool> connections;
  final int index;
  final VoidCallback onEdit;
  final Function(double, double, String) onAddRoom;
  final double boxWidth;
  final double boxHeight;
  final double spacing;

  const RoomBox({
    super.key,
    required this.dx,
    required this.dy,
    required this.roomName,
    required this.roomType,
    required this.connections,
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
                  Text(roomName,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(roomType, style: const TextStyle(color: Colors.grey)),
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
          if (!connections["top"]!)
            AddButton(
              alignment: const Alignment(0.0, -1.1),
              newDx: dx,
              newDy: dy - boxHeight - spacing,
              connectingSide: "top",
              onAddRoom: onAddRoom,
            ),
          if (!connections["bottom"]!)
            AddButton(
              alignment: const Alignment(0.0, 1.1),
              newDx: dx,
              newDy: dy + boxHeight + spacing,
              connectingSide: "bottom",
              onAddRoom: onAddRoom,
            ),
          if (!connections["left"]!)
            AddButton(
              alignment: const Alignment(-1.1, 0.0),
              newDx: dx - boxWidth - spacing,
              newDy: dy,
              connectingSide: "left",
              onAddRoom: onAddRoom,
            ),
          if (!connections["right"]!)
            AddButton(
              alignment: const Alignment(1.1, 0.0),
              newDx: dx + boxWidth + spacing,
              newDy: dy,
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
  final double newDx;
  final double newDy;
  final String connectingSide;
  final Function(double, double, String) onAddRoom;

  const AddButton({
    super.key,
    required this.alignment,
    required this.newDx,
    required this.newDy,
    required this.connectingSide,
    required this.onAddRoom,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: InkWell(
        onTap: () => onAddRoom(newDx, newDy, connectingSide),
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