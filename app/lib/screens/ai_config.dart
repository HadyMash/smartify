import 'package:flutter/material.dart';
import 'dart:math' as math;

class AiConfig {
  static final AiConfig _instance = AiConfig._internal();
  factory AiConfig() => _instance;
  AiConfig._internal();

  // Text content
  String greetingText = "Hello batman,\nWhat do you need?";
  String exampleCommand = '"Turn off bedroom lamp"';
  String title = "AI Assistant";

  // UI measurements
  double desktopPadding = 32.0;
  double mobilePadding = 20.0;
  double micButtonSize = 80.0; // Desktop
  double mobileMicButtonSize = 70.0;
  double micButtonBottomMargin = 100.0;
  double waveHeight = 100.0;
  double topBarPaddingHorizontal = 20.0;
  double topBarPaddingVertical = 16.0;
  double examplePadding = 16.0;
  double mobileExamplePadding = 12.0;
  double desktopSpacing = 24.0;
  double mobileSpacing = 20.0;

  // Colors
  Color backgroundColor = Colors.white;
  Color micActiveColor = Colors.red;
  Color micInactiveColor = Colors.white;
  Color micIconActiveColor = Colors.white;
  Color micIconInactiveColor = Colors.black54;
  Color exampleBackgroundColor = Colors.grey[100]!; // Assert non-null
  Color waveColor = Colors.grey.shade200;
  Color borderColor = Colors.grey.shade300;
  Color textColor = Colors.black54;
  Color exampleTextColor = Colors.black87;
  Color titleColor = Colors.black;

  // Icons
  IconData backIcon = Icons.arrow_back;
  IconData micIcon = Icons.mic;

  // Text styles
  double greetingFontSizeDesktop = 28.0;
  double greetingFontSizeMobile = 24.0;
  double exampleFontSizeDesktop = 18.0;
  double exampleFontSizeMobile = 16.0; // Adjusted for mobile
  double titleFontSizeDesktop = 20.0;
  double titleFontSizeMobile = 18.0; // AppBar uses slightly smaller default
  FontWeight titleFontWeight = FontWeight.bold;
  FontWeight appBarFontWeight = FontWeight.w500;
  double greetingLineHeight = 1.5;

  // Wave animation parameters
  double waveBaseHeightFactor = 0.65;
  double waveAmplitudeFactor = 0.1;
  double waveFrequency = math.pi * 2;
  Duration waveDuration = const Duration(seconds: 2);
}