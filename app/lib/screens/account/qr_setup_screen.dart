// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:qr_flutter/qr_flutter.dart';
// import 'package:smartify/widgets/back_button.dart'; // Import the custom back button widget
// import 'mfa_verification_screen.dart';

// class QRSetupScreen extends StatelessWidget {
//   final String mfaSecret; // Add a parameter for the MFA secret

//   const QRSetupScreen({super.key, required this.mfaSecret});

//   void _copyToClipboard(BuildContext context) {
//     Clipboard.setData(ClipboardData(text: mfaSecret));
//     ScaffoldMessenger.of(context).showSnackBar(
//       const SnackBar(
//         content: Text('Code copied to clipboard'),
//         duration: Duration(seconds: 2),
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: SafeArea(
//         child: Padding(
//           padding: const EdgeInsets.all(16.0),
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.stretch,
//             children: [
//               // Status Bar and Back Button
//               const Row(
//                 mainAxisAlignment: MainAxisAlignment.start,
//                 children: [
//                   SizedBox(
//                     width: 40, // Fixed width for the back button
//                     child:
//                         CustomBackButton(), // Use the custom back button widget
//                   ),
//                 ],
//               ),
//               const SizedBox(height: 24),

//               // Title and Description
//               const Text(
//                 'Set up MFA',
//                 style: TextStyle(
//                   fontSize: 24,
//                   fontWeight: FontWeight.bold,
//                 ),
//                 textAlign: TextAlign.center,
//               ),
//               const SizedBox(height: 16),
//               const Text(
//                 'For your security, please set up Multi-Factor Authentication (MFA). Scan the QR code below',
//                 style: TextStyle(
//                   fontSize: 14,
//                   color: Colors.grey,
//                 ),
//                 textAlign: TextAlign.center,
//               ),

//               // QR Code
//               const SizedBox(height: 32),
//               Center(
//                 child: QrImageView(
//                   data: mfaSecret,
//                   version: QrVersions.auto,
//                   size: 200.0,
//                 ),
//               ),

//               // Manual Code Section
//               const SizedBox(height: 32),
//               const Text(
//                 'Or paste this code manually:',
//                 style: TextStyle(
//                   fontSize: 14,
//                   color: Colors.grey,
//                 ),
//                 textAlign: TextAlign.center,
//               ),
//               const SizedBox(height: 8),
//               Container(
//                 margin: const EdgeInsets.symmetric(horizontal: 32),
//                 padding:
//                     const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
//                 decoration: BoxDecoration(
//                   color: Colors.grey[100],
//                   borderRadius: BorderRadius.circular(8),
//                 ),
//                 child: Row(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     const Text(
//                       mfaSecret,
//                       style: TextStyle(
//                         fontSize: 16,
//                         fontWeight: FontWeight.w500,
//                         letterSpacing: 1,
//                       ),
//                     ),
//                     const SizedBox(width: 8),
//                     IconButton(
//                       icon: const Icon(Icons.copy, size: 20),
//                       onPressed: () => _copyToClipboard(context),
//                       padding: EdgeInsets.zero,
//                       constraints: const BoxConstraints(),
//                     ),
//                   ],
//                 ),
//               ),

//               // Next Button
//               const Spacer(),
//               ElevatedButton(
//                 onPressed: () {
//                   Navigator.push(
//                     context,
//                     MaterialPageRoute(
//                       builder: (context) => const MFAVerificationScreen(),
//                     ),
//                   );
//                 },
//                 child: const Text(
//                   'Next',
//                   style: TextStyle(color: Colors.white),
//                 ),
//               ),
//               const SizedBox(height: 16),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:smartify/widgets/back_button.dart'; // Import the custom back button widget
import 'mfa_verification_screen.dart';
//import 'package:smartify/services/auth.dart'; // Make sure to import your AuthService file here

class QRSetupScreen extends StatelessWidget {
  final String mfaSecret; // Add a parameter for the MFA secret

  const QRSetupScreen({super.key, required this.mfaSecret});

  void _copyToClipboard(BuildContext context) {
    Clipboard.setData(ClipboardData(text: mfaSecret));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Code copied to clipboard'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _navigateToMFAConfirmationScreen(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const MFAVerificationScreen(
            isSetup: true), // Passing 'true' for setup
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Status Bar and Back Button
              const Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 40, // Fixed width for the back button
                    child:
                        CustomBackButton(), // Use the custom back button widget
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Title and Description
              const Text(
                'Set up MFA',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'For your security, please set up Multi-Factor Authentication (MFA). Scan the QR code below',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),

              // QR Code
              const SizedBox(height: 32),
              Center(
                child: QrImageView(
                  data: mfaSecret,
                  version: QrVersions.auto,
                  size: 200.0,
                ),
              ),

              // Manual Code Section
              const SizedBox(height: 32),
              const Text(
                'Or paste this code manually:',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 32),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      mfaSecret,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.copy, size: 20),
                      onPressed: () => _copyToClipboard(context),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),

              // Next Button (Confirm MFA)
              const Spacer(),
              ElevatedButton(
                onPressed: () => _navigateToMFAConfirmationScreen(context),
                child: const Text(
                  'Confirm MFA',
                  style: TextStyle(color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
