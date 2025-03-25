import 'package:flutter/material.dart';

class ConfigureRoomScreen extends StatefulWidget {
  //final int lowestIndex;
  final int floorCount;
  final int finalOffset;

  const ConfigureRoomScreen({
    super.key,
    // required this.lowestIndex,
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

  List<String> calculateFloorNames(int finalOffset, int floorCount) {
    List<String> floorNames = [];
    print("final offset: $finalOffset");
    print("floor count:$floorCount");
    for (int i = 0; i < floorCount; i++) {
      int floorNumber = finalOffset + i;

      if (floorNumber == 0) {
        floorNames.add("G"); // Ground floor
      } else if (floorNumber > 0) {
        floorNames.add("L$floorNumber"); // Above ground (L1, L2, ...)
      } else {
        floorNames.add("B${-floorNumber}"); // Below ground (B1, B2, ...)
      }
    }

    return floorNames;
  }

  List<Map<String, dynamic>> attachedBoxes = [
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
  ];

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
      builder: (context) {
        return AlertDialog(
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
        );
      },
    );
  }

  void _showEditRoomDialog(int index) {
    TextEditingController roomNameController =
        TextEditingController(text: attachedBoxes[index]["roomName"]);
    String roomType = attachedBoxes[index]["roomType"];
    List<String> roomTypes = [
      "Kitchen",
      "Living Room",
      "Bedroom",
      "Bathroom",
      "Study Room"
    ];

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
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
                  attachedBoxes[index]["roomName"] = roomNameController.text;
                  attachedBoxes[index]["roomType"] = roomType;
                });
                Navigator.pop(context);
              },
              child: const Text("Save Changes"),
            ),
          ],
        );
      },
    );
  }

  void _addBox(double dx, double dy, String connectingSide, String roomName,
      String roomType) {
    setState(() {
      for (var box in attachedBoxes) {
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

      for (var box in attachedBoxes) {
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

      attachedBoxes.add({
        "dx": dx,
        "dy": dy,
        "roomName": roomName,
        "roomType": roomType,
        "connections": newConnections,
      });
    });
  }

  bool _isSidebarOpen = false;

  Widget _buildSidebar() {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: _isSidebarOpen ? 100 : 0,
      color: Colors.blueGrey[900],
      child: _isSidebarOpen
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () {
                    setState(() {
                      _isSidebarOpen = false;
                    });
                  },
                ),
                for (String floor in calculateFloorNames(
                    widget.finalOffset, widget.floorCount))
                  ListTile(
                    title: Text(
                      floor,
                      style: const TextStyle(color: Colors.white),
                    ),
                    onTap: () {
                      // Handle floor selection
                    },
                  ),
              ],
            )
          : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configure Room'),
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
          _buildSidebar(),
          Expanded(
            child: GestureDetector(
              onPanUpdate: (details) {
                setState(() {
                  _x += details.delta.dx;
                  _y += details.delta.dy;
                });
              },
              child: Stack(
                children: attachedBoxes.map((box) {
                  return Positioned(
                    left: _x + box["dx"],
                    top: _y + box["dy"],
                    child: _buildBox(
                        box["dx"],
                        box["dy"],
                        box["roomName"],
                        box["roomType"],
                        box["connections"],
                        attachedBoxes.indexOf(box)),
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBox(double dx, double dy, String roomName, String roomType,
      Map<String, bool> connections, int index) {
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
          // Edit (Pen) Icon
          Positioned(
            top: 5,
            right: 5,
            child: GestureDetector(
              onTap: () => _showEditRoomDialog(index),
              child: const Icon(Icons.edit, size: 20, color: Colors.blue),
            ),
          ),
          if (!connections["top"]!)
            _buildAddButton(const Alignment(0.0, -1.1), dx,
                dy - boxHeight - spacing, "top"),
          if (!connections["bottom"]!)
            _buildAddButton(const Alignment(0.0, 1.1), dx,
                dy + boxHeight + spacing, "bottom"),
          if (!connections["left"]!)
            _buildAddButton(const Alignment(-1.1, 0.0), dx - boxWidth - spacing,
                dy, "left"),
          if (!connections["right"]!)
            _buildAddButton(const Alignment(1.1, 0.0), dx + boxWidth + spacing,
                dy, "right"),
        ],
      ),
    );
  }

  Widget _buildAddButton(
      Alignment alignment, double newDx, double newDy, String connectingSide) {
    return Align(
      alignment: alignment,
      child: InkWell(
        onTap: () => _showAddRoomDialog(newDx, newDy, connectingSide),
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
