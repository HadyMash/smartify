import 'package:flutter/material.dart';

class MFASetupCompleteScreen extends StatelessWidget {
  const MFASetupCompleteScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Back Button
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Title and Description
              const Text(
                'Setup Confirmation',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Your MFA setup is complete! Your account is now secured with an extra layer of security.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Green Tick Icon (HUGE and centered)
              const Center(
                child: Icon(
                  Icons.check_circle,
                  color: Colors.green,
                  size: 200, // HUGE size for the tick
                ),
              ),
              const Spacer(), // Pushes the button to the bottom

              // Finish Button (aligned with other pages)
              ElevatedButton(
                onPressed: () {
                  // Navigate to the home screen or any other screen
                  Navigator.of(context).popUntil((route) => route.isFirst);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Finish',
                  style: TextStyle(color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}