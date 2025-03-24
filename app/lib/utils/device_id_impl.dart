// Non-web implementation
import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:uuid/uuid.dart';

/// Gets a unique device identifier for non-web platforms
Future<String> getDeviceId() async {
  final DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();

  if (Platform.isAndroid) {
    AndroidDeviceInfo androidInfo = await deviceInfoPlugin.androidInfo;
    return androidInfo.id;
  } else if (Platform.isIOS) {
    IosDeviceInfo iosInfo = await deviceInfoPlugin.iosInfo;
    return iosInfo.identifierForVendor ?? 'unknown-ios-id';
  } else if (Platform.isWindows) {
    WindowsDeviceInfo windowsInfo = await deviceInfoPlugin.windowsInfo;
    return windowsInfo.computerName;
  } else if (Platform.isMacOS) {
    MacOsDeviceInfo macOsInfo = await deviceInfoPlugin.macOsInfo;
    return macOsInfo.systemGUID ?? 'unknown-macos-id';
  } else if (Platform.isLinux) {
    LinuxDeviceInfo linuxInfo = await deviceInfoPlugin.linuxInfo;
    return linuxInfo.machineId ?? 'unknown-linux-id';
  } else {
    // For any other platform, generate a UUID
    return const Uuid().v4();
  }
}
