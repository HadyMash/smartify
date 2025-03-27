import 'package:flutter/material.dart';
import 'device_capability.dart';

class DeviceExamples {
  static List<DeviceCapability> getDeviceCapabilities(String deviceType) {
    switch (deviceType.toLowerCase()) {
      case 'light':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'brightness',
            name: 'Brightness',
            type: CapabilityType.range,
            value: 70.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
          DeviceCapability(
            id: 'color',
            name: 'Color',
            type: CapabilityType.mode,
            value: 'White',
            config: {
              'modes': ['Red', 'Purple', 'Green', 'White'],
              'colors': [Colors.red, Colors.purple, Colors.green, Colors.white],
            },
          ),
        ];

      case 'smart tv':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'volume',
            name: 'Volume',
            type: CapabilityType.range,
            value: 30.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
          DeviceCapability(
            id: 'mute',
            name: 'Mute',
            type: CapabilityType.toggle,
            value: false,
          ),
          DeviceCapability(
            id: 'source',
            name: 'Source',
            type: CapabilityType.mode,
            value: 'HDMI 1',
            config: {
              'modes': ['HDMI 1', 'HDMI 2', 'AV', 'USB'],
            },
          ),
        ];

      case 'coffee machine':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'coffee_type',
            name: 'Coffee Type',
            type: CapabilityType.mode,
            value: 'Espresso',
            config: {
              'modes': ['Espresso', 'Cappuccino', 'Latte', 'Americano', 'Mocha'],
            },
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Temperature',
            type: CapabilityType.range,
            value: 160.0,
            config: {
              'min': 140.0,
              'max': 200.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'no_sugar',
            name: 'No Sugar',
            type: CapabilityType.toggle,
            value: false,
          ),
        ];

      case 'speakers':
      case 'speaker': // Handles both "Speakers" and "Speaker"
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'volume',
            name: 'Volume',
            type: CapabilityType.range,
            value: 65.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
          DeviceCapability(
            id: 'mute',
            name: 'Mute',
            type: CapabilityType.toggle,
            value: false,
          ),
          DeviceCapability(
            id: 'playback',
            name: 'Playback',
            type: CapabilityType.mode,
            value: 'Play',
            config: {
              'modes': ['Play', 'Pause', 'Next', 'Previous'],
              'icons': [Icons.play_arrow, Icons.pause, Icons.skip_next, Icons.skip_previous],
            },
          ),
        ];

      case 'air conditioner':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Temperature',
            type: CapabilityType.range,
            value: 24.0,
            config: {
              'min': 16.0,
              'max': 30.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'mode',
            name: 'Mode',
            type: CapabilityType.mode,
            value: 'Cool',
            config: {
              'modes': ['Cool', 'Heat', 'Fan', 'Dry', 'Auto'],
            },
          ),
          DeviceCapability(
            id: 'fan_speed',
            name: 'Fan Speed',
            type: CapabilityType.mode,
            value: 'Auto',
            config: {
              'modes': ['Low', 'Medium', 'High', 'Auto'],
            },
          ),
        ];

      case 'refrigerator':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Temperature',
            type: CapabilityType.range,
            value: 4.0,
            config: {
              'min': 1.0,
              'max': 8.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'freezer_temp',
            name: 'Freezer Temperature',
            type: CapabilityType.range,
            value: -18.0,
            config: {
              'min': -24.0,
              'max': -16.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'mode',
            name: 'Mode',
            type: CapabilityType.mode,
            value: 'Normal',
            config: {
              'modes': ['Normal', 'Vacation', 'Quick Cool', 'Quick Freeze'],
            },
          ),
        ];

      case 'smart vacuum':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'mode',
            name: 'Cleaning Mode',
            type: CapabilityType.mode,
            value: 'Auto',
            config: {
              'modes': ['Auto', 'Spot', 'Edge', 'Deep Clean', 'Quick'],
            },
          ),
          DeviceCapability(
            id: 'suction',
            name: 'Suction Power',
            type: CapabilityType.range,
            value: 50.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
          DeviceCapability(
            id: 'battery',
            name: 'Battery Level',
            type: CapabilityType.value,
            value: '85%',
            config: {
              'icon': Icons.battery_6_bar,
            },
          ),
          DeviceCapability(
            id: 'start_cleaning',
            name: 'Start Cleaning',
            type: CapabilityType.action,
            value: null,
            config: {
              'icon': Icons.play_arrow,
            },
          ),
        ];

      case 'security camera':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'recording',
            name: 'Recording',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'motion_detection',
            name: 'Motion Detection',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'sensitivity',
            name: 'Motion Sensitivity',
            type: CapabilityType.range,
            value: 70.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
          DeviceCapability(
            id: 'resolution',
            name: 'Resolution',
            type: CapabilityType.mode,
            value: '1080p',
            config: {
              'modes': ['720p', '1080p', '2K', '4K'],
            },
          ),
          DeviceCapability(
            id: 'take_snapshot',
            name: 'Take Snapshot',
            type: CapabilityType.action,
            value: null,
            config: {
              'icon': Icons.camera,
            },
          ),
        ];

      case 'smart plug':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'energy_usage',
            name: 'Energy Usage',
            type: CapabilityType.value,
            value: '45W',
            config: {
              'icon': Icons.electric_bolt,
            },
          ),
          DeviceCapability(
            id: 'schedule',
            name: 'Schedule',
            type: CapabilityType.action,
            value: null,
            config: {
              'icon': Icons.schedule,
            },
          ),
        ];

      case 'garage door':
        return [
          DeviceCapability(
            id: 'status',
            name: 'Door Status',
            type: CapabilityType.value,
            value: 'Closed',
            config: {
              'icon': Icons.garage,
            },
          ),
          DeviceCapability(
            id: 'auto_close',
            name: 'Auto Close',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'auto_close_timer',
            name: 'Auto Close Timer',
            type: CapabilityType.range,
            value: 5.0,
            config: {
              'min': 1.0,
              'max': 30.0,
              'unit': 'min',
            },
          ),
          DeviceCapability(
            id: 'open_close',
            name: 'Open/Close',
            type: CapabilityType.action,
            value: null,
            config: {
              'icon': Icons.door_sliding,
            },
          ),
        ];

      case 'blinds':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'position',
            name: 'Position',
            type: CapabilityType.range,
            value: 50.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
          DeviceCapability(
            id: 'mode',
            name: 'Mode',
            type: CapabilityType.mode,
            value: 'Manual',
            config: {
              'modes': ['Manual', 'Auto', 'Scheduled'],
            },
          ),
        ];

      case 'bedroom alarm':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'armed',
            name: 'Armed',
            type: CapabilityType.toggle,
            value: false,
          ),
          DeviceCapability(
            id: 'sensitivity',
            name: 'Sensitivity',
            type: CapabilityType.range,
            value: 50.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
          DeviceCapability(
            id: 'mode',
            name: 'Mode',
            type: CapabilityType.mode,
            value: 'Home',
            config: {
              'modes': ['Home', 'Away', 'Night'],
            },
          ),
        ];

      case 'shower':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Water Temperature',
            type: CapabilityType.range,
            value: 38.0,
            config: {
              'min': 20.0,
              'max': 50.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'pressure',
            name: 'Water Pressure',
            type: CapabilityType.range,
            value: 50.0,
            config: {
              'min': 0.0,
              'max': 100.0,
              'unit': '%',
            },
          ),
        ];

      case 'floor heater':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Temperature',
            type: CapabilityType.range,
            value: 25.0,
            config: {
              'min': 15.0,
              'max': 35.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'mode',
            name: 'Mode',
            type: CapabilityType.mode,
            value: 'Comfort',
            config: {
              'modes': ['Comfort', 'Eco', 'Boost'],
            },
          ),
        ];

      case 'thermostat':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Temperature',
            type: CapabilityType.range,
            value: 22.0,
            config: {
              'min': 10.0,
              'max': 30.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'mode',
            name: 'Mode',
            type: CapabilityType.mode,
            value: 'Heat',
            config: {
              'modes': ['Heat', 'Cool', 'Auto'],
            },
          ),
        ];

      case 'stove':
      case 'microwave':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Temperature',
            type: CapabilityType.range,
            value: 180.0,
            config: {
              'min': 50.0,
              'max': 250.0,
              'unit': '°C',
            },
          ),
          DeviceCapability(
            id: 'timer',
            name: 'Timer',
            type: CapabilityType.range,
            value: 5.0,
            config: {
              'min': 1.0,
              'max': 60.0,
              'unit': 'min',
            },
          ),
        ];

      case 'ev charger':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'charge_rate',
            name: 'Charge Rate',
            type: CapabilityType.range,
            value: 32.0,
            config: {
              'min': 6.0,
              'max': 48.0,
              'unit': 'A',
            },
          ),
          DeviceCapability(
            id: 'status',
            name: 'Status',
            type: CapabilityType.value,
            value: 'Charging',
            config: {
              'icon': Icons.battery_charging_full,
            },
          ),
          DeviceCapability(
            id: 'start_stop',
            name: 'Start/Stop',
            type: CapabilityType.action,
            value: null,
            config: {
              'icon': Icons.power_settings_new,
            },
          ),
        ];

      case 'outdoor sensor':
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
          DeviceCapability(
            id: 'temperature',
            name: 'Temperature',
            type: CapabilityType.value,
            value: '22°C',
            config: {
              'icon': Icons.thermostat,
            },
          ),
          DeviceCapability(
            id: 'humidity',
            name: 'Humidity',
            type: CapabilityType.value,
            value: '45%',
            config: {
              'icon': Icons.water_drop,
            },
          ),
        ];

      default:
        return [
          DeviceCapability(
            id: 'power',
            name: 'Power',
            type: CapabilityType.toggle,
            value: true,
          ),
        ];
    }
  }
}