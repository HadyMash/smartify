import 'package:flutter/material.dart';
import 'package:smartify/screens/household/household_screen.dart';
import 'package:smartify/services/iot.dart';
import 'package:smartify/widgets/nav_bar.dart';
import 'package:smartify/screens/energy/energy_screen.dart'; // Import the EnergyScreen
// Import the HouseholdScreen
import 'package:smartify/screens/settings/settings.dart'; // Import the SettingsScreen
import 'package:smartify/services/auth.dart'; // Import the AuthService

class DashboardScreen extends StatefulWidget {
  // Define an instance of authService
  final AuthService authService;
  const DashboardScreen({super.key, required this.authService});

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 2;

  // Define your screens
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const EnergyScreen(),
      const HouseholdScreen(),
      const DashboardContent(), // Display Dashboard Content first (home)
      SettingsScreen(authService: widget.authService),
      // Energy screen
      SettingsScreen(authService: widget.authService),
      // You can add other screens here, like DevicesScreen, SecurityScreen, SettingsScreen
    ];
  }

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
    return SafeArea(
      child: Center(
        child: Column(
          children: [
            ElevatedButton(
              onPressed: () async {
                final iot = await IotService.create();
                print(await iot.discoverDevices());
              },
              child: const Text('discover devices'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final iot = await IotService.create();
                await iot.testRoute();
              },
              child: const Text('test route'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final iot = await IotService.create();
                print(await iot
                    .getDeviceState('32df2452-6092-4269-aead-99da9ed0919d'));
              },
              child: const Text('get device state'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final iot = await IotService.create();
                print(await iot.getAllDeviceStates('67e48b974bdb223b52a9458d'));
              },
              child: const Text('get all device states'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final iot = await IotService.create();
                final device = await iot
                    .getDeviceState('32df2452-6092-4269-aead-99da9ed0919d');

                print(device);
                if (device == null) {
                  return;
                }

                await iot.updateDeviceState(
                    '32df2452-6092-4269-aead-99da9ed0919d',
                    {'on': !device.state['on']});
              },
              child: const Text('set device state'),
            ),
          ],
        ),
        // You can add your dashboard content here
      ),
    );
  }
}
