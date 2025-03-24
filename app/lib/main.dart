// ignore_for_file: unused_local_variable, prefer_const_declarations, avoid_print, constant_identifier_names, non_constant_identifier_names

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:smartify/services/auth.dart';
import 'package:smartify/services/household.dart';
import 'package:smartify/services/http/http_client.dart';

// import 'models/mfa.dart';
// import 'models/user.dart';
// import 'services/mfa.dart';
// import 'widgets/mfa_code.dart';

Future<void> main() async {
  await dotenv.load(fileName: '.env');
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
      home: const MyWidget(),
    );
  }
}

class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Widget'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              children: [
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    print(
                        'sign in result: ${await as.signIn('hady@gmail.com', 'Password1!')}');
                  },
                  child: const Text('Sign In'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    print(
                        'sign up result: ${await as.register('hady@gmail.com', 'Password1!', name: 'Hady')}');
                  },
                  child: const Text('Sign Up'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    print(
                        'confirm mfa result: ${await as.confirmMFA('180327')}');
                  },
                  child: const Text('Confirm MFA'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    print('verify mfa result: ${await as.verifyMFA('123456')}');
                  },
                  child: const Text('Verify MFA'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    final shc = await SmartifyHttpClient.instance;

                    print('current auth state: ${as.state}');

                    //shc.deleteCookie('access-token');

                    as.authEventStream.listen((event) {
                      print('Auth event: $event');
                    });

                    //print('Cookies: ${await as.getCookies()}');
                    print(
                        'has access token: ${await shc.hasCookie('access-token')}');
                    print(
                        'has refresh token: ${await shc.hasCookie('refresh-token')}');
                    print('has id token: ${await shc.hasCookie('id-token')}');
                  },
                  child: const Text('Print cookies'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    await as.signOut();
                  },
                  child: const Text('Sign out'),
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 16),
                ElevatedButton(
                    onPressed: () async {
                      final hs = await HouseholdService.create();
                      await hs.createHousehold(
                        'My House ${Random().nextInt(100)}',
                        2,
                        [
                          const HouseholdRoom(
                            id: '1',
                            name: 'Living Room',
                            type: 'living',
                            floor: 0,
                            connectedRooms: RoomConnections(right: '2'),
                          ),
                          const HouseholdRoom(
                            id: '2',
                            name: 'Kitchen',
                            type: 'kitchen',
                            floor: 0,
                            connectedRooms: RoomConnections(left: '1'),
                          ),
                          const HouseholdRoom(
                            id: '3',
                            name: 'Bedroom',
                            type: 'bedroom',
                            floor: 1,
                            connectedRooms: RoomConnections(),
                          )
                        ],
                      );
                    },
                    child: const Text('Create Household')),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final hs = await HouseholdService.create();
                    print('get households result: ${await hs.getHouseholds()}');
                  },
                  child: const Text('Get households'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
