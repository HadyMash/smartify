import 'package:flutter/material.dart';
import 'app_config.dart';

class InitialScheduleData {
  static final Map<String, Map<String, Map<String, dynamic>>> initialSchedules = {
    'Mon': {
      '6:00am': {
        'name': 'Rise and Shine Mode',
        'color': ScheduleConfig().scheduleColors[0],
        'stopTime': '7:00am',
        'devices': ['Coffee Machine', 'Lights']
      },
      '8:00am': {
        'name': 'Morning Boost',
        'color': Colors.black,
        'stopTime': '9:00am',
        'devices': ['Air Conditioner', 'Speaker']
      },
    },
    'Tue': {
      '7:00am': {
        'name': 'Morning Routine',
        'color': ScheduleConfig().scheduleColors[1],
        'stopTime': '8:00am',
        'devices': ['Coffee Machine', 'Lights', 'Speaker']
      },
    },
    'Wed': {
      '6:00am': {
        'name': 'Rise and Shine Mode',
        'color': ScheduleConfig().scheduleColors[0],
        'stopTime': '7:00am',
        'devices': ['Coffee Machine', 'Lights']
      },
    },
    'Thurs': {},
    'Fri': {},
    'Sat': {},
    'Sun': {},
  };
}