import 'package:flutter/material.dart';

class SecurityConfig {
  static final SecurityConfig _instance = SecurityConfig._internal();
  factory SecurityConfig() => _instance;
  SecurityConfig._internal();

  // Initial data (can be overridden later via backend)
  List<String> defaultCameraIds = List.generate(5, (i) => (i + 1).toString());
  Map<String, bool> defaultLocks = {
    'Front door': false,
    'Back door': true,
    'Garage door': true,
    'Master Bedroom': false,
  };
  Map<String, bool> defaultAlarms = {
    'Back door': true,
    'Basement': false,
    'Front door': false,
    'Attic': true,
  };

  // Text content
  String defaultTitle = 'Security';
  String appTitle = 'Smart Home';
  String cameraSectionLabel = 'Camera';
  String locksSectionLabel = 'Locks and Alarms';
  String devicesSectionLabel = 'Devices';
  List<String> sidebarLabels = ['Energy', 'Devices', 'Home', 'Security', 'Settings'];
  List<String> navBarLabels = ['Energy', 'Devices', 'Home', 'Security', 'Settings'];
  String cameraLabelPrefix = 'Camera ';
  String lockOpenText = 'Open';
  String lockClosedText = 'Closed';
  String alarmActiveText = 'Active';
  String alarmInactiveText = 'Inactive';

  // UI measurements
  double desktopPadding = 32.0;
  double mobilePadding = 16.0;
  double sidebarWidth = 240.0;
  double sidebarItemPaddingHorizontal = 24.0;
  double sidebarItemPaddingVertical = 16.0;
  double desktopSpacingLarge = 24.0;
  double desktopSpacingMedium = 16.0;
  double mobileSpacingLarge = 16.0;
  double mobileSpacingMedium = 12.0;
  double cameraFullScreenTopPadding = 16.0;
  double cameraFullScreenBottomPaddingDesktop = 48.0;
  double cameraFullScreenBottomPaddingMobile = 32.0;
  double cameraFullScreenSpacingDesktop = 24.0;
  double cameraFullScreenSpacingMobile = 16.0;
  double locksCardMarginBottom = 16.0;
  double desktopIconSizeLarge = 36.0;
  double mobileIconSizeLarge = 32.0;
  double desktopIconSizeMedium = 28.0;
  double mobileIconSizeMedium = 24.0;
  double navIconSize = 24.0;
  double sidebarIconSize = 20.0;
  double arrowIconSize = 18.0;
  double cameraOffIconSize = 32.0;
  double cameraFullScreenOffIconSize = 48.0;
  double desktopMicButtonSize = 80.0;
  double mobileMicButtonSize = 64.0;
  double desktopTitleFontSize = 28.0;
  double mobileTitleFontSize = 24.0;
  double desktopSectionFontSize = 22.0;
  double mobileSectionFontSize = 20.0;
  double desktopSidebarFontSize = 20.0;
  double desktopCardFontSize = 20.0;
  double mobileCardFontSize = 18.0;
  double desktopStatusFontSize = 18.0;
  double mobileStatusFontSize = 16.0;
  double cameraLabelFontSize = 12.0;
  double desktopCameraFullScreenFontSize = 22.0;
  double mobileCameraFullScreenFontSize = 18.0;

  // Colors
  Color backgroundColor = Colors.white;
  Color cameraBackgroundColor = Colors.grey[200]!;
  Color sidebarBackgroundColor = Colors.grey[100]!;
  Color sidebarBorderColor = Colors.grey[300]!;
  Color cameraLabelBackgroundColor = Colors.black.withOpacity(0.6);
  Color textColor = Colors.black;
  Color inactiveTextColor = Colors.grey[600]!;
  Color inactiveAlarmTextColor = Colors.grey[400]!;
  Color whiteTextColor = Colors.white;
  Color shadowColor = Colors.black.withOpacity(0.05);
  Color lockCardShadowColor = Colors.grey.withOpacity(0.1);
  Color micActiveColor = Colors.red;
  Color micInactiveColor = Colors.white;
  Color switchActiveColor = Colors.blue;
  Color navGradientStart = Colors.black;
  Color navGradientEnd = Colors.black87;
  Color fullscreenBackgroundColor = Colors.black;
  Color cameraOffIconColor = Colors.grey;

  // Icons
  IconData backIcon = Icons.arrow_back;
  IconData cameraOffIcon = Icons.videocam_off_outlined;
  IconData fullscreenIcon = Icons.fullscreen;
  IconData appIcon = Icons.home;
  IconData micIcon = Icons.mic;
  IconData arrowForwardIcon = Icons.arrow_forward_ios;
  IconData energyIcon = Icons.bolt;
  IconData devicesIcon = Icons.lightbulb;
  IconData homeIcon = Icons.home;
  IconData securityIcon = Icons.security;
  IconData settingsIcon = Icons.settings;
  IconData lockOpenIcon = Icons.lock_open;
  IconData lockClosedIcon = Icons.lock_outline;
  IconData alarmActiveIcon = Icons.notifications_none;
  IconData alarmInactiveIcon = Icons.notifications_off_outlined;

  // Layout parameters
  double cameraAspectRatio = 16 / 9;
  double cardAspectRatio = 4 / 3;
  double desktopLocksAspectRatio = 1.2;
  int desktopCameraGridCount = 3;
  int mobileCameraGridCount = 2;
  int desktopLocksGridCount = 4;
  int securityNavIndex = 3;

  // Styles
  FontWeight boldFontWeight = FontWeight.bold;
  FontWeight semiBoldFontWeight = FontWeight.w600;
  FontWeight mediumFontWeight = FontWeight.w500;
  FontWeight normalFontWeight = FontWeight.normal;
  double shadowBlurRadius = 10.0;
  double lockCardShadowBlurRadius = 4.0;
  double shadowSpreadRadius = 1.0;
  Offset shadowOffset = const Offset(0, 2);
}