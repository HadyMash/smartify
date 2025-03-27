import 'package:flutter/material.dart';

enum CapabilityType {
  value,    // string value
  toggle,   // boolean value (renamed from switch)
  range,    // number with min/max bounds
  number,   // number with optional single bound
  mode,     // enumerated string values
  multiswitch,
  multimode,
  multirange,
  multinumber,
  multivalue,
  action,
}

class DeviceCapability {
  final String id;
  final String name;
  final CapabilityType type;
  final dynamic value;
  final Map<String, dynamic>? config;

  DeviceCapability({
    required this.id,
    required this.name,
    required this.type,
    required this.value,
    this.config,
  });
}

class DeviceCapabilityConfig {
  final double? min;
  final double? max;
  final List<String>? modes;
  final String? unit;
  final IconData? icon;
  final List<String>? options;

  DeviceCapabilityConfig({
    this.min,
    this.max,
    this.modes,
    this.unit,
    this.icon,
    this.options,
  });
}