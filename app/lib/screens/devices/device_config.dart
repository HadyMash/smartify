import 'package:flutter/material.dart';

class DeviceConfig {
  static final DeviceConfig _instance = DeviceConfig._internal();
  factory DeviceConfig() => _instance;
  DeviceConfig._internal();

  // Text content
  final String addDeviceTitle = 'Add a device';
  final String scanInstructionText = 'Scan for nearby devices by clicking\nthe button below';
  final String scanButtonText = 'Scan';
  final String skipButtonText = 'Skip';
  final String availableDevicesTitle = 'Devices';
  final String availableDevicesHeaderText = 'Available Devices';
  final String nameDeviceTitle = 'Name your device';
  final String deviceNameHint = 'Device name';
  final String selectLocationText = 'Select Location';
  final String continueButtonText = 'Continue';
  final String deviceAddedTitle = 'Successfully added the device';
  final String returnButtonText = 'Return to device page';

  // Colors
  final Color backgroundColor = Colors.white;
  final Color primaryTextColor = Colors.black;
  final Color secondaryTextColor = Colors.grey;
  final Color borderColor = Colors.grey.shade300;
  final Color selectedBorderColor = Colors.black;
  final Color buttonColor = Colors.black;
  final Color buttonTextColor = Colors.white;
  final Color inputBackgroundColor = Colors.grey.shade100;
  final Color successColor = Colors.green;
  final Color shadowColor = Colors.grey.withOpacity(0.1);
  final Color selectedLocationColor = Colors.black;
  final Color unselectedLocationColor = Color(0xFF555555);

  // Sizes & Dimensions - Desktop
  final double desktopMaxWidth = 800.0;
  final double desktopPadding = 48.0;
  final double desktopVerticalPadding = 60.0;
  final double desktopIconSize = 28.0;
  final double desktopTitleSize = 36.0;
  final double desktopSubtitleSize = 20.0;
  final double desktopButtonTextSize = 18.0;
  final double desktopScanSize = 300.0;
  final double desktopOuterScanSize = 320.0;
  final double desktopBorderWidth = 3.0;
  final double desktopInnerBorderWidth = 10.0;
  final double desktopSpacing = 28.0;
  final double desktopGridSpacing = 24.0;
  final double desktopBorderRadius = 16.0;
  final double desktopSuccessIconSize = 150.0;

  // Sizes & Dimensions - Mobile
  final double mobilePadding = 24.0;
  final double mobileVerticalPadding = 40.0;
  final double mobileIconSize = 24.0;
  final double mobileTitleSize = 28.0;
  final double mobileSubtitleSize = 16.0;
  final double mobileButtonTextSize = 16.0;
  final double mobileScanSize = 200.0;
  final double mobileOuterScanSize = 220.0;
  final double mobileBorderWidth = 2.0;
  final double mobileInnerBorderWidth = 8.0;
  final double mobileSpacing = 20.0;
  final double mobileGridSpacing = 16.0;
  final double mobileBorderRadius = 12.0;
  final double mobileSuccessIconSize = 100.0;

  // Animation
  final Duration scanAnimationDuration = Duration(seconds: 2);
  final double scanAnimationStart = 1.0;
  final double scanAnimationEnd = 1.2;
  final Curve scanAnimationCurve = Curves.easeInOut;

  // Device Locations
  final List<String> deviceLocations = [
    'Living Room',
    'Kitchen',
    'Bathroom',
    'Bedroom',
    'Garage',
  ];

  // Available Devices
  final List<String> availableDevices = [
    'Alexa',
    'Samsung',
    'Amazon Echo',
    'Security camera',
    'Kitchen bulb',
    'Smart plug',
    'Smart purifier',
  ];

  // Grid Configuration
  final int desktopGridCrossAxisCount = 3;
  final int mobileGridCrossAxisCount = 1;
  final double desktopGridAspectRatio = 2.0;
  final double mobileGridAspectRatio = 4.0;

  // Location Grid Configuration
  final int desktopLocationGridCrossAxisCount = 3;
  final int mobileLocationGridCrossAxisCount = 2;
  final double desktopLocationGridAspectRatio = 3.0;
  final double mobileLocationGridAspectRatio = 2.5;

  // Button Styles
  ButtonStyle getElevatedButtonStyle({
    required bool isDesktop,
    Color? backgroundColor,
  }) {
    return ElevatedButton.styleFrom(
      backgroundColor: backgroundColor ?? buttonColor,
      padding: EdgeInsets.symmetric(
        vertical: isDesktop ? 20 : 16,
      ),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(
          isDesktop ? desktopBorderRadius : mobileBorderRadius,
        ),
      ),
    );
  }

  // Text Styles
  TextStyle getTitleStyle({required bool isDesktop}) {
    return TextStyle(
      fontSize: isDesktop ? desktopTitleSize : mobileTitleSize,
      fontWeight: FontWeight.bold,
      color: primaryTextColor,
    );
  }

  TextStyle getSubtitleStyle({required bool isDesktop}) {
    return TextStyle(
      fontSize: isDesktop ? desktopSubtitleSize : mobileSubtitleSize,
      color: secondaryTextColor,
    );
  }

  TextStyle getButtonTextStyle({required bool isDesktop}) {
    return TextStyle(
      fontSize: isDesktop ? desktopButtonTextSize : mobileButtonTextSize,
      color: buttonTextColor,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
    );
  }
}