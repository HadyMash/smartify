import 'package:flutter/material.dart';

// Navigation item model
class NavItem {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  NavItem({required this.icon, required this.label, this.onTap});
}

// Device suggestion model
class SuggestedDevice {
  final String name;
  final String room;

  SuggestedDevice({required this.name, required this.room});
}

// Dashboard content configuration
class DashboardData {
  // Greeting and voice assistant
  static const String greetingName = "Batman";
  static const String welcomeMessage = "Welcome back to your Smart Home";
  static const String voicePromptTitle = "Ask Us With Your Voice";
  static const String voicePromptSubtitle = 'Say "hi home" first as trigger';

  // Energy usage
  static const Map<String, String> energyStats = {
    "Today": "↑ 14 kwh",
    "This month": "↑ 167 kwh",
  };

  // Suggested devices
  static final List<SuggestedDevice> suggestedDevices = [
    SuggestedDevice(name: "Smart TV", room: "Living Room"),
    SuggestedDevice(name: "Air Conditioner", room: "Bedroom"),
    SuggestedDevice(name: "Light", room: "Living Room"),
    SuggestedDevice(name: "Speakers", room: "Bedroom"),
  ];

  // Schedule
  static const String scheduleText = "2 schedules created";

  // Sidebar and bottom navigation items
  static final List<NavItem> navItems = [
    NavItem(icon: Icons.bolt, label: "Energy"),
    NavItem(
      icon: Icons.lightbulb,
      label: "Devices",
      onTap: null, // Will be set dynamically in the widget
    ),
    NavItem(icon: Icons.home, label: "Home"),
    NavItem(
      icon: Icons.security,
      label: "Security",
      onTap: null, // Will be set dynamically in the widget
    ),
    NavItem(icon: Icons.settings, label: "Settings"),
  ];

  // App title
  static const String appTitle = "Smart Home";
}