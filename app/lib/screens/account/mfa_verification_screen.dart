// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:smartify/widgets/back_button.dart';
// import 'mfa_setup_complete_screen.dart';
// import 'package:smartify/services/auth.dart'; // Ensure you have this for API calls

// class MFAVerificationScreen extends StatefulWidget {
//   final bool isSetup;

//   const MFAVerificationScreen({super.key, required this.isSetup, required AuthState authState});

//   @override
//   _MFAVerificationScreenState createState() => _MFAVerificationScreenState();
// }

// class _MFAVerificationScreenState extends State<MFAVerificationScreen> {
//   final List<TextEditingController> _controllers = List.generate(
//     6,
//     (index) => TextEditingController(),
//   );
//   final List<FocusNode> _focusNodes = List.generate(
//     6,
//     (index) => FocusNode(),
//   );
//   bool _isError = false;
//   bool _isLoading = false;

//   @override
//   void dispose() {
//     for (var controller in _controllers) {
//       controller.dispose();
//     }
//     for (var node in _focusNodes) {
//       node.dispose();
//     }
//     super.dispose();
//   }

//   Future<void> _verifyCode() async {
//     String code = _controllers.map((controller) => controller.text).join();

//     if (code.length != 6) {
//       setState(() => _isError = true);
//       return;
//     }

//     setState(() {
//       _isLoading = true;
//       _isError = false;
//     });

//     try {
//       // Create an instance of AuthService using the factory method
//       final authService = await AuthService.create();

//       bool success = false;
//       if (widget.isSetup) {
//         success = await authService.confirmMFA(code); // Use the instance
//       } else {
//         success = await authService.verifyMFA(code); // Use the instance
//       }

//       if (success) {
//         if (widget.isSetup) {
//           Navigator.push(
//             context,
//             MaterialPageRoute(
//               builder: (context) => const MFASetupCompleteScreen(),
//             ),
//           );
//         } else {
//           Navigator.pushReplacementNamed(context, '/home');
//         }
//       } else {
//         setState(() => _isError = true);
//       }
//     } catch (e) {
//       setState(() {
//         _isError = true;
//         ScaffoldMessenger.of(context).showSnackBar(
//           SnackBar(content: Text('Error: ${e.toString()}')),
//         );
//       });
//     } finally {
//       setState(() => _isLoading = false);
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: SafeArea(
//         child: SingleChildScrollView(
//           child: Padding(
//             padding: const EdgeInsets.all(16.0),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.stretch,
//               children: [
//                 const Row(
//                   children: [CustomBackButton()],
//                 ),
//                 const SizedBox(height: 24),
//                 Text(
//                   widget.isSetup ? 'Complete Your MFA Setup' : 'Enter MFA Code',
//                   style: const TextStyle(
//                     fontSize: 24,
//                     fontWeight: FontWeight.bold,
//                   ),
//                   textAlign: TextAlign.center,
//                 ),
//                 const SizedBox(height: 8),
//                 Text(
//                   widget.isSetup
//                       ? 'Enter the 6-digit code from your authenticator app to finish setting up MFA.'
//                       : 'Enter the 6-digit code from your authenticator app to sign in.',
//                   style: const TextStyle(
//                     fontSize: 14,
//                     color: Colors.grey,
//                   ),
//                   textAlign: TextAlign.center,
//                 ),
//                 const SizedBox(height: 32),
//                 Row(
//                   mainAxisAlignment: MainAxisAlignment.spaceEvenly,
//                   children: List.generate(
//                     6,
//                     (index) => SizedBox(
//                       width: 40,
//                       child: TextField(
//                         controller: _controllers[index],
//                         focusNode: _focusNodes[index],
//                         keyboardType: TextInputType.number,
//                         textAlign: TextAlign.center,
//                         maxLength: 1,
//                         decoration: InputDecoration(
//                           counterText: '',
//                           enabledBorder: OutlineInputBorder(
//                             borderSide: BorderSide(
//                               color: _isError ? Colors.red : Colors.grey,
//                             ),
//                             borderRadius: BorderRadius.circular(8),
//                           ),
//                           focusedBorder: OutlineInputBorder(
//                             borderSide: BorderSide(
//                               color: _isError ? Colors.red : Colors.black,
//                             ),
//                             borderRadius: BorderRadius.circular(8),
//                           ),
//                         ),
//                         onChanged: (value) {
//                           if (value.isNotEmpty && index < 5) {
//                             _focusNodes[index + 1].requestFocus();
//                           } else if (value.isEmpty && index > 0) {
//                             _focusNodes[index - 1].requestFocus();
//                           }
//                         },
//                         inputFormatters: [
//                           FilteringTextInputFormatter.digitsOnly
//                         ],
//                       ),
//                     ),
//                   ),
//                 ),
//                 const SizedBox(height: 32),
//                 _isLoading
//                     ? const Center(child: CircularProgressIndicator())
//                     : ElevatedButton(
//                         onPressed: _verifyCode,
//                         child: const Text(
//                           'Verify',
//                           style: TextStyle(color: Colors.white),
//                         ),
//                       ),
//                 if (_isError)
//                   const Padding(
//                     padding: EdgeInsets.only(top: 16),
//                     child: Text(
//                       'The code you entered is incorrect. Please try again.',
//                       style: TextStyle(
//                         color: Colors.red,
//                         fontSize: 14,
//                       ),
//                       textAlign: TextAlign.center,
//                     ),
//                   ),
//                 const SizedBox(height: 16),
//               ],
//             ),
//           ),
//         ),
//       ),
//     );
//   }
// }


import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smartify/widgets/back_button.dart';
import 'mfa_setup_complete_screen.dart';
import 'package:smartify/services/auth.dart';

class MFAVerificationScreen extends StatefulWidget {
  final AuthState authState; // Use AuthState instead of isSetup
  final AuthService authService;

  const MFAVerificationScreen({super.key, required this.authState, required this.authService});

  @override
  _MFAVerificationScreenState createState() => _MFAVerificationScreenState();
}

class _MFAVerificationScreenState extends State<MFAVerificationScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (index) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (index) => FocusNode());

  bool _isError = false;
  bool _isLoading = false;

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  Future<void> _verifyCode() async {
    String code = _controllers.map((controller) => controller.text).join();
    String code = _controllers.map((controller) => controller.text).join();

    if (code.length != 6) {
      setState(() => _isError = true);
      return;
    }
    if (code.length != 6) {
      setState(() => _isError = true);
      return;
    }

    setState(() {
      _isLoading = true;
      _isError = false;
    });
    setState(() {
      _isLoading = true;
      _isError = false;
    });

    try {
      bool success = false;

      if (widget.authState == AuthState.signedInMFAVerify) {
        success = await widget.authService.verifyMFA(code);
      } else if (widget.authState == AuthState.signedInMFAConfirm) {
        success = await widget.authService.confirmMFA(code);
      }

      if (success) {
        if (widget.authState == AuthState.signedInMFAConfirm) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const MFASetupCompleteScreen()),
          );
        } else {
          Navigator.pushReplacementNamed(context, '/home');
        }
      } else {
        setState(() => _isError = true);
      }
    } catch (e) {
      setState(() {
        _isError = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isSetup = widget.authState == AuthState.signedInMFAConfirm;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [CustomBackButton()],
                ),
                const SizedBox(height: 24),
                Text(
                  isSetup ? 'Complete Your MFA Setup' : 'Enter MFA Code',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  isSetup
                      ? 'Enter the 6-digit code from your authenticator app to finish setting up MFA.'
                      : 'Enter the 6-digit code from your authenticator app to sign in.',
                  style: const TextStyle(fontSize: 14, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(
                    6,
                    (index) => SizedBox(
                      width: 40,
                      child: TextField(
                        controller: _controllers[index],
                        focusNode: _focusNodes[index],
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        maxLength: 1,
                        decoration: InputDecoration(
                          counterText: '',
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: _isError ? Colors.red : Colors.grey),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: _isError ? Colors.red : Colors.black),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onChanged: (value) {
                          if (value.isNotEmpty && index < 5) {
                            _focusNodes[index + 1].requestFocus();
                          } else if (value.isEmpty && index > 0) {
                            _focusNodes[index - 1].requestFocus();
                          }
                        },
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton(
                        onPressed: _verifyCode,
                        child: const Text('Verify', style: TextStyle(color: Colors.white)),
                      ),
                if (_isError)
                  const Padding(
                    padding: EdgeInsets.only(top: 16),
                    child: Text(
                      'The code you entered is incorrect. Please try again.',
                      style: TextStyle(color: Colors.red, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

