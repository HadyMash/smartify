import 'package:dio/dio.dart';
import 'package:smartify/services/http/http_client.dart';

class IotService {
  late final Dio _dio;
  late final SmartifyHttpClient _httpClient;

  IotService._(this._dio, this._httpClient);

  /// factory method to create an instance of AuthService
  static Future<IotService> create() async {
    final httpClient = await SmartifyHttpClient.instance;
    return IotService._(httpClient.dio, httpClient);
  }

  Future<List<({String id, String name})>> discoverDevices() async {
    try {
      final response = await _dio.get('/devices/discover');
      final devices = response.data['devices'] as List<Map<String, dynamic>>;
      return devices
          .map((device) =>
              (id: device['id'] as String, name: device['name'] as String))
          .toList();
    } catch (_) {
      return [];
    }
  }
}
