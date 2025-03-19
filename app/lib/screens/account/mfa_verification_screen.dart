// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'mfa_setup_complete_screen.dart'; // Ensure this import is correct
// import 'package:smartify/widgets/back_button.dart'; // Import the custom back button widget

// class MFAVerificationScreen extends StatefulWidget {
//   const MFAVerificationScreen({super.key});

//   @override
//   // ignore: library_private_types_in_public_api
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

//   void _verifyCode() {
//     String code = _controllers.map((controller) => controller.text).join();
//     if (code.length != 6) {
//       setState(() => _isError = true);
//     } else {
//       // Add your verification logic here
//       // For demo purposes, we'll assume the code is correct and navigate to the confirmation screen
//       Navigator.push(
//         context,
//         MaterialPageRoute(
//           builder: (context) => const MFASetupCompleteScreen(),
//         ),
//       );
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
//                 // Back Button
//                 const Row(
//                   children: [
//                     CustomBackButton(), // Use the custom back button widget
//                   ],
//                 ),
//                 const SizedBox(height: 24),

//                 // Title and Description
//                 const Text(
//                   'Verify your MFA Setup',
//                   style: TextStyle(
//                     fontSize: 24,
//                     fontWeight: FontWeight.bold,
//                   ),
//                   textAlign: TextAlign.center,
//                 ),
//                 const SizedBox(height: 8),
//                 const Text(
//                   'Enter the 6-digit code generated in your authenticator app to complete the setup',
//                   style: TextStyle(
//                     fontSize: 14,
//                     color: Colors.grey,
//                   ),
//                   textAlign: TextAlign.center,
//                 ),

//                 // Code Input Fields
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
//                           }
//                         },
//                         inputFormatters: [
//                           FilteringTextInputFormatter.digitsOnly
//                         ],
//                       ),
//                     ),
//                   ),
//                 ),

//                 // Verify Button
//                 const SizedBox(height: 32),
//                 ElevatedButton(
//                   onPressed: _verifyCode,
//                   child: const Text(
//                     'Verify',
//                     style: TextStyle(color: Colors.white),
//                   ),
//                 ),

//                 // Error Message
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
import 'package:smartify/services/auth.dart'; // Ensure you have this for API calls

class MFAVerificationScreen extends StatefulWidget {
  final bool isSetup;

  const MFAVerificationScreen({super.key, required this.isSetup});

  @override
  _MFAVerificationScreenState createState() => _MFAVerificationScreenState();
}

class _MFAVerificationScreenState extends State<MFAVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (index) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(
    6,
    (index) => FocusNode(),
  );
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

    if (code.length != 6) {
      setState(() => _isError = true);
      return;
    }

    setState(() {
      _isLoading = true;
      _isError = false;
    });

    bool success = false;
    if (widget.isSetup) {
      success = await AuthService().confirmMFA(code);
    } else {
      success = await AuthService().verifyMFA(code);
    }

    setState(() => _isLoading = false);

    if (success) {
      if (widget.isSetup) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const MFASetupCompleteScreen(),
          ),
        );
      } else {
        Navigator.pushReplacementNamed(context, '/home');
      }
    } else {
      setState(() => _isError = true);
    }
  }

  @override
  Widget build(BuildContext context) {
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
                  widget.isSetup ? 'Complete Your MFA Setup' : 'Enter MFA Code',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  widget.isSetup
                      ? 'Enter the 6-digit code from your authenticator app to finish setting up MFA.'
                      : 'Enter the 6-digit code from your authenticator app to sign in.',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
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
                            borderSide: BorderSide(
                              color: _isError ? Colors.red : Colors.grey,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(
                              color: _isError ? Colors.red : Colors.black,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onChanged: (value) {
                          if (value.isNotEmpty && index < 5) {
                            _focusNodes[index + 1].requestFocus();
                          }
                        },
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton(
                        onPressed: _verifyCode,
                        child: const Text(
                          'Verify',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                if (_isError)
                  const Padding(
                    padding: EdgeInsets.only(top: 16),
                    child: Text(
                      'The code you entered is incorrect. Please try again.',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 14,
                      ),
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
