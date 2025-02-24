// import 'package:flutter/material.dart';
// import 'package:smartify/widgets/back_button.dart'; // Ensure correct path

// class Room {
//   final String id;
//   final String name;
//   final String type;
//   final Offset position;
//   final Size size;
//   final bool isDefault;

//   Room({
//     required this.id,
//     required this.name,
//     required this.type,
//     required this.position,
//     required this.size,
//     this.isDefault = false,
//   });

//   Room copyWith({
//     String? id,
//     String? name,
//     String? type,
//     Offset? position,
//     Size? size,
//     bool? isDefault,
//   }) {
//     return Room(
//       id: id ?? this.id,
//       name: name ?? this.name,
//       type: type ?? this.type,
//       position: position ?? this.position,
//       size: size ?? this.size,
//       isDefault: isDefault ?? this.isDefault,
//     );
//   }
// }

// class Floor {
//   final String name;
//   final List<Room> rooms;

//   Floor({
//     required this.name,
//     required this.rooms,
//   });
// }

// class ConfigureRoomScreen extends StatefulWidget {
//   final List<String> floors;

//   const ConfigureRoomScreen({
//     super.key,
//     required this.floors,
//   });

//   @override
//   State<ConfigureRoomScreen> createState() => _ConfigureRoomScreenState();
// }

// class _ConfigureRoomScreenState extends State<ConfigureRoomScreen> {
//   late List<Floor> _floors;
//   int _selectedFloorIndex = 0;
//   final List<String> _roomTypes = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Study'];

//   @override
//   void initState() {
//     super.initState();
//     _initializeFloors();
//   }

//   void _initializeFloors() {
//     _floors = widget.floors.map((floorName) {
//       return Floor(
//         name: floorName,
//         rooms: [
//           Room(
//             id: DateTime.now().toString(),
//             name: 'Default Room',
//             type: 'Living Room',
//             position: const Offset(100, 100),
//             size: const Size(200, 150),
//             isDefault: true,
//           ),
//         ],
//       );
//     }).toList();
//   }

//   void _showAddRoomDialog(BuildContext context, Room parentRoom, String direction) {
//     final nameController = TextEditingController();
//     String selectedType = _roomTypes[0];

//     showDialog(
//       context: context,
//       builder: (context) {
//         return StatefulBuilder(
//           builder: (context, setState) => AlertDialog(
//             title: const Text('Add Room'),
//             content: Column(
//               mainAxisSize: MainAxisSize.min,
//               children: [
//                 TextField(
//                   controller: nameController,
//                   decoration: const InputDecoration(labelText: 'Room Name'),
//                 ),
//                 const SizedBox(height: 16),
//                 DropdownButtonFormField<String>(
//                   value: selectedType,
//                   items: _roomTypes.map((type) {
//                     return DropdownMenuItem(
//                       value: type,
//                       child: Text(type),
//                     );
//                   }).toList(),
//                   onChanged: (value) {
//                     setState(() {
//                       selectedType = value!;
//                     });
//                   },
//                   decoration: const InputDecoration(labelText: 'Room Type'),
//                 ),
//               ],
//             ),
//             actions: [
//               TextButton(
//                 onPressed: () => Navigator.pop(context),
//                 child: const Text('Cancel'),
//               ),
//               ElevatedButton(
//                 onPressed: () {
//                   if (nameController.text.isNotEmpty) {
//                     _addRoom(parentRoom, direction, nameController.text, selectedType);
//                     Navigator.pop(context);
//                   }
//                 },
//                 child: const Text('Add'),
//               ),
//             ],
//           ),
//         );
//       },
//     );
//   }

//   void _addRoom(Room parentRoom, String direction, String name, String type) {
//     final parentIndex = _floors[_selectedFloorIndex].rooms.indexOf(parentRoom);
//     if (parentIndex == -1) return;

//     final newPosition = _calculateNewRoomPosition(parentRoom, direction);

//     if (_isPositionOccupied(newPosition)) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text('Cannot place room here! Position occupied.')),
//       );
//       return;
//     }

//     final newRoom = Room(
//       id: DateTime.now().toString(),
//       name: name,
//       type: type,
//       position: newPosition,
//       size: const Size(200, 150),
//     );

//     setState(() {
//       _floors[_selectedFloorIndex].rooms.add(newRoom);
//     });
//   }

//   Offset _calculateNewRoomPosition(Room parentRoom, String direction) {
//     switch (direction) {
//       case 'top':
//         return Offset(parentRoom.position.dx, parentRoom.position.dy - parentRoom.size.height - 20);
//       case 'right':
//         return Offset(parentRoom.position.dx + parentRoom.size.width + 20, parentRoom.position.dy);
//       case 'bottom':
//         return Offset(parentRoom.position.dx, parentRoom.position.dy + parentRoom.size.height + 20);
//       case 'left':
//         return Offset(parentRoom.position.dx - parentRoom.size.width - 20, parentRoom.position.dy);
//       default:
//         return parentRoom.position;
//     }
//   }

//   bool _isPositionOccupied(Offset position) {
//     return _floors[_selectedFloorIndex].rooms.any((room) {
//       return (room.position.dx - position.dx).abs() < room.size.width &&
//              (room.position.dy - position.dy).abs() < room.size.height;
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return Scaffold(
//       body: SafeArea(
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Row(
//               children: [
//                 const CustomBackButton(),
//                 const SizedBox(width: 16),
//                 Text(
//                   'Configure Rooms',
//                   style: textTheme.headlineSmall,
//                 ),
//                 const Spacer(),
//                 DropdownButton<int>(
//                   value: _selectedFloorIndex,
//                   items: List.generate(_floors.length, (index) {
//                     return DropdownMenuItem(
//                       value: index,
//                       child: Text(_floors[index].name),
//                     );
//                   }),
//                   onChanged: (index) {
//                     setState(() {
//                       _selectedFloorIndex = index!;
//                     });
//                   },
//                 ),
//               ],
//             ),
//             const SizedBox(height: 16),
//             Expanded(
//               child: Stack(
//                 children: _floors[_selectedFloorIndex].rooms.map((room) {
//                   return Positioned(
//                     left: room.position.dx,
//                     top: room.position.dy,
//                     child: _RoomWidget(
//                       room: room,
//                       onAddRoom: _showAddRoomDialog,
//                     ),
//                   );
//                 }).toList(),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// class _RoomWidget extends StatelessWidget {
//   final Room room;
//   final Function(BuildContext, Room, String) onAddRoom;

//   const _RoomWidget({
//     required this.room,
//     required this.onAddRoom,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return GestureDetector(
//       onTap: () => onAddRoom(context, room, 'right'),
//       child: Container(
//         width: room.size.width,
//         height: room.size.height,
//         decoration: BoxDecoration(
//           color: Colors.white,
//           border: Border.all(color: Colors.black),
//           borderRadius: BorderRadius.circular(8),
//         ),
//         child: Center(
//           child: Text(room.name),
//         ),
//       ),
//     );
//   }
// }

// import 'package:flutter/material.dart';
// import 'package:smartify/widgets/back_button.dart';

// class Room {
//   final String id;
//   final String name;
//   final String type;
//   final Offset position;
//   final Size size;
//   final bool isDefault;

//   Room({
//     required this.id,
//     required this.name,
//     required this.type,
//     required this.position,
//     required this.size,
//     this.isDefault = false,
//   });

//   Room copyWith({
//     String? id,
//     String? name,
//     String? type,
//     Offset? position,
//     Size? size,
//     bool? isDefault,
//   }) {
//     return Room(
//       id: id ?? this.id,
//       name: name ?? this.name,
//       type: type ?? this.type,
//       position: position ?? this.position,
//       size: size ?? this.size,
//       isDefault: isDefault ?? this.isDefault,
//     );
//   }
// }

// class Floor {
//   final String name;
//   final List<Room> rooms;

//   Floor({
//     required this.name,
//     required this.rooms,
//   });
// }

// class ConfigureRoomScreen extends StatefulWidget {
//   final List<String> floors;

//   const ConfigureRoomScreen({
//     super.key,
//     required this.floors,
//   });

//   @override
//   State<ConfigureRoomScreen> createState() => _ConfigureRoomScreenState();
// }

// class _ConfigureRoomScreenState extends State<ConfigureRoomScreen> {
//   late List<Floor> _floors;
//   int _selectedFloorIndex = 0;
//   double _scale = 1.0;
//   Offset _position = Offset.zero;
//   Offset? _startingFocalPoint;
//   Offset? _previousOffset;
//   double? _previousScale;
//   final _roomTypes = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Study'];

//   @override
//   void initState() {
//     super.initState();
//     _initializeFloors();
//   }

//   void _initializeFloors() {
//     _floors = widget.floors.map((floorName) {
//       return Floor(
//         name: floorName,
//         rooms: [
//           Room(
//             id: DateTime.now().toString(),
//             name: 'Default Room',
//             type: 'Living Room',
//             position: const Offset(100, 100),
//             size: const Size(200, 150),
//             isDefault: true,
//           ),
//         ],
//       );
//     }).toList();
//   }

//   void _showAddRoomDialog(BuildContext context, Room parentRoom, String direction) {
//     final nameController = TextEditingController();
//     String selectedType = _roomTypes[0];

//     showDialog(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: const Text('Add Room'),
//         content: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [
//             TextField(
//               controller: nameController,
//               decoration: const InputDecoration(labelText: 'Room Name'),
//             ),
//             const SizedBox(height: 16),
//             DropdownButtonFormField<String>(
//               value: selectedType,
//               items: _roomTypes.map((type) {
//                 return DropdownMenuItem(
//                   value: type,
//                   child: Text(type),
//                 );
//               }).toList(),
//               onChanged: (value) {
//                 selectedType = value!;
//               },
//               decoration: const InputDecoration(labelText: 'Room Type'),
//             ),
//           ],
//         ),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.pop(context),
//             child: const Text('Cancel'),
//           ),
//           ElevatedButton(
//             onPressed: () {
//               if (nameController.text.isNotEmpty) {
//                 _addRoom(parentRoom, direction, nameController.text, selectedType);
//                 Navigator.pop(context);
//               }
//             },
//             child: const Text('Add'),
//           ),
//         ],
//       ),
//     );
//   }

//   void _addRoom(Room parentRoom, String direction, String name, String type) {
//     final parentIndex = _floors[_selectedFloorIndex].rooms.indexOf(parentRoom);
//     if (parentIndex == -1) return;

//     final newPosition = _calculateNewRoomPosition(parentRoom, direction);
//     final newRoom = Room(
//       id: DateTime.now().toString(),
//       name: name,
//       type: type,
//       position: newPosition,
//       size: const Size(200, 150),
//     );

//     setState(() {
//       _floors[_selectedFloorIndex].rooms.add(newRoom);
//     });
//   }

//   Offset _calculateNewRoomPosition(Room parentRoom, String direction) {
//     switch (direction) {
//       case 'top':
//         return Offset(
//           parentRoom.position.dx,
//           parentRoom.position.dy - parentRoom.size.height - 20,
//         );
//       case 'right':
//         return Offset(
//           parentRoom.position.dx + parentRoom.size.width + 20,
//           parentRoom.position.dy,
//         );
//       case 'bottom':
//         return Offset(
//           parentRoom.position.dx,
//           parentRoom.position.dy + parentRoom.size.height + 20,
//         );
//       case 'left':
//         return Offset(
//           parentRoom.position.dx - parentRoom.size.width - 20,
//           parentRoom.position.dy,
//         );
//       default:
//         return parentRoom.position;
//     }
//   }

//   void _deleteRoom(Room room) {
//     setState(() {
//       _floors[_selectedFloorIndex].rooms.removeWhere((r) => r.id == room.id);
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return Scaffold(
//       body: SafeArea(
//         child: Row(
//           children: [
//             // Main Content
//             Expanded(
//               flex: 3,
//               child: Padding(
//                 padding: const EdgeInsets.all(24.0),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Row(
//                       children: [
//                         const CustomBackButton(),
//                         const SizedBox(width: 16),
//                         Text(
//                           'Configure Rooms',
//                           style: textTheme.displayMedium,
//                         ),
//                       ],
//                     ),
//                     const SizedBox(height: 32),
//                     Expanded(
//                       child: GestureDetector(
//                         onScaleStart: (details) {
//                           _startingFocalPoint = details.focalPoint;
//                           _previousOffset = _position;
//                           _previousScale = _scale;
//                         },
//                         onScaleUpdate: (details) {
//                           setState(() {
//                             if (details.scale != 1.0) {
//                               // Zooming
//                               _scale = (_previousScale! * details.scale)
//                                   .clamp(0.5, 2.0);
//                             } else {
//                               // Panning
//                               final delta = details.focalPoint -
//                                   _startingFocalPoint!;
//                               _position = _previousOffset! + delta;
//                             }
//                           });
//                         },
//                         child: ClipRect(
//                           child: Transform(
//                             transform: Matrix4.identity()
//                               ..translate(_position.dx, _position.dy)
//                               ..scale(_scale),
//                             child: Stack(
//                               children: [
//                                 for (final room in _floors[_selectedFloorIndex].rooms)
//                                   Positioned(
//                                     left: room.position.dx,
//                                     top: room.position.dy,
//                                     child: _RoomWidget(
//                                       room: room,
//                                       onAddRoom: _showAddRoomDialog,
//                                       onDelete: room.isDefault ? null : _deleteRoom,
//                                     ),
//                                   ),
//                               ],
//                             ),
//                           ),
//                         ),
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//             // Floor Selector
//             Container(
//               width: 60,
//               decoration: BoxDecoration(
//                 border: Border(
//                   left: BorderSide(
//                     color: theme.colorScheme.secondary.withOpacity(0.2),
//                   ),
//                 ),
//               ),
//               child: ListView.builder(
//                 itemCount: widget.floors.length,
//                 itemBuilder: (context, index) {
//                   final isSelected = index == _selectedFloorIndex;
//                   return GestureDetector(
//                     onTap: () {
//                       setState(() {
//                         _selectedFloorIndex = index;
//                       });
//                     },
//                     child: Container(
//                       margin: const EdgeInsets.all(8),
//                       padding: const EdgeInsets.all(12),
//                       decoration: BoxDecoration(
//                         color: isSelected
//                             ? theme.colorScheme.secondary
//                             : theme.colorScheme.surface,
//                         borderRadius: BorderRadius.circular(8),
//                       ),
//                       child: Text(
//                         widget.floors[index],
//                         style: textTheme.bodyLarge?.copyWith(
//                           color: isSelected
//                               ? theme.colorScheme.onSecondary
//                               : theme.colorScheme.onSurface,
//                           fontWeight: FontWeight.bold,
//                         ),
//                         textAlign: TextAlign.center,
//                       ),
//                     ),
//                   );
//                 },
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// class _RoomWidget extends StatelessWidget {
//   final Room room;
//   final Function(BuildContext, Room, String) onAddRoom;
//   final Function(Room)? onDelete;

//   const _RoomWidget({
//     required this.room,
//     required this.onAddRoom,
//     this.onDelete,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       width: room.size.width,
//       height: room.size.height,
//       child: Stack(
//         children: [
//           Container(
//             decoration: BoxDecoration(
//               color: Colors.white,
//               border: Border.all(color: Colors.black),
//               borderRadius: BorderRadius.circular(8),
//             ),
//             child: Center(
//               child: Row(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   Icon(
//                     Icons.edit,
//                     size: 20,
//                     color: Colors.grey[600],
//                   ),
//                   if (onDelete != null) ...[
//                     const SizedBox(width: 8),
//                     IconButton(
//                       icon: const Icon(Icons.delete, size: 20),
//                       color: Colors.red,
//                       onPressed: () => onDelete!(room),
//                     ),
//                   ],
//                 ],
//               ),
//             ),
//           ),
//           // Add Room buttons on each side
//           Positioned(
//             top: -20,
//             left: (room.size.width - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'top'),
//             ),
//           ),
//           Positioned(
//             right: -20,
//             top: (room.size.height - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'right'),
//             ),
//           ),
//           Positioned(
//             bottom: -20,
//             left: (room.size.width - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'bottom'),
//             ),
//           ),
//           Positioned(
//             left: -20,
//             top: (room.size.height - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'left'),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }

// class _AddRoomButton extends StatelessWidget {
//   final VoidCallback onTap;

//   const _AddRoomButton({
//     required this.onTap,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return GestureDetector(
//       onTap: onTap,
//       child: Container(
//         width: 40,
//         height: 40,
//         decoration: BoxDecoration(
//           color: Colors.white,
//           border: Border.all(color: Colors.black),
//           shape: BoxShape.circle,
//         ),
//         child: const Icon(Icons.add),
//       ),
//     );
//   }
// }

// import 'package:flutter/material.dart';
// import 'package:smartify/widgets/back_button.dart';

// class Room {
//   final String id;
//   final String name;
//   final String type;
//   final Offset position;
//   final Size size;
//   final bool isDefault;

//   Room({
//     required this.id,
//     required this.name,
//     required this.type,
//     required this.position,
//     required this.size,
//     this.isDefault = false,
//   });

//   Room copyWith({
//     String? id,
//     String? name,
//     String? type,
//     Offset? position,
//     Size? size,
//     bool? isDefault,
//   }) {
//     return Room(
//       id: id ?? this.id,
//       name: name ?? this.name,
//       type: type ?? this.type,
//       position: position ?? this.position,
//       size: size ?? this.size,
//       isDefault: isDefault ?? this.isDefault,
//     );
//   }
// }

// class Floor {
//   final String name;
//   final List<Room> rooms;

//   Floor({
//     required this.name,
//     required this.rooms,
//   });
// }

// class ConfigureRoomScreen extends StatefulWidget {
//   final List<String> floors;

//   const ConfigureRoomScreen({
//     super.key,
//     required this.floors,
//   });

//   @override
//   State<ConfigureRoomScreen> createState() => _ConfigureRoomScreenState();
// }

// class _ConfigureRoomScreenState extends State<ConfigureRoomScreen> {
//   late List<Floor> _floors;
//   int _selectedFloorIndex = 0;
//   double _scale = 1.0;
//   Offset _position = Offset.zero;
//   Offset? _startingFocalPoint;
//   Offset? _previousOffset;
//   double? _previousScale;
//   final _roomTypes = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Study'];

//   @override
//   void initState() {
//     super.initState();
//     _initializeFloors();
//   }

//   void _initializeFloors() {
//     _floors = widget.floors.map((floorName) {
//       return Floor(
//         name: floorName,
//         rooms: [
//           Room(
//             id: DateTime.now().toString(),
//             name: 'Default Room',
//             type: 'Living Room',
//             position: const Offset(100, 100),
//             size: const Size(200, 150),
//             isDefault: true,
//           ),
//         ],
//       );
//     }).toList();
//   }

//   void _showAddRoomDialog(BuildContext context, Room parentRoom, String direction) {
//     final nameController = TextEditingController();
//     String selectedType = _roomTypes[0];

//     showDialog(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: const Text('Add Room'),
//         content: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [
//             TextField(
//               controller: nameController,
//               decoration: const InputDecoration(labelText: 'Room Name'),
//             ),
//             const SizedBox(height: 16),
//             DropdownButtonFormField<String>(
//               value: selectedType,
//               items: _roomTypes.map((type) {
//                 return DropdownMenuItem(
//                   value: type,
//                   child: Text(type),
//                 );
//               }).toList(),
//               onChanged: (value) {
//                 selectedType = value!;
//               },
//               decoration: const InputDecoration(labelText: 'Room Type'),
//             ),
//           ],
//         ),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.pop(context),
//             child: const Text('Cancel'),
//           ),
//           ElevatedButton(
//             onPressed: () {
//               if (nameController.text.isNotEmpty) {
//                 _addRoom(parentRoom, direction, nameController.text, selectedType);
//                 Navigator.pop(context);
//               }
//             },
//             child: const Text('Add'),
//           ),
//         ],
//       ),
//     );
//   }

//  void _addRoom(Room parentRoom, String direction, String name, String type) {
//   final newPosition = _calculateNewRoomPosition(parentRoom, direction);
//   final newRoom = Room(
//     id: DateTime.now().toString(),
//     name: name,
//     type: type,
//     position: newPosition,
//     size: const Size(200, 150),
//   );

//   setState(() {
//     _floors[_selectedFloorIndex].rooms.add(newRoom);
//   });

//   _adjustViewport(newRoom.position); // Move viewport if needed
// }

//   Offset _calculateNewRoomPosition(Room parentRoom, String direction) {
//     switch (direction) {
//       case 'top':
//         return Offset(
//           parentRoom.position.dx,
//           parentRoom.position.dy - parentRoom.size.height - 20,
//         );
//       case 'right':
//         return Offset(
//           parentRoom.position.dx + parentRoom.size.width + 20,
//           parentRoom.position.dy,
//         );
//       case 'bottom':
//         return Offset(
//           parentRoom.position.dx,
//           parentRoom.position.dy + parentRoom.size.height + 20,
//         );
//       case 'left':
//         return Offset(
//           parentRoom.position.dx - parentRoom.size.width - 20,
//           parentRoom.position.dy,
//         );
//       default:
//         return parentRoom.position;
//     }
//   }

//   void _adjustViewport(Offset newPosition) {
//     // Implement the logic to adjust the viewport based on the new room position
//   setState(() {
//     // Move the viewport if the new room is out of the visible area
//     if (newPosition.dx < _position.dx ||
//         newPosition.dy < _position.dy ||
//         newPosition.dx > _position.dx + 500 ||
//         newPosition.dy > _position.dy + 500) {

//       _position = Offset(
//         newPosition.dx - 200, // Adjust so the room is visible in the center
//         newPosition.dy - 150
//       );
//     }
//   });
//   }

//   void _deleteRoom(Room room) {
//     setState(() {
//       _floors[_selectedFloorIndex].rooms.removeWhere((r) => r.id == room.id);
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return Scaffold(
//       body: SafeArea(
//         child: Row(
//           children: [
//             // Main Content
//             Expanded(
//               flex: 3,
//               child: Padding(
//                 padding: const EdgeInsets.all(24.0),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Row(
//                       children: [
//                         const CustomBackButton(),
//                         const SizedBox(width: 16),
//                         Text(
//                           'Configure Rooms',
//                           style: textTheme.displayMedium,
//                         ),
//                       ],
//                     ),
//                     const SizedBox(height: 32),
//                     Expanded(
//                       child: Container(
//                         decoration: BoxDecoration(
//                           border: Border.all(
//                             color: theme.colorScheme.secondary.withOpacity(0.1),
//                           ),
//                           borderRadius: BorderRadius.circular(12),
//                         ),
//                         child: ClipRRect(
//                           borderRadius: BorderRadius.circular(12),
//                           child: InteractiveViewer(
//   boundaryMargin: const EdgeInsets.all(500),
//   minScale: 0.5,
//   maxScale: 2.5,
//   panEnabled: true,
//   child: Transform.translate(
//     offset: _position, // Apply updated position
//     child: Stack(
//       children: [
//         Container(
//           width: 2000,
//           height: 2000,
//           color: Colors.white,
//         ),
//         for (final room in _floors[_selectedFloorIndex].rooms)
//           Positioned(
//             left: room.position.dx,
//             top: room.position.dy,
//             child: _RoomWidget(
//               room: room,
//               onAddRoom: _showAddRoomDialog,
//               onDelete: room.isDefault ? null : _deleteRoom,
//             ),
//           ),
//       ],
//     ),
//   ),
// ),

//                         ),
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//             // Floor Selector
//             Container(
//               width: 60,
//               decoration: BoxDecoration(
//                 border: Border(
//                   left: BorderSide(
//                     color: theme.colorScheme.secondary.withOpacity(0.2),
//                   ),
//                 ),
//               ),
//               child: ListView.builder(
//                 itemCount: widget.floors.length,
//                 itemBuilder: (context, index) {
//                   final isSelected = index == _selectedFloorIndex;
//                   return GestureDetector(
//                     onTap: () {
//                       setState(() {
//                         _selectedFloorIndex = index;
//                       });
//                     },
//                     child: Container(
//                       margin: const EdgeInsets.symmetric(
//                         horizontal: 4,
//                         vertical: 4,
//                       ),
//                       padding: const EdgeInsets.symmetric(
//                         horizontal: 4,
//                         vertical: 8,
//                       ),
//                       decoration: BoxDecoration(
//                         color: isSelected
//                             ? theme.colorScheme.secondary
//                             : theme.colorScheme.surface,
//                         borderRadius: BorderRadius.circular(6),
//                       ),
//                       child: Text(
//                         widget.floors[index],
//                         style: textTheme.bodyMedium?.copyWith(
//                           color: isSelected
//                               ? theme.colorScheme.onSecondary
//                               : theme.colorScheme.onSurface,
//                           fontWeight: FontWeight.bold,
//                         ),
//                         textAlign: TextAlign.center,
//                       ),
//                     ),
//                   );
//                 },
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// class _RoomWidget extends StatelessWidget {
//   final Room room;
//   final Function(BuildContext, Room, String) onAddRoom;
//   final Function(Room)? onDelete;

//   const _RoomWidget({
//     required this.room,
//     required this.onAddRoom,
//     this.onDelete,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       width: room.size.width,
//       height: room.size.height,
//       child: Stack(
//         children: [
//           Container(
//             decoration: BoxDecoration(
//               color: Colors.white,
//               border: Border.all(color: Colors.black),
//               borderRadius: BorderRadius.circular(8),
//             ),
//             child: Center(
//               child: Row(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   Icon(
//                     Icons.edit,
//                     size: 20,
//                     color: Colors.grey[600],
//                   ),
//                   if (onDelete != null) ...[
//                     const SizedBox(width: 8),
//                     IconButton(
//                       icon: const Icon(Icons.delete, size: 20),
//                       color: Colors.red,
//                       onPressed: () => onDelete!(room),
//                     ),
//                   ],
//                 ],
//               ),
//             ),
//           ),
//           // Add Room buttons on each side
//           Positioned(
//             top: -20,
//             left: (room.size.width - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'top'),
//             ),
//           ),
//           Positioned(
//             right: -20,
//             top: (room.size.height - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'right'),
//             ),
//           ),
//           Positioned(
//             bottom: -20,
//             left: (room.size.width - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'bottom'),
//             ),
//           ),
//           Positioned(
//             left: -20,
//             top: (room.size.height - 40) / 2,
//             child: _AddRoomButton(
//               onTap: () => onAddRoom(context, room, 'left'),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }

// class _AddRoomButton extends StatelessWidget {
//   final VoidCallback onTap;

//   const _AddRoomButton({
//     required this.onTap,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return GestureDetector(
//       onTap: onTap,
//       child: Container(
//         width: 50,
//         height: 55,
//         decoration: BoxDecoration(
//           color: Colors.white,
//           border: Border.all(color: Colors.black),
//           shape: BoxShape.circle,
//         ),
//         child: const Icon(Icons.add),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';

class ConfigureRoomScreen extends StatefulWidget {
  const ConfigureRoomScreen({super.key});

  @override
  _ConfigureRoomScreenState createState() => _ConfigureRoomScreenState();
}

class _ConfigureRoomScreenState extends State<ConfigureRoomScreen> {
  double _x = 100; // Base position for all boxes
  double _y = 100;
  final double boxWidth = 200.0; // Adjusted width for outlined box
  final double boxHeight = 150.0; // Adjusted height for outlined box
  final double spacing = 0.5;

  List<Map<String, dynamic>> attachedBoxes = [
    {
      "dx": 0.0,
      "dy": 0.0,
      "connections": {
        "top": false,
        "bottom": false,
        "left": false,
        "right": false
      }
    }
  ];

  void _addBox(double dx, double dy, String connectingSide) {
    setState(() {
      // Find the existing box and update its connections
      for (var box in attachedBoxes) {
        if (box["dx"] == dx && box["dy"] == dy) {
          box["connections"][connectingSide] = true;
        }
      }

      // Determine connections for the new box
      Map<String, bool> newConnections = {
        "top": connectingSide == "bottom",
        "bottom": connectingSide == "top",
        "left": connectingSide == "right",
        "right": connectingSide == "left",
      };

      // Check for adjacent boxes and update connections
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

      // Add the new box with updated connections
      attachedBoxes.add({"dx": dx, "dy": dy, "connections": newConnections});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Configure Room')),
      body: GestureDetector(
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
              child: _buildBox(box["dx"], box["dy"], box["connections"]),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildBox(double dx, double dy, Map<String, bool> connections) {
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
                border:
                    Border.all(color: Colors.black, width: 0.5), // Outlined box
                borderRadius: BorderRadius.circular(8),
                color: Colors.transparent, // No fill color
              ),
              child: Stack(
                children: [
                  // Add tiny grey boxes to represent furniture or items in the room
                  Positioned(
                    left: 10,
                    top: 30,
                    child: Container(
                      width: 30,
                      height: 75,
                      color: Colors.grey[350],
                    ),
                  ),
                  Positioned(
                    left: 120,
                    top: 90,
                    child: Container(
                      width: 50,
                      height: 20,
                      color: Colors.grey[350],
                    ),
                  ),
                  Positioned(
                    left: 120,
                    top: 20,
                    child: Container(
                      width: 30,
                      height: 30,
                      color: Colors.grey[350],
                    ),
                  ),
                ],
              ),
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
        onTap: () => _addBox(newDx, newDy, connectingSide),
        borderRadius: BorderRadius.circular(
            8), // Optional: Rounded corners for the touch target
        child: Container(
          width: 30, // Larger touch area
          height: 30, // Larger touch area
          decoration: BoxDecoration(
            color: Colors.grey[400], // Background color
            borderRadius: BorderRadius.circular(8), // Rounded corners
          ),
          child: const Icon(Icons.add,
              color: Colors.black, size: 24), // Black plus icon
        ),
      ),
    );
  }
}

void main() {
  runApp(const MaterialApp(
    home: ConfigureRoomScreen(),
  ));
}
