import 'package:flutter/material.dart';
import '/widgets/back_button.dart';

class EditMemberScreen extends StatefulWidget {
  const EditMemberScreen({super.key});

  @override
  State<EditMemberScreen> createState() => _EditMemberScreenState();
}

class _EditMemberScreenState extends State<EditMemberScreen> {
  String? _selectedRole = 'Admin';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 16),
                  Text(
                    'Edit Member',
                    style: textTheme.displayMedium,
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Permissions Section
              ListTile(
                title: Text(
                  'Permissions',
                  style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
                ),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  // Handle permissions tap
                },
              ),

              // Role Selection
              ListTile(
                title: Text(
                  'Role',
                  style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
                ),
                trailing: DropdownButton<String>(
                  value: _selectedRole,
                  items: ['Admin', 'Dweller'].map((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value),
                    );
                  }).toList(),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedRole = newValue;
                    });
                  },
                ),
              ),

              // Remove Member Button
              const SizedBox(height: 32),
              ListTile(
                title: Text(
                  'Remove member',
                  style: textTheme.bodyLarge?.copyWith(
                    color: Colors.red,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                onTap: () {
                  // Handle remove member
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}