import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/add_device_screen.dart';
import 'screens/devices_screen.dart';
import 'screens/device_name_screen.dart';
import 'screens/device_added_screen.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Home Dashboard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        textTheme: GoogleFonts.latoTextTheme(
          Theme.of(context).textTheme,
        ),
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const DashboardScreen(), // Set the initial screen
      routes: {
        '/dashboard': (context) => const DashboardScreen(),
        '/addDevice': (context) => const AddDeviceScreen(),
        '/devices': (context) => const DevicesScreen(),
        '/deviceName': (context) => const DeviceNameScreen(),
        '/deviceAdded': (context) => const DeviceAddedScreen(),
      },
    );
  }
}
