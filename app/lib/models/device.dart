import 'package:freezed_annotation/freezed_annotation.dart';

/// All capability types a device can have
enum DeviceCapabilityType {
  // Basic capabilities
  value,
  @JsonValue('switch')
  toggle, // boolean value (named toggle to avoid keyword conflict)
  range,
  number,
  mode,
  date,
  image,
  // Multi-value capabilities
  multiswitch,
  multimode,
  multirange,
  multinumber,
  multivalue,
  // Action capability
  action,
}

/// Bound type for number capabilities
enum BoundType {
  min,
  max,
}

/// Capability subtypes for more specific capabilities
enum CapabilitySubtype {
  @JsonValue('power')
  power,
  @JsonValue('lock')
  lock,
  @JsonValue('mute')
  mute,
  @JsonValue('timer')
  timer,
  @JsonValue('color')
  color,
  @JsonValue('list')
  list,
}

/// Basic capability types that can be used in both device capabilities and action arguments
const List<DeviceCapabilityType> basicCapabilityTypes = [
  DeviceCapabilityType.value,
  DeviceCapabilityType.toggle,
  DeviceCapabilityType.range,
  DeviceCapabilityType.number,
  DeviceCapabilityType.mode,
  DeviceCapabilityType.date,
  DeviceCapabilityType.image,
];
