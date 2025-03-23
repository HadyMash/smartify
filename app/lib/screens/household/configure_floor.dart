// import 'package:flutter/material.dart';
// // import 'package:flutter_picker/flutter_picker.dart';
// import 'package:gesture_x_detector/gesture_x_detector.dart';

// class ConfigureFloorsScreen extends StatefulWidget {
//   const ConfigureFloorsScreen({super.key});

//   @override
//   State<ConfigureFloorsScreen> createState() => _ConfigureFloorsScreenState();
// }

// class _ConfigureFloorsScreenState extends State<ConfigureFloorsScreen> {
//   int _selectedFloorIndex = 2; // G floor is selected by default
//   final List<String> _floors = ['B2', 'B1', 'G', 'L1', 'L2'];
//   int _totalFloors = 5;
//   double _scrollOffset = 0.0;
//   final double _itemHeight = 100.0; // Height of each floor item

//   void _incrementFloors() {
//     if (_totalFloors < 10) { // Set a reasonable maximum
//       setState(() {
//         _totalFloors++;
//         _floors.insert(0, 'B${_totalFloors - 4}'); // Add basement
//         _selectedFloorIndex++;
//       });
//     }
//   }

//   void _decrementFloors() {
//     if (_totalFloors > 3) { // Minimum 3 floors (1 ground + 1 upper + 1 basement)
//       setState(() {
//         _totalFloors--;
//         _floors.removeAt(0);
//         _selectedFloorIndex = _selectedFloorIndex > 0 ? _selectedFloorIndex - 1 : 0;
//       });
//     }
//   }

//   void _handleVerticalDragUpdate(double delta) {
//     setState(() {
//       _scrollOffset += delta;
//       // Calculate the new selected index based on scroll position
//       final newIndex = (_scrollOffset / _itemHeight).round();
//       if (newIndex >= 0 && newIndex < _floors.length) {
//         _selectedFloorIndex = _floors.length - 1 - newIndex;
//       }
//       // Keep scroll offset within bounds
//       _scrollOffset = _selectedFloorIndex * _itemHeight;
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return Scaffold(
//       body: SafeArea(
//         child: Padding(
//           padding: const EdgeInsets.all(24.0),
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Text(
//                 'Configure Floors',
//                 style: textTheme.displayMedium,
//               ),
//               const SizedBox(height: 40),
//               Expanded(
//                 child: Row(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     // Floor indicators with smooth scrolling
//                     Expanded(
//                       child: XGestureDetector(
//                         onMoveUpdate: (event) {
//                           _handleVerticalDragUpdate(event.delta.dy);
//                         },
//                         child: LayoutBuilder(
//                           builder: (context, constraints) {
//                             final itemHeight = constraints.maxHeight / _floors.length;
//                             return Stack(
//                               children: [
//                                 // Floor boxes
//                                 ...List.generate(_floors.length, (index) {
//                                   final isSelected = index == _selectedFloorIndex;
//                                   return AnimatedPositioned(
//                                     duration: const Duration(milliseconds: 200),
//                                     curve: Curves.easeOutCubic,
//                                     left: 0,
//                                     right: 0,
//                                     top: index * itemHeight - _scrollOffset,
//                                     child: GestureDetector(
//                                       onTap: () {
//                                         setState(() {
//                                           _selectedFloorIndex = index;
//                                           _scrollOffset = (_floors.length - 1 - index) * _itemHeight;
//                                         });
//                                       },
//                                       child: SizedBox(
//                                         height: itemHeight,
//                                         child: Center(
//                                           child: AnimatedContainer(
//                                             duration: const Duration(milliseconds: 200),
//                                             width: 60,
//                                             height: 60,
//                                             decoration: BoxDecoration(
//                                               color: isSelected
//                                                   ? theme.colorScheme.secondary
//                                                   : theme.colorScheme.surface,
//                                               borderRadius: BorderRadius.circular(12),
//                                               boxShadow: isSelected ? [
//                                                 BoxShadow(
//                                                   color: Colors.black.withOpacity(0.1),
//                                                   blurRadius: 8,
//                                                   offset: const Offset(0, 2),
//                                                 )
//                                               ] : null,
//                                             ),
//                                             child: Center(
//                                               child: Text(
//                                                 _floors[_floors.length - 1 - index],
//                                                 style: textTheme.bodyLarge?.copyWith(
//                                                   color: isSelected
//                                                       ? theme.colorScheme.onSecondary
//                                                       : theme.colorScheme.onSurface,
//                                                   fontWeight: FontWeight.bold,
//                                                 ),
//                                               ),
//                                             ),
//                                           ),
//                                         ),
//                                       ),
//                                     ),
//                                   );
//                                 }),
//                               ],
//                             );
//                           },
//                         ),
//                       ),
//                     ),
//                     const SizedBox(width: 24),
//                     // Plus/Minus controls
//                     Column(
//                       mainAxisAlignment: MainAxisAlignment.center,
//                       children: [
//                         IconButton(
//                           onPressed: _incrementFloors,
//                           icon: const Icon(Icons.add),
//                           style: IconButton.styleFrom(
//                             backgroundColor: theme.colorScheme.surface,
//                             padding: const EdgeInsets.all(12),
//                           ),
//                         ),
//                         Text(
//                           _totalFloors.toString(),
//                           style: textTheme.bodyLarge,
//                         ),
//                         IconButton(
//                           onPressed: _decrementFloors,
//                           icon: const Icon(Icons.remove),
//                           style: IconButton.styleFrom(
//                             backgroundColor: theme.colorScheme.surface,
//                             padding: const EdgeInsets.all(12),
//                           ),
//                         ),
//                       ],
//                     ),
//                   ],
//                 ),
//               ),
//               const SizedBox(height: 24),
//               Row(
//                 children: [
//                   Expanded(
//                     child: ElevatedButton(
//                       onPressed: () => Navigator.pop(context),
//                       style: ElevatedButton.styleFrom(
//                         backgroundColor: Colors.grey[300],
//                       ),
//                       child: Text(
//                         'Go Back',
//                         style: textTheme.bodyLarge?.copyWith(
//                           fontWeight: FontWeight.bold,
//                           color: Colors.black,
//                         ),
//                       ),
//                     ),
//                   ),
//                   const SizedBox(width: 16),
//                   Expanded(
//                     child: ElevatedButton(
//                       onPressed: () {
//                         // Handle next action
//                       },
//                       child: Text(
//                         'Next',
//                         style: textTheme.bodyLarge?.copyWith(
//                           fontWeight: FontWeight.bold,
//                           color: theme.colorScheme.onSecondary,
//                         ),
//                       ),
//                     ),
//                   ),
//                 ],
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// } boxes slider
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:smartify/screens/household/configure_room.dart'; // Ensure this import is correct

class ConfigureFloorsScreen extends StatefulWidget {
  const ConfigureFloorsScreen({super.key});

  @override
  State<ConfigureFloorsScreen> createState() => _ConfigureFloorsScreenState();
}

class _ConfigureFloorsScreenState extends State<ConfigureFloorsScreen> {
  int _selectedFloorIndex = 2; // G floor is selected by default
  final List<String> _floors = ['L2', 'L1', 'G', 'B1', 'B2'];

  void _incrementFloors() {
    setState(() {
      int gIndex = _floors.indexOf('G');

      if (_selectedFloorIndex <= gIndex) {
        // If at or above G, add more L floors at the top
        int newLNumber = (_floors.first.startsWith('L'))
            ? int.tryParse(_floors.first.substring(1)) ?? 2
            : 0;
        _floors.insert(0, 'L${newLNumber + 1}');
        _selectedFloorIndex++;
      } else {
        // If below G (Basements), add more B floors at the bottom
        int newBNumber = (_floors.last.startsWith('B'))
            ? int.tryParse(_floors.last.substring(1)) ?? 2
            : 0;
        _floors.add('B${newBNumber + 1}');
      }
    });
  }

  void _decrementFloors() {
    setState(() {
      int gIndex = _floors.indexOf('G');

      if (_selectedFloorIndex <= gIndex) {
        // If at or above G, remove the first L floor
        if (_floors.first.startsWith('L')) {
          _floors.removeAt(0);
          _selectedFloorIndex =
              (_selectedFloorIndex > 0) ? _selectedFloorIndex - 1 : 0;
        }
      } else {
        // If below G (Basements), remove the last B floor
        if (_floors.last.startsWith('B')) {
          _floors.removeLast();
          _selectedFloorIndex =
              (_selectedFloorIndex > gIndex) ? _selectedFloorIndex - 1 : gIndex;
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Configure Floors',
                style: textTheme.displayMedium,
              ),
              const SizedBox(height: 40),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: CupertinoPicker(
                        itemExtent: 50.0,
                        scrollController: FixedExtentScrollController(
                            initialItem: _selectedFloorIndex),
                        onSelectedItemChanged: (int index) {
                          setState(() {
                            _selectedFloorIndex = index;
                          });
                        },
                        children: _floors
                            .map((floor) => Center(
                                  child: Text(
                                    floor,
                                    style: textTheme.bodyLarge,
                                  ),
                                ))
                            .toList(),
                      ),
                    ),
                    const SizedBox(width: 24),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          onPressed: _incrementFloors,
                          icon: const Icon(Icons.add),
                          style: ButtonStyle(
                            backgroundColor: WidgetStateProperty.all(
                                theme.colorScheme.surface),
                            padding: WidgetStateProperty.all(
                                const EdgeInsets.all(12)),
                          ),
                        ),
                        Text(
                          _floors.length.toString(),
                          style: textTheme.bodyLarge,
                        ),
                        IconButton(
                          onPressed: _decrementFloors,
                          icon: const Icon(Icons.remove),
                          style: ButtonStyle(
                            backgroundColor: WidgetStateProperty.all(
                                theme.colorScheme.surface),
                            padding: WidgetStateProperty.all(
                                const EdgeInsets.all(12)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ConfigureRoomScreen(),
                      // ConfigureRoomScreen(floors: _floors),
                    ),
                  );
                },
                child: Text(
                  'Next',
                  style: textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// class ConfigureFloorsScreen extends StatefulWidget {
//   const ConfigureFloorsScreen({super.key});

//   @override
//   State<ConfigureFloorsScreen> createState() => _ConfigureFloorsScreenState();
// }

// class _ConfigureFloorsScreenState extends State<ConfigureFloorsScreen> {
//   final List<String> _floors = ['B2', 'B1', 'G', 'L1', 'L2'];
//   int _selectedFloorIndex = 2;
//   int _totalFloors = 5;

//   void _addFloor() {
//     setState(() {
//       final newFloor = 'L${_totalFloors - 2}';
//       _floors.add(newFloor);
//       _totalFloors++;
//     });
//   }

//   void _removeFloor() {
//     if (_floors.length > 3 && _floors.last != 'G') {
//       setState(() {
//         _floors.removeLast();
//         _totalFloors--;
//       });
//     }
//   }

//   void _showPicker() {
//     Picker(
//       adapter: PickerDataAdapter<String>(pickerData: _floors.reversed.toList()),
//       selecteds: [_floors.length - 1 - _selectedFloorIndex],
//       onConfirm: (Picker picker, List<int> value) {
//         setState(() {
//           _selectedFloorIndex = _floors.length - 1 - value.first;
//         });
//       },
//     ).showModal(context);
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return Scaffold(
//       body: SafeArea(
//         child: Padding(
//           padding: const EdgeInsets.all(24.0),
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Row(
//                 children: [
//                   IconButton(
//                     icon: const Icon(Icons.arrow_back),
//                     onPressed: () => Navigator.pop(context),
//                   ),
//                   Text('Configure Floors', style: textTheme.displayMedium),
//                 ],
//               ),
//               const SizedBox(height: 40),
//               Expanded(
//                 child: Column(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     GestureDetector(
//                       onTap: _showPicker,
//                       child: Container(
//                         padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
//                         decoration: BoxDecoration(
//                           color: theme.colorScheme.surface,
//                           borderRadius: BorderRadius.circular(12),
//                           boxShadow: [
//                             BoxShadow(
//                               color: Colors.black.withOpacity(0.1),
//                               blurRadius: 8,
//                             )
//                           ],
//                         ),
//                         child: Text(
//                           _floors[_selectedFloorIndex],
//                           style: textTheme.headlineLarge,
//                         ),
//                       ),
//                     ),
//                     const SizedBox(height: 24),
//                     Row(
//                       mainAxisAlignment: MainAxisAlignment.center,
//                       children: [
//                         Column(
//                           children: [
//                             IconButton(
//                               onPressed: _addFloor,
//                               icon: const Icon(Icons.add),
//                             ),
//                             Text('$_totalFloors', style: textTheme.bodyLarge),
//                             IconButton(
//                               onPressed: _removeFloor,
//                               icon: const Icon(Icons.remove),
//                             ),
//                           ],
//                         ),
//                       ],
//                     ),
//                   ],
//                 ),
//               ),
//               const SizedBox(height: 24),
//               ElevatedButton(
//                 onPressed: () {
//                   // Navigate to Configure Room Page
//                 },
//                 child: const Text('Next'),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

// import 'package:flutter/material.dart';
// import 'package:flutter_picker/flutter_picker.dart';

// class ConfigureFloorsScreen extends StatefulWidget {
//   const ConfigureFloorsScreen({super.key});

//   @override
//   State<ConfigureFloorsScreen> createState() => _ConfigureFloorsScreenState();
// }

// class _ConfigureFloorsScreenState extends State<ConfigureFloorsScreen> {
//   final List<String> _floors = ['B2', 'B1', 'G', 'L1', 'L2'];
//   int _selectedFloorIndex = 2;
//   int _totalFloors = 5;

//   void _addFloor() {
//     setState(() {
//       final newFloor = 'L${_totalFloors - 2}';
//       _floors.add(newFloor);
//       _totalFloors++;
//     });
//   }

//   void _removeFloor() {
//     if (_floors.length > 3 && _floors.last != 'G') {
//       setState(() {
//         _floors.removeLast();
//         _totalFloors--;
//       });
//     }
//   }

//   void _showPicker() {
//     Picker(
//       adapter: PickerDataAdapter<String>(pickerData: _floors.reversed.toList()),
//       selecteds: [_floors.length - 1 - _selectedFloorIndex],
//       onConfirm: (Picker picker, List<int> value) {
//         setState(() {
//           _selectedFloorIndex = _floors.length - 1 - value.first;
//         });
//       },
//     ).showModal(context);
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return Scaffold(
//       body: SafeArea(
//         child: SingleChildScrollView( // ✅ Prevents Overflow
//           child: Padding(
//             padding: const EdgeInsets.all(24.0),
//             child: Column(
//               mainAxisSize: MainAxisSize.min, // ✅ Fixes excess height
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Row(
//                   children: [
//                     IconButton(
//                       icon: const Icon(Icons.arrow_back),
//                       onPressed: () => Navigator.pop(context),
//                     ),
//                     Text('Configure Floors', style: textTheme.displayMedium),
//                   ],
//                 ),
//                 const SizedBox(height: 40),
//                 Center(
//                   child: Column(
//                     mainAxisSize: MainAxisSize.min,
//                     children: [
//                       GestureDetector(
//                         onTap: _showPicker,
//                         child: Container(
//                           padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
//                           decoration: BoxDecoration(
//                             color: theme.colorScheme.surface,
//                             borderRadius: BorderRadius.circular(12),
//                             boxShadow: [
//                               BoxShadow(
//                                 color: Colors.black.withOpacity(0.1),
//                                 blurRadius: 8,
//                               )
//                             ],
//                           ),
//                           child: Text(
//                             _floors[_selectedFloorIndex],
//                             style: textTheme.headlineLarge,
//                           ),
//                         ),
//                       ),
//                       const SizedBox(height: 24),
//                       Row(
//                         mainAxisAlignment: MainAxisAlignment.center,
//                         children: [
//                           Column(
//                             children: [
//                               IconButton(
//                                 onPressed: _addFloor,
//                                 icon: const Icon(Icons.add),
//                               ),
//                               Text('$_totalFloors', style: textTheme.bodyLarge),
//                               IconButton(
//                                 onPressed: _removeFloor,
//                                 icon: const Icon(Icons.remove),
//                               ),
//                             ],
//                           ),
//                         ],
//                       ),
//                     ],
//                   ),
//                 ),
//                 const SizedBox(height: 24),
//                 ElevatedButton(
//                   onPressed: () {
//                     // Navigate to Configure Room Page
//                   },
//                   child: const Text('Next'),
//                 ),
//               ],
//             ),
//           ),
//         ),
//       ),
//     );
//   }
// }
