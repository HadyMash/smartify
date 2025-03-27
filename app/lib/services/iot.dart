import 'package:dio/dio.dart';
import 'package:smartify/services/http/http_client.dart';

import '../models/capability.dart';
import '../models/device.dart';
import '../models/device_schema.dart';

class IotService {
  late final Dio _dio;

  IotService._(this._dio);

  /// factory method to create an instance of AuthService
  static Future<IotService> create() async {
    final httpClient = await SmartifyHttpClient.instance;
    return IotService._(httpClient.dio);
  }

  Future<List<({String id, String? name})>> discoverDevices() async {
    try {
      final response = await _dio.get('/iot/discover');
      final devices = response.data['devices'] as List<dynamic>;
      print('response: $devices');
      return devices
          .map((device) =>
              (id: device['id'] as String, name: device['name'] as String?))
          .toList();
    } catch (e) {
      print('error discovering devices: $e');
      return [];
    }
  }

  Future<DeviceWithState?> getDeviceState(String deviceId) async {
    try {
      final response = await _dio.get('/iot/$deviceId');
      final data = response.data['device'];
      if (data == null) return null;

      return DeviceWithPartialState(
        id: data['id'],
        name: data['name'],
        description: data['description'],
        source: _parseDeviceSource(data['source']),
        accessType: _parseDeviceAccessType(data['accessType']),
        icon: data['icon'],
        capabilities: _parseCapabilities(data['capabilities']),
        state: Map<String, dynamic>.from(data['state'] ?? {}),
        actionStates: data['actionStates'] != null
            ? _parseActionStates(data['actionStates'])
            : null,
      ).toDeviceWithState();
    } catch (e) {
      print('error getting device state: $e');
      return null;
    }
  }

  Future<List<DeviceWithState>> getAllDeviceStates(String householdId) async {
    try {
      final response = await _dio.get('/iot/$householdId/all');
      final devices = response.data['devices'] as List<dynamic>?;

      print('response: $devices');

      if (devices == null) return [];

      return devices.map((deviceData) {
        return DeviceWithPartialState(
          id: deviceData['id'],
          name: deviceData['name'],
          description: deviceData['description'],
          source: _parseDeviceSource(deviceData['source']),
          accessType: _parseDeviceAccessType(deviceData['accessType']),
          icon: deviceData['icon'],
          capabilities: _parseCapabilities(deviceData['capabilities']),
          state: Map<String, dynamic>.from(deviceData['state'] ?? {}),
          actionStates: deviceData['actionStates'] != null
              ? _parseActionStates(deviceData['actionStates'])
              : null,
        ).toDeviceWithState();
      }).toList();
    } catch (e) {
      print('error getting all device states: $e');
      return [];
    }
  }

  // Helper methods for parsing response data
  DeviceSource _parseDeviceSource(String source) {
    return DeviceSource.values.firstWhere(
      (e) => e.toString().split('.').last == source,
      orElse: () => DeviceSource.acme,
    );
  }

  DeviceAccessType _parseDeviceAccessType(String accessType) {
    return DeviceAccessType.values.firstWhere(
      (e) => e.toString().split('.').last == accessType,
      orElse: () => DeviceAccessType.appliances,
    );
  }

  List<Capability> _parseCapabilities(List<dynamic> capabilities) {
    return capabilities.map((cap) {
      final type = _parseCapabilityType(cap['type']);

      switch (type) {
        case DeviceCapabilityType.toggle:
          return Capability.toggle(
            id: cap['id'],
            type: type,
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
        case DeviceCapabilityType.range:
          return Capability.range(
            id: cap['id'],
            type: type,
            min: (cap['min'] as num).toDouble(),
            max: (cap['max'] as num).toDouble(),
            step: cap['step'] != null ? (cap['step'] as num).toDouble() : null,
            unit: cap['unit'],
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
        case DeviceCapabilityType.number:
          return Capability.number(
            id: cap['id'],
            type: type,
            bound: cap['bound'] != null
                ? BoundValue(
                    type: cap['bound']['type'] == 'min'
                        ? BoundType.min
                        : BoundType.max,
                    value: (cap['bound']['value'] as num).toDouble(),
                  )
                : null,
            step: cap['step'] != null ? (cap['step'] as num).toDouble() : null,
            unit: cap['unit'],
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
        case DeviceCapabilityType.mode:
          return Capability.mode(
            id: cap['id'],
            type: type,
            modes: (cap['modes'] as List).cast<String>(),
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
        case DeviceCapabilityType.value:
          return Capability.value(
            id: cap['id'],
            type: type,
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
        case DeviceCapabilityType.date:
          return Capability.date(
            id: cap['id'],
            type: type,
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
        case DeviceCapabilityType.image:
          return Capability.image(
            id: cap['id'],
            type: type,
            bytes: cap['bytes'] != null
                ? (cap['bytes'] as List).cast<int>()
                : null,
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
        default:
          // Handle other capability types if needed
          return Capability.value(
            id: cap['id'],
            type: type,
            name: cap['name'],
            extensionType: cap['extensionType'],
            readonly: cap['readonly'],
            icon: cap['icon'],
          );
      }
    }).toList();
  }

  Future<void> updateDeviceState(
      String deviceId, Map<String, dynamic> state) async {
    try {
      final response = await _dio
          .patch('/iot/state', data: {'deviceId': deviceId, 'state': state});
      print(response);
    } catch (e) {
      print('error updating device state: $e');
    }
  }

  DeviceCapabilityType _parseCapabilityType(String type) {
    return DeviceCapabilityType.values.firstWhere(
      (e) =>
          e.toString().split('.').last == type ||
          (e == DeviceCapabilityType.toggle && type == 'switch'),
      orElse: () => DeviceCapabilityType.value,
    );
  }

  Map<String, ActionState> _parseActionStates(
      Map<String, dynamic> actionStates) {
    final result = <String, ActionState>{};

    actionStates.forEach((key, value) {
      result[key] = ActionState(
        actionId: value['actionId'],
        progress: value['progress'],
        startTime: value['startTime'],
        data: value['data'],
      );
    });

    return result;
  }

  Future<void> testRoute() async {
    try {
      await _dio.get('/iot/test-route');
    } catch (e) {
      print(e);
    }
  }
}
