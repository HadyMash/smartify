import 'package:flutter/material.dart';
import 'qr_setup_screen.dart';

class CreateAccountScreen extends StatefulWidget {
  @override
  _CreateAccountScreenState createState() => _CreateAccountScreenState();
}

class _CreateAccountScreenState extends State<CreateAccountScreen> {
  final TextEditingController emailController = TextEditingController();w
  final TextEditingController passwordController = TextEditingController();

  String? gender;
  String? selectedMonth;
  String? selectedYear;

  final List<String> months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text("Create Account")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gender Field
            Text(
              "What’s your gender? (optional)",
              style: textTheme.bodyLarge,
            ),
            Row(
              children: [
                Expanded(
                  child: RadioListTile<String>(
                    title: const Text("Male"),
                    value: "Male",
                    groupValue: gender,
                    onChanged: (value) {
                      setState(() {
                        gender = value;
                      });
                    },
                  ),
                ),
                Expanded(
                  child: RadioListTile<String>(
                    title: const Text("Female"),
                    value: "Female",
                    groupValue: gender,
                    onChanged: (value) {
                      setState(() {
                        gender = value;
                      });
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Date of Birth Field
            Text(
              "What’s your date of birth?",
              style: textTheme.bodyLarge,
            ),
            Row(
              children: [
                // Month Dropdown
                Expanded(
                  child: DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: "Month",
                      border: OutlineInputBorder(),
                    ),
                    items: months.map((month) {
                      return DropdownMenuItem(
                        value: month,
                        child: Text(month),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        selectedMonth = value;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 10),

                // Year Dropdown
                Expanded(
                  child: DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: "Year",
                      border: OutlineInputBorder(),
                    ),
                    items: List.generate(100, (index) {
                      final year = (2025 - index).toString();
                      return DropdownMenuItem(
                        value: year,
                        child: Text(year),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        selectedYear = value;
                      });
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Sign Up Button
            Center(
            child: ElevatedButton(
            onPressed: () {
              print("Email: ${emailController.text}");
              print("Password: ${passwordController.text}");
              print("Gender: $gender");
              print("DOB: $selectedMonth $selectedYear");

      // Navigate to QRSetupScreen
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => QRSetupScreen()),
      );
    },
    style: ElevatedButton.styleFrom(
      padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 80),
      backgroundColor: colorScheme.secondary,
      foregroundColor: colorScheme.onSecondary,
    ),
    child: const Text("Sign up"),
  ),
),

            Center(
              child: Text(
                "By creating an account, you agree to the Terms of use and Privacy Policy.",
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium?.copyWith(fontSize: 12),
              ),
            ),
            const SizedBox(height: 20),

            Center(
              child: TextButton(
                onPressed: () {
                  // Navigate to Sign In
                },
                child: Text(
                  "Already have an Account? Sign In",
                  style: textTheme.bodyMedium?.copyWith(
                    color: colorScheme.primary,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}