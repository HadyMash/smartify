import 'package:flutter/material.dart';
import 'package:smartify/screens/household/household_screen.dart';
import 'package:smartify/screens/household/add_household.dart';
import 'package:smartify/household_invites.dart';
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
              _buildSettingsCard(
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
              _buildSettingsCard(
                context,
                'Manage my household',
                Icons.home_outlined,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const HouseholdScreen(),
                    ),
                  );
                },
              ),
              _buildSettingsCard(
                context,
                'Create household',
                Icons.add_home_outlined,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const AddHouseholdScreen(),
                    ),
                  );
                },
              ),
              _buildSettingsCard(
                context,
                'View invites',
                Icons.mail_outline,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => HouseholdInvitesScreen(
                        authService: authService,
                      ),
                    ),
                  );
                },
              ),
              _buildSettingsCard(
                context,
                'Sign out',
                Icons.logout,
                onTap: () async {
                  try {
                    await authService.signOut();
                    ScaffoldMessenger.of(context)
                        .showSnackBar(
                          const SnackBar(
                              content: Text('Signed out successfully')),
                        )
                        .closed
                        .then((_) {
                      Navigator.pushReplacementNamed(context, '/login');
                    });
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to sign out: $e')),
                    );
                  }
                },
              ),
              _buildSettingsCard(
                context,
                'Delete account',
                Icons.delete_outline,
                textColor: Colors.red,
                onTap: () {
                  // Placeholder for delete account logic
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsCard(
    BuildContext context,
    String title,
    IconData icon, {
    required VoidCallback? onTap,
    Color? textColor,
  }) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 8.0),
      child: ListTile(
        leading: Icon(icon),
        title: Text(
          title,
          style: TextStyle(
            color: textColor ?? Theme.of(context).textTheme.bodyLarge?.color,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
