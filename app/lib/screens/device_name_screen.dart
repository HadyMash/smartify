import 'package:flutter/material.dart';
import 'device_added_screen.dart';

class DeviceNameScreen extends StatefulWidget {
  const DeviceNameScreen({Key? key}) : super(key: key);

  @override
  _DeviceNameScreenState createState() => _DeviceNameScreenState();
}

class _DeviceNameScreenState extends State<DeviceNameScreen> {
  final TextEditingController _controller = TextEditingController();
  String _selectedLocation = 'Living Room';

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
        title: const Text('Name of the device',
            style: TextStyle(color: Colors.black)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'Lights',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey),
                  onPressed: () => _controller.clear(),
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: 40), // Increased spacing
            const Text(
              'Select Location',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20), // Increased spacing
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2, // Two buttons per row
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 2.5, // Adjust this to control button height
              children: [
                _buildLocationButton('Living Room'),
                _buildLocationButton('Kitchen'),
                _buildLocationButton('Bathroom'),
                _buildLocationButton('Bedroom'),
                _buildLocationButton('Garage'),
              ],
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => const DeviceAddedScreen()),
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
                  'Continue',
                  style: TextStyle(
                    color: Colors.white, // Changed text color to white
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationButton(String label) {
    bool isSelected = _selectedLocation == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedLocation = label;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? Colors.black : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}
