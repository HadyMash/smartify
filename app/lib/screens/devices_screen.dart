import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'add_device_screen.dart';

class DevicesScreen extends StatefulWidget {
  const DevicesScreen({Key? key}) : super(key: key);

  @override
  State<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends State<DevicesScreen> {
  String currentRoom = "Living room";

  final Map<String, List<DeviceInfo>> roomDevices = {
    'Living room': [
      DeviceInfo(
          name: 'Smart TV', icon: Icons.tv, isOn: true, color: Colors.blue),
      DeviceInfo(
          name: 'Speakers', icon: Icons.speaker, isOn: true, color: Colors.red),
      DeviceInfo(
          name: 'Air Conditioner',
          icon: Icons.ac_unit,
          isOn: true,
          color: Colors.lightBlue),
      DeviceInfo(
          name: 'Light',
          icon: Icons.lightbulb_outline,
          isOn: false,
          color: Colors.yellow),
      DeviceInfo(
          name: 'Blinds',
          icon: Icons.blinds,
          isOn: false,
          color: Colors.purple),
      DeviceInfo(
          name: 'Smart Vacuum',
          icon: Icons.cleaning_services,
          isOn: true,
          color: Colors.green),
    ],
    'Bedroom': [
      DeviceInfo(
          name: 'Air conditioner',
          icon: Icons.ac_unit,
          isOn: true,
          color: Colors.lightBlue),
      DeviceInfo(
          name: 'Blinds',
          icon: Icons.blinds,
          isOn: false,
          color: Colors.purple),
      DeviceInfo(
          name: 'Bedroom Speakers',
          icon: Icons.speaker,
          isOn: true,
          color: Colors.red),
      DeviceInfo(
          name: 'Bedroom Alarm',
          icon: Icons.alarm,
          isOn: true,
          color: Colors.purple),
      DeviceInfo(
          name: 'Bedside Lamp',
          icon: Icons.lightbulb_outline,
          isOn: false,
          color: Colors.yellow),
    ],
    'Bathroom': [
      DeviceInfo(
          name: 'Floor Heater',
          icon: Icons.heat_pump,
          isOn: false,
          color: Colors.red),
      DeviceInfo(
          name: 'Bathroom Speaker',
          icon: Icons.speaker,
          isOn: false,
          color: Colors.red),
      DeviceInfo(
          name: 'Shower', icon: Icons.shower, isOn: true, color: Colors.cyan),
      DeviceInfo(
          name: 'Thermostat',
          icon: Icons.thermostat,
          isOn: true,
          color: Colors.blue),
      DeviceInfo(
          name: 'Bathroom Lighting',
          icon: Icons.lightbulb_outline,
          isOn: true,
          color: Colors.yellow),
    ],
    'Kitchen': [
      DeviceInfo(
          name: 'Refrigerator',
          icon: Icons.kitchen,
          isOn: true,
          color: Colors.blue),
      DeviceInfo(
          name: 'Dish Washer',
          icon: Icons.countertops,
          isOn: false,
          color: Colors.green),
      DeviceInfo(
          name: 'Oven',
          icon: Icons.microwave,
          isOn: false,
          color: Colors.orange),
      DeviceInfo(
          name: 'Microwave',
          icon: Icons.microwave,
          isOn: false,
          color: Colors.red),
      DeviceInfo(
          name: 'Coffee Machine',
          icon: Icons.coffee,
          isOn: false,
          color: Colors.brown),
      DeviceInfo(
          name: 'Light',
          icon: Icons.lightbulb_outline,
          isOn: true,
          color: Colors.yellow),
    ],
    'Garage': [
      DeviceInfo(
          name: 'Outdoor Sensor',
          icon: Icons.sensors,
          isOn: true,
          color: Colors.red),
      DeviceInfo(
          name: 'EV Charger',
          icon: Icons.electric_car,
          isOn: true,
          color: Colors.green),
      DeviceInfo(
          name: 'Garage Camera',
          icon: Icons.camera_outdoor,
          isOn: true,
          color: Colors.purple),
      DeviceInfo(
          name: 'Garage Door',
          icon: Icons.garage,
          isOn: true,
          color: Colors.brown),
      DeviceInfo(
          name: 'Garage Lighting',
          icon: Icons.lightbulb_outline,
          isOn: false,
          color: Colors.yellow),
    ],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Devices',
                style: GoogleFonts.lato(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Container(
              height: 40,
              margin: const EdgeInsets.only(bottom: 16),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: roomDevices.length,
                itemBuilder: (context, index) {
                  final room = roomDevices.keys.elementAt(index);
                  return GestureDetector(
                    onTap: () => setState(() => currentRoom = room),
                    child: Container(
                      margin: const EdgeInsets.only(right: 32),
                      child: Text(
                        room,
                        style: GoogleFonts.lato(
                          fontSize: 16,
                          fontWeight: currentRoom == room
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color:
                              currentRoom == room ? Colors.black : Colors.grey,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: Row(
                      children: [
                        const Icon(Icons.grid_view,
                            color: Colors.white, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          'Grid',
                          style: GoogleFonts.lato(
                              color: Colors.white, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: Row(
                      children: [
                        Icon(Icons.layers_outlined,
                            color: Colors.grey.shade600, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          'Floor',
                          style: GoogleFonts.lato(
                              color: Colors.grey.shade600, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => const AddDeviceScreen(),
                        ),
                      );
                    },
                    child: Row(
                      children: [
                        Text(
                          'To add more devices',
                          style: GoogleFonts.lato(color: Colors.grey.shade600),
                        ),
                        Icon(Icons.arrow_forward,
                            color: Colors.grey.shade600, size: 16),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                itemCount: roomDevices[currentRoom]!.length,
                itemBuilder: (context, index) {
                  final device = roomDevices[currentRoom]![index];
                  return DeviceCard(device: device);
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.flash_on), label: 'Devices'),
          BottomNavigationBarItem(
              icon: Icon(Icons.lightbulb_outline), label: 'Scenes'),
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.mic), label: 'Voice'),
          BottomNavigationBarItem(
              icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}

class DeviceInfo {
  final String name;
  final IconData icon;
  final bool isOn;
  final Color color;

  DeviceInfo({
    required this.name,
    required this.icon,
    required this.isOn,
    required this.color,
  });
}

class DeviceCard extends StatelessWidget {
  final DeviceInfo device;

  const DeviceCard({Key? key, required this.device}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: device.isOn ? Colors.white : Colors.black,
        borderRadius: BorderRadius.circular(16),
        border: device.isOn ? Border.all(color: Colors.grey.shade300) : null,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            device.icon,
            color: device.isOn ? device.color : Colors.white,
            size: 24,
          ),
          const SizedBox(height: 8),
          Flexible(
            child: Text(
              device.name,
              style: GoogleFonts.lato(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: device.isOn ? Colors.black : Colors.white,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            device.isOn ? 'On' : 'Off',
            style: GoogleFonts.lato(
              fontSize: 14,
              color: device.isOn ? Colors.grey.shade600 : Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
