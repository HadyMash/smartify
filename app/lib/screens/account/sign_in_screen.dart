// import 'package:flutter/material.dart';
// import 'package:smartify/screens/account/CreateAccountScreen.dart';
// import 'package:smartify/screens/account/forgotPassword.dart';
// // import 'package:smartify/screens/household/view_household.dart';
// import 'mfa_verification_screen.dart';

// void main() {
//   runApp(const MyApp());
// }

// class MyApp extends StatelessWidget {
//   const MyApp({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return const MaterialApp(
//       debugShowCheckedModeBanner: false,
//       home: SignInScreen(),
//     );
//   }
// }

// class SignInScreen extends StatelessWidget {
//   const SignInScreen({super.key});

//   @override
//   State<SignInScreen> createState() => _SignInScreenState();
// }

// class _SignInScreenState extends State<SignInScreen> {
//   final TextEditingController _emailController = TextEditingController();
//   final TextEditingController _passwordController = TextEditingController();
//   final AuthService _authService = AuthService(); // Create an instance of AuthService

//   @override
//   void dispose() {
//     _emailController.dispose();
//     _passwordController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     TextTheme textTheme = Theme.of(context).textTheme;
//     ColorScheme colorScheme = Theme.of(context).colorScheme;
//     return Scaffold(
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(20.0),
//         child: Center(
//           child: Column(
//             mainAxisAlignment: MainAxisAlignment.center,
//             children: [
//               const SizedBox(height: 60), // Add spacing at the top

//               // Profile Icon
//               CircleAvatar(
//                 radius: 70,
//                 backgroundColor: colorScheme.surface,
//                 child: Icon(Icons.person, size: 80, color: colorScheme.primary),
//               ),
//               const SizedBox(height: 20),

//               // Sign In Text
//               Text(
//                 "Sign In",
//                 style: textTheme.displayLarge,
//               ),
//               const SizedBox(height: 30),

//               // Email Field
//               Align(
//                 alignment: Alignment.centerLeft,
//                 child: Text(
//                   "Email",
//                   style: textTheme.bodyLarge,
//                 ),
//               ),
//               const SizedBox(height: 8),
//               TextField(
//                 decoration: InputDecoration(
//                   border: OutlineInputBorder(
//                     borderRadius: BorderRadius.circular(8),
//                   ),
//                 ),
//               ),
//               const SizedBox(height: 20),

//               // Password Field
//               Align(
//                 alignment: Alignment.centerLeft,
//                 child: Text(
//                   "Password",
//                   style: textTheme.bodyLarge,
//                 ),
//               ),
//               const SizedBox(height: 8),
//               TextField(
//                 obscureText: true,
//                 decoration: InputDecoration(
//                   border: OutlineInputBorder(
//                     borderRadius: BorderRadius.circular(8),
//                   ),
//                   suffixIcon: const Icon(Icons.visibility_off),
//                 ),
//               ),

//               const SizedBox(height: 10),

//               // Forgot Password Row
//               Row(
//                 mainAxisAlignment: MainAxisAlignment.end,
//                 children: [
//                   TextButton(
//                     onPressed: () {
//                       // Navigate to ForgotPasswordScreen
//                       Navigator.push(
//                         context,
//                         MaterialPageRoute(
//                           builder: (context) => ForgotPasswordScreen(),
//                         ),
//                       );
//                     },
//                     child: Text(
//                       "Forgot Password?",
//                       style: textTheme.bodyMedium
//                           ?.copyWith(fontWeight: FontWeight.bold),
//                     ),
//                   ),
//                 ],
//               ),

//               const SizedBox(height: 20),

//               // Sign In Button
//               ElevatedButton(
//                 onPressed: () async {
//                   final email = _emailController.text;
//                   final password = _passwordController.text;

//                   // Call the signIn method from AuthService
//                   final success = await _authService.signIn(email, password);

//                   if (success) {
//                     // Navigate to the next screen after successful sign-in
//                     ScaffoldMessenger.of(context).showSnackBar(
//                       const SnackBar(content: Text('Sign-in successful!')),
//                     );

//                    } else {

//                     ScaffoldMessenger.of(context).showSnackBar(
//                       const SnackBar(content: Text('Sign-in failed. Please try again.')),

//                   // Navigate to the next screen
//                   // Navigator.push(
//                   //   context,
//                   //   MaterialPageRoute(
//                   //     builder: (context) => ViewHouseholdScreen(),
//                   //   ),
//                   // );
//                 },
//                 child: const Text("Sign in", style: TextStyle(fontSize: 16)),
//               ),

//               const SizedBox(height: 20),

//               // Or sign in with Text
//               Text("Or sign in with", style: textTheme.bodyMedium),
//               const SizedBox(height: 10),

//               OutlinedButton.icon(
//                 onPressed: () {},
//                 icon: Icon(
//                   Icons.account_circle,
//                   size: 20,
//                   color: colorScheme.onPrimary,
//                 ),
//                 label: const Text("Continue with Google"),
//                 style: OutlinedButton.styleFrom(
//                   padding:
//                       const EdgeInsets.symmetric(vertical: 15, horizontal: 30),
//                   foregroundColor: Colors.black,
//                 ),
//               ),
//               Row(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 children: [
//                   const Text("Don’t have an account? "),
//                   TextButton(
//                     onPressed: () {
//                       // Navigate to CreateAccountScreen
//                       Navigator.push(
//                         context,
//                         MaterialPageRoute(
//                           builder: (context) => const MFAVerificationScreen(isSetup: false),
//                         ),
//                       );
//                     },
//                     child: Text(
//                       "Sign up",
//                       style: textTheme.bodyMedium?.copyWith(
//                         color: colorScheme.onPrimary,
//                         fontWeight: FontWeight.bold,
//                       ),
//                     ),
//                   ),
//                 ],
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

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
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final AuthService _authService =
      AuthService(); // Create an instance of AuthService

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
                onPressed: () async {
                  final email = _emailController.text;
                  final password = _passwordController.text;

                  // Call the signIn method from AuthService
                  final response = await _authService.signIn(email, password);

                  if (response['status'] == 'mfa_required') {
                    // If MFA is required, navigate to the MFA verification screen
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const MFAVerificationScreen(
                          isSetup:
                              false, // Set this based on your logic (is setup or sign-in)
                        ),
                      ),
                    );
                  } else if (response['status'] == 'success') {
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
                },
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
