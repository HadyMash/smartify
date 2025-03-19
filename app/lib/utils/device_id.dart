// This file is the entry point for device_id functionality
// It uses conditional imports to handle web vs non-web platforms

// Export the getDeviceId function from the appropriate implementation
export 'device_id_impl.dart' if (dart.library.html) 'device_id_web.dart';
