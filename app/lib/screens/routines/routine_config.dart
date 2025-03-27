import 'package:flutter/material.dart';

class RoutineConfig {
  static final RoutineConfig _instance = RoutineConfig._internal();
  factory RoutineConfig() => _instance;
  RoutineConfig._internal();

  // Text content
  String title = "Routines";
  String editTitle = "Edit Routine";
  String addTitle = "Add Routine";
  String routineNameLabel = "Routine Name";
  String routineNameHint = "Enter routine name";
  String selectIconLabel = "Select Icon";
  String pickIconButton = "Pick Icon";
  String selectedDevicesLabel = "Selected Devices";
  String addDeviceButton = "Add Device";
  String saveButton = "Save";
  String deleteTitle = "Delete Routine";
  String deleteMessage = "Are you sure you want to delete this routine?";
  String cancelButton = "Cancel";
  String deleteButton = "Delete";
  String selectDeviceTitle = "Select Device";

  // Default routines
  List<Map<String, dynamic>> defaultRoutines = [
    {'name': 'Rise and Shine Mode', 'icon': Icons.wb_sunny_outlined, 'isActive': false},
    {'name': 'Away Mode', 'icon': Icons.home_outlined, 'isActive': false},
    {'name': 'Morning Boost', 'icon': Icons.brightness_7_outlined, 'isActive': false},
    {'name': 'Living Room Light', 'icon': Icons.lightbulb_outline, 'isActive': false},
    {'name': 'Lunch Time Setup', 'icon': Icons.restaurant_outlined, 'isActive': false},
    {'name': 'Tea Time Routine', 'icon': Icons.coffee_outlined, 'isActive': false},
    {'name': 'Evening Comfort', 'icon': Icons.nights_stay_outlined, 'isActive': false},
    {'name': 'Bedtime Routine', 'icon': Icons.bedtime_outlined, 'isActive': false},
  ];

  // Device icons
  Map<String, Map<String, dynamic>> deviceIcons = {
    'TV': {'icon': Icons.tv, 'color': Colors.indigo},
    'Lights': {'icon': Icons.lightbulb_outline, 'color': Colors.yellow[700]},
    'Air Conditioner': {'icon': Icons.ac_unit, 'color': Colors.lightBlue},
    'Speaker': {'icon': Icons.speaker, 'color': Colors.red},
    'Blinds': {'icon': Icons.blinds, 'color': Colors.brown},
    'Smart Vacuum': {'icon': Icons.cleaning_services, 'color': Colors.green},
    'Coffee Machine': {'icon': Icons.coffee, 'color': Colors.brown[700]},
    'Oven': {'icon': Icons.microwave, 'color': Colors.orange},
    'Microwave': {'icon': Icons.microwave, 'color': Colors.teal},
    'Refrigerator': {'icon': Icons.kitchen, 'color': Colors.blueGrey},
    'Dishwasher': {'icon': Icons.wash, 'color': Colors.cyan},
  };

  // Common icons
  List<IconData> commonIcons = [
    Icons.wb_sunny_outlined,
    Icons.home_outlined,
    Icons.brightness_7_outlined,
    Icons.lightbulb_outline,
    Icons.restaurant_outlined,
    Icons.coffee_outlined,
    Icons.nights_stay_outlined,
    Icons.bedtime_outlined,
    Icons.sports_esports,
    Icons.tv,
    Icons.computer,
    Icons.phone_android,
    Icons.umbrella,
    Icons.local_cafe,
    Icons.fitness_center,
    Icons.movie,
    Icons.music_note,
    Icons.brush,
    Icons.directions_car,
    Icons.pets,
  ];

  // Colors
  Color backgroundColor = Colors.white;
  Color borderColor = Colors.grey.shade200;
  Color shadowColor = Colors.grey.withOpacity(0.1);
  Color activeSwitchColor = Colors.green;
  Color inactiveSwitchColor = Colors.grey;
  Color editIconColor = Colors.grey;
  Color deleteIconColor = Colors.grey;
  Color fabColor = Colors.black;
  Color fabIconColor = Colors.white;
  Color textColor = Colors.black;
  Color hintTextColor = Colors.grey;
  Color buttonColor = Colors.black;
  Color buttonTextColor = Colors.white;
  Color deleteButtonColor = Colors.red;

  // Sizes & Dimensions - Desktop
  double desktopPadding = 24.0;
  double desktopSpacing = 24.0;
  double desktopGridSpacing = 24.0;
  double desktopCardPadding = 24.0;
  double desktopIconSize = 36.0;
  double desktopTextSize = 22.0;
  double desktopTitleSize = 24.0;
  double desktopButtonTextSize = 16.0;
  double desktopBorderRadius = 16.0;
  int desktopGridCrossAxisCount = 2;
  double desktopGridChildAspectRatio = 1.5;

  // Sizes & Dimensions - Mobile
  double mobilePadding = 16.0;
  double mobileSpacing = 16.0;
  double mobileCardPadding = 20.0;
  double mobileIconSize = 30.0;
  double mobileTextSize = 20.0;
  double mobileTitleSize = 24.0;
  double mobileButtonTextSize = 16.0;
  double mobileBorderRadius = 16.0;

  // Icons
  IconData backIcon = Icons.arrow_back;
  IconData addIcon = Icons.add;
  IconData editIcon = Icons.edit_outlined;
  IconData deleteIcon = Icons.delete_outline;
  IconData closeIcon = Icons.close;

  // Responsive helpers
  double getPadding(bool isDesktop) => isDesktop ? desktopPadding : mobilePadding;
  double getSpacing(bool isDesktop) => isDesktop ? desktopSpacing : mobileSpacing;
  double getCardPadding(bool isDesktop) => isDesktop ? desktopCardPadding : mobileCardPadding;
  double getIconSize(bool isDesktop) => isDesktop ? desktopIconSize : mobileIconSize;
  double getTextSize(bool isDesktop) => isDesktop ? desktopTextSize : mobileTextSize;
  double getTitleSize(bool isDesktop) => isDesktop ? desktopTitleSize : mobileTitleSize;
  double getBorderRadius(bool isDesktop) => isDesktop ? desktopBorderRadius : mobileBorderRadius;
}