// import 'package:flutter/material.dart';
// import '/widgets/back_button.dart';

// class Device {
//   final String id;
//   final String name;
//   final Offset position;

//   Device({
//     required this.id,
//     required this.name,
//     required this.position,
//   });

//   Device copyWith({
//     String? id,
//     String? name,
//     Offset? position,
//   }) {
//     return Device(
//       id: id ?? this.id,
//       name: name ?? this.name,
//       position: position ?? this.position,
//     );
//   }
// }

// class ConfigureRoomScreen extends StatefulWidget {
//   const ConfigureRoomScreen({super.key});

//   @override
//   State<ConfigureRoomScreen> createState() => _ConfigureRoomScreenState();
// }

// class _ConfigureRoomScreenState extends State<ConfigureRoomScreen> {
//   final List<Device> _devices = [];
//   Device? _selectedDevice;
//   bool _isPlacingDevice = false;

//   void _addDevice(String name) {
//     setState(() {
//       _devices.add(Device(
//         id: DateTime.now().toString(),
//         name: name,
//         position: const Offset(0, 0),
//       ));
//       _isPlacingDevice = true;
//       _selectedDevice = _devices.last;
//     });
//   }

//   void _updateDevicePosition(Device device, Offset position) {
//     final index = _devices.indexWhere((d) => d.id == device.id);
//     if (index != -1) {
//       setState(() {
//         _devices[index] = device.copyWith(position: position);
//       });
//     }
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
//                   const CustomBackButton(),
//                   const SizedBox(width: 16),
//                   Text(
//                     'Configure Room',
//                     style: textTheme.displayMedium,
//                   ),
//                 ],
//               ),
//               const SizedBox(height: 32),

//               // Room Layout
//               Expanded(
//                 child: Container(
//                   decoration: BoxDecoration(
//                     border: Border.all(color: theme.colorScheme.secondary),
//                     borderRadius: BorderRadius.circular(12),
//                   ),
//                   child: GestureDetector(
//                     onPanUpdate: _isPlacingDevice && _selectedDevice != null
//                         ? (details) {
//                             final RenderBox box = context.findRenderObject() as RenderBox;
//                             final localPosition = box.globalToLocal(details.globalPosition);
//                             _updateDevicePosition(_selectedDevice!, localPosition);
//                           }
//                         : null,
//                     onPanEnd: _isPlacingDevice && _selectedDevice != null
//                         ? (details) {
//                             setState(() {
//                               _isPlacingDevice = false;
//                               _selectedDevice = null;
//                             });
//                           }
//                         : null,
//                     child: Stack(
//                       children: [
//                         // Grid Lines
//                         CustomPaint(
//                           painter: GridPainter(),
//                           size: Size.infinite,
//                         ),
//                         // Devices
//                         ..._devices.map((device) => Positioned(
//                           left: device.position.dx,
//                           top: device.position.dy,
//                           child: _DeviceWidget(
//                             device: device,
//                             isSelected: device.id == _selectedDevice?.id,
//                           ),
//                         )),
//                       ],
//                     ),
//                   ),
//                 ),
//               ),
//               const SizedBox(height: 16),

//               // Device Controls
//               Row(
//                 mainAxisAlignment: MainAxisAlignment.spaceEvenly,
//                 children: [
//                   _DeviceButton(
//                     icon: Icons.lightbulb_outline,
//                     label: 'Light',
//                     onTap: () => _addDevice('Light'),
//                   ),
//                   _DeviceButton(
//                     icon: Icons.ac_unit,
//                     label: 'AC',
//                     onTap: () => _addDevice('AC'),
//                   ),
//                   _DeviceButton(
//                     icon: Icons.tv,
//                     label: 'TV',
//                     onTap: () => _addDevice('TV'),
//                   ),
//                   _DeviceButton(
//                     icon: Icons.wind_power,
//                     label: 'Fan',
//                     onTap: () => _addDevice('Fan'),
//                   ),
//                 ],
//               ),
//               const SizedBox(height: 16),

//               // Bottom Buttons
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
//                         // Handle save configuration
//                         Navigator.pop(context);
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
// }

// class _DeviceButton extends StatelessWidget {
//   final IconData icon;
//   final String label;
//   final VoidCallback onTap;

//   const _DeviceButton({
//     required this.icon,
//     required this.label,
//     required this.onTap,
//   });

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return InkWell(
//       onTap: onTap,
//       child: Column(
//         mainAxisSize: MainAxisSize.min,
//         children: [
//           Container(
//             padding: const EdgeInsets.all(12),
//             decoration: BoxDecoration(
//               color: theme.colorScheme.surface,
//               borderRadius: BorderRadius.circular(12),
//             ),
//             child: Icon(icon),
//           ),
//           const SizedBox(height: 4),
//           Text(
//             label,
//             style: textTheme.bodySmall,
//           ),
//         ],
//       ),
//     );
//   }
// }

// class _DeviceWidget extends StatelessWidget {
//   final Device device;
//   final bool isSelected;

//   const _DeviceWidget({
//     required this.device,
//     required this.isSelected,
//   });

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);

//     return Container(
//       padding: const EdgeInsets.all(8),
//       decoration: BoxDecoration(
//         color: isSelected
//             ? theme.colorScheme.secondary
//             : theme.colorScheme.surface,
//         borderRadius: BorderRadius.circular(8),
//         border: Border.all(
//           color: theme.colorScheme.secondary,
//           width: isSelected ? 2 : 1,
//         ),
//       ),
//       child: Icon(
//         _getIconForDevice(device.name),
//         color: isSelected
//             ? theme.colorScheme.onSecondary
//             : theme.colorScheme.onSurface,
//       ),
//     );
//   }

//   IconData _getIconForDevice(String name) {
//     switch (name) {
//       case 'Light':
//         return Icons.lightbulb_outline;
//       case 'AC':
//         return Icons.ac_unit;
//       case 'TV':
//         return Icons.tv;
//       case 'Fan':
//         return Icons.wind_power;
//       default:
//         return Icons.device_unknown;
//     }
//   }
// }

// class GridPainter extends CustomPainter {
//   @override
//   void paint(Canvas canvas, Size size) {
//     final paint = Paint()
//       ..color = Colors.grey.withOpacity(0.2)
//       ..strokeWidth = 1;

//     const gridSize = 20.0;

//     for (double i = 0; i < size.width; i += gridSize) {
//       canvas.drawLine(
//         Offset(i, 0),
//         Offset(i, size.height),
//         paint,
//       );
//     }

//     for (double i = 0; i < size.height; i += gridSize) {
//       canvas.drawLine(
//         Offset(0, i),
//         Offset(size.width, i),
//         paint,
//       );
//     }
//   }

//   @override
//   bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
// }

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const Slidertry());
}

class Slidertry extends StatelessWidget {
  const Slidertry({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text("iPhone Style Picker")),
        body: const Center(
          child: TimePicker(),
        ),
      ),
    );
  }
}

class TimePicker extends StatefulWidget {
  const TimePicker({super.key});

  @override
  _TimePickerState createState() => _TimePickerState();
}

class _TimePickerState extends State<TimePicker> {
  int _selectedHour = 12;
  int _selectedMinute = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CupertinoPicker(
          itemExtent: 32.0,
          onSelectedItemChanged: (int index) {
            setState(() {
              _selectedHour = index;
            });
          },
          children: List<Widget>.generate(24, (int index) {
            return Center(child: Text('$index'));
          }),
        ),
        CupertinoPicker(
          itemExtent: 32.0,
          onSelectedItemChanged: (int index) {
            setState(() {
              _selectedMinute = index * 5; // Incrementing minutes in 5s
            });
          },
          children: List<Widget>.generate(12, (int index) {
            return Center(child: Text('${index * 5}'));
          }),
        ),
        Text('Selected Time: $_selectedHour:$_selectedMinute'),
      ],
    );
  }
}
