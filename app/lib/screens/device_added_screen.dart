import 'package:flutter/material.dart';
import 'devices_screen.dart'; // Import the next screen

class DeviceAddedScreen extends StatelessWidget {
  const DeviceAddedScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              const Spacer(), // Pushes content to center
              const Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 100,
              ),
              const SizedBox(height: 20),
              const Text(
                'Successfully added the device', // Updated text
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const Spacer(), // Pushes button to bottom
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                          builder: (context) => const DevicesScreen()),
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Return to device page',
                    style: TextStyle(
                        color: Colors.white), // Changed text color to white
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
