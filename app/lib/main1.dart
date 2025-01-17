import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'intro_screen.dart';
import 'sign_in_screen.dart';
import 'dashboard_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: Size(360, 690), // Reference size for scaling
      builder: (context, child) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Smartify App',
          theme: ThemeData(
            scaffoldBackgroundColor: Color(0xFFFFFFFF), // Main Background
          ),
          initialRoute: '/',
          routes: {
            '/': (context) => IntroScreen(),
            '/signin': (context) => SignInScreen(),
            '/dashboard': (context) => DashboardScreen(),
          },
        );
      },
    );
  }
}
