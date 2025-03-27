import 'package:flutter/material.dart';
import '/widgets/back_button.dart';

class ProfileDetailsScreen extends StatelessWidget {
  const ProfileDetailsScreen({super.key});

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
              // Header with back button
              Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 16),
                  Text(
                    'Profile',
                    style: textTheme.displayMedium,
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Profile Details Section
              Text(
                'Profile details',
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 16),

              // First Name Card
              _buildProfileCard(
                'Bruce',
                onTap: () {
                  // Handle first name edit
                },
              ),
              const SizedBox(height: 12),

              // Last Name Card
              _buildProfileCard(
                'Wayne',
                onTap: () {
                  // Handle last name edit
                },
              ),
              const SizedBox(height: 12),

              // Date of Birth Card
              _buildProfileCard(
                '19 December 2024',
                trailing: const Icon(Icons.calendar_today, size: 20),
                onTap: () {
                  // Handle date selection
                },
              ),
              const SizedBox(height: 12),

              // Email Card
              _buildProfileCard(
                'batman@gmail.com',
                onTap: () {
                  // Handle email edit
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(
    String text, {
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 8,
        ),
        title: Text(
          text,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
          ),
        ),
        trailing: trailing ?? const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
