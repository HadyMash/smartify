import 'package:flutter/material.dart';
import 'package:smartify/household_invites.dart';
import 'package:smartify/screens/household/add_household.dart';
import 'package:smartify/services/auth.dart'; // Assuming you are using this service
import 'package:provider/provider.dart';

class GetStartedScreen extends StatelessWidget {
  final AuthService authService; // Add the AuthService

  const GetStartedScreen(
      {super.key, required this.authService}); // Update constructor

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final authService = Provider.of<AuthService>(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  
                  const SizedBox(width: 16),
                  Text(
                    'Get Started',
                    style: textTheme.displayMedium,
                  ),
                ],
              ),
              const SizedBox(height: 48),

              // House Icon
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Icon(
                    Icons.home_outlined,
                    size: 40,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Description Text
              Center(
                child: Text(
                  'Get started by creating your own household or joining an existing one with an invite!',
                  textAlign: TextAlign.center,
                  style: textTheme.bodyLarge,
                ),
              ),
              const SizedBox(height: 32),

              // Create Household Button
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  leading: Icon(
                    Icons.add_home_outlined,
                    color: theme.colorScheme.onSurface,
                  ),
                  title: Text(
                    'Create Household',
                    style: textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  trailing: Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: theme.colorScheme.onSurface,
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            const AddHouseholdScreen(), // Pass authService
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),

              // Join Household Button
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  leading: Icon(
                    Icons.group_add_outlined,
                    color: theme.colorScheme.onSurface,
                  ),
                  title: Text(
                    'Join Household',
                    style: textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  trailing: Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: theme.colorScheme.onSurface,
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => HouseholdInvitesScreen(
                            authService: authService), // Pass authService
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
