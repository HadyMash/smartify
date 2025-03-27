// ignore_for_file: unused_local_variable, prefer_const_declarations, avoid_print, constant_identifier_names, non_constant_identifier_names

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:smartify/services/auth.dart';
import 'package:smartify/services/auth_wrapper.dart';
import 'package:smartify/services/household.dart';

// import 'models/mfa.dart';
// import 'models/user.dart';
// import 'services/mfa.dart';
// import 'widgets/mfa_code.dart';

Future<void> main() async {
  await dotenv.load(fileName: '.env');

  final authService = await AuthService.create();
  final householdService =
      await HouseholdService.create(); // Initialize HouseholdService

  runApp(
    MultiProvider(
      providers: [
        Provider<AuthService>.value(value: authService), // Provide AuthService
        Provider<HouseholdService>.value(
            value: householdService), // Provide HouseholdService
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key}); // Constructor

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smartify',
      theme: ThemeData(
        useMaterial3: true,
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            height: 38 / 32,
          ),
          displayMedium: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            height: 29 / 24,
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.normal,
            height: 19 / 16,
          ),
          bodyMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.normal,
            height: 24 / 14,
          ),
        ),
        colorScheme: ColorScheme(
          brightness: Brightness.light,
          primary: Colors.white,
          onPrimary: Colors.black,
          secondary: Colors.black,
          onSecondary: Colors.white,
          surface: Colors.grey[200]!,
          onSurface: Colors.black,
          error: Colors.red,
          onError: Colors.white,
        ),
        scaffoldBackgroundColor: Colors.white,
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 50),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(50),
            ),
            elevation: 4,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
  filled: true,
  fillColor: Colors.white,
  border: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(color: Colors.black, width: 2),
  ),
  enabledBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(color: Colors.black, width: 1),
  ),
  focusedBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(color: Colors.grey, width: 1),
  ),
  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  labelStyle: const TextStyle(color: Colors.black), // Label text remains black
  floatingLabelStyle: const TextStyle(color: Colors.black), // Label stays black when focused
),
textSelectionTheme: const TextSelectionThemeData(
  cursorColor: Colors.black, // Black cursor
  selectionColor: Colors.black, // Black selection color
  selectionHandleColor: Colors.black, // Black selection handle

),


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
      home: const AuthWrapper(), // Pass AuthService to AuthWrapper
    );
  }
}
