import 'package:flutter/material.dart';
import 'package:smartify/screens/household/configure_room.dart';
import '/widgets/back_button.dart';
// import 'add_room.dart';
// import 'edit_room.dart';

class RoomsScreen extends StatelessWidget {
  const RoomsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 16),
                  Text(
                    'Rooms',
                    style: textTheme.displayMedium,
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ConfigureRoomScreen()),
                      );
                    },
                    child: Text(
                      '+ Add Room',
                      style: textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.secondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              Expanded(
                child: ListView(
                  children: [
                    _buildRoomTile(
                      context,
                      'Master Bedroom',
                      'First Floor, 5 Devices',
                    ),
                    _buildRoomTile(
                      context,
                      'Kitchen',
                      'Ground Floor, 7 Devices',
                    ),
                    _buildRoomTile(
                      context,
                      'Living Room',
                      'Ground Floor, 3 Devices',
                    ),
                    _buildRoomTile(
                      context,
                      'Study Room',
                      'Ground Floor, 4 Devices',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoomTile(BuildContext context, String name, String details) {
    return ListTile(
      title: Text(name),
      subtitle: Text(details),
      trailing: IconButton(
        icon: const Icon(Icons.edit),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ConfigureRoomScreen()),
          );
        },
      ),
    );
  }
}