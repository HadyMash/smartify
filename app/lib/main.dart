// import 'dart:io';
// import 'package:flutter/material.dart';
// import 'services/mfa.dart';
// import 'widgets/mfa_code.dart';
// import 'screens/account/sign_in_screen.dart';
// // import 'screens/account/dashboard_screen.dart';

// Future<void> main() async {
//   //await dotenv.load(fileName: '.env');

//   runApp(const MyApp());
// }

// class MyApp extends StatelessWidget {
//   const MyApp({super.key});

//   // This widget is the root of your application.
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'Flutter Demo',
//       theme: ThemeData(
//         // This is the theme of your application.
//         //
//         // TRY THIS: Try running your application with "flutter run". You'll see
//         // the application has a purple toolbar. Then, without quitting the app,
//         // try changing the seedColor in the colorScheme below to Colors.green
//         // and then invoke "hot reload" (save your changes or press the "hot
//         // reload" button in a Flutter-supported IDE, or press "r" if you used
//         // the command line to start the app).
//         //
//         // Notice that the counter didn't reset back to zero; the application
//         // state is not lost during the reload. To reset the state, use hot
//         // restart instead.
//         //
//         // This works for code too, not just values: Most code changes can be
//         // tested with just a hot reload.
//         textTheme: TextTheme(
//         displayLarge: TextStyle(
//           fontSize: 32, // Heading 1 size
//           fontWeight: FontWeight.bold, // Heading 1 weight
//           height: 38 / 32, // Line height (calculated as line height / font size)
//         ),
//         displayMedium: TextStyle(
//           fontSize: 24, // Heading 2 size
//           fontWeight: FontWeight.bold, // Heading 2 weight
//           height: 29 / 24, // Line height
//         ),
//         bodyLarge: TextStyle(
//           fontSize: 16, // Body Text size
//           fontWeight: FontWeight.normal, // Body Text weight (Regular)
//           height: 19 / 16, // Line height
//         ),
//         bodyMedium: TextStyle(
//           fontSize: 14, // Secondary Text size
//           fontWeight: FontWeight.normal, // Secondary Text weight (Regular)
//           height: 24 / 14, // Line height
//         ),
//         ),
//           colorScheme: ColorScheme(
//           brightness: Brightness.light, // Light theme
//           primary: Colors.white, // Primary color
//           onPrimary: Colors.black, // Text/Icon color on primary
//           secondary: Colors.black, // Secondary color
//           onSecondary: Colors.white, // Text/Icon color on secondary
//           surface: Colors.grey[200]!, // Surface color
//           onSurface: Colors.black, // Text/Icon color on surface
//           error: Colors.red, // Error color
//           onError: Colors.white, // Text/Icon color on error
//         ),
//         useMaterial3: true,
//         scaffoldBackgroundColor: Colors.white,

//        // Elevated Button Theme (Black button with rounded edges and white text)
//         elevatedButtonTheme: ElevatedButtonThemeData(
//           style: ElevatedButton.styleFrom(
//             backgroundColor: Colors.black, // Button color
//             foregroundColor: Colors.white, // Text color
//             minimumSize: Size(double.infinity, 50), // Full width button
//             shape: RoundedRectangleBorder(
//               borderRadius: BorderRadius.circular(50), // Rounded corners
//             ),
//             elevation: 4, // Light shadow
//           ),
//         ),
//         inputDecorationTheme: InputDecorationTheme(
//           filled: true,
//           fillColor: Colors.white, // Background color
//           border: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(12), // Rounded edges
//             borderSide: BorderSide(color: Colors.black, width: 2), // Black outline
//           ),
//           enabledBorder: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(12),
//             borderSide: BorderSide(color: Colors.black, width: 1),
//           ),
//           focusedBorder: OutlineInputBorder(
//             borderRadius: BorderRadius.circular(12),
//             borderSide: BorderSide(color: Colors.grey, width: 1),
//           ),
//           contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14), // Padding inside text field
//         ),
//       ),
//       // initialRoute: '/main',
//       // routes: {
//       //   '/main': (context) => SignInScreen(),
//       //   '/dashboard': (context) => DashboardScreen(),
//       // },
//       home: SignInScreen()
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:smartify/screens/household/configure_room.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,

        // Text Theme
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

        // Color Scheme
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

        // Elevated Button Theme
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

        // AppBar Theme
        appBarTheme: const AppBarTheme(
          backgroundColor:
              Colors.white, // Set the background color of the AppBar
          foregroundColor:
              Colors.black, // Set the text/icon color of the AppBar
          elevation: 0, // Remove shadow
        ),

        // Input Decoration Theme
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
        ),

        // Date Picker Theme
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
      // home: const ConfigureRoomScreen(floors: ['L1','G','B1'],),
      home: const ConfigureRoomScreen(),
    );
  }
}
