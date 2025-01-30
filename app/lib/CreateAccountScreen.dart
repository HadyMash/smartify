import 'package:flutter/material.dart';
import 'custom_text_field.dart'; 

class CreateAccountScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final List<String> months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  String? selectedMonth;
  String? selectedYear;
  String gender = '';

  CreateAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    TextTheme textTheme = Theme.of(context).textTheme;
    ColorScheme colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 0, // No app bar visible
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            const SizedBox(height: 20),
            Center(
              child: Text(
                "Create An Account",
                style: textTheme.displayMedium,
              ),
            ),
            const SizedBox(height: 20),

            // Email Field
            CustomTextField(
              label: "Email",
              prefixIcon: Icons.email,
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 20),

            // Password Field
            CustomTextField(
              label: "Password",
              prefixIcon: Icons.lock,
              isPassword: true,
              controller: passwordController,
            ),
            const SizedBox(height: 10),

            // Password requirements
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text("• Use 8 or more characters"),
                Text("• Use upper and lower case letters (e.g. Aa)"),
                Text("• Use a number (e.g. 1234)"),
              ],
            ),
            const SizedBox(height: 20),

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
                      gender = value!;
                    },
                  ),
                ),
                Expanded(
                  child: RadioListTile<String>(
                    title: const Text("Female"),
                    value: "Female",
                    groupValue: gender,
                    onChanged: (value) {
                      gender = value!;
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
                    decoration: InputDecoration(
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
                      selectedMonth = value;
                    },
                  ),
                ),
                const SizedBox(width: 10),

                // Year Dropdown
                Expanded(
                  child: DropdownButtonFormField<String>(
                    decoration: InputDecoration(
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
                      selectedYear = value;
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
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                      vertical: 15, horizontal: 80),
                  backgroundColor: colorScheme.secondary,
                  foregroundColor: colorScheme.onSecondary,
                ),
                child: const Text("Sign up"),
              ),
            ),
            const SizedBox(height: 20),

            
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

// CustomTextField widget reused
class CustomTextField extends StatelessWidget {
  final String label;
  final IconData? prefixIcon;
  final bool isPassword;
  final TextEditingController? controller;
  final TextInputType keyboardType;

  const CustomTextField({
    Key? key,
    required this.label,
    this.prefixIcon,
    this.isPassword = false,
    this.controller,
    this.keyboardType = TextInputType.text,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;

    return TextField(
      controller: controller,
      obscureText: isPassword,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: textTheme.bodyLarge?.copyWith(color: colorScheme.onSurface),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        prefixIcon: prefixIcon != null
            ? Icon(prefixIcon, color: colorScheme.onSurface)
            : null,
      ),
    );
  }
}
