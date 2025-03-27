import 'package:flutter/material.dart';
import 'app_config.dart'; 

class AppConstants {
  static ScheduleConfig config = ScheduleConfig();

  static List<String> get days => config.days;
  static List<String> get allTimes => config.allTimes;
  static Map<String, Map<String, dynamic>> get deviceIcons => config.deviceIcons;
  static List<Color> get scheduleColors => config.scheduleColors;
  static double get borderRadius => config.borderRadius;
  static double get padding => config.padding;
  static double get spacing => config.spacing;

  // Utility methods remain unchanged
  static TimeOfDay parseTimeString(String timeStr) {
    String timeLower = timeStr.toLowerCase();
    bool isAM = timeLower.contains('am');
    List<String> parts = timeLower.replaceAll(RegExp(r'[ap]m'), '').split(':');

    int hour = int.parse(parts[0]);
    int minute = int.parse(parts[1]);

    if (!isAM && hour != 12) {
      hour += 12;
    } else if (isAM && hour == 12) {
      hour = 0;
    }

    return TimeOfDay(hour: hour, minute: minute);
  }

  static String formatTimeOfDay(TimeOfDay time) {
    int hour = time.hour;
    bool isAM = hour < 12;

    if (hour == 0) {
      hour = 12;
    } else if (hour > 12) {
      hour -= 12;
    }

    final minute = time.minute.toString().padLeft(2, '0');
    final period = isAM ? 'am' : 'pm';
    return '$hour:$minute$period';
  }

  static int convertTimeToMinutes(String time) {
    TimeOfDay timeOfDay = parseTimeString(time);
    return timeOfDay.hour * 60 + timeOfDay.minute;
  }

  static bool isValidTimeRange(TimeOfDay start, TimeOfDay stop) {
    final startMinutes = start.hour * 60 + start.minute;
    final stopMinutes = stop.hour * 60 + stop.minute;

    if (stopMinutes < startMinutes) {
      return true; // Valid if stop time is on the next day
    }

    return startMinutes < stopMinutes;
  }
}