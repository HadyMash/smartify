import 'package:flutter/material.dart';
import 'package:smartify/services/auth.dart'; // Adjust the import path
import 'package:smartify/screens/account/sign_in_screen.dart'; // Your sign-in screen
import 'package:smartify/screens/account/mfa_verification_screen.dart'; // Your MFA verification screen
//import 'dashboard_screen.dart'; // Your dashboard screen
import 'package:smartify/screens/account/qr_setup_screen.dart'; // Your QR setup screen

import 'package:smartify/dashboard_screen.dart';
import 'package:smartify/screens/get_started.dart'; // Your get started scree
import 'package:smartify/services/household.dart'; // Adjust the import path

class AuthWrapper extends StatelessWidget {
  final AuthService authService;
  final HouseholdService householdService;

  const AuthWrapper(
      {super.key, required this.authService, required this.householdService});

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
            return FutureBuilder<Map<String, dynamic>>(
              future: _getUserHouseholdData(), // Fetch household data
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else {
                  final householdData = snapshot.data;
                  final bool isInHousehold =
                      householdData?['isInHousehold'] ?? false;

                  if (isInHousehold) {
                    return DashboardScreen(authService: authService);
                  } else {
                    return GetStartedScreen(authService: authService);
                  }
                }
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

/// Fetch household data and determine if the user belongs to any household.
Future<Map<String, dynamic>> _getUserHouseholdData() async {
  try {
    // Fetch household info
    final householdResponse = await HouseholdService.getUserHouseholds();

    // Check if user is in a household
    final bool hasHousehold = householdResponse['success'] == true &&
        householdResponse['households'] != null &&
        (householdResponse['households'] as List).isNotEmpty;

    // If user is in a household, return true
    if (hasHousehold) {
      return {"isInHousehold": true};
    }

    // If user is not in a household, return false
    return {"isInHousehold": false};
  } catch (e) {
    // Handle any errors and rethrow if necessary
    throw Exception('Failed to fetch household data: $e');
  }
}
