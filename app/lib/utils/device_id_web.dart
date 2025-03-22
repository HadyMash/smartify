// Web-specific implementation
// ignore: deprecated_member_use, avoid_web_libraries_in_flutter
import 'dart:html' as html;

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

/// Gets a unique device identifier for web platforms
Future<String> getDeviceId() async {
  const String storageKey = 'smartify_device_id';
  try {
    // Check if local storage is available
    if (html.window.localStorage.containsKey(storageKey)) {
      return html.window.localStorage[storageKey]!;
    } else {
      // Generate a new UUID
      final String uuid = const Uuid().v4();
      try {
        // Try to save it to local storage
        html.window.localStorage[storageKey] = uuid;
      } catch (e) {
        debugPrint(
            'WARNING: Local storage not available. Device ID will not be persistent.');
      }
      return uuid;
    }
  } catch (e) {
    // If local storage is completely unavailable
    debugPrint(
        'WARNING: Error accessing local storage: $e. Device ID will not be persistent.');
    return const Uuid().v4();
  }
}
