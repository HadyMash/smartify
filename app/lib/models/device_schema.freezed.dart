// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'device_schema.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Device {
  /// Device ID
  String get id;

  /// The device's name
  String? get name;

  /// The device's description
  String? get description;

  /// The source of the device (manufacturer)
  DeviceSource get source;

  /// The type of device
  DeviceAccessType get accessType;

  /// The device's icon
  String? get icon;

  /// Device capabilities
  List<Capability> get capabilities;

  /// Create a copy of Device
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $DeviceCopyWith<Device> get copyWith =>
      _$DeviceCopyWithImpl<Device>(this as Device, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is Device &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.accessType, accessType) ||
                other.accessType == accessType) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            const DeepCollectionEquality()
                .equals(other.capabilities, capabilities));
  }

  @override
  int get hashCode => Object.hash(runtimeType, id, name, description, source,
      accessType, icon, const DeepCollectionEquality().hash(capabilities));

  @override
  String toString() {
    return 'Device(id: $id, name: $name, description: $description, source: $source, accessType: $accessType, icon: $icon, capabilities: $capabilities)';
  }
}

/// @nodoc
abstract mixin class $DeviceCopyWith<$Res> {
  factory $DeviceCopyWith(Device value, $Res Function(Device) _then) =
      _$DeviceCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String? name,
      String? description,
      DeviceSource source,
      DeviceAccessType accessType,
      String? icon,
      List<Capability> capabilities});
}

/// @nodoc
class _$DeviceCopyWithImpl<$Res> implements $DeviceCopyWith<$Res> {
  _$DeviceCopyWithImpl(this._self, this._then);

  final Device _self;
  final $Res Function(Device) _then;

  /// Create a copy of Device
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? description = freezed,
    Object? source = null,
    Object? accessType = null,
    Object? icon = freezed,
    Object? capabilities = null,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as DeviceSource,
      accessType: null == accessType
          ? _self.accessType
          : accessType // ignore: cast_nullable_to_non_nullable
              as DeviceAccessType,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      capabilities: null == capabilities
          ? _self.capabilities
          : capabilities // ignore: cast_nullable_to_non_nullable
              as List<Capability>,
    ));
  }
}

/// @nodoc

class _Device extends Device {
  const _Device(
      {required this.id,
      this.name,
      this.description,
      required this.source,
      required this.accessType,
      this.icon,
      required final List<Capability> capabilities})
      : _capabilities = capabilities,
        super._();

  /// Device ID
  @override
  final String id;

  /// The device's name
  @override
  final String? name;

  /// The device's description
  @override
  final String? description;

  /// The source of the device (manufacturer)
  @override
  final DeviceSource source;

  /// The type of device
  @override
  final DeviceAccessType accessType;

  /// The device's icon
  @override
  final String? icon;

  /// Device capabilities
  final List<Capability> _capabilities;

  /// Device capabilities
  @override
  List<Capability> get capabilities {
    if (_capabilities is EqualUnmodifiableListView) return _capabilities;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_capabilities);
  }

  /// Create a copy of Device
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$DeviceCopyWith<_Device> get copyWith =>
      __$DeviceCopyWithImpl<_Device>(this, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _Device &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.accessType, accessType) ||
                other.accessType == accessType) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            const DeepCollectionEquality()
                .equals(other._capabilities, _capabilities));
  }

  @override
  int get hashCode => Object.hash(runtimeType, id, name, description, source,
      accessType, icon, const DeepCollectionEquality().hash(_capabilities));

  @override
  String toString() {
    return 'Device(id: $id, name: $name, description: $description, source: $source, accessType: $accessType, icon: $icon, capabilities: $capabilities)';
  }
}

/// @nodoc
abstract mixin class _$DeviceCopyWith<$Res> implements $DeviceCopyWith<$Res> {
  factory _$DeviceCopyWith(_Device value, $Res Function(_Device) _then) =
      __$DeviceCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String? name,
      String? description,
      DeviceSource source,
      DeviceAccessType accessType,
      String? icon,
      List<Capability> capabilities});
}

/// @nodoc
class __$DeviceCopyWithImpl<$Res> implements _$DeviceCopyWith<$Res> {
  __$DeviceCopyWithImpl(this._self, this._then);

  final _Device _self;
  final $Res Function(_Device) _then;

  /// Create a copy of Device
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? description = freezed,
    Object? source = null,
    Object? accessType = null,
    Object? icon = freezed,
    Object? capabilities = null,
  }) {
    return _then(_Device(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as DeviceSource,
      accessType: null == accessType
          ? _self.accessType
          : accessType // ignore: cast_nullable_to_non_nullable
              as DeviceAccessType,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      capabilities: null == capabilities
          ? _self._capabilities
          : capabilities // ignore: cast_nullable_to_non_nullable
              as List<Capability>,
    ));
  }
}

/// @nodoc
mixin _$DeviceWithState {
  /// Device ID
  String get id;

  /// The device's name
  String? get name;

  /// The device's description
  String? get description;

  /// The source of the device (manufacturer)
  DeviceSource get source;

  /// The type of device
  DeviceAccessType get accessType;

  /// The device's icon
  String? get icon;

  /// Device capabilities
  List<Capability> get capabilities;

  /// The device's state
  Map<String, dynamic> get state;

  /// Optional active actions and their states
  Map<String, ActionState>? get actionStates;

  /// Create a copy of DeviceWithState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $DeviceWithStateCopyWith<DeviceWithState> get copyWith =>
      _$DeviceWithStateCopyWithImpl<DeviceWithState>(
          this as DeviceWithState, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is DeviceWithState &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.accessType, accessType) ||
                other.accessType == accessType) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            const DeepCollectionEquality()
                .equals(other.capabilities, capabilities) &&
            const DeepCollectionEquality().equals(other.state, state) &&
            const DeepCollectionEquality()
                .equals(other.actionStates, actionStates));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      source,
      accessType,
      icon,
      const DeepCollectionEquality().hash(capabilities),
      const DeepCollectionEquality().hash(state),
      const DeepCollectionEquality().hash(actionStates));

  @override
  String toString() {
    return 'DeviceWithState(id: $id, name: $name, description: $description, source: $source, accessType: $accessType, icon: $icon, capabilities: $capabilities, state: $state, actionStates: $actionStates)';
  }
}

/// @nodoc
abstract mixin class $DeviceWithStateCopyWith<$Res> {
  factory $DeviceWithStateCopyWith(
          DeviceWithState value, $Res Function(DeviceWithState) _then) =
      _$DeviceWithStateCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String? name,
      String? description,
      DeviceSource source,
      DeviceAccessType accessType,
      String? icon,
      List<Capability> capabilities,
      Map<String, dynamic> state,
      Map<String, ActionState>? actionStates});
}

/// @nodoc
class _$DeviceWithStateCopyWithImpl<$Res>
    implements $DeviceWithStateCopyWith<$Res> {
  _$DeviceWithStateCopyWithImpl(this._self, this._then);

  final DeviceWithState _self;
  final $Res Function(DeviceWithState) _then;

  /// Create a copy of DeviceWithState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? description = freezed,
    Object? source = null,
    Object? accessType = null,
    Object? icon = freezed,
    Object? capabilities = null,
    Object? state = null,
    Object? actionStates = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as DeviceSource,
      accessType: null == accessType
          ? _self.accessType
          : accessType // ignore: cast_nullable_to_non_nullable
              as DeviceAccessType,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      capabilities: null == capabilities
          ? _self.capabilities
          : capabilities // ignore: cast_nullable_to_non_nullable
              as List<Capability>,
      state: null == state
          ? _self.state
          : state // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      actionStates: freezed == actionStates
          ? _self.actionStates
          : actionStates // ignore: cast_nullable_to_non_nullable
              as Map<String, ActionState>?,
    ));
  }
}

/// @nodoc

class _DeviceWithState extends DeviceWithState {
  const _DeviceWithState(
      {required this.id,
      this.name,
      this.description,
      required this.source,
      required this.accessType,
      this.icon,
      required final List<Capability> capabilities,
      required final Map<String, dynamic> state,
      final Map<String, ActionState>? actionStates})
      : _capabilities = capabilities,
        _state = state,
        _actionStates = actionStates,
        super._();

  /// Device ID
  @override
  final String id;

  /// The device's name
  @override
  final String? name;

  /// The device's description
  @override
  final String? description;

  /// The source of the device (manufacturer)
  @override
  final DeviceSource source;

  /// The type of device
  @override
  final DeviceAccessType accessType;

  /// The device's icon
  @override
  final String? icon;

  /// Device capabilities
  final List<Capability> _capabilities;

  /// Device capabilities
  @override
  List<Capability> get capabilities {
    if (_capabilities is EqualUnmodifiableListView) return _capabilities;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_capabilities);
  }

  /// The device's state
  final Map<String, dynamic> _state;

  /// The device's state
  @override
  Map<String, dynamic> get state {
    if (_state is EqualUnmodifiableMapView) return _state;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_state);
  }

  /// Optional active actions and their states
  final Map<String, ActionState>? _actionStates;

  /// Optional active actions and their states
  @override
  Map<String, ActionState>? get actionStates {
    final value = _actionStates;
    if (value == null) return null;
    if (_actionStates is EqualUnmodifiableMapView) return _actionStates;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  /// Create a copy of DeviceWithState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$DeviceWithStateCopyWith<_DeviceWithState> get copyWith =>
      __$DeviceWithStateCopyWithImpl<_DeviceWithState>(this, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _DeviceWithState &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.accessType, accessType) ||
                other.accessType == accessType) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            const DeepCollectionEquality()
                .equals(other._capabilities, _capabilities) &&
            const DeepCollectionEquality().equals(other._state, _state) &&
            const DeepCollectionEquality()
                .equals(other._actionStates, _actionStates));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      source,
      accessType,
      icon,
      const DeepCollectionEquality().hash(_capabilities),
      const DeepCollectionEquality().hash(_state),
      const DeepCollectionEquality().hash(_actionStates));

  @override
  String toString() {
    return 'DeviceWithState(id: $id, name: $name, description: $description, source: $source, accessType: $accessType, icon: $icon, capabilities: $capabilities, state: $state, actionStates: $actionStates)';
  }
}

/// @nodoc
abstract mixin class _$DeviceWithStateCopyWith<$Res>
    implements $DeviceWithStateCopyWith<$Res> {
  factory _$DeviceWithStateCopyWith(
          _DeviceWithState value, $Res Function(_DeviceWithState) _then) =
      __$DeviceWithStateCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String? name,
      String? description,
      DeviceSource source,
      DeviceAccessType accessType,
      String? icon,
      List<Capability> capabilities,
      Map<String, dynamic> state,
      Map<String, ActionState>? actionStates});
}

/// @nodoc
class __$DeviceWithStateCopyWithImpl<$Res>
    implements _$DeviceWithStateCopyWith<$Res> {
  __$DeviceWithStateCopyWithImpl(this._self, this._then);

  final _DeviceWithState _self;
  final $Res Function(_DeviceWithState) _then;

  /// Create a copy of DeviceWithState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? description = freezed,
    Object? source = null,
    Object? accessType = null,
    Object? icon = freezed,
    Object? capabilities = null,
    Object? state = null,
    Object? actionStates = freezed,
  }) {
    return _then(_DeviceWithState(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as DeviceSource,
      accessType: null == accessType
          ? _self.accessType
          : accessType // ignore: cast_nullable_to_non_nullable
              as DeviceAccessType,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      capabilities: null == capabilities
          ? _self._capabilities
          : capabilities // ignore: cast_nullable_to_non_nullable
              as List<Capability>,
      state: null == state
          ? _self._state
          : state // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      actionStates: freezed == actionStates
          ? _self._actionStates
          : actionStates // ignore: cast_nullable_to_non_nullable
              as Map<String, ActionState>?,
    ));
  }
}

/// @nodoc
mixin _$DeviceWithPartialState {
  /// Device ID
  String get id;

  /// The device's name
  String? get name;

  /// The device's description
  String? get description;

  /// The source of the device (manufacturer)
  DeviceSource get source;

  /// The type of device
  DeviceAccessType get accessType;

  /// The device's icon
  String? get icon;

  /// Device capabilities
  List<Capability> get capabilities;

  /// The device's partial state
  Map<String, dynamic> get state;

  /// Optional active actions and their states
  Map<String, ActionState>? get actionStates;

  /// Create a copy of DeviceWithPartialState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $DeviceWithPartialStateCopyWith<DeviceWithPartialState> get copyWith =>
      _$DeviceWithPartialStateCopyWithImpl<DeviceWithPartialState>(
          this as DeviceWithPartialState, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is DeviceWithPartialState &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.accessType, accessType) ||
                other.accessType == accessType) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            const DeepCollectionEquality()
                .equals(other.capabilities, capabilities) &&
            const DeepCollectionEquality().equals(other.state, state) &&
            const DeepCollectionEquality()
                .equals(other.actionStates, actionStates));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      source,
      accessType,
      icon,
      const DeepCollectionEquality().hash(capabilities),
      const DeepCollectionEquality().hash(state),
      const DeepCollectionEquality().hash(actionStates));

  @override
  String toString() {
    return 'DeviceWithPartialState(id: $id, name: $name, description: $description, source: $source, accessType: $accessType, icon: $icon, capabilities: $capabilities, state: $state, actionStates: $actionStates)';
  }
}

/// @nodoc
abstract mixin class $DeviceWithPartialStateCopyWith<$Res> {
  factory $DeviceWithPartialStateCopyWith(DeviceWithPartialState value,
          $Res Function(DeviceWithPartialState) _then) =
      _$DeviceWithPartialStateCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String? name,
      String? description,
      DeviceSource source,
      DeviceAccessType accessType,
      String? icon,
      List<Capability> capabilities,
      Map<String, dynamic> state,
      Map<String, ActionState>? actionStates});
}

/// @nodoc
class _$DeviceWithPartialStateCopyWithImpl<$Res>
    implements $DeviceWithPartialStateCopyWith<$Res> {
  _$DeviceWithPartialStateCopyWithImpl(this._self, this._then);

  final DeviceWithPartialState _self;
  final $Res Function(DeviceWithPartialState) _then;

  /// Create a copy of DeviceWithPartialState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? description = freezed,
    Object? source = null,
    Object? accessType = null,
    Object? icon = freezed,
    Object? capabilities = null,
    Object? state = null,
    Object? actionStates = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as DeviceSource,
      accessType: null == accessType
          ? _self.accessType
          : accessType // ignore: cast_nullable_to_non_nullable
              as DeviceAccessType,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      capabilities: null == capabilities
          ? _self.capabilities
          : capabilities // ignore: cast_nullable_to_non_nullable
              as List<Capability>,
      state: null == state
          ? _self.state
          : state // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      actionStates: freezed == actionStates
          ? _self.actionStates
          : actionStates // ignore: cast_nullable_to_non_nullable
              as Map<String, ActionState>?,
    ));
  }
}

/// @nodoc

class _DeviceWithPartialState extends DeviceWithPartialState {
  const _DeviceWithPartialState(
      {required this.id,
      this.name,
      this.description,
      required this.source,
      required this.accessType,
      this.icon,
      required final List<Capability> capabilities,
      final Map<String, dynamic> state = const {},
      final Map<String, ActionState>? actionStates})
      : _capabilities = capabilities,
        _state = state,
        _actionStates = actionStates,
        super._();

  /// Device ID
  @override
  final String id;

  /// The device's name
  @override
  final String? name;

  /// The device's description
  @override
  final String? description;

  /// The source of the device (manufacturer)
  @override
  final DeviceSource source;

  /// The type of device
  @override
  final DeviceAccessType accessType;

  /// The device's icon
  @override
  final String? icon;

  /// Device capabilities
  final List<Capability> _capabilities;

  /// Device capabilities
  @override
  List<Capability> get capabilities {
    if (_capabilities is EqualUnmodifiableListView) return _capabilities;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_capabilities);
  }

  /// The device's partial state
  final Map<String, dynamic> _state;

  /// The device's partial state
  @override
  @JsonKey()
  Map<String, dynamic> get state {
    if (_state is EqualUnmodifiableMapView) return _state;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_state);
  }

  /// Optional active actions and their states
  final Map<String, ActionState>? _actionStates;

  /// Optional active actions and their states
  @override
  Map<String, ActionState>? get actionStates {
    final value = _actionStates;
    if (value == null) return null;
    if (_actionStates is EqualUnmodifiableMapView) return _actionStates;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  /// Create a copy of DeviceWithPartialState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$DeviceWithPartialStateCopyWith<_DeviceWithPartialState> get copyWith =>
      __$DeviceWithPartialStateCopyWithImpl<_DeviceWithPartialState>(
          this, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _DeviceWithPartialState &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.accessType, accessType) ||
                other.accessType == accessType) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            const DeepCollectionEquality()
                .equals(other._capabilities, _capabilities) &&
            const DeepCollectionEquality().equals(other._state, _state) &&
            const DeepCollectionEquality()
                .equals(other._actionStates, _actionStates));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      source,
      accessType,
      icon,
      const DeepCollectionEquality().hash(_capabilities),
      const DeepCollectionEquality().hash(_state),
      const DeepCollectionEquality().hash(_actionStates));

  @override
  String toString() {
    return 'DeviceWithPartialState(id: $id, name: $name, description: $description, source: $source, accessType: $accessType, icon: $icon, capabilities: $capabilities, state: $state, actionStates: $actionStates)';
  }
}

/// @nodoc
abstract mixin class _$DeviceWithPartialStateCopyWith<$Res>
    implements $DeviceWithPartialStateCopyWith<$Res> {
  factory _$DeviceWithPartialStateCopyWith(_DeviceWithPartialState value,
          $Res Function(_DeviceWithPartialState) _then) =
      __$DeviceWithPartialStateCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String? name,
      String? description,
      DeviceSource source,
      DeviceAccessType accessType,
      String? icon,
      List<Capability> capabilities,
      Map<String, dynamic> state,
      Map<String, ActionState>? actionStates});
}

/// @nodoc
class __$DeviceWithPartialStateCopyWithImpl<$Res>
    implements _$DeviceWithPartialStateCopyWith<$Res> {
  __$DeviceWithPartialStateCopyWithImpl(this._self, this._then);

  final _DeviceWithPartialState _self;
  final $Res Function(_DeviceWithPartialState) _then;

  /// Create a copy of DeviceWithPartialState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? description = freezed,
    Object? source = null,
    Object? accessType = null,
    Object? icon = freezed,
    Object? capabilities = null,
    Object? state = null,
    Object? actionStates = freezed,
  }) {
    return _then(_DeviceWithPartialState(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as DeviceSource,
      accessType: null == accessType
          ? _self.accessType
          : accessType // ignore: cast_nullable_to_non_nullable
              as DeviceAccessType,
      icon: freezed == icon
          ? _self.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      capabilities: null == capabilities
          ? _self._capabilities
          : capabilities // ignore: cast_nullable_to_non_nullable
              as List<Capability>,
      state: null == state
          ? _self._state
          : state // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      actionStates: freezed == actionStates
          ? _self._actionStates
          : actionStates // ignore: cast_nullable_to_non_nullable
              as Map<String, ActionState>?,
    ));
  }
}

/// @nodoc
mixin _$ActionState {
  /// The action being performed
  String get actionId;

  /// The progress description
  String get progress;

  /// Start time of the action in milliseconds since epoch
  int get startTime;

  /// Optional data specific to this action
  Map<String, dynamic>? get data;

  /// Create a copy of ActionState
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ActionStateCopyWith<ActionState> get copyWith =>
      _$ActionStateCopyWithImpl<ActionState>(this as ActionState, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ActionState &&
            (identical(other.actionId, actionId) ||
                other.actionId == actionId) &&
            (identical(other.progress, progress) ||
                other.progress == progress) &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            const DeepCollectionEquality().equals(other.data, data));
  }

  @override
  int get hashCode => Object.hash(runtimeType, actionId, progress, startTime,
      const DeepCollectionEquality().hash(data));

  @override
  String toString() {
    return 'ActionState(actionId: $actionId, progress: $progress, startTime: $startTime, data: $data)';
  }
}

/// @nodoc
abstract mixin class $ActionStateCopyWith<$Res> {
  factory $ActionStateCopyWith(
          ActionState value, $Res Function(ActionState) _then) =
      _$ActionStateCopyWithImpl;
  @useResult
  $Res call(
      {String actionId,
      String progress,
      int startTime,
      Map<String, dynamic>? data});
}

/// @nodoc
class _$ActionStateCopyWithImpl<$Res> implements $ActionStateCopyWith<$Res> {
  _$ActionStateCopyWithImpl(this._self, this._then);

  final ActionState _self;
  final $Res Function(ActionState) _then;

  /// Create a copy of ActionState
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? actionId = null,
    Object? progress = null,
    Object? startTime = null,
    Object? data = freezed,
  }) {
    return _then(_self.copyWith(
      actionId: null == actionId
          ? _self.actionId
          : actionId // ignore: cast_nullable_to_non_nullable
              as String,
      progress: null == progress
          ? _self.progress
          : progress // ignore: cast_nullable_to_non_nullable
              as String,
      startTime: null == startTime
          ? _self.startTime
          : startTime // ignore: cast_nullable_to_non_nullable
              as int,
      data: freezed == data
          ? _self.data
          : data // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc

class _ActionState extends ActionState {
  const _ActionState(
      {required this.actionId,
      required this.progress,
      required this.startTime,
      final Map<String, dynamic>? data})
      : _data = data,
        super._();

  /// The action being performed
  @override
  final String actionId;

  /// The progress description
  @override
  final String progress;

  /// Start time of the action in milliseconds since epoch
  @override
  final int startTime;

  /// Optional data specific to this action
  final Map<String, dynamic>? _data;

  /// Optional data specific to this action
  @override
  Map<String, dynamic>? get data {
    final value = _data;
    if (value == null) return null;
    if (_data is EqualUnmodifiableMapView) return _data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  /// Create a copy of ActionState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$ActionStateCopyWith<_ActionState> get copyWith =>
      __$ActionStateCopyWithImpl<_ActionState>(this, _$identity);

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _ActionState &&
            (identical(other.actionId, actionId) ||
                other.actionId == actionId) &&
            (identical(other.progress, progress) ||
                other.progress == progress) &&
            (identical(other.startTime, startTime) ||
                other.startTime == startTime) &&
            const DeepCollectionEquality().equals(other._data, _data));
  }

  @override
  int get hashCode => Object.hash(runtimeType, actionId, progress, startTime,
      const DeepCollectionEquality().hash(_data));

  @override
  String toString() {
    return 'ActionState(actionId: $actionId, progress: $progress, startTime: $startTime, data: $data)';
  }
}

/// @nodoc
abstract mixin class _$ActionStateCopyWith<$Res>
    implements $ActionStateCopyWith<$Res> {
  factory _$ActionStateCopyWith(
          _ActionState value, $Res Function(_ActionState) _then) =
      __$ActionStateCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String actionId,
      String progress,
      int startTime,
      Map<String, dynamic>? data});
}

/// @nodoc
class __$ActionStateCopyWithImpl<$Res> implements _$ActionStateCopyWith<$Res> {
  __$ActionStateCopyWithImpl(this._self, this._then);

  final _ActionState _self;
  final $Res Function(_ActionState) _then;

  /// Create a copy of ActionState
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? actionId = null,
    Object? progress = null,
    Object? startTime = null,
    Object? data = freezed,
  }) {
    return _then(_ActionState(
      actionId: null == actionId
          ? _self.actionId
          : actionId // ignore: cast_nullable_to_non_nullable
              as String,
      progress: null == progress
          ? _self.progress
          : progress // ignore: cast_nullable_to_non_nullable
              as String,
      startTime: null == startTime
          ? _self.startTime
          : startTime // ignore: cast_nullable_to_non_nullable
              as int,
      data: freezed == data
          ? _self._data
          : data // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

// dart format on
