import 'capability.dart';
import 'device.dart';

/// Extension methods for capabilities
extension CapabilityTypeExtension on DeviceCapabilityType {
  /// Convert to basic capability type if possible
  DeviceCapabilityType? toBasicType() {
    switch (this) {
      case DeviceCapabilityType.value:
        return DeviceCapabilityType.value;
      case DeviceCapabilityType.toggle:
        return DeviceCapabilityType.toggle;
      case DeviceCapabilityType.range:
        return DeviceCapabilityType.range;
      case DeviceCapabilityType.number:
        return DeviceCapabilityType.number;
      case DeviceCapabilityType.mode:
        return DeviceCapabilityType.mode;
      case DeviceCapabilityType.date:
        return DeviceCapabilityType.date;
      case DeviceCapabilityType.image:
        return DeviceCapabilityType.image;
      default:
        return null;
    }
  }

  /// Check if this is a multi-type capability
  bool get isMultiType {
    return this == DeviceCapabilityType.multiswitch ||
        this == DeviceCapabilityType.multimode ||
        this == DeviceCapabilityType.multirange ||
        this == DeviceCapabilityType.multinumber ||
        this == DeviceCapabilityType.multivalue;
  }

  /// Check if this is a basic type capability
  bool get isBasicType {
    return this == DeviceCapabilityType.value ||
        this == DeviceCapabilityType.toggle ||
        this == DeviceCapabilityType.range ||
        this == DeviceCapabilityType.number ||
        this == DeviceCapabilityType.mode ||
        this == DeviceCapabilityType.date ||
        this == DeviceCapabilityType.image;
  }
}

/// Extension methods for validating capability states
extension CapabilityValidation on Capability {
  /// Validate a value against this capability's constraints
  bool validateValue(dynamic value) {
    return value.when(
      toggle: (c) => value is bool,
      range: (c) {
        if (value is! double && value is! int) return false;
        final numValue = value is int ? value.toDouble() : value as double;
        if (numValue < c.min || numValue > c.max) return false;
        if (c.step != null) {
          final steps = (numValue - c.min) / c.step!;
          return (steps - steps.round()).abs() <= 1e-10;
        }
        return true;
      },
      number: (c) {
        if (value is! double && value is! int) return false;
        final numValue = value is int ? value.toDouble() : value as double;
        if (c.bound != null) {
          if (c.bound!.type == BoundType.min && numValue < c.bound!.value) {
            return false;
          }
          if (c.bound!.type == BoundType.max && numValue > c.bound!.value) {
            return false;
          }
        }
        if (c.step != null) {
          final reference = c.bound?.value ?? 0;
          final steps = (numValue - reference) / c.step!;
          return (steps - steps.round()).abs() <= 1e-10;
        }
        return true;
      },
      mode: (c) => value is String && c.modes.contains(value),
      value: (c) => value is String,
      date: (c) {
        if (value is! int) return false;
        try {
          final date = DateTime.fromMillisecondsSinceEpoch(value);
          return date.millisecondsSinceEpoch > 0;
        } catch (_) {
          return false;
        }
      },
      image: (c) => value is List<int>,
      multiSwitch: (c) {
        if (value is! List<bool>) return false;
        if (c.length != null && value.length != c.length) return false;
        return true;
      },
      multiMode: (c) {
        if (value is! List) return false;
        if (!value.every((v) => v is String && c.modes.contains(v))) {
          return false;
        }
        return true;
      },
      multiRange: (c) {
        if (value is! List) return false;
        if (c.length != null && value.length != c.length) return false;

        // Extract mins, maxs, and steps
        final mins = c.min is List
            ? c.min as List<double>
            : List.filled(value.length, c.min as double);
        final maxs = c.max is List
            ? c.max as List<double>
            : List.filled(value.length, c.max as double);
        final steps = c.step is List
            ? c.step as List<double>?
            : c.step != null
                ? List.filled(value.length, c.step as double)
                : null;

        for (int i = 0; i < value.length; i++) {
          if (value[i] is! double && value[i] is! int) return false;
          final numValue = value[i] is int
              ? (value[i] as int).toDouble()
              : value[i] as double;

          if (numValue < mins[i] || numValue > maxs[i]) return false;

          if (steps != null) {
            final stepValue = steps[i];
            if (stepValue != null) {
              final stepCount = (numValue - mins[i]) / stepValue;
              if ((stepCount - stepCount.round()).abs() > 1e-10) return false;
            }
          }
        }

        return true;
      },
      multiNumber: (c) {
        if (value is! List) return false;
        if (c.length != null && value.length != c.length) return false;

        final bounds = c.bound is List
            ? c.bound as List<BoundValue?>
            : c.bound != null
                ? List.filled(value.length, c.bound as BoundValue)
                : null;

        final steps = c.step is List
            ? c.step as List<double>?
            : c.step != null
                ? List.filled(value.length, c.step as double)
                : null;

        for (int i = 0; i < value.length; i++) {
          if (value[i] is! double && value[i] is! int) return false;
          final numValue = value[i] is int
              ? (value[i] as int).toDouble()
              : value[i] as double;

          if (bounds != null && i < bounds.length && bounds[i] != null) {
            final bound = bounds[i]!;
            if (bound.type == BoundType.min && numValue < bound.value) {
              return false;
            }
            if (bound.type == BoundType.max && numValue > bound.value) {
              return false;
            }
          }

          if (steps != null && i < steps.length && steps[i] != null) {
            final reference =
                bounds != null && i < bounds.length && bounds[i] != null
                    ? bounds[i]!.value
                    : 0.0;
            final stepCount = (numValue - reference) / steps[i]!;
            if ((stepCount - stepCount.round()).abs() > 1e-10) return false;
          }
        }

        return true;
      },
      multiValue: (c) {
        if (value is! List) return false;
        if (c.length != null && value.length != c.length) return false;
        return value.every((v) => v is String);
      },
      action: (c) => value == null, // Actions have null state
    );
  }
}

/// Extension methods for validating basic capability states
extension BasicCapabilityValidation on DeviceCapabilityType {
  /// Validate a value against this capability's constraints
  bool validateValue(dynamic value) {
    switch (this) {
      case DeviceCapabilityType.toggle:
        return value is bool;
      case DeviceCapabilityType.range:
        if (value is! double && value is! int) return false;
        // Note: We can't validate min/max here as we don't have the range values
        return true;
      case DeviceCapabilityType.number:
        return value is double || value is int;
      case DeviceCapabilityType.mode:
        return value is String;
      case DeviceCapabilityType.value:
        return value is String;
      case DeviceCapabilityType.date:
        if (value is! int) return false;
        try {
          final date = DateTime.fromMillisecondsSinceEpoch(value);
          return date.millisecondsSinceEpoch > 0;
        } catch (_) {
          return false;
        }
      case DeviceCapabilityType.image:
        return value is List<int>;
      default:
        return false;
    }
  }
}
