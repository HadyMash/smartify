import 'package:flutter/material.dart';
import 'package:smartify/CreateAccountScreen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: SignInScreen(),
    );
  }
}

class SignInScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    TextTheme textTheme = Theme.of(context).textTheme;
    ColorScheme colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: colorScheme.primary,
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Profile Icon
            CircleAvatar(
              radius: 50,
              backgroundColor: colorScheme.surface,
              child: Icon(Icons.person, size: 50, color: colorScheme.surface),
            ),
            const SizedBox(height: 20),
            
            // Sign In Text
            Text(
              "Sign In",
              style: textTheme.displayLarge,
            ),
            const SizedBox(height: 30),
            
            // Email Field
            TextField(
              decoration: InputDecoration(
                labelText: "Email",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
            ),
            const SizedBox(height: 20),
            
            // Password Field
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: "Password",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.lock),
                suffixIcon: Icon(Icons.visibility_off),
              ),
            ),
            const SizedBox(height: 10),
            
            // Remember Me and Forgot Password Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Checkbox(value: false, onChanged: (value) {}),
                    const Text("Remember me"),
                  ],
                ),
                TextButton(
                  onPressed: () {},
                  child: Text(
                    "Forgot Password?",
                    style: textTheme.bodyMedium,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Sign In Button
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 80),
                backgroundColor: colorScheme.secondary,
                foregroundColor: colorScheme.onSecondary,
              ),
              child: const Text("Sign in", style: TextStyle(fontSize: 16)),
            ),
            const SizedBox(height: 20),
            
            // Or sign in with Text
            Text("Or sign in with", style: textTheme.bodyMedium),
            const SizedBox(height: 10),
           
          OutlinedButton.icon(
            onPressed: () {},
            icon: Icon(
              Icons.account_circle, 
              size: 20,
              color: colorScheme.onPrimary, 
            ),
            label: const Text("Continue with Google"),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 30),
              foregroundColor: Colors.black,
            ),
          ),
Row(
  mainAxisAlignment: MainAxisAlignment.center,
  children: [
    Text("Don’t have an account? "),
    TextButton(
      onPressed: () {
        // Navigate to CreateAccountScreen
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => CreateAccountScreen(),
          ),
        );
      },
      child: Text(
        "Sign up",
        style: textTheme.bodyMedium?.copyWith(color: colorScheme.primary),
      ),
    ),
  ],
),
          ],
        ),
      ),
    );
  }
}

