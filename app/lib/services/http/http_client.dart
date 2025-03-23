import 'dart:io';
import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:path_provider/path_provider.dart';
import 'package:smartify/utils/device_id.dart';

/// A singleton HTTP client for making API requests. This class handles the
/// Creation and configuration of the dio instance and cookies
class SmartifyHttpClient {
  static SmartifyHttpClient? _instance;

  late final Dio dio;
  late final CookieJar cookieJar;
  late final Uri apiBaseUrl;

  /// Private constructor
  SmartifyHttpClient._();

  /// Factory method to get the singleton instance
  static Future<SmartifyHttpClient> get instance async {
    if (_instance == null) {
      _instance = SmartifyHttpClient._();
      await _instance!._init();
    }
    return _instance!;
  }

  /// Initialize the HTTP client
  Future<void> _init() async {
    apiBaseUrl =
        Uri.parse(dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api');

    dio = Dio(BaseOptions(
      headers: {
        'x-device-id': await getDeviceId(),
      },
      responseType: ResponseType.json,
      contentType: 'application/json',
      validateStatus: (status) => status != null && status < 300,
      baseUrl: apiBaseUrl.toString(),
    ));

    final appDocDir = await getApplicationDocumentsDirectory();
    final cookiePath = '${appDocDir.path}/.cookies/';
    cookieJar = PersistCookieJar(storage: FileStorage(cookiePath));

    dio.interceptors.add(CookieManager(cookieJar));
  }

  /// Get cookies for a specific URL
  Future<List<Cookie>> getCookies() {
    return cookieJar.loadForRequest(apiBaseUrl);
  }

  /// Delete all cookies
  Future<void> deleteAllCookies() {
    return cookieJar.deleteAll();
  }

  /// Check if a specific cookie exists
  Future<bool> hasCookie(String name) async {
    final cookies = await cookieJar.loadForRequest(apiBaseUrl);
    return cookies.any((cookie) =>
        cookie.name == name &&
        (cookie.expires == null || cookie.expires!.isAfter(DateTime.now())));
  }
}
