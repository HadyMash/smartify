import 'package:flutter/material.dart';
import 'package:smartify/screens/household/configure_floor.dart';
import 'package:smartify/services/household.dart'; // Import HouseholdService
// Import AuthService

class AddHouseholdScreen extends StatefulWidget {
  const AddHouseholdScreen({
    super.key,
  });

  @override
  _AddHouseholdScreenState createState() => _AddHouseholdScreenState();
}

class _AddHouseholdScreenState extends State<AddHouseholdScreen> {
  final TextEditingController _nameController = TextEditingController();
  bool _isLoading = false;

  // Function to create a household
  Future<void> _createHousehold() async {
    final String householdName = _nameController.text.trim();
    if (householdName.isEmpty) {
      _showError("Household name cannot be empty");
      return;
    }

    setState(() {
      _isLoading = true;
    });

    //final userId = await widget.authService.getUserId(); // Retrieve user ID
    final result = await HouseholdService.createHousehold(householdName);

    setState(() {
      _isLoading = false;
    });

    if (result['success']) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const ConfigureFloorsScreen(),
        ),
      );
    } else {
      _showError(result['message']);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content: Text(message, style: const TextStyle(color: Colors.white)),
          backgroundColor: Colors.red),
    );
  }

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
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Household Name'),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isLoading ? null : _createHousehold,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Add Household'),
            ),
          ],
        ),
      ),
    );
  }
}
