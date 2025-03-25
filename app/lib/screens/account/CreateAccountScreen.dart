// import 'package:flutter/material.dart';
// import 'package:intl/intl.dart';
// import 'package:flutter/gestures.dart';
// import 'package:smartify/utils/validators.dart';
// import 'qr_setup_screen.dart';
// import 'package:smartify/widgets/back_button.dart';
// import 'package:smartify/services/auth.dart';

// class CreateAccountScreen extends StatefulWidget {
//   const CreateAccountScreen({super.key});

//   @override
//   _CreateAccountScreenState createState() => _CreateAccountScreenState();
// }

// class _CreateAccountScreenState extends State<CreateAccountScreen> {
//   final _formKey = GlobalKey<FormState>();
//   final _emailController = TextEditingController();
//   final _passwordController = TextEditingController();
//   bool _obscurePassword = true;
//   String? _selectedGender;
//   DateTime? _selectedDate;

//   late AuthService _authService; // Declare AuthService
//   bool _isLoading = false;

//   @override
//   void initState() {
//     super.initState();
//     _initializeAuthService();
//   }

//   Future<void> _initializeAuthService() async {
//     _authService = await AuthService.create(); // Initialize AuthService
//   }

//   @override
//   void dispose() {
//     _emailController.dispose();
//     _passwordController.dispose();
//     super.dispose();
//   }

//   Future<void> _selectDate(BuildContext context) async {
//     final DateTime? pickedDate = await showDatePicker(
//       context: context,
//       initialDate: _selectedDate ?? DateTime.now(),
//       firstDate: DateTime(1900),
//       lastDate: DateTime.now(),
//       builder: (BuildContext context, Widget? child) {
//         return Theme(
//           data: Theme.of(context).copyWith(
//             datePickerTheme: const DatePickerThemeData(
//               backgroundColor: Colors.white,
//               headerBackgroundColor: Colors.black,
//               headerForegroundColor: Colors.white,
//               surfaceTintColor: Colors.transparent,
//               dayStyle: TextStyle(color: Colors.black),
//               yearStyle: TextStyle(color: Colors.black),
//               weekdayStyle: TextStyle(color: Colors.black),
//               headerHeadlineStyle: TextStyle(
//                 color: Colors.white,
//                 fontSize: 24,
//                 fontWeight: FontWeight.bold,
//               ),
//               headerHelpStyle: TextStyle(color: Colors.white),
//             ),
//           ),
//           child: child!,
//         );
//       },
//     );
//     if (pickedDate != null && pickedDate != _selectedDate) {
//       setState(() {
//         _selectedDate = pickedDate;
//       });
//     }
//   }

//   void _handleSignUp() async {
//     if (!_formKey.currentState!.validate()) return;

//     setState(() {
//       _isLoading = true;
//     });

//     try {
//       final mfa = await _authService.register(
//         _emailController.text,
//         _passwordController.text,
//         dob: _selectedDate,
//         sex: _selectedGender,
//       );

//       if (mfa != null) {
//         Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (context) => QRSetupScreen(
//               mfaSecret: mfa.formattedKey,
//               mfaQRUri: mfa.qrCodeUri,
//               authService: _authService,
//             ),
//           ),
//         );
//       }
//     } catch (e) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Registration failed: ${e.toString()}')),
//       );
//     } finally {
//       setState(() {
//         _isLoading = false;
//       });
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final textTheme = theme.textTheme;

//     return Scaffold(
//       body: SafeArea(
//         child: SingleChildScrollView(
//           padding: const EdgeInsets.all(24.0),
//           child: Form(
//             key: _formKey,
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Row(
//                   children: [
//                     const CustomBackButton(),
//                     const SizedBox(width: 16),
//                     Text(
//                       'Create An Account',
//                       style: textTheme.displayMedium,
//                     ),
//                   ],
//                 ),
//                 const SizedBox(height: 32),

//                 // Email Field
//                 Text(
//                   'Email',
//                   style: textTheme.bodyLarge
//                       ?.copyWith(fontWeight: FontWeight.w500),
//                 ),
//                 const SizedBox(height: 8),
//                 TextFormField(
//                   controller: _emailController,
//                   keyboardType: TextInputType.emailAddress,
//                   decoration: const InputDecoration(
//                     border: OutlineInputBorder(),
//                   ),
//                   validator: validateEmail,
//                 ),
//                 const SizedBox(height: 24),

//                 // Password Field
//                 Text(
//                   'Password',
//                   style: textTheme.bodyLarge
//                       ?.copyWith(fontWeight: FontWeight.w500),
//                 ),
//                 const SizedBox(height: 8),
//                 TextFormField(
//                   controller: _passwordController,
//                   obscureText: _obscurePassword,
//                   decoration: InputDecoration(
//                     border: const OutlineInputBorder(),
//                     suffixIcon: IconButton(
//                       icon: Icon(
//                         _obscurePassword
//                             ? Icons.visibility_off
//                             : Icons.visibility,
//                         color: theme.colorScheme.onSurface.withOpacity(0.6),
//                       ),
//                       onPressed: () {
//                         setState(() {
//                           _obscurePassword = !_obscurePassword;
//                         });
//                       },
//                     ),
//                   ),
//                   validator: validatePassword,
//                 ),
//                 const SizedBox(height: 8),
//                 // Password requirements
//                 Text(
//                   '• Use 8 or more characters',
//                   style: textTheme.bodyMedium?.copyWith(
//                     color: theme.colorScheme.onSurface.withOpacity(0.6),
//                   ),
//                 ),
//                 Text(
//                   '• Use a number (e.g. 1234)',
//                   style: textTheme.bodyMedium?.copyWith(
//                     color: theme.colorScheme.onSurface.withOpacity(0.6),
//                   ),
//                 ),
//                 Text(
//                   '• Use upper and lower case letters (e.g. Aa)',
//                   style: textTheme.bodyMedium?.copyWith(
//                     color: theme.colorScheme.onSurface.withOpacity(0.6),
//                   ),
//                 ),
//                 const SizedBox(height: 24),

//                 // Gender Selection
//                 Text(
//                   "What's your gender? (optional)",
//                   style: textTheme.bodyLarge
//                       ?.copyWith(fontWeight: FontWeight.w500),
//                 ),
//                 const SizedBox(height: 8),
//                 Row(
//                   children: [
//                     Radio<String>(
//                       value: 'm', // changed from 'Male' to 'm'
//                       groupValue: _selectedGender,
//                       onChanged: (String? value) {
//                         setState(() {
//                           _selectedGender = value;
//                         });
//                       },
//                       activeColor: theme.colorScheme.secondary,
//                     ),
//                     Text('Male', style: textTheme.bodyLarge),
//                     const SizedBox(width: 24),
//                     Radio<String>(
//                       value: 'f', // changed from 'Female' to 'f'
//                       groupValue: _selectedGender,
//                       onChanged: (String? value) {
//                         setState(() {
//                           _selectedGender = value;
//                         });
//                       },
//                       activeColor: theme.colorScheme.secondary,
//                     ),
//                     Text('Female', style: textTheme.bodyLarge),
//                   ],
//                 ),

//                 // Date of Birth
//                 Text(
//                   "What's your date of birth?",
//                   style: textTheme.bodyLarge
//                       ?.copyWith(fontWeight: FontWeight.w500),
//                 ),
//                 const SizedBox(height: 8),
//                 InkWell(
//                   onTap: () => _selectDate(context),
//                   child: Container(
//                     padding: const EdgeInsets.symmetric(
//                         horizontal: 16, vertical: 12),
//                     decoration: BoxDecoration(
//                       border: Border.all(color: theme.colorScheme.secondary),
//                       borderRadius: BorderRadius.circular(12),
//                     ),
//                     child: Row(
//                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                       children: [
//                         Text(
//                           _selectedDate == null
//                               ? 'Select Date'
//                               : DateFormat('MMMM d, y').format(_selectedDate!),
//                           style: textTheme.bodyLarge?.copyWith(
//                             color: _selectedDate == null
//                                 ? theme.colorScheme.onSurface.withOpacity(0.6)
//                                 : theme.colorScheme.onSurface,
//                           ),
//                         ),
//                         Icon(
//                           Icons.calendar_today,
//                           color: theme.colorScheme.onSurface.withOpacity(0.6),
//                         ),
//                       ],
//                     ),
//                   ),
//                 ),
//                 const SizedBox(height: 32),

//                 // Sign Up Button
//                 SizedBox(
//                   width: double.infinity,
//                   child: ElevatedButton(
//                     onPressed: _isLoading
//                         ? null
//                         : _handleSignUp, // Disable when loading
//                     child: _isLoading
//                         ? const CircularProgressIndicator(
//                             color: Colors.white) // Show loading spinner
//                         : Text(
//                             'Sign up',
//                             style: textTheme.bodyLarge?.copyWith(
//                               fontWeight: FontWeight.bold,
//                               color: theme.colorScheme.onSecondary,
//                             ),
//                           ),
//                   ),
//                 ),

//                 // Terms and Privacy Policy
//                 Center(
//                   child: Text.rich(
//                     TextSpan(
//                       text: 'By creating an account, you agree to the ',
//                       style: textTheme.bodyMedium?.copyWith(
//                         color: theme.colorScheme.onSurface.withOpacity(0.6),
//                       ),
//                       children: [
//                         TextSpan(
//                           text: 'Terms of use',
//                           style: const TextStyle(
//                             decoration: TextDecoration.underline,
//                           ),
//                           recognizer: TapGestureRecognizer()
//                             ..onTap = () {
//                               // Handle Terms of use tap
//                             },
//                         ),
//                         const TextSpan(text: ' and '),
//                         TextSpan(
//                           text: 'Privacy Policy',
//                           style: const TextStyle(
//                             decoration: TextDecoration.underline,
//                           ),
//                           recognizer: TapGestureRecognizer()
//                             ..onTap = () {
//                               // Handle Privacy Policy tap
//                             },
//                         ),
//                       ],
//                     ),
//                     textAlign: TextAlign.center,
//                   ),
//                 ),
//                 const SizedBox(height: 16),

//                 // Sign In Link
//                 Center(
//                   child: Text.rich(
//                     TextSpan(
//                       text: 'Already have an Account? ',
//                       style: textTheme.bodyMedium?.copyWith(
//                         color: theme.colorScheme.onSurface.withOpacity(0.6),
//                       ),
//                       children: [
//                         TextSpan(
//                           text: 'Sign In',
//                           style: TextStyle(
//                             color: theme.colorScheme.secondary,
//                             fontWeight: FontWeight.bold,
//                           ),
//                           recognizer: TapGestureRecognizer()
//                             ..onTap = () {
//                               Navigator.pop(context);
//                             },
//                         ),
//                       ],
//                     ),
//                   ),
//                 ),
//               ],
//             ),
//           ),
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter/gestures.dart';
import 'package:smartify/utils/validators.dart';
import 'qr_setup_screen.dart';
import 'package:smartify/widgets/back_button.dart';
import 'package:smartify/services/auth.dart';

class CreateAccountScreen extends StatefulWidget {
  const CreateAccountScreen({super.key});

  @override
  _CreateAccountScreenState createState() => _CreateAccountScreenState();
}

class _CreateAccountScreenState extends State<CreateAccountScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController(); // Added name controller
  bool _obscurePassword = true;
  String? _selectedGender;
  DateTime? _selectedDate;

  late AuthService _authService;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _initializeAuthService();
  }

  Future<void> _initializeAuthService() async {
    _authService = await AuthService.create();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose(); // Dispose name controller
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (BuildContext context, Widget? child) {
        return Theme(
          data: Theme.of(context).copyWith(
            datePickerTheme: const DatePickerThemeData(
              backgroundColor: Colors.white,
              headerBackgroundColor: Colors.black,
              headerForegroundColor: Colors.white,
              surfaceTintColor: Colors.transparent,
              dayStyle: TextStyle(color: Colors.black),
              yearStyle: TextStyle(color: Colors.black),
              weekdayStyle: TextStyle(color: Colors.black),
              headerHeadlineStyle: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              headerHelpStyle: TextStyle(color: Colors.white),
            ),
          ),
          child: child!,
        );
      },
    );
    if (pickedDate != null && pickedDate != _selectedDate) {
      setState(() {
        _selectedDate = pickedDate;
      });
    }
  }

  void _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final mfa = await _authService.register(
        _emailController.text,
        _passwordController.text,
        dob: _selectedDate,
        sex: _selectedGender,
        name: _nameController.text, // Pass name to register method
      );

      if (mfa != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => QRSetupScreen(
              mfaSecret: mfa.formattedKey,
              mfaQRUri: mfa.qrCodeUri,
              authService: _authService,
            ),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration failed: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const CustomBackButton(),
                    const SizedBox(width: 16),
                    Text(
                      'Create An Account',
                      style: textTheme.displayMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Name Field (Added)
                Text(
                  'Name',
                  style: textTheme.bodyLarge
                      ?.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _nameController,
                  keyboardType: TextInputType.text,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Email Field
                Text(
                  'Email',
                  style: textTheme.bodyLarge
                      ?.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                  validator: validateEmail,
                ),
                const SizedBox(height: 24),

                // Password Field
                Text(
                  'Password',
                  style: textTheme.bodyLarge
                      ?.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                  validator: validatePassword,
                ),
                const SizedBox(height: 8),
                // Password requirements
                Text(
                  '• Use 8 or more characters',
                  style: textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
                Text(
                  '• Use a number (e.g. 1234)',
                  style: textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
                Text(
                  '• Use upper and lower case letters (e.g. Aa)',
                  style: textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 24),

                // Gender Selection
                Text(
                  "What's your gender? (optional)",
                  style: textTheme.bodyLarge
                      ?.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Radio<String>(
                      value: 'm',
                      groupValue: _selectedGender,
                      onChanged: (String? value) {
                        setState(() {
                          _selectedGender = value;
                        });
                      },
                      activeColor: theme.colorScheme.secondary,
                    ),
                    Text('Male', style: textTheme.bodyLarge),
                    const SizedBox(width: 24),
                    Radio<String>(
                      value: 'f',
                      groupValue: _selectedGender,
                      onChanged: (String? value) {
                        setState(() {
                          _selectedGender = value;
                        });
                      },
                      activeColor: theme.colorScheme.secondary,
                    ),
                    Text('Female', style: textTheme.bodyLarge),
                  ],
                ),

                // Date of Birth
                Text(
                  "What's your date of birth?",
                  style: textTheme.bodyLarge
                      ?.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => _selectDate(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: theme.colorScheme.secondary),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _selectedDate == null
                              ? 'Select Date'
                              : DateFormat('MMMM d, y').format(_selectedDate!),
                          style: textTheme.bodyLarge?.copyWith(
                            color: _selectedDate == null
                                ? theme.colorScheme.onSurface.withOpacity(0.6)
                                : theme.colorScheme.onSurface,
                          ),
                        ),
                        Icon(
                          Icons.calendar_today,
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Sign Up Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleSignUp,
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            'Sign up',
                            style: textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.onSecondary,
                            ),
                          ),
                  ),
                ),

                // Terms and Privacy Policy
                Center(
                  child: Text.rich(
                    TextSpan(
                      text: 'By creating an account, you agree to the ',
                      style: textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      children: [
                        TextSpan(
                          text: 'Terms of use',
                          style: const TextStyle(
                            decoration: TextDecoration.underline,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              // Handle Terms of use tap
                            },
                        ),
                        const TextSpan(text: ' and '),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: const TextStyle(
                            decoration: TextDecoration.underline,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              // Handle Privacy Policy tap
                            },
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 16),

                // Sign In Link
                Center(
                  child: Text.rich(
                    TextSpan(
                      text: 'Already have an Account? ',
                      style: textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      children: [
                        TextSpan(
                          text: 'Sign In',
                          style: TextStyle(
                            color: theme.colorScheme.secondary,
                            fontWeight: FontWeight.bold,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              Navigator.pop(context);
                            },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
