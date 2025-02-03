import 'package:flutter/material.dart';
import 'confirm_password.dart';

class CreateNewPasswordScreen extends StatelessWidget {
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Create New Password")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Your new password must be unique from those previously used.",
              style: Theme.of(context).textTheme.bodyLarge, // Use app theme text style
            ),
            const SizedBox(height: 16),

            // Password Field
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: InputDecoration(
                hintText: "Create password",
              ),
            ),
            const SizedBox(height: 16),

            // Confirm Password Field
            TextField(
              controller: confirmPasswordController,
              obscureText: true,
              decoration: InputDecoration(
                hintText: "Confirm password",
              ),
            ),
          ],
        ),
      ),

      // Themed ElevatedButton in bottomNavigationBar
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => PasswordChangedScreen()),
            );
          },
          child: const Text("Confirm"),
        ),
      ),
    );
  }
}