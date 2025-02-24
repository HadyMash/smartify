import 'package:flutter/material.dart';
import 'package:smartify/widgets/nav_bar.dart';
import 'package:smartify/screens/energy/energy_screen.dart'; // Import the EnergyScreen
import 'package:smartify/screens/household/household_screen.dart'; // Import the HouseholdScreen
import 'package:smartify/screens/settings/settings.dart'; // Import the SettingsScreen

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 2;

  // Define your screens
  final List<Widget> _screens = [
    const EnergyScreen(),
    const HouseholdScreen(),
    const DashboardContent(), // Display Dashboard Content first (home)
    const SettingsScreen(),
    // Energy screen
    const SettingsScreen(),
    // You can add other screens here, like DevicesScreen, SecurityScreen, SettingsScreen
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex], // Display selected screen
      bottomNavigationBar: CustomNavBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index; // Update the selected index
          });
        },
      ),
    );
  }
}

// Create a new widget for your dashboard content
class DashboardContent extends StatelessWidget {
  const DashboardContent({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('This is the Dashboard!'),
      // You can add your dashboard content here
    );
  }
}
