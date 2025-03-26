import 'package:flutter/material.dart';

class DeviceInfo {
  final String name;
  final IconData icon;
  final bool isOn;
  final Color color;

  DeviceInfo({
    required this.name,
    required this.icon,
    required this.isOn,
    required this.color,
  });
}