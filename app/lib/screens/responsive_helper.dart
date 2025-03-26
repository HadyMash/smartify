import 'package:flutter/material.dart';

class ResponsiveHelper {
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 850;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 850;

  // Get dynamic values based on screen size
  static double getScheduleWidth(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    if (screenWidth >= 1400) {
      return 250.0; // Larger schedule boxes for very wide screens
    } else if (screenWidth >= 850) {
      return 200.0; // Medium schedule boxes for desktop
    }
    return 150.0; // Original mobile size
  }

  static double getTimeSlotWidth(BuildContext context) {
    return isDesktop(context) ? 100.0 : 80.0;
  }

  static double getHourHeight(BuildContext context) {
    return isDesktop(context) ? 90.0 : 70.0;
  }

  static double getFontSize(BuildContext context, double mobileSize) {
    return isDesktop(context) ? mobileSize * 1.2 : mobileSize;
  }

  static EdgeInsets getScreenPadding(BuildContext context) {
    return isDesktop(context)
        ? const EdgeInsets.all(32.0)
        : const EdgeInsets.all(16.0);
  }
  
  // New helper methods for schedule screen
  static double getIconSize(BuildContext context, double mobileSize) {
    return isDesktop(context) ? mobileSize * 1.25 : mobileSize;
  }
  
  static double getButtonHeight(BuildContext context) {
    return isDesktop(context) ? 56.0 : 48.0;
  }
  
  static double getSpacing(BuildContext context, double mobileSpacing) {
    return isDesktop(context) ? mobileSpacing * 1.5 : mobileSpacing;
  }
  
  static BorderRadius getBorderRadius(BuildContext context, double mobileRadius) {
    return BorderRadius.circular(isDesktop(context) ? mobileRadius * 1.25 : mobileRadius);
  }
  
  // Adding the missing methods that are causing errors
  static EdgeInsets getBoxPadding(BuildContext context) {
    return EdgeInsets.symmetric(
      vertical: isDesktop(context) ? 16.0 : 12.0,
      horizontal: isDesktop(context) ? 20.0 : 16.0,
    );
  }
  
  static EdgeInsets getButtonPadding(BuildContext context) {
    return EdgeInsets.symmetric(
      horizontal: isDesktop(context) ? 24.0 : 16.0,
      vertical: isDesktop(context) ? 16.0 : 12.0,
    );
  }
}