// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'capability.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ToggleCapability _$ToggleCapabilityFromJson(Map<String, dynamic> json) =>
    ToggleCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$ToggleCapabilityToJson(ToggleCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

const _$DeviceCapabilityTypeEnumMap = {
  DeviceCapabilityType.value: 'value',
  DeviceCapabilityType.toggle: 'switch',
  DeviceCapabilityType.range: 'range',
  DeviceCapabilityType.number: 'number',
  DeviceCapabilityType.mode: 'mode',
  DeviceCapabilityType.date: 'date',
  DeviceCapabilityType.image: 'image',
  DeviceCapabilityType.multiswitch: 'multiswitch',
  DeviceCapabilityType.multimode: 'multimode',
  DeviceCapabilityType.multirange: 'multirange',
  DeviceCapabilityType.multinumber: 'multinumber',
  DeviceCapabilityType.multivalue: 'multivalue',
  DeviceCapabilityType.action: 'action',
};

RangeCapability _$RangeCapabilityFromJson(Map<String, dynamic> json) =>
    RangeCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      min: (json['min'] as num).toDouble(),
      max: (json['max'] as num).toDouble(),
      step: (json['step'] as num?)?.toDouble(),
      unit: json['unit'] as String?,
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$RangeCapabilityToJson(RangeCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'min': instance.min,
      'max': instance.max,
      'step': instance.step,
      'unit': instance.unit,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

NumberCapability _$NumberCapabilityFromJson(Map<String, dynamic> json) =>
    NumberCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      bound: json['bound'] == null
          ? null
          : BoundValue.fromJson(json['bound'] as Map<String, dynamic>),
      step: (json['step'] as num?)?.toDouble(),
      unit: json['unit'] as String?,
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$NumberCapabilityToJson(NumberCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'bound': instance.bound,
      'step': instance.step,
      'unit': instance.unit,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

ModeCapability _$ModeCapabilityFromJson(Map<String, dynamic> json) =>
    ModeCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      modes: (json['modes'] as List<dynamic>).map((e) => e as String).toList(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$ModeCapabilityToJson(ModeCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'modes': instance.modes,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

ValueCapability _$ValueCapabilityFromJson(Map<String, dynamic> json) =>
    ValueCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$ValueCapabilityToJson(ValueCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

DateCapability _$DateCapabilityFromJson(Map<String, dynamic> json) =>
    DateCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$DateCapabilityToJson(DateCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

ImageCapability _$ImageCapabilityFromJson(Map<String, dynamic> json) =>
    ImageCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      bytes: (json['bytes'] as List<dynamic>?)
          ?.map((e) => (e as num).toInt())
          .toList(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$ImageCapabilityToJson(ImageCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'bytes': instance.bytes,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

MultiSwitchCapability _$MultiSwitchCapabilityFromJson(
        Map<String, dynamic> json) =>
    MultiSwitchCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      length: (json['length'] as num?)?.toInt(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$MultiSwitchCapabilityToJson(
        MultiSwitchCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'length': instance.length,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

MultiModeCapability _$MultiModeCapabilityFromJson(Map<String, dynamic> json) =>
    MultiModeCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      modes: (json['modes'] as List<dynamic>).map((e) => e as String).toList(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$MultiModeCapabilityToJson(
        MultiModeCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'modes': instance.modes,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

MultiRangeCapability _$MultiRangeCapabilityFromJson(
        Map<String, dynamic> json) =>
    MultiRangeCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      min: json['min'],
      max: json['max'],
      step: json['step'],
      unit: json['unit'],
      length: (json['length'] as num?)?.toInt(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$MultiRangeCapabilityToJson(
        MultiRangeCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'min': instance.min,
      'max': instance.max,
      'step': instance.step,
      'unit': instance.unit,
      'length': instance.length,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

MultiNumberCapability _$MultiNumberCapabilityFromJson(
        Map<String, dynamic> json) =>
    MultiNumberCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      bound: json['bound'],
      step: json['step'],
      unit: json['unit'],
      length: (json['length'] as num?)?.toInt(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$MultiNumberCapabilityToJson(
        MultiNumberCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'bound': instance.bound,
      'step': instance.step,
      'unit': instance.unit,
      'length': instance.length,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

MultiValueCapability _$MultiValueCapabilityFromJson(
        Map<String, dynamic> json) =>
    MultiValueCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      length: (json['length'] as num?)?.toInt(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$MultiValueCapabilityToJson(
        MultiValueCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'length': instance.length,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

ActionCapability _$ActionCapabilityFromJson(Map<String, dynamic> json) =>
    ActionCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      arguments: (json['arguments'] as List<dynamic>)
          .map((e) => BasicCapability.fromJson(e as Map<String, dynamic>))
          .toList(),
      lockedFields: (json['lockedFields'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$ActionCapabilityToJson(ActionCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'arguments': instance.arguments,
      'lockedFields': instance.lockedFields,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

_BoundValue _$BoundValueFromJson(Map<String, dynamic> json) => _BoundValue(
      type: $enumDecode(_$BoundTypeEnumMap, json['type']),
      value: (json['value'] as num).toDouble(),
    );

Map<String, dynamic> _$BoundValueToJson(_BoundValue instance) =>
    <String, dynamic>{
      'type': _$BoundTypeEnumMap[instance.type]!,
      'value': instance.value,
    };

const _$BoundTypeEnumMap = {
  BoundType.min: 'min',
  BoundType.max: 'max',
};

BasicToggleCapability _$BasicToggleCapabilityFromJson(
        Map<String, dynamic> json) =>
    BasicToggleCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$BasicToggleCapabilityToJson(
        BasicToggleCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

BasicRangeCapability _$BasicRangeCapabilityFromJson(
        Map<String, dynamic> json) =>
    BasicRangeCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      min: (json['min'] as num).toDouble(),
      max: (json['max'] as num).toDouble(),
      step: (json['step'] as num?)?.toDouble(),
      unit: json['unit'] as String?,
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$BasicRangeCapabilityToJson(
        BasicRangeCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'min': instance.min,
      'max': instance.max,
      'step': instance.step,
      'unit': instance.unit,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

BasicNumberCapability _$BasicNumberCapabilityFromJson(
        Map<String, dynamic> json) =>
    BasicNumberCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      bound: json['bound'] == null
          ? null
          : BoundValue.fromJson(json['bound'] as Map<String, dynamic>),
      step: (json['step'] as num?)?.toDouble(),
      unit: json['unit'] as String?,
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$BasicNumberCapabilityToJson(
        BasicNumberCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'bound': instance.bound,
      'step': instance.step,
      'unit': instance.unit,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

BasicModeCapability _$BasicModeCapabilityFromJson(Map<String, dynamic> json) =>
    BasicModeCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      modes: (json['modes'] as List<dynamic>).map((e) => e as String).toList(),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$BasicModeCapabilityToJson(
        BasicModeCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'modes': instance.modes,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

BasicValueCapability _$BasicValueCapabilityFromJson(
        Map<String, dynamic> json) =>
    BasicValueCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$BasicValueCapabilityToJson(
        BasicValueCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };

BasicDateCapability _$BasicDateCapabilityFromJson(Map<String, dynamic> json) =>
    BasicDateCapability(
      id: json['id'] as String,
      type: $enumDecode(_$DeviceCapabilityTypeEnumMap, json['type']),
      name: json['name'] as String?,
      extensionType: json['extensionType'] as String?,
      readonly: json['readonly'] as bool?,
      icon: json['icon'] as String?,
      $type: json['runtimeType'] as String?,
    );

Map<String, dynamic> _$BasicDateCapabilityToJson(
        BasicDateCapability instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$DeviceCapabilityTypeEnumMap[instance.type]!,
      'name': instance.name,
      'extensionType': instance.extensionType,
      'readonly': instance.readonly,
      'icon': instance.icon,
      'runtimeType': instance.$type,
    };
