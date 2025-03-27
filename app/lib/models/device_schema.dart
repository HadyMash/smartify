import 'package:freezed_annotation/freezed_annotation.dart';
import 'dart:convert';
import 'device.dart';
import 'capability.dart';
import 'capability_extension.dart';

part 'device_schema.freezed.dart';

/// The supported device sources/manufacturers
enum DeviceSource {
  @JsonValue('acme')
  acme,
}

/// The types of device access
enum DeviceAccessType {
  @JsonValue('appliances')
  appliances,
  @JsonValue('health')
  health,
  @JsonValue('security')
  security,
  @JsonValue('energy')
  energy,
}

/// A base device model without state
@freezed
abstract class Device with _$Device {
  const Device._();

  const factory Device({
    /// Device ID
    required String id,

    /// The device's name
    String? name,

    /// The device's description
    String? description,

    /// The source of the device (manufacturer)
    required DeviceSource source,

    /// The type of device
    required DeviceAccessType accessType,

    /// The device's icon
    String? icon,

    /// Device capabilities
    required List<Capability> capabilities,
  }) = _Device;

  ///// Factory constructor for creating a Device from JSON
  //factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
}

/// A device with its state
@freezed
abstract class DeviceWithState with _$DeviceWithState {
  const DeviceWithState._();

  const factory DeviceWithState({
    /// Device ID
    required String id,

    /// The device's name
    String? name,

    /// The device's description
    String? description,

    /// The source of the device (manufacturer)
    required DeviceSource source,

    /// The type of device
    required DeviceAccessType accessType,

    /// The device's icon
    String? icon,

    /// Device capabilities
    required List<Capability> capabilities,

    /// The device's state
    required Map<String, dynamic> state,

    /// Optional active actions and their states
    Map<String, ActionState>? actionStates,
  }) = _DeviceWithState;

  ///// Factory constructor for creating a DeviceWithState from JSON
  //factory DeviceWithState.fromJson(Map<String, dynamic> json) =>
  //    _$DeviceWithStateFromJson(json);

  /// Validates that all capabilities have a corresponding state
  bool validateStateCompletion() {
    final stateKeys = state.keys.toSet();
    final capabilityIds = capabilities.map((c) => c.id).toSet();

    // All state keys must be valid capability IDs
    if (!stateKeys.every((key) => capabilityIds.contains(key))) {
      return false;
    }

    // All capabilities must have a state
    if (!capabilityIds.every((id) => stateKeys.contains(id))) {
      return false;
    }

    return true;
  }

  /// Validates that all state values match their capability types
  bool validateStateValues() {
    return state.entries.every((entry) {
      final capability = capabilities.firstWhere(
        (c) => c.id == entry.key,
        orElse: () =>
            throw Exception('No capability found for state key: ${entry.key}'),
      );

      return capability.validateValue(entry.value);
    });
  }
}

/// A device with partial state
@freezed
abstract class DeviceWithPartialState with _$DeviceWithPartialState {
  const DeviceWithPartialState._();

  const factory DeviceWithPartialState({
    /// Device ID
    required String id,

    /// The device's name
    String? name,

    /// The device's description
    String? description,

    /// The source of the device (manufacturer)
    required DeviceSource source,

    /// The type of device
    required DeviceAccessType accessType,

    /// The device's icon
    String? icon,

    /// Device capabilities
    required List<Capability> capabilities,

    /// The device's partial state
    @Default({}) Map<String, dynamic> state,

    /// Optional active actions and their states
    Map<String, ActionState>? actionStates,
  }) = _DeviceWithPartialState;

  ///// Factory constructor for creating a DeviceWithPartialState from JSON
  //factory DeviceWithPartialState.fromJson(Map<String, dynamic> json) =>
  //    _$DeviceWithPartialStateFromJson(json);

  /// Validates that all state values match their capability types
  bool validateStateValues() {
    return state.entries.every((entry) {
      final capability = capabilities.firstWhere(
        (c) => c.id == entry.key,
        orElse: () =>
            throw Exception('No capability found for state key: ${entry.key}'),
      );

      return capability.validateValue(entry.value);
    });
  }

  /// Converts partial state to complete state
  DeviceWithState toDeviceWithState() {
    // Make sure all capabilities have a state
    final completeState = Map<String, dynamic>.from(state);

    for (final capability in capabilities) {
      if (!completeState.containsKey(capability.id)) {
        completeState[capability.id] =
            _getDefaultValueForCapability(capability);
      }
    }

    return DeviceWithState(
      id: id,
      name: name,
      description: description,
      source: source,
      accessType: accessType,
      icon: icon,
      capabilities: capabilities,
      state: completeState,
      actionStates: actionStates,
    );
  }

  /// Generate default value for a capability
  dynamic _getDefaultValueForCapability(Capability capability) {
    switch (capability.runtimeType) {
      case ToggleCapability:
        return false;
      case RangeCapability:
        final c = capability as RangeCapability;
        return c.min;
      case NumberCapability:
        final c = capability as NumberCapability;
        return c.bound?.value ?? 0;
      case ModeCapability:
        final c = capability as ModeCapability;
        return c.modes.first;
      case ValueCapability:
        return '';
      case DateCapability:
        return DateTime.now().millisecondsSinceEpoch;
      case ImageCapability:
        return <int>[];
      case MultiSwitchCapability:
        final c = capability as MultiSwitchCapability;
        return List<bool>.filled(c.length ?? 1, false);
      case MultiModeCapability:
        final c = capability as MultiModeCapability;
        return [c.modes.first];
      case MultiRangeCapability:
        final c = capability as MultiRangeCapability;
        final min =
            c.min is List<double> ? c.min as List<double> : [c.min as double];
        return min;
      case MultiNumberCapability:
        final c = capability as MultiNumberCapability;
        final length = c.length ?? 1;
        final defaultValue = c.bound is List
            ? (c.bound as List).map((b) => b?.value ?? 0.0).toList()
            : List<double>.filled(length, c.bound?.value ?? 0.0);
        return defaultValue;
      case MultiValueCapability:
        final c = capability as MultiValueCapability;
        return List<String>.filled(c.length ?? 1, '');
      case ActionCapability:
        return null;
      default:
        throw ArgumentError(
            'Unknown capability type: ${capability.runtimeType}');
    }
  }
}

/// The state of an ongoing action
@freezed
abstract class ActionState with _$ActionState {
  const ActionState._();

  const factory ActionState({
    /// The action being performed
    required String actionId,

    /// The progress description
    required String progress,

    /// Start time of the action in milliseconds since epoch
    required int startTime,

    /// Optional data specific to this action
    Map<String, dynamic>? data,
  }) = _ActionState;

  ///// Factory constructor for creating an ActionState from JSON
  //factory ActionState.fromJson(Map<String, dynamic> json) =>
  //    _$ActionStateFromJson(json);

  /// Get the start time as a DateTime
  DateTime get startDateTime => DateTime.fromMillisecondsSinceEpoch(startTime);
}

/// Device-related errors
class DeviceError implements Exception {
  final String message;
  DeviceError(this.message);
  @override
  String toString() => message;
}

class DeviceOfflineError extends DeviceError {
  final String deviceId;
  DeviceOfflineError(this.deviceId) : super('Device offline, id: $deviceId');
}

class DeviceNotFoundError extends DeviceError {
  final String deviceId;
  DeviceNotFoundError(this.deviceId) : super('Device not found, id: $deviceId');
}

class BadRequestToDeviceError extends DeviceError {
  final String deviceId;
  BadRequestToDeviceError(this.deviceId, [String? details])
      : super(
            'Bad request sent to device: $deviceId${details != null ? ". $details" : ""}');
}

class ExternalServerError extends DeviceError {
  ExternalServerError([String? details])
      : super('External server error${details != null ? ". $details" : ""}');
}
