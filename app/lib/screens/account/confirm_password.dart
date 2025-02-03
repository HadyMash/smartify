import 'package:flutter/material.dart';
// import '../../widgets/custom_button.dart';
// import '../../widgets/screen_layout.dart';

class PasswordChangedScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("PASSWORD CHANGED!"),
      ),
      body: Center( // Wrap Column in Center to prevent layout issues
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.check_circle, size: 100, color: Colors.green),
              const SizedBox(height: 16),
              Text(
                "Your password has been changed successfully.",
                style: Theme.of(context).textTheme.displayMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Sign In Button
              ElevatedButton(
                onPressed: () {
                  Navigator.popUntil(context, (route) => route.isFirst);
                },
                child: const Text("Back to Sign In"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
