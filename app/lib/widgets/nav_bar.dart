// import 'package:flutter/material.dart';

// class CustomNavBar extends StatelessWidget {
//   final int currentIndex;
//   final Function(int) onTap;

//   const CustomNavBar(
//       {super.key, required this.currentIndex, required this.onTap});

//   @override
//   Widget build(BuildContext context) {
//     return Container(
//       decoration: BoxDecoration(
//         color: Colors.white,
//         borderRadius: BorderRadius.circular(20),
//       ),
//       margin: const EdgeInsets.all(16),
//       padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
//       child: Row(
//         mainAxisAlignment: MainAxisAlignment.spaceBetween,
//         children: List.generate(5, (index) {
//           return _buildNavItem(index);
//         }),
//       ),
//     );
//   }

//   Widget _buildNavItem(int index) {
//     bool isSelected = index == currentIndex;
//     List<IconData> icons = [
//       Icons.bolt, // Energy
//       Icons.lightbulb, // Devices
//       Icons.home, // Home
//       Icons.security, // Security
//       Icons.settings, // Settings
//     ];
//     List<String> labels = ["Energy", "Devices", "Home", "Security", "Settings"];

//     return GestureDetector(
//       onTap: () => onTap(index),
//       child: AnimatedContainer(
//         duration: const Duration(milliseconds: 300),
//         padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
//         decoration: isSelected
//             ? BoxDecoration(
//                 gradient: const LinearGradient(
//                   colors: [Colors.black, Colors.black87], // Black gradient
//                   begin: Alignment.topLeft,
//                   end: Alignment.bottomRight,
//                 ),
//                 borderRadius: BorderRadius.circular(20),
//               )
//             : const BoxDecoration(color: Colors.transparent),
//         child: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [
//             Icon(
//               icons[index],
//               color: isSelected ? Colors.white : Colors.black,
//               size: 24,
//             ),
//             if (isSelected)
//               Text(
//                 labels[index],
//                 style: const TextStyle(color: Colors.white, fontSize: 12),
//               ),
//           ],
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';

class CustomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20), // Rounded edges
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        backgroundColor: Colors.white, // Background color
        selectedItemColor: Colors.white, // Active icon color
        unselectedItemColor: Colors.black, // Inactive icon color
        type: BottomNavigationBarType.fixed, // Ensures labels always show
        items: [
          _buildNavItem(Icons.bolt, "Energy"),
          _buildNavItem(Icons.lightbulb, "Devices"),
          _buildNavItem(Icons.home, "Home"),
          _buildNavItem(Icons.security, "Security"),
          _buildNavItem(Icons.settings, "Settings"),
        ],
      ),
    );
  }

  BottomNavigationBarItem _buildNavItem(IconData icon, String label) {
    return BottomNavigationBarItem(
      icon: Icon(icon, size: 24),
      activeIcon: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Colors.black, Colors.black87], // Black gradient
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Icon(icon, color: Colors.white, size: 24),
      ),
      label: label,
    );
  }
}
