import 'dart:math';

String getDeviceId() {
  final random = Random().nextInt(1000000);
  return 'web-device-$random';
}
