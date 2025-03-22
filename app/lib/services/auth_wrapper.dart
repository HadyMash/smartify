import 'package:flutter/material.dart';
import 'package:smartify/services/auth.dart'; // Adjust the import path
import 'package:smartify/screens/account/sign_in_screen.dart'; // Your sign-in screen
import 'package:smartify/screens/account/mfa_verification_screen.dart'; // Your MFA verification screen
//import 'dashboard_screen.dart'; // Your dashboard screen
import 'package:smartify/screens/account/qr_setup_screen.dart'; // Your QR setup screen

import 'package:smartify/screens/account/del_cookie.dart';

// class AuthWrapper extends StatelessWidget {
//   final AuthService authService;

//   AuthWrapper({required this.authService});

//   @override
//   Widget build(BuildContext context) {
//     return StreamBuilder<AuthEvent>(
//       stream: authService.authEventStream,
//       initialData: AuthEvent(AuthEventType.authStateChanged, authService.state),
//       builder: (context, snapshot) {
//         final authEvent = snapshot.data;
//         final authState = authEvent?.state ?? AuthState.signedOut;

//         switch (authState) {
//           case AuthState.signedOut:
//             return SignInScreen(authService: authService);
//           case AuthState.signedInMFAVerify:
//             return MFAVerificationScreen(authService: authService);
//           case AuthState.signedInMFAConfirm:
//             return QRSetupScreen(authService: authService);
//           case AuthState.signedIn:
//             //return DashboardScreen();
//           default:
//             return SignInScreen(authService: authService);
//         }
//       },
//     );
//   }
// }

class AuthWrapper extends StatelessWidget {
  final AuthService authService;

  const AuthWrapper({super.key, required this.authService});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthEvent>(
      stream: authService.authEventStream,
      initialData: AuthEvent(AuthEventType.authStateChanged, authService.state),
      builder: (context, snapshot) {
        final authEvent = snapshot.data;
        final authState = authEvent?.state ?? AuthState.signedOut;

        switch (authState) {
          case AuthState.signedOut:
            return SignInScreen(authService: authService);
          case AuthState.signedInMFAVerify:
            return MFAVerificationScreen(
                authState: authState, authService: authService);

          case AuthState.signedInMFAConfirm:
            final mfaKey = authService.mfaKey; // Retrieve stored MFA data
            return QRSetupScreen(
              authService: authService,
              mfaSecret: mfaKey?.formattedKey ?? '',
              mfaQRUri: mfaKey?.qrCodeUri ?? '',
            );

          case AuthState.signedIn:
            return SignOutScreen(); // return DashboardScreen();
          // ignore: unreachable_switch_default
          default:
            return SignInScreen(authService: authService);
        }
      },
    );
  }
}
