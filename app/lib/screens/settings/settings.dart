import 'package:flutter/material.dart';
import 'profile_screen.dart';
import 'package:smartify/services/auth.dart';

class SettingsScreen extends StatelessWidget {
  final AuthService authService;
  const SettingsScreen({super.key, required this.authService});

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
              Text(
                'Settings',
                style: textTheme.displayMedium,
              ),
              const SizedBox(height: 32),

              // Profile Avatar
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Colors.black,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.person,
                        color: Colors.white,
                        size: 40,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Batman',
                      style: textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'batman@gmail.com',
                      style: textTheme.bodyMedium?.copyWith(
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Settings List
              _buildSettingsTile(
                context,
                'Profile',
                Icons.person_outline,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ProfileDetailsScreen(),
                    ),
                  );
                },
              ),
              _buildSettingsTile(
                context,
                'Push Notifications',
                Icons.notifications_none,
                isSwitch: true,
              ),
              _buildSettingsTile(
                context,
                'Support',
                Icons.help_outline,
                onTap: () {
                  // Navigate to support
                },
              ),
              _buildSettingsTile(
                context,
                'Sign out',
                Icons.logout,
                onTap: () async {
                  try {
                    // Get the AuthService instance
                    // Call the signOut method from AuthService
                    await authService.signOut();

                    // Show a success message
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Signed out successfully')),
                    );

                    // Navigate to the login screen or another appropriate screen
                    Navigator.pushReplacementNamed(context, '/login');
                  } catch (e) {
                    // Show an error message if sign-out fails
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text('Failed to sign out: ${e.toString()}')),
                    );
                  } // Handle sign out
                },
              ),
              _buildSettingsTile(
                context,
                'Delete account',
                Icons.delete_outline,
                textColor: Colors.red,
                onTap: () {
                  // Navigate to delete account
                },
              ),
              _buildSettingsTile(
                context,
                'Manage my household',
                Icons.home_outlined,
                onTap: () {
                  // Navigator.push(
                  //   context,
                  //   MaterialPageRoute(
                  //     builder: (context) => const HouseholdScreen(),
                  //   ),
                  // );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsTile(
    BuildContext context,
    String title,
    IconData icon, {
    VoidCallback? onTap,
    bool isSwitch = false,
    Color? textColor,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(
        title,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: isSwitch
          ? Switch(
              value: true,
              onChanged: (value) {
                // Handle switch change
              },
            )
          : const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }
}
