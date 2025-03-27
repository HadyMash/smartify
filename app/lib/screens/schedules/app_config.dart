import 'package:flutter/material.dart';

class ScheduleConfig {
  static final ScheduleConfig _instance = ScheduleConfig._internal();
  factory ScheduleConfig() => _instance;
  ScheduleConfig._internal();

  // Days of the week
  List<String> days = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

  // All time slots
  List<String> allTimes = [
    '12:00am', '1:00am', '2:00am', '3:00am', '4:00am', '5:00am',
    '6:00am', '7:00am', '8:00am', '9:00am', '10:00am', '11:00am',
    '12:00pm', '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm',
    '6:00pm', '7:00pm', '8:00pm', '9:00pm', '10:00pm', '11:00pm',
    '12:00am' // Added to represent 11:59pm, displayed as "12am"
  ];

  // Device icons and colors
  Map<String, Map<String, dynamic>> deviceIcons = {
    'TV': {'icon': Icons.tv, 'color': Colors.indigo},
    'Lights': {'icon': Icons.lightbulb_outline, 'colorValue': 0xFFFFB300},
    'Air Conditioner': {'icon': Icons.ac_unit, 'color': Colors.lightBlue},
    'Speaker': {'icon': Icons.speaker, 'color': Colors.red},
    'Blinds': {'icon': Icons.blinds, 'color': Colors.brown},
    'Smart Vacuum': {'icon': Icons.cleaning_services, 'color': Colors.green},
    'Coffee Machine': {'icon': Icons.coffee, 'colorValue': 0xFF5D4037},
    'Oven': {'icon': Icons.microwave, 'color': Colors.orange},
    'Microwave': {'icon': Icons.microwave, 'color': Colors.teal},
    'Refrigerator': {'icon': Icons.kitchen, 'color': Colors.blueGrey},
    'Dishwasher': {'icon': Icons.wash, 'color': Colors.cyan}
  };

  // Schedule colors
  List<Color> scheduleColors = [
    Color(0xFFE57373), // Red
    Color(0xFF81C784), // Green
    Color(0xFF64B5F6), // Blue
    Color(0xFFFFB74D), // Orange
    Color(0xFFBA68C8), // Purple
    Color(0xFF4DB6AC), // Teal
    Color(0xFFFFD54F), // Yellow
    Color(0xFF7986CB), // Indigo
    Color(0xFFA1887F), // Brown
    Color(0xFF90A4AE), // Blue Grey
  ];

  // UI constants
  double borderRadius = 12.0;
  double padding = 16.0;
  double spacing = 8.0;

  // Default times for AddScheduleScreen
  TimeOfDay defaultStartTime = TimeOfDay(hour: 7, minute: 0);
  TimeOfDay defaultStopTime = TimeOfDay(hour: 8, minute: 0);
}