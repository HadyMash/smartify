import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LocksScreen extends StatefulWidget {
  const LocksScreen({Key? key}) : super(key: key);

  @override
  State<LocksScreen> createState() => _LocksScreenState();
}

class _LocksScreenState extends State<LocksScreen> {
  final Map<String, bool> locks = {
    'Front door': false,
    'Back door': true,
    'Garage door': true,
    'Master Bedroom': false,
  };

  final Map<String, bool> alarms = {
    'Back door': true,
    'Basement': false,
    'Front door': false,
    'Attic': true,
  };

  Widget _buildDeviceCard(String name, bool isActive, bool isAlarm) {
    return AspectRatio(
      aspectRatio: 1, // Ensures all cards have the same aspect ratio
      child: Container(
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.black,
          borderRadius: BorderRadius.circular(16),
          border: isActive ? Border.all(color: Colors.grey[300]!) : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(
              isAlarm
                  ? (isActive
                      ? Icons.notifications_none
                      : Icons.notifications_off_outlined)
                  : (isActive ? Icons.lock_open : Icons.lock_outline),
              color: isActive ? Colors.black : Colors.white,
              size: 32,
            ),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: GoogleFonts.lato(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                      color: isActive ? Colors.black : Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isAlarm
                        ? (isActive ? 'Active' : 'Inactive') // For alarms
                        : (isActive ? 'Open' : 'Closed'), // For locks
                    style: GoogleFonts.lato(
                      fontSize: 16,
                      color: isActive ? Colors.grey[600] : Colors.grey[400],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Security',
                    style: GoogleFonts.lato(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Devices',
                style: GoogleFonts.lato(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Locks column
                    Expanded(
                      child: Column(
                        children: locks.entries.map((entry) {
                          return GestureDetector(
                            onLongPress: () {
                              setState(() {
                                locks[entry.key] = !entry.value;
                              });
                            },
                            child:
                                _buildDeviceCard(entry.key, entry.value, false),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Alarms column
                    Expanded(
                      child: Column(
                        children: alarms.entries.map((entry) {
                          return GestureDetector(
                            onLongPress: () {
                              setState(() {
                                alarms[entry.key] = !entry.value;
                              });
                            },
                            child:
                                _buildDeviceCard(entry.key, entry.value, true),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
