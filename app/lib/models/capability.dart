import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';
import 'device.dart';

part 'capability.freezed.dart';
part 'capability.g.dart';

/// Base capability model for all device capabilities
@freezed
abstract class Capability with _$Capability {
  const Capability._();

  /// Switch/toggle capability
  const factory Capability.toggle({
    required String id,
    required DeviceCapabilityType type,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = ToggleCapability;

  /// Range capability (number with min/max)
  const factory Capability.range({
    required String id,
    required DeviceCapabilityType type,
    required double min,
    required double max,
    double? step,
    String? unit,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = RangeCapability;

  /// Number capability (with optional single bound)
  const factory Capability.number({
    required String id,
    required DeviceCapabilityType type,
    BoundValue? bound,
    double? step,
    String? unit,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = NumberCapability;

  /// Mode capability (enumerated string values)
  const factory Capability.mode({
    required String id,
    required DeviceCapabilityType type,
    required List<String> modes,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = ModeCapability;

  /// Value capability (string value)
  const factory Capability.value({
    required String id,
    required DeviceCapabilityType type,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = ValueCapability;

  /// Date capability
  const factory Capability.date({
    required String id,
    required DeviceCapabilityType type,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = DateCapability;

  /// Image capability
  const factory Capability.image({
    required String id,
    required DeviceCapabilityType type,
    List<int>? bytes,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = ImageCapability;

  /// Multi-switch capability
  const factory Capability.multiSwitch({
    required String id,
    required DeviceCapabilityType type,
    int? length,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = MultiSwitchCapability;

  /// Multi-mode capability
  const factory Capability.multiMode({
    required String id,
    required DeviceCapabilityType type,
    required List<String> modes,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = MultiModeCapability;

  /// Multi-range capability
  const factory Capability.multiRange({
    required String id,
    required DeviceCapabilityType type,
    required dynamic min, // Can be double or List<double>
    required dynamic max, // Can be double or List<double>
    dynamic step, // Can be double or List<double>
    dynamic unit, // Can be String or List<String>
    int? length,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = MultiRangeCapability;

  /// Multi-number capability
  const factory Capability.multiNumber({
    required String id,
    required DeviceCapabilityType type,
    dynamic bound, // Can be BoundValue or List<BoundValue?>
    dynamic step, // Can be double or List<double>
    dynamic unit, // Can be String or List<String>
    int? length,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = MultiNumberCapability;

  /// Multi-value capability
  const factory Capability.multiValue({
    required String id,
    required DeviceCapabilityType type,
    int? length,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = MultiValueCapability;

  /// Action capability
  const factory Capability.action({
    required String id,
    required DeviceCapabilityType type,
    required List<BasicCapability> arguments,
    required List<String> lockedFields,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = ActionCapability;

  /// Factory constructor for creating a Capability from JSON
  factory Capability.fromJson(Map<String, dynamic> json) =>
      _$CapabilityFromJson(json);
}

/// A bound value for number capabilities
@freezed
abstract class BoundValue with _$BoundValue {
  const factory BoundValue({
    required BoundType type,
    required double value,
  }) = _BoundValue;

  factory BoundValue.fromJson(Map<String, dynamic> json) =>
      _$BoundValueFromJson(json);
}

/// Basic capability for use in action arguments
@freezed
abstract class BasicCapability with _$BasicCapability {
  const BasicCapability._();

  /// Switch/toggle capability
  const factory BasicCapability.toggle({
    required String id,
    required DeviceCapabilityType type,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = BasicToggleCapability;

  /// Range capability
  const factory BasicCapability.range({
    required String id,
    required DeviceCapabilityType type,
    required double min,
    required double max,
    double? step,
    String? unit,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = BasicRangeCapability;

  /// Number capability
  const factory BasicCapability.number({
    required String id,
    required DeviceCapabilityType type,
    BoundValue? bound,
    double? step,
    String? unit,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = BasicNumberCapability;

  /// Mode capability
  const factory BasicCapability.mode({
    required String id,
    required DeviceCapabilityType type,
    required List<String> modes,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = BasicModeCapability;

  /// Value capability
  const factory BasicCapability.value({
    required String id,
    required DeviceCapabilityType type,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = BasicValueCapability;

  /// Date capability
  const factory BasicCapability.date({
    required String id,
    required DeviceCapabilityType type,
    String? name,
    String? extensionType,
    bool? readonly,
    String? icon,
  }) = BasicDateCapability;

  /// Factory constructor for creating a BasicCapability from JSON
  factory BasicCapability.fromJson(Map<String, dynamic> json) =>
      _$BasicCapabilityFromJson(json);
}
