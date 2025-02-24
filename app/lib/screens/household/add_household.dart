import 'package:flutter/material.dart';
import 'package:smartify/screens/household/configure_floor.dart';

class AddHouseholdScreen extends StatelessWidget {
  const AddHouseholdScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Add Household', style: textTheme.headlineMedium),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Enter Household Details', style: textTheme.titleLarge),
            const SizedBox(height: 24),
            const TextField(
              decoration: InputDecoration(labelText: 'Household Type'),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(labelText: 'Status'),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(labelText: 'Address'),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const ConfigureFloorsScreen()),
                );
              },
              child: const Text('Add Household'),
            ),
          ],
        ),
      ),
    );
  }
}
