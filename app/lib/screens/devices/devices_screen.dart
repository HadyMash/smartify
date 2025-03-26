import 'package:flutter/material.dart';
import 'add_device_screen.dart';
import '../models/device_info.dart';
import '../models/device_examples.dart';
import 'device_management_screen.dart';
import '../routines_screen.dart';
import '../dashboard_screen.dart';
import '../security_screen.dart';
import '../responsive_helper.dart';

class DevicesScreen extends StatefulWidget {
  final Map<String, String>? newDevice;

  const DevicesScreen({Key? key, this.newDevice}) : super(key: key);

  // Static map to persist devices across instances
  static Map<String, List<DeviceInfo>> roomDevices = {
    'Living Room': [
      DeviceInfo(name: 'Smart TV', icon: Icons.tv, isOn: true, color: Colors.blue),
      DeviceInfo(name: 'Speakers', icon: Icons.speaker, isOn: true, color: Colors.red),
      DeviceInfo(name: 'Air Conditioner', icon: Icons.ac_unit, isOn: true, color: Colors.lightBlue),
      DeviceInfo(name: 'Light', icon: Icons.lightbulb_outline, isOn: false, color: Colors.yellow),
      DeviceInfo(name: 'Blinds', icon: Icons.blinds, isOn: false, color: Colors.purple),
      DeviceInfo(name: 'Smart Vacuum', icon: Icons.cleaning_services, isOn: true, color: Colors.green),
    ],
    'Bedroom': [
      DeviceInfo(name: 'Air conditioner', icon: Icons.ac_unit, isOn: true, color: Colors.lightBlue),
      DeviceInfo(name: 'Blinds', icon: Icons.blinds, isOn: false, color: Colors.purple),
      DeviceInfo(name: 'Speaker', icon: Icons.speaker, isOn: true, color: Colors.red),
      DeviceInfo(name: 'Bedroom Alarm', icon: Icons.alarm, isOn: true, color: Colors.purple),
      DeviceInfo(name: 'Light', icon: Icons.lightbulb_outline, isOn: false, color: Colors.yellow),
    ],
      'Bathroom': [
      DeviceInfo(name: 'Floor Heater', icon: Icons.heat_pump, isOn: false, color: Colors.red),
      DeviceInfo(name: 'Speaker', icon: Icons.speaker, isOn: false, color: Colors.red),
      DeviceInfo(name: 'Shower', icon: Icons.shower, isOn: true, color: Colors.cyan),
      DeviceInfo(name: 'Air Conditioner', icon: Icons.ac_unit, isOn: true, color: Colors.blue),
      DeviceInfo(name: 'Light', icon: Icons.lightbulb_outline, isOn: true, color: Colors.yellow),
    ],
    'Kitchen': [
      DeviceInfo(name: 'Refrigerator', icon: Icons.kitchen, isOn: true, color: Colors.blue),
      DeviceInfo(name: 'Stove', icon: Icons.microwave, isOn: false, color: Colors.orange),
      DeviceInfo(name: 'Microwave', icon: Icons.microwave, isOn: false, color: Colors.red),
      DeviceInfo(name: 'Coffee Machine', icon: Icons.coffee, isOn: false, color: Colors.brown),
      DeviceInfo(name: 'Light', icon: Icons.lightbulb_outline, isOn: true, color: Colors.yellow),
    ],
    'Garage': [
      DeviceInfo(name: 'Outdoor Sensor', icon: Icons.sensors, isOn: true, color: Colors.red),
      DeviceInfo(name: 'EV Charger', icon: Icons.electric_car, isOn: true, color: Colors.green),
      DeviceInfo(name: 'Garage Door', icon: Icons.garage, isOn: true, color: Colors.brown),
      DeviceInfo(name: 'Light', icon: Icons.lightbulb_outline, isOn: false, color: Colors.yellow),
    ],
  };

  @override
  State<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends State<DevicesScreen> {
  String currentRoom = "Living Room";

  @override
  void initState() {
    super.initState();
    // Add the new device if provided
    if (widget.newDevice != null) {
      addDevice(
        widget.newDevice!['deviceName']!,
        widget.newDevice!['location']!,
        _getIconForDevice(widget.newDevice!['deviceName']!),
        _getColorForDevice(widget.newDevice!['deviceName']!),
      );
    }
  }

  void addDevice(String deviceName, String location, IconData icon, Color color) {
    setState(() {
      DevicesScreen.roomDevices.putIfAbsent(location, () => []);
      // Check if the device already exists to avoid duplicates (optional)
      if (!DevicesScreen.roomDevices[location]!.any((d) => d.name == deviceName)) {
        DevicesScreen.roomDevices[location]!.add(
          DeviceInfo(
            name: deviceName,
            icon: icon,
            isOn: false,
            color: color,
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: isDesktop 
            ? _buildDesktopLayout(context)
            : _buildMobileLayout(context),
      ),
      bottomNavigationBar: isDesktop 
          ? null 
          : CustomNavBar(
              currentIndex: 1,
              onTap: (index) {
                if (index == 2) {
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const DashboardScreen()));
                } else if (index == 3) {
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const SecurityScreen()));
                }
              },
            ),
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Row(
      children: [
        // Sidebar
        Container(
          width: 240,
          height: double.infinity,
          decoration: BoxDecoration(
            color: Colors.grey[100],
            border: Border(
              right: BorderSide(color: Colors.grey[300]!),
            ),
          ),
          child: Column(
            children: [
              // App title
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    Icon(Icons.home, size: 24),
                    const SizedBox(width: 12),
                    Text(
                      'Smart Home',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Navigation items
              _buildSidebarItem(context, Icons.bolt, 'Energy', false),
              _buildSidebarItem(context, Icons.lightbulb, 'Devices', true),
              _buildSidebarItem(context, Icons.home, 'Home', false, onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const DashboardScreen(),
                  ),
                );
              }),
              _buildSidebarItem(context, Icons.security, 'Security', false, onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const SecurityScreen(),
                  ),
                );
              }),
              _buildSidebarItem(context, Icons.settings, 'Settings', false),
            ],
          ),
        ),
        
        // Main content
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    Text(
                      'Devices',
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const RoutinesScreen()));
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.home_outlined, size: 18),
                            const SizedBox(width: 8),
                            Text('View Routines', style: TextStyle(fontSize: 16, color: Colors.black)),
                            const Icon(Icons.chevron_right, size: 18),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Room tabs
              Container(
                height: 50,
                margin: const EdgeInsets.only(bottom: 24),
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: DevicesScreen.roomDevices.length,
                  itemBuilder: (context, index) {
                    final room = DevicesScreen.roomDevices.keys.elementAt(index);
                    return GestureDetector(
                      onTap: () => setState(() => currentRoom = room),
                      child: Container(
                        margin: const EdgeInsets.only(right: 32),
                        child: Text(
                          room,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: currentRoom == room ? FontWeight.bold : FontWeight.normal,
                            color: currentRoom == room ? Colors.black : Colors.grey,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              
              // View options and add button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(20)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          const Icon(Icons.grid_view, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
                          Text('Grid', style: TextStyle(color: Colors.white, fontSize: 16)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Container(
                      decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(20)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          Icon(Icons.layers_outlined, color: Colors.grey.shade600, size: 18),
                          const SizedBox(width: 8),
                          Text('Floor', style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
                        ],
                      ),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () async {
                        await Navigator.of(context).push(
                          MaterialPageRoute(builder: (context) => const AddDeviceScreen()),
                        );
                      },
                      child: Row(
                        children: [
                          Text('Add more devices', style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
                          Icon(Icons.arrow_forward, color: Colors.grey.shade600, size: 18),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              // Devices grid
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 4,
                      crossAxisSpacing: 24,
                      mainAxisSpacing: 24,
                      childAspectRatio: 1.2,
                    ),
                    itemCount: DevicesScreen.roomDevices[currentRoom]!.length,
                    itemBuilder: (context, index) {
                      final device = DevicesScreen.roomDevices[currentRoom]![index];
                      return DeviceCard(device: device, currentRoom: currentRoom);
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSidebarItem(BuildContext context, IconData icon, String label, bool isActive, {VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          color: isActive ? Colors.grey[200] : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: Colors.black,
            ),
            const SizedBox(width: 16),
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                color: Colors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Mobile layout - keeping exactly the same as original
  Widget _buildMobileLayout(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Text(
                'Devices',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const RoutinesScreen()));
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.home_outlined, size: 16),
                      const SizedBox(width: 4),
                      Text('View Routines', style: TextStyle(fontSize: 14, color: Colors.black)),
                      const Icon(Icons.chevron_right, size: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        Container(
          height: 40,
          margin: const EdgeInsets.only(bottom: 16),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: DevicesScreen.roomDevices.length,
            itemBuilder: (context, index) {
              final room = DevicesScreen.roomDevices.keys.elementAt(index);
              return GestureDetector(
                onTap: () => setState(() => currentRoom = room),
                child: Container(
                  margin: const EdgeInsets.only(right: 32),
                  child: Text(
                    room,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: currentRoom == room ? FontWeight.bold : FontWeight.normal,
                      color: currentRoom == room ? Colors.black : Colors.grey,
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
                decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(20)),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: Row(
                  children: [
                    const Icon(Icons.grid_view, color: Colors.white, size: 16),
                    const SizedBox(width: 4),
                    Text('Grid', style: TextStyle(color: Colors.white, fontSize: 14)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(20)),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: Row(
                  children: [
                    Icon(Icons.layers_outlined, color: Colors.grey.shade600, size: 16),
                    const SizedBox(width: 4),
                    Text('Floor', style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
                  ],
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () async {
                  await Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const AddDeviceScreen()),
                  );
                },
                child: Row(
                  children: [
                    Text('Add more devices', style: TextStyle(color: Colors.grey.shade600)),
                    Icon(Icons.arrow_forward, color: Colors.grey.shade600, size: 16),
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
            itemCount: DevicesScreen.roomDevices[currentRoom]!.length,
            itemBuilder: (context, index) {
              final device = DevicesScreen.roomDevices[currentRoom]![index];
              return DeviceCard(device: device, currentRoom: currentRoom);
            },
          ),
        ),
      ],
    );
  }

  IconData _getIconForDevice(String deviceName) {
    switch (deviceName.toLowerCase()) {
      case 'alexa':
      case 'amazon echo':
        return Icons.speaker;
      case 'samsung':
        return Icons.tv;
      case 'security camera':
        return Icons.camera_outdoor;
      case 'kitchen bulb':
        return Icons.lightbulb_outline;
      case 'smart plug':
        return Icons.power;
      case 'smart purifier':
        return Icons.air;
      default:
        return Icons.devices_other;
    }
  }

  Color _getColorForDevice(String deviceName) {
    switch (deviceName.toLowerCase()) {
      case 'alexa':
      case 'amazon echo':
        return Colors.blue;
      case 'samsung':
        return Colors.indigo;
      case 'security camera':
        return Colors.red;
      case 'kitchen bulb':
        return Colors.yellow;
      case 'smart plug':
        return Colors.green;
      case 'smart purifier':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }
}

class DeviceCard extends StatelessWidget {
  final DeviceInfo device;
  final String currentRoom;

  const DeviceCard({
    Key? key,
    required this.device,
    required this.currentRoom,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DeviceManagementScreen(
              device: device,
              room: currentRoom,
              capabilities: DeviceExamples.getDeviceCapabilities(device.name),
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade300),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(device.icon, color: device.color, size: 24),
            const SizedBox(height: 8),
            Flexible(
              child: Text(
                device.name,
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CustomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const CustomNavBar({super.key, required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        backgroundColor: Colors.white,
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.black,
        type: BottomNavigationBarType.fixed,
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
          gradient: const LinearGradient(colors: [Colors.black, Colors.black87], begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Icon(icon, color: Colors.white, size: 24),
      ),
      label: label,
    );
  }
}