import 'package:flutter/material.dart';
import 'package:smartify/screens/account/CreateAccountScreen.dart';
import 'package:smartify/screens/account/forgotPassword.dart';
import 'mfa_verification_screen.dart';
import 'package:smartify/services/auth.dart'; // Import your AuthService to handle login logic

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: SignInScreen(),
    );
  }
}

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  late AuthService _authService; // Declare AuthService
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _initializeAuthService(); // Initialize AuthService
  }

  Future<void> _initializeAuthService() async {
    _authService = await AuthService.create(); // Use the factory method
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    TextTheme textTheme = Theme.of(context).textTheme;
    ColorScheme colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 60), // Add spacing at the top

              // Profile Icon
              CircleAvatar(
                radius: 70,
                backgroundColor: colorScheme.surface,
                child: Icon(Icons.person, size: 80, color: colorScheme.primary),
              ),
              const SizedBox(height: 20),

              // Sign In Text
              Text(
                "Sign In",
                style: textTheme.displayLarge,
              ),
              const SizedBox(height: 30),

              // Email Field
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Email",
                  style: textTheme.bodyLarge,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Password Field
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Password",
                  style: textTheme.bodyLarge,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  suffixIcon: const Icon(Icons.visibility_off),
                ),
              ),

              const SizedBox(height: 10),

              // Forgot Password Row
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () {
                      // Navigate to ForgotPasswordScreen
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ForgotPasswordScreen(),
                        ),
                      );
                    },
                    child: Text(
                      "Forgot Password?",
                      style: textTheme.bodyMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Sign In Button
              ElevatedButton(
                onPressed: _isLoading
                    ? null
                    : () async {
                        final email = _emailController.text;
                        final password = _passwordController.text;

                        setState(() => _isLoading = true);

                        try {
                          // Call the signIn method from AuthService
                          final response = await _authService.signIn(email, password);

                          if (response?.mfa != null) {
                            // If MFA is required, navigate to the MFA verification screen
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const MFAVerificationScreen(
                                  isSetup: false, // Set this based on your logic (is setup or sign-in)
                                ),
                              ),
                            );
                          } else if (response?.success == true) {
                            // Successful sign-in, navigate to next screen
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Sign-in successful!')),
                            );

                            // Navigate to the main screen (e.g., CreateAccountScreen or ViewHouseholdScreen)
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const CreateAccountScreen(),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Sign-in failed. Please try again.')),
                            );
                          }
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: ${e.toString()}')),
                          );
                        } finally {
                          setState(() => _isLoading = false);
                        }
                      },
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text("Sign in", style: TextStyle(fontSize: 16)),
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
                  padding:
                      const EdgeInsets.symmetric(vertical: 15, horizontal: 30),
                  foregroundColor: Colors.black,
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don’t have an account? "),
                  TextButton(
                    onPressed: () {
                      // Navigate to CreateAccountScreen
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const CreateAccountScreen(),
                        ),
                      );
                    },
                    child: Text(
                      "Sign up",
                      style: textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
