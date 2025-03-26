import 'package:flutter/material.dart';
import 'package:smartify/services/auth.dart'; // Adjust the import path
import 'package:smartify/screens/account/sign_in_screen.dart'; // Your sign-in screen
import 'package:smartify/screens/account/mfa_verification_screen.dart'; // Your MFA verification screen
//import 'dashboard_screen.dart'; // Your dashboard screen
import 'package:smartify/screens/account/qr_setup_screen.dart'; // Your QR setup screen

import 'package:smartify/dashboard_screen.dart';
import 'package:smartify/screens/get_started.dart'; // Your get started scree
import 'package:smartify/services/household.dart'; // Adjust the import path

import 'package:provider/provider.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final householdService = Provider.of<HouseholdService>(context);
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
            return FutureBuilder<List<HouseholdInfo>>(
              future: householdService.getUserHouseholds(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Scaffold(
                    body: Center(child: CircularProgressIndicator()),
                  );
                }

                final households = snapshot.data ?? [];
                return households.isNotEmpty
                    ? DashboardScreen(authService: authService)
                    : GetStartedScreen(authService: authService);
              },
            );

          // ignore: unreachable_switch_default
          default:
            return SignInScreen(authService: authService);
        }
      },
    );
  }
}
