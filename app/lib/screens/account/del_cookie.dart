import 'package:flutter/material.dart';
import 'package:smartify/services/auth.dart'; // Import your AuthService

class SignOutScreen extends StatelessWidget {
  final Future<AuthService> _authService =
      AuthService.create(); // Use the factory method

  SignOutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Out'),
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            try {
              // Get the AuthService instance
              final authService = await _authService;

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
                SnackBar(content: Text('Failed to sign out: ${e.toString()}')),
              );
            }
          },
          child: const Text('Sign Out'),
        ),
      ),
    );
  }
}
