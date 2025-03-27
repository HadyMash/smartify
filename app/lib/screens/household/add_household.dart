import 'package:flutter/material.dart';
import 'package:smartify/screens/household/configure_floor.dart';

class AddHouseholdScreen extends StatefulWidget {
  const AddHouseholdScreen({super.key});

  @override
  _AddHouseholdScreenState createState() => _AddHouseholdScreenState();
}

class _AddHouseholdScreenState extends State<AddHouseholdScreen> {
  final TextEditingController _nameController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _navigateToConfigureFloors() {
    final householdName = _nameController.text.trim();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            ConfigureFloorsScreen(householdName: householdName),
      ),
    );
  }

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
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    'Add Household',
                    style: textTheme.displayMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              Text('Enter Household Details', style: textTheme.titleLarge),
              const SizedBox(height: 24),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Household Name'),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _navigateToConfigureFloors,
                  child: const Text(
                    'Add Household',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
