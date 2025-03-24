import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:smartify/screens/household/household_screen.dart';
import 'services/auth_wrapper.dart';
import 'services/auth.dart'; // Import AuthService
import 'services/household.dart';

Future<void> main() async {
  await dotenv.load(fileName: '.env');

  final authService = await AuthService.create(); //  Initialize AuthService

  runApp(MyApp(authService: authService)); // Pass it to MyApp
}

class MyApp extends StatelessWidget {
  final AuthService authService; //  Add AuthService as a property

  const MyApp({super.key, required this.authService}); // Constructor

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
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            floatingLabelStyle: const TextStyle(
              color: Colors.black, // Ensure label is visible when focused
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),

              
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
  textSelectionTheme: TextSelectionThemeData(
    cursorColor: Colors.black, // Ensures cursor is black
    selectionColor: Colors.grey[400], // Background color when selecting text
    selectionHandleColor: Colors.black, // Handle color when dragging selection
  ),
  cardTheme: CardTheme(
    elevation: 2,
    color: Colors.white, // Background color of the card
    shadowColor: Colors.grey[300], // Subtle shadow color
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),

      ),

      home: const HouseholdScreen(),
      // home: AuthWrapper(
      //   authService: authService,
      //   householdService: HouseholdService(),
      // ), // Pass AuthService to AuthWrapper
    );
  }
}
