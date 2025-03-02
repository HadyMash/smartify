import 'package:flutter/material.dart';
import 'device_name_screen.dart'; // Import the next screen

class DevicesScreen extends StatelessWidget {
  const DevicesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Devices', style: TextStyle(color: Colors.black)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Available Devices',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            DeviceListItem(
                name: 'Alexa', status: 'Connected', color: Colors.green),
            DeviceListItem(
                name: 'Samsung', status: 'Connected', color: Colors.green),
            DeviceListItem(
                name: 'Amazon Echo',
                status: 'Not connected',
                color: Colors.grey),
            DeviceListItem(
                name: 'Security camera',
                status: 'Not connected',
                color: Colors.red),
          ],
        ),
      ),
    );
  }
}

class DeviceListItem extends StatelessWidget {
  final String name;
  final String status;
  final Color color;

  const DeviceListItem({
    Key? key,
    required this.name,
    required this.status,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(status,
                    style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.grey),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                    builder: (context) => const DeviceNameScreen()),
              );
            },
          ),
        ],
      ),
    );
  }
}
