// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'capability.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
Capability _$CapabilityFromJson(Map<String, dynamic> json) {
  switch (json['runtimeType']) {
    case 'toggle':
      return ToggleCapability.fromJson(json);
    case 'range':
      return RangeCapability.fromJson(json);
    case 'number':
      return NumberCapability.fromJson(json);
    case 'mode':
      return ModeCapability.fromJson(json);
    case 'value':
      return ValueCapability.fromJson(json);
    case 'date':
      return DateCapability.fromJson(json);
    case 'image':
      return ImageCapability.fromJson(json);
    case 'multiSwitch':
      return MultiSwitchCapability.fromJson(json);
    case 'multiMode':
      return MultiModeCapability.fromJson(json);
    case 'multiRange':
      return MultiRangeCapability.fromJson(json);
    case 'multiNumber':
      return MultiNumberCapability.fromJson(json);
    case 'multiValue':
      return MultiValueCapability.fromJson(json);
    case 'action':
      return ActionCapability.fromJson(json);

    default:
      throw CheckedFromJsonException(json, 'runtimeType', 'Capability',
          'Invalid union type "${json['runtimeType']}"!');
  }
}

/// @nodoc
mixin _$Capability implements DiagnosticableTreeMixin {
  String get id;
  DeviceCapabilityType get type;
  String? get name;
  String? get extensionType;
  bool? get readonly;
  String? get icon;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $CapabilityCopyWith<Capability> get copyWith =>
      _$CapabilityCopyWithImpl<Capability>(this as Capability, _$identity);

  /// Serializes this Capability to a JSON map.
  Map<String, dynamic> toJson();

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is Capability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $CapabilityCopyWith<$Res> {
  factory $CapabilityCopyWith(
          Capability value, $Res Function(Capability) _then) =
      _$CapabilityCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$CapabilityCopyWithImpl<$Res> implements $CapabilityCopyWith<$Res> {
  _$CapabilityCopyWithImpl(this._self, this._then);

  final Capability _self;
  final $Res Function(Capability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class ToggleCapability extends Capability with DiagnosticableTreeMixin {
  const ToggleCapability(
      {required this.id,
      required this.type,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'toggle',
        super._();
  factory ToggleCapability.fromJson(Map<String, dynamic> json) =>
      _$ToggleCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ToggleCapabilityCopyWith<ToggleCapability> get copyWith =>
      _$ToggleCapabilityCopyWithImpl<ToggleCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ToggleCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.toggle'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ToggleCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.toggle(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $ToggleCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $ToggleCapabilityCopyWith(
          ToggleCapability value, $Res Function(ToggleCapability) _then) =
      _$ToggleCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$ToggleCapabilityCopyWithImpl<$Res>
    implements $ToggleCapabilityCopyWith<$Res> {
  _$ToggleCapabilityCopyWithImpl(this._self, this._then);

  final ToggleCapability _self;
  final $Res Function(ToggleCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(ToggleCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class RangeCapability extends Capability with DiagnosticableTreeMixin {
  const RangeCapability(
      {required this.id,
      required this.type,
      required this.min,
      required this.max,
      this.step,
      this.unit,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'range',
        super._();
  factory RangeCapability.fromJson(Map<String, dynamic> json) =>
      _$RangeCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final double min;
  final double max;
  final double? step;
  final String? unit;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $RangeCapabilityCopyWith<RangeCapability> get copyWith =>
      _$RangeCapabilityCopyWithImpl<RangeCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$RangeCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.range'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('min', min))
      ..add(DiagnosticsProperty('max', max))
      ..add(DiagnosticsProperty('step', step))
      ..add(DiagnosticsProperty('unit', unit))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is RangeCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.min, min) || other.min == min) &&
            (identical(other.max, max) || other.max == max) &&
            (identical(other.step, step) || other.step == step) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, type, min, max, step, unit,
      name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.range(id: $id, type: $type, min: $min, max: $max, step: $step, unit: $unit, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $RangeCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $RangeCapabilityCopyWith(
          RangeCapability value, $Res Function(RangeCapability) _then) =
      _$RangeCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      double min,
      double max,
      double? step,
      String? unit,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$RangeCapabilityCopyWithImpl<$Res>
    implements $RangeCapabilityCopyWith<$Res> {
  _$RangeCapabilityCopyWithImpl(this._self, this._then);

  final RangeCapability _self;
  final $Res Function(RangeCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? min = null,
    Object? max = null,
    Object? step = freezed,
    Object? unit = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(RangeCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      min: null == min
          ? _self.min
          : min // ignore: cast_nullable_to_non_nullable
              as double,
      max: null == max
          ? _self.max
          : max // ignore: cast_nullable_to_non_nullable
              as double,
      step: freezed == step
          ? _self.step
          : step // ignore: cast_nullable_to_non_nullable
              as double?,
      unit: freezed == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class NumberCapability extends Capability with DiagnosticableTreeMixin {
  const NumberCapability(
      {required this.id,
      required this.type,
      this.bound,
      this.step,
      this.unit,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'number',
        super._();
  factory NumberCapability.fromJson(Map<String, dynamic> json) =>
      _$NumberCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final BoundValue? bound;
  final double? step;
  final String? unit;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $NumberCapabilityCopyWith<NumberCapability> get copyWith =>
      _$NumberCapabilityCopyWithImpl<NumberCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$NumberCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.number'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('bound', bound))
      ..add(DiagnosticsProperty('step', step))
      ..add(DiagnosticsProperty('unit', unit))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is NumberCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.bound, bound) || other.bound == bound) &&
            (identical(other.step, step) || other.step == step) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, type, bound, step, unit,
      name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.number(id: $id, type: $type, bound: $bound, step: $step, unit: $unit, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $NumberCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $NumberCapabilityCopyWith(
          NumberCapability value, $Res Function(NumberCapability) _then) =
      _$NumberCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      BoundValue? bound,
      double? step,
      String? unit,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});

  $BoundValueCopyWith<$Res>? get bound;
}

/// @nodoc
class _$NumberCapabilityCopyWithImpl<$Res>
    implements $NumberCapabilityCopyWith<$Res> {
  _$NumberCapabilityCopyWithImpl(this._self, this._then);

  final NumberCapability _self;
  final $Res Function(NumberCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? bound = freezed,
    Object? step = freezed,
    Object? unit = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(NumberCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      bound: freezed == bound
          ? _self.bound
          : bound // ignore: cast_nullable_to_non_nullable
              as BoundValue?,
      step: freezed == step
          ? _self.step
          : step // ignore: cast_nullable_to_non_nullable
              as double?,
      unit: freezed == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $BoundValueCopyWith<$Res>? get bound {
    if (_self.bound == null) {
      return null;
    }

    return $BoundValueCopyWith<$Res>(_self.bound!, (value) {
      return _then(_self.copyWith(bound: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class ModeCapability extends Capability with DiagnosticableTreeMixin {
  const ModeCapability(
      {required this.id,
      required this.type,
      required final List<String> modes,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : _modes = modes,
        $type = $type ?? 'mode',
        super._();
  factory ModeCapability.fromJson(Map<String, dynamic> json) =>
      _$ModeCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final List<String> _modes;
  List<String> get modes {
    if (_modes is EqualUnmodifiableListView) return _modes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_modes);
  }

  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ModeCapabilityCopyWith<ModeCapability> get copyWith =>
      _$ModeCapabilityCopyWithImpl<ModeCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ModeCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.mode'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('modes', modes))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ModeCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other._modes, _modes) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      const DeepCollectionEquality().hash(_modes),
      name,
      extensionType,
      readonly,
      icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.mode(id: $id, type: $type, modes: $modes, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $ModeCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $ModeCapabilityCopyWith(
          ModeCapability value, $Res Function(ModeCapability) _then) =
      _$ModeCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      List<String> modes,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$ModeCapabilityCopyWithImpl<$Res>
    implements $ModeCapabilityCopyWith<$Res> {
  _$ModeCapabilityCopyWithImpl(this._self, this._then);

  final ModeCapability _self;
  final $Res Function(ModeCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? modes = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(ModeCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      modes: null == modes
          ? _self._modes
          : modes // ignore: cast_nullable_to_non_nullable
              as List<String>,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class ValueCapability extends Capability with DiagnosticableTreeMixin {
  const ValueCapability(
      {required this.id,
      required this.type,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'value',
        super._();
  factory ValueCapability.fromJson(Map<String, dynamic> json) =>
      _$ValueCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ValueCapabilityCopyWith<ValueCapability> get copyWith =>
      _$ValueCapabilityCopyWithImpl<ValueCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ValueCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.value'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ValueCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.value(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $ValueCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $ValueCapabilityCopyWith(
          ValueCapability value, $Res Function(ValueCapability) _then) =
      _$ValueCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$ValueCapabilityCopyWithImpl<$Res>
    implements $ValueCapabilityCopyWith<$Res> {
  _$ValueCapabilityCopyWithImpl(this._self, this._then);

  final ValueCapability _self;
  final $Res Function(ValueCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(ValueCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class DateCapability extends Capability with DiagnosticableTreeMixin {
  const DateCapability(
      {required this.id,
      required this.type,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'date',
        super._();
  factory DateCapability.fromJson(Map<String, dynamic> json) =>
      _$DateCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $DateCapabilityCopyWith<DateCapability> get copyWith =>
      _$DateCapabilityCopyWithImpl<DateCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$DateCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.date'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is DateCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.date(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $DateCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $DateCapabilityCopyWith(
          DateCapability value, $Res Function(DateCapability) _then) =
      _$DateCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$DateCapabilityCopyWithImpl<$Res>
    implements $DateCapabilityCopyWith<$Res> {
  _$DateCapabilityCopyWithImpl(this._self, this._then);

  final DateCapability _self;
  final $Res Function(DateCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(DateCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class ImageCapability extends Capability with DiagnosticableTreeMixin {
  const ImageCapability(
      {required this.id,
      required this.type,
      final List<int>? bytes,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : _bytes = bytes,
        $type = $type ?? 'image',
        super._();
  factory ImageCapability.fromJson(Map<String, dynamic> json) =>
      _$ImageCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final List<int>? _bytes;
  List<int>? get bytes {
    final value = _bytes;
    if (value == null) return null;
    if (_bytes is EqualUnmodifiableListView) return _bytes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ImageCapabilityCopyWith<ImageCapability> get copyWith =>
      _$ImageCapabilityCopyWithImpl<ImageCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ImageCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.image'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('bytes', bytes))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ImageCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other._bytes, _bytes) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      const DeepCollectionEquality().hash(_bytes),
      name,
      extensionType,
      readonly,
      icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.image(id: $id, type: $type, bytes: $bytes, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $ImageCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $ImageCapabilityCopyWith(
          ImageCapability value, $Res Function(ImageCapability) _then) =
      _$ImageCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      List<int>? bytes,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$ImageCapabilityCopyWithImpl<$Res>
    implements $ImageCapabilityCopyWith<$Res> {
  _$ImageCapabilityCopyWithImpl(this._self, this._then);

  final ImageCapability _self;
  final $Res Function(ImageCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? bytes = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(ImageCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      bytes: freezed == bytes
          ? _self._bytes
          : bytes // ignore: cast_nullable_to_non_nullable
              as List<int>?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class MultiSwitchCapability extends Capability with DiagnosticableTreeMixin {
  const MultiSwitchCapability(
      {required this.id,
      required this.type,
      this.length,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'multiSwitch',
        super._();
  factory MultiSwitchCapability.fromJson(Map<String, dynamic> json) =>
      _$MultiSwitchCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final int? length;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MultiSwitchCapabilityCopyWith<MultiSwitchCapability> get copyWith =>
      _$MultiSwitchCapabilityCopyWithImpl<MultiSwitchCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MultiSwitchCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.multiSwitch'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('length', length))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MultiSwitchCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.length, length) || other.length == length) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, type, length, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.multiSwitch(id: $id, type: $type, length: $length, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $MultiSwitchCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $MultiSwitchCapabilityCopyWith(MultiSwitchCapability value,
          $Res Function(MultiSwitchCapability) _then) =
      _$MultiSwitchCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      int? length,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$MultiSwitchCapabilityCopyWithImpl<$Res>
    implements $MultiSwitchCapabilityCopyWith<$Res> {
  _$MultiSwitchCapabilityCopyWithImpl(this._self, this._then);

  final MultiSwitchCapability _self;
  final $Res Function(MultiSwitchCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? length = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(MultiSwitchCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      length: freezed == length
          ? _self.length
          : length // ignore: cast_nullable_to_non_nullable
              as int?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class MultiModeCapability extends Capability with DiagnosticableTreeMixin {
  const MultiModeCapability(
      {required this.id,
      required this.type,
      required final List<String> modes,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : _modes = modes,
        $type = $type ?? 'multiMode',
        super._();
  factory MultiModeCapability.fromJson(Map<String, dynamic> json) =>
      _$MultiModeCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final List<String> _modes;
  List<String> get modes {
    if (_modes is EqualUnmodifiableListView) return _modes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_modes);
  }

  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MultiModeCapabilityCopyWith<MultiModeCapability> get copyWith =>
      _$MultiModeCapabilityCopyWithImpl<MultiModeCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MultiModeCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.multiMode'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('modes', modes))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MultiModeCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other._modes, _modes) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      const DeepCollectionEquality().hash(_modes),
      name,
      extensionType,
      readonly,
      icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.multiMode(id: $id, type: $type, modes: $modes, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $MultiModeCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $MultiModeCapabilityCopyWith(
          MultiModeCapability value, $Res Function(MultiModeCapability) _then) =
      _$MultiModeCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      List<String> modes,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$MultiModeCapabilityCopyWithImpl<$Res>
    implements $MultiModeCapabilityCopyWith<$Res> {
  _$MultiModeCapabilityCopyWithImpl(this._self, this._then);

  final MultiModeCapability _self;
  final $Res Function(MultiModeCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? modes = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(MultiModeCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      modes: null == modes
          ? _self._modes
          : modes // ignore: cast_nullable_to_non_nullable
              as List<String>,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class MultiRangeCapability extends Capability with DiagnosticableTreeMixin {
  const MultiRangeCapability(
      {required this.id,
      required this.type,
      required this.min,
      required this.max,
      this.step,
      this.unit,
      this.length,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'multiRange',
        super._();
  factory MultiRangeCapability.fromJson(Map<String, dynamic> json) =>
      _$MultiRangeCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final dynamic min;
// Can be double or List<double>
  final dynamic max;
// Can be double or List<double>
  final dynamic step;
// Can be double or List<double>
  final dynamic unit;
// Can be String or List<String>
  final int? length;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MultiRangeCapabilityCopyWith<MultiRangeCapability> get copyWith =>
      _$MultiRangeCapabilityCopyWithImpl<MultiRangeCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MultiRangeCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.multiRange'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('min', min))
      ..add(DiagnosticsProperty('max', max))
      ..add(DiagnosticsProperty('step', step))
      ..add(DiagnosticsProperty('unit', unit))
      ..add(DiagnosticsProperty('length', length))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MultiRangeCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other.min, min) &&
            const DeepCollectionEquality().equals(other.max, max) &&
            const DeepCollectionEquality().equals(other.step, step) &&
            const DeepCollectionEquality().equals(other.unit, unit) &&
            (identical(other.length, length) || other.length == length) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      const DeepCollectionEquality().hash(min),
      const DeepCollectionEquality().hash(max),
      const DeepCollectionEquality().hash(step),
      const DeepCollectionEquality().hash(unit),
      length,
      name,
      extensionType,
      readonly,
      icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.multiRange(id: $id, type: $type, min: $min, max: $max, step: $step, unit: $unit, length: $length, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $MultiRangeCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $MultiRangeCapabilityCopyWith(MultiRangeCapability value,
          $Res Function(MultiRangeCapability) _then) =
      _$MultiRangeCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      dynamic min,
      dynamic max,
      dynamic step,
      dynamic unit,
      int? length,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$MultiRangeCapabilityCopyWithImpl<$Res>
    implements $MultiRangeCapabilityCopyWith<$Res> {
  _$MultiRangeCapabilityCopyWithImpl(this._self, this._then);

  final MultiRangeCapability _self;
  final $Res Function(MultiRangeCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? min = freezed,
    Object? max = freezed,
    Object? step = freezed,
    Object? unit = freezed,
    Object? length = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(MultiRangeCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      min: freezed == min
          ? _self.min
          : min // ignore: cast_nullable_to_non_nullable
              as dynamic,
      max: freezed == max
          ? _self.max
          : max // ignore: cast_nullable_to_non_nullable
              as dynamic,
      step: freezed == step
          ? _self.step
          : step // ignore: cast_nullable_to_non_nullable
              as dynamic,
      unit: freezed == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as dynamic,
      length: freezed == length
          ? _self.length
          : length // ignore: cast_nullable_to_non_nullable
              as int?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class MultiNumberCapability extends Capability with DiagnosticableTreeMixin {
  const MultiNumberCapability(
      {required this.id,
      required this.type,
      this.bound,
      this.step,
      this.unit,
      this.length,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'multiNumber',
        super._();
  factory MultiNumberCapability.fromJson(Map<String, dynamic> json) =>
      _$MultiNumberCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final dynamic bound;
// Can be BoundValue or List<BoundValue?>
  final dynamic step;
// Can be double or List<double>
  final dynamic unit;
// Can be String or List<String>
  final int? length;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MultiNumberCapabilityCopyWith<MultiNumberCapability> get copyWith =>
      _$MultiNumberCapabilityCopyWithImpl<MultiNumberCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MultiNumberCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.multiNumber'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('bound', bound))
      ..add(DiagnosticsProperty('step', step))
      ..add(DiagnosticsProperty('unit', unit))
      ..add(DiagnosticsProperty('length', length))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MultiNumberCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other.bound, bound) &&
            const DeepCollectionEquality().equals(other.step, step) &&
            const DeepCollectionEquality().equals(other.unit, unit) &&
            (identical(other.length, length) || other.length == length) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      const DeepCollectionEquality().hash(bound),
      const DeepCollectionEquality().hash(step),
      const DeepCollectionEquality().hash(unit),
      length,
      name,
      extensionType,
      readonly,
      icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.multiNumber(id: $id, type: $type, bound: $bound, step: $step, unit: $unit, length: $length, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $MultiNumberCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $MultiNumberCapabilityCopyWith(MultiNumberCapability value,
          $Res Function(MultiNumberCapability) _then) =
      _$MultiNumberCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      dynamic bound,
      dynamic step,
      dynamic unit,
      int? length,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$MultiNumberCapabilityCopyWithImpl<$Res>
    implements $MultiNumberCapabilityCopyWith<$Res> {
  _$MultiNumberCapabilityCopyWithImpl(this._self, this._then);

  final MultiNumberCapability _self;
  final $Res Function(MultiNumberCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? bound = freezed,
    Object? step = freezed,
    Object? unit = freezed,
    Object? length = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(MultiNumberCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      bound: freezed == bound
          ? _self.bound
          : bound // ignore: cast_nullable_to_non_nullable
              as dynamic,
      step: freezed == step
          ? _self.step
          : step // ignore: cast_nullable_to_non_nullable
              as dynamic,
      unit: freezed == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as dynamic,
      length: freezed == length
          ? _self.length
          : length // ignore: cast_nullable_to_non_nullable
              as int?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class MultiValueCapability extends Capability with DiagnosticableTreeMixin {
  const MultiValueCapability(
      {required this.id,
      required this.type,
      this.length,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'multiValue',
        super._();
  factory MultiValueCapability.fromJson(Map<String, dynamic> json) =>
      _$MultiValueCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final int? length;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MultiValueCapabilityCopyWith<MultiValueCapability> get copyWith =>
      _$MultiValueCapabilityCopyWithImpl<MultiValueCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MultiValueCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.multiValue'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('length', length))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MultiValueCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.length, length) || other.length == length) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, type, length, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.multiValue(id: $id, type: $type, length: $length, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $MultiValueCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $MultiValueCapabilityCopyWith(MultiValueCapability value,
          $Res Function(MultiValueCapability) _then) =
      _$MultiValueCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      int? length,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$MultiValueCapabilityCopyWithImpl<$Res>
    implements $MultiValueCapabilityCopyWith<$Res> {
  _$MultiValueCapabilityCopyWithImpl(this._self, this._then);

  final MultiValueCapability _self;
  final $Res Function(MultiValueCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? length = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(MultiValueCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      length: freezed == length
          ? _self.length
          : length // ignore: cast_nullable_to_non_nullable
              as int?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class ActionCapability extends Capability with DiagnosticableTreeMixin {
  const ActionCapability(
      {required this.id,
      required this.type,
      required final List<BasicCapability> arguments,
      required final List<String> lockedFields,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : _arguments = arguments,
        _lockedFields = lockedFields,
        $type = $type ?? 'action',
        super._();
  factory ActionCapability.fromJson(Map<String, dynamic> json) =>
      _$ActionCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final List<BasicCapability> _arguments;
  List<BasicCapability> get arguments {
    if (_arguments is EqualUnmodifiableListView) return _arguments;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_arguments);
  }

  final List<String> _lockedFields;
  List<String> get lockedFields {
    if (_lockedFields is EqualUnmodifiableListView) return _lockedFields;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_lockedFields);
  }

  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ActionCapabilityCopyWith<ActionCapability> get copyWith =>
      _$ActionCapabilityCopyWithImpl<ActionCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ActionCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'Capability.action'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('arguments', arguments))
      ..add(DiagnosticsProperty('lockedFields', lockedFields))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ActionCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality()
                .equals(other._arguments, _arguments) &&
            const DeepCollectionEquality()
                .equals(other._lockedFields, _lockedFields) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      const DeepCollectionEquality().hash(_arguments),
      const DeepCollectionEquality().hash(_lockedFields),
      name,
      extensionType,
      readonly,
      icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'Capability.action(id: $id, type: $type, arguments: $arguments, lockedFields: $lockedFields, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $ActionCapabilityCopyWith<$Res>
    implements $CapabilityCopyWith<$Res> {
  factory $ActionCapabilityCopyWith(
          ActionCapability value, $Res Function(ActionCapability) _then) =
      _$ActionCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      List<BasicCapability> arguments,
      List<String> lockedFields,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$ActionCapabilityCopyWithImpl<$Res>
    implements $ActionCapabilityCopyWith<$Res> {
  _$ActionCapabilityCopyWithImpl(this._self, this._then);

  final ActionCapability _self;
  final $Res Function(ActionCapability) _then;

  /// Create a copy of Capability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? arguments = null,
    Object? lockedFields = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(ActionCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      arguments: null == arguments
          ? _self._arguments
          : arguments // ignore: cast_nullable_to_non_nullable
              as List<BasicCapability>,
      lockedFields: null == lockedFields
          ? _self._lockedFields
          : lockedFields // ignore: cast_nullable_to_non_nullable
              as List<String>,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$BoundValue implements DiagnosticableTreeMixin {
  BoundType get type;
  double get value;

  /// Create a copy of BoundValue
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BoundValueCopyWith<BoundValue> get copyWith =>
      _$BoundValueCopyWithImpl<BoundValue>(this as BoundValue, _$identity);

  /// Serializes this BoundValue to a JSON map.
  Map<String, dynamic> toJson();

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BoundValue'))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('value', value));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BoundValue &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.value, value) || other.value == value));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, type, value);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BoundValue(type: $type, value: $value)';
  }
}

/// @nodoc
abstract mixin class $BoundValueCopyWith<$Res> {
  factory $BoundValueCopyWith(
          BoundValue value, $Res Function(BoundValue) _then) =
      _$BoundValueCopyWithImpl;
  @useResult
  $Res call({BoundType type, double value});
}

/// @nodoc
class _$BoundValueCopyWithImpl<$Res> implements $BoundValueCopyWith<$Res> {
  _$BoundValueCopyWithImpl(this._self, this._then);

  final BoundValue _self;
  final $Res Function(BoundValue) _then;

  /// Create a copy of BoundValue
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? value = null,
  }) {
    return _then(_self.copyWith(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as BoundType,
      value: null == value
          ? _self.value
          : value // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _BoundValue with DiagnosticableTreeMixin implements BoundValue {
  const _BoundValue({required this.type, required this.value});
  factory _BoundValue.fromJson(Map<String, dynamic> json) =>
      _$BoundValueFromJson(json);

  @override
  final BoundType type;
  @override
  final double value;

  /// Create a copy of BoundValue
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$BoundValueCopyWith<_BoundValue> get copyWith =>
      __$BoundValueCopyWithImpl<_BoundValue>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BoundValueToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BoundValue'))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('value', value));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _BoundValue &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.value, value) || other.value == value));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, type, value);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BoundValue(type: $type, value: $value)';
  }
}

/// @nodoc
abstract mixin class _$BoundValueCopyWith<$Res>
    implements $BoundValueCopyWith<$Res> {
  factory _$BoundValueCopyWith(
          _BoundValue value, $Res Function(_BoundValue) _then) =
      __$BoundValueCopyWithImpl;
  @override
  @useResult
  $Res call({BoundType type, double value});
}

/// @nodoc
class __$BoundValueCopyWithImpl<$Res> implements _$BoundValueCopyWith<$Res> {
  __$BoundValueCopyWithImpl(this._self, this._then);

  final _BoundValue _self;
  final $Res Function(_BoundValue) _then;

  /// Create a copy of BoundValue
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? type = null,
    Object? value = null,
  }) {
    return _then(_BoundValue(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as BoundType,
      value: null == value
          ? _self.value
          : value // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

BasicCapability _$BasicCapabilityFromJson(Map<String, dynamic> json) {
  switch (json['runtimeType']) {
    case 'toggle':
      return BasicToggleCapability.fromJson(json);
    case 'range':
      return BasicRangeCapability.fromJson(json);
    case 'number':
      return BasicNumberCapability.fromJson(json);
    case 'mode':
      return BasicModeCapability.fromJson(json);
    case 'value':
      return BasicValueCapability.fromJson(json);
    case 'date':
      return BasicDateCapability.fromJson(json);

    default:
      throw CheckedFromJsonException(json, 'runtimeType', 'BasicCapability',
          'Invalid union type "${json['runtimeType']}"!');
  }
}

/// @nodoc
mixin _$BasicCapability implements DiagnosticableTreeMixin {
  String get id;
  DeviceCapabilityType get type;
  String? get name;
  String? get extensionType;
  bool? get readonly;
  String? get icon;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BasicCapabilityCopyWith<BasicCapability> get copyWith =>
      _$BasicCapabilityCopyWithImpl<BasicCapability>(
          this as BasicCapability, _$identity);

  /// Serializes this BasicCapability to a JSON map.
  Map<String, dynamic> toJson();

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BasicCapability'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BasicCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BasicCapability(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $BasicCapabilityCopyWith<$Res> {
  factory $BasicCapabilityCopyWith(
          BasicCapability value, $Res Function(BasicCapability) _then) =
      _$BasicCapabilityCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$BasicCapabilityCopyWithImpl<$Res>
    implements $BasicCapabilityCopyWith<$Res> {
  _$BasicCapabilityCopyWithImpl(this._self, this._then);

  final BasicCapability _self;
  final $Res Function(BasicCapability) _then;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class BasicToggleCapability extends BasicCapability
    with DiagnosticableTreeMixin {
  const BasicToggleCapability(
      {required this.id,
      required this.type,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'toggle',
        super._();
  factory BasicToggleCapability.fromJson(Map<String, dynamic> json) =>
      _$BasicToggleCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BasicToggleCapabilityCopyWith<BasicToggleCapability> get copyWith =>
      _$BasicToggleCapabilityCopyWithImpl<BasicToggleCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BasicToggleCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BasicCapability.toggle'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BasicToggleCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BasicCapability.toggle(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $BasicToggleCapabilityCopyWith<$Res>
    implements $BasicCapabilityCopyWith<$Res> {
  factory $BasicToggleCapabilityCopyWith(BasicToggleCapability value,
          $Res Function(BasicToggleCapability) _then) =
      _$BasicToggleCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$BasicToggleCapabilityCopyWithImpl<$Res>
    implements $BasicToggleCapabilityCopyWith<$Res> {
  _$BasicToggleCapabilityCopyWithImpl(this._self, this._then);

  final BasicToggleCapability _self;
  final $Res Function(BasicToggleCapability) _then;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(BasicToggleCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class BasicRangeCapability extends BasicCapability
    with DiagnosticableTreeMixin {
  const BasicRangeCapability(
      {required this.id,
      required this.type,
      required this.min,
      required this.max,
      this.step,
      this.unit,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'range',
        super._();
  factory BasicRangeCapability.fromJson(Map<String, dynamic> json) =>
      _$BasicRangeCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final double min;
  final double max;
  final double? step;
  final String? unit;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BasicRangeCapabilityCopyWith<BasicRangeCapability> get copyWith =>
      _$BasicRangeCapabilityCopyWithImpl<BasicRangeCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BasicRangeCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BasicCapability.range'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('min', min))
      ..add(DiagnosticsProperty('max', max))
      ..add(DiagnosticsProperty('step', step))
      ..add(DiagnosticsProperty('unit', unit))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BasicRangeCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.min, min) || other.min == min) &&
            (identical(other.max, max) || other.max == max) &&
            (identical(other.step, step) || other.step == step) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, type, min, max, step, unit,
      name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BasicCapability.range(id: $id, type: $type, min: $min, max: $max, step: $step, unit: $unit, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $BasicRangeCapabilityCopyWith<$Res>
    implements $BasicCapabilityCopyWith<$Res> {
  factory $BasicRangeCapabilityCopyWith(BasicRangeCapability value,
          $Res Function(BasicRangeCapability) _then) =
      _$BasicRangeCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      double min,
      double max,
      double? step,
      String? unit,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$BasicRangeCapabilityCopyWithImpl<$Res>
    implements $BasicRangeCapabilityCopyWith<$Res> {
  _$BasicRangeCapabilityCopyWithImpl(this._self, this._then);

  final BasicRangeCapability _self;
  final $Res Function(BasicRangeCapability) _then;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? min = null,
    Object? max = null,
    Object? step = freezed,
    Object? unit = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(BasicRangeCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      min: null == min
          ? _self.min
          : min // ignore: cast_nullable_to_non_nullable
              as double,
      max: null == max
          ? _self.max
          : max // ignore: cast_nullable_to_non_nullable
              as double,
      step: freezed == step
          ? _self.step
          : step // ignore: cast_nullable_to_non_nullable
              as double?,
      unit: freezed == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class BasicNumberCapability extends BasicCapability
    with DiagnosticableTreeMixin {
  const BasicNumberCapability(
      {required this.id,
      required this.type,
      this.bound,
      this.step,
      this.unit,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'number',
        super._();
  factory BasicNumberCapability.fromJson(Map<String, dynamic> json) =>
      _$BasicNumberCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final BoundValue? bound;
  final double? step;
  final String? unit;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BasicNumberCapabilityCopyWith<BasicNumberCapability> get copyWith =>
      _$BasicNumberCapabilityCopyWithImpl<BasicNumberCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BasicNumberCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BasicCapability.number'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('bound', bound))
      ..add(DiagnosticsProperty('step', step))
      ..add(DiagnosticsProperty('unit', unit))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BasicNumberCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.bound, bound) || other.bound == bound) &&
            (identical(other.step, step) || other.step == step) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, type, bound, step, unit,
      name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BasicCapability.number(id: $id, type: $type, bound: $bound, step: $step, unit: $unit, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $BasicNumberCapabilityCopyWith<$Res>
    implements $BasicCapabilityCopyWith<$Res> {
  factory $BasicNumberCapabilityCopyWith(BasicNumberCapability value,
          $Res Function(BasicNumberCapability) _then) =
      _$BasicNumberCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      BoundValue? bound,
      double? step,
      String? unit,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});

  $BoundValueCopyWith<$Res>? get bound;
}

/// @nodoc
class _$BasicNumberCapabilityCopyWithImpl<$Res>
    implements $BasicNumberCapabilityCopyWith<$Res> {
  _$BasicNumberCapabilityCopyWithImpl(this._self, this._then);

  final BasicNumberCapability _self;
  final $Res Function(BasicNumberCapability) _then;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? bound = freezed,
    Object? step = freezed,
    Object? unit = freezed,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(BasicNumberCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      bound: freezed == bound
          ? _self.bound
          : bound // ignore: cast_nullable_to_non_nullable
              as BoundValue?,
      step: freezed == step
          ? _self.step
          : step // ignore: cast_nullable_to_non_nullable
              as double?,
      unit: freezed == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String?,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $BoundValueCopyWith<$Res>? get bound {
    if (_self.bound == null) {
      return null;
    }

    return $BoundValueCopyWith<$Res>(_self.bound!, (value) {
      return _then(_self.copyWith(bound: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class BasicModeCapability extends BasicCapability with DiagnosticableTreeMixin {
  const BasicModeCapability(
      {required this.id,
      required this.type,
      required final List<String> modes,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : _modes = modes,
        $type = $type ?? 'mode',
        super._();
  factory BasicModeCapability.fromJson(Map<String, dynamic> json) =>
      _$BasicModeCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  final List<String> _modes;
  List<String> get modes {
    if (_modes is EqualUnmodifiableListView) return _modes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_modes);
  }

  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BasicModeCapabilityCopyWith<BasicModeCapability> get copyWith =>
      _$BasicModeCapabilityCopyWithImpl<BasicModeCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BasicModeCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BasicCapability.mode'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('modes', modes))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BasicModeCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other._modes, _modes) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      const DeepCollectionEquality().hash(_modes),
      name,
      extensionType,
      readonly,
      icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BasicCapability.mode(id: $id, type: $type, modes: $modes, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $BasicModeCapabilityCopyWith<$Res>
    implements $BasicCapabilityCopyWith<$Res> {
  factory $BasicModeCapabilityCopyWith(
          BasicModeCapability value, $Res Function(BasicModeCapability) _then) =
      _$BasicModeCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      List<String> modes,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$BasicModeCapabilityCopyWithImpl<$Res>
    implements $BasicModeCapabilityCopyWith<$Res> {
  _$BasicModeCapabilityCopyWithImpl(this._self, this._then);

  final BasicModeCapability _self;
  final $Res Function(BasicModeCapability) _then;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? modes = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(BasicModeCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      modes: null == modes
          ? _self._modes
          : modes // ignore: cast_nullable_to_non_nullable
              as List<String>,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class BasicValueCapability extends BasicCapability
    with DiagnosticableTreeMixin {
  const BasicValueCapability(
      {required this.id,
      required this.type,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'value',
        super._();
  factory BasicValueCapability.fromJson(Map<String, dynamic> json) =>
      _$BasicValueCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BasicValueCapabilityCopyWith<BasicValueCapability> get copyWith =>
      _$BasicValueCapabilityCopyWithImpl<BasicValueCapability>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BasicValueCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BasicCapability.value'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BasicValueCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BasicCapability.value(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $BasicValueCapabilityCopyWith<$Res>
    implements $BasicCapabilityCopyWith<$Res> {
  factory $BasicValueCapabilityCopyWith(BasicValueCapability value,
          $Res Function(BasicValueCapability) _then) =
      _$BasicValueCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$BasicValueCapabilityCopyWithImpl<$Res>
    implements $BasicValueCapabilityCopyWith<$Res> {
  _$BasicValueCapabilityCopyWithImpl(this._self, this._then);

  final BasicValueCapability _self;
  final $Res Function(BasicValueCapability) _then;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(BasicValueCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class BasicDateCapability extends BasicCapability with DiagnosticableTreeMixin {
  const BasicDateCapability(
      {required this.id,
      required this.type,
      this.name,
      this.extensionType,
      this.readonly,
      this.icon,
      final String? $type})
      : $type = $type ?? 'date',
        super._();
  factory BasicDateCapability.fromJson(Map<String, dynamic> json) =>
      _$BasicDateCapabilityFromJson(json);

  @override
  final String id;
  @override
  final DeviceCapabilityType type;
  @override
  final String? name;
  @override
  final String? extensionType;
  @override
  final bool? readonly;
  @override
  final String? icon;

  @JsonKey(name: 'runtimeType')
  final String $type;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BasicDateCapabilityCopyWith<BasicDateCapability> get copyWith =>
      _$BasicDateCapabilityCopyWithImpl<BasicDateCapability>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BasicDateCapabilityToJson(
      this,
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    properties
      ..add(DiagnosticsProperty('type', 'BasicCapability.date'))
      ..add(DiagnosticsProperty('id', id))
      ..add(DiagnosticsProperty('type', type))
      ..add(DiagnosticsProperty('name', name))
      ..add(DiagnosticsProperty('extensionType', extensionType))
      ..add(DiagnosticsProperty('readonly', readonly))
      ..add(DiagnosticsProperty('icon', icon));
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BasicDateCapability &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.extensionType, extensionType) ||
                other.extensionType == extensionType) &&
            (identical(other.readonly, readonly) ||
                other.readonly == readonly) &&
            (identical(other.icon, icon) || other.icon == icon));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, name, extensionType, readonly, icon);

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'BasicCapability.date(id: $id, type: $type, name: $name, extensionType: $extensionType, readonly: $readonly, icon: $icon)';
  }
}

/// @nodoc
abstract mixin class $BasicDateCapabilityCopyWith<$Res>
    implements $BasicCapabilityCopyWith<$Res> {
  factory $BasicDateCapabilityCopyWith(
          BasicDateCapability value, $Res Function(BasicDateCapability) _then) =
      _$BasicDateCapabilityCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      DeviceCapabilityType type,
      String? name,
      String? extensionType,
      bool? readonly,
      String? icon});
}

/// @nodoc
class _$BasicDateCapabilityCopyWithImpl<$Res>
    implements $BasicDateCapabilityCopyWith<$Res> {
  _$BasicDateCapabilityCopyWithImpl(this._self, this._then);

  final BasicDateCapability _self;
  final $Res Function(BasicDateCapability) _then;

  /// Create a copy of BasicCapability
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? name = freezed,
    Object? extensionType = freezed,
    Object? readonly = freezed,
    Object? icon = freezed,
  }) {
    return _then(BasicDateCapability(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as DeviceCapabilityType,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      extensionType: freezed == extensionType
          ? _self.extensionType
          : extensionType // ignore: cast_nullable_to_non_nullable
              as String?,
      readonly: freezed == readonly
          ? _self.readonly
          : readonly // ignore: cast_nullable_to_non_nullable
              as bool?,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

// dart format on
