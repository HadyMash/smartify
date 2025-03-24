import 'dart:io';
import 'dart:async';
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

  // Cookie monitoring
  final StreamController<CookieChangeEvent> _cookieEventStream =
      StreamController<CookieChangeEvent>.broadcast();
  Stream<CookieChangeEvent> get cookieEventStream => _cookieEventStream.stream;

  // Token names
  static const String ID_TOKEN_NAME = 'id-token';
  static const String REFRESH_TOKEN_NAME = 'refresh-token';
  static const String ACCESS_TOKEN_NAME = 'access-token';
  static const String MFA_TOKEN_NAME = 'mfa-token';

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
    dio.interceptors.add(_createCookieMonitorInterceptor());
  }

  /// Create an interceptor that monitors cookie changes
  Interceptor _createCookieMonitorInterceptor() {
    return InterceptorsWrapper(
      onResponse: (response, handler) async {
        // Check cookies after response
        await _checkCookieChanges();
        handler.next(response);
      },
      onError: (error, handler) async {
        // Check cookies even on error responses
        await _checkCookieChanges();
        handler.next(error);
      },
    );
  }

  // Track the previous state of important cookies
  Map<String, bool> _previousCookieState = {
    ACCESS_TOKEN_NAME: false,
    REFRESH_TOKEN_NAME: false,
    MFA_TOKEN_NAME: false,
  };

  /// Check for changes in authentication cookies
  Future<void> _checkCookieChanges() async {
    try {
      final cookies = await getCookies();
      final currentState = {
        ACCESS_TOKEN_NAME:
            cookies.any((c) => c.name == ACCESS_TOKEN_NAME && !_isExpired(c)),
        REFRESH_TOKEN_NAME:
            cookies.any((c) => c.name == REFRESH_TOKEN_NAME && !_isExpired(c)),
        MFA_TOKEN_NAME:
            cookies.any((c) => c.name == MFA_TOKEN_NAME && !_isExpired(c)),
      };

      // Check for changes
      if (_previousCookieState[ACCESS_TOKEN_NAME] !=
              currentState[ACCESS_TOKEN_NAME] ||
          _previousCookieState[REFRESH_TOKEN_NAME] !=
              currentState[REFRESH_TOKEN_NAME]) {
        // Determine the event type
        CookieChangeEventType eventType;

        // If refresh token exists and access token is added or changed,
        // it's a token refresh rather than a new login
        if (currentState[ACCESS_TOKEN_NAME]! &&
            !_previousCookieState[ACCESS_TOKEN_NAME]! &&
            currentState[REFRESH_TOKEN_NAME]! &&
            _previousCookieState[REFRESH_TOKEN_NAME]!) {
          eventType = CookieChangeEventType.tokenRefreshed;
        }
        // Regular token added event
        else if ((currentState[ACCESS_TOKEN_NAME]! &&
                !_previousCookieState[ACCESS_TOKEN_NAME]!) ||
            (currentState[REFRESH_TOKEN_NAME]! &&
                !_previousCookieState[REFRESH_TOKEN_NAME]!)) {
          eventType = CookieChangeEventType.tokenAdded;
        }
        // Token removed event
        else if ((!currentState[ACCESS_TOKEN_NAME]! &&
                _previousCookieState[ACCESS_TOKEN_NAME]!) ||
            (!currentState[REFRESH_TOKEN_NAME]! &&
                _previousCookieState[REFRESH_TOKEN_NAME]!)) {
          eventType = CookieChangeEventType.tokenRemoved;
        }
        // Default to token refreshed for any other changes
        else {
          eventType = CookieChangeEventType.tokenRefreshed;
        }

        // Emit the event
        _cookieEventStream.add(CookieChangeEvent(
          type: eventType,
          hasAccessToken: currentState[ACCESS_TOKEN_NAME]!,
          hasRefreshToken: currentState[REFRESH_TOKEN_NAME]!,
          hasMfaToken: currentState[MFA_TOKEN_NAME]!,
        ));
      }

      // Update previous state
      _previousCookieState = currentState;
    } catch (e) {
      print('Error checking cookie changes: $e');
    }
  }

  bool _isExpired(Cookie cookie) {
    return cookie.expires != null && cookie.expires!.isBefore(DateTime.now());
  }

  /// Get cookies for a specific URL
  Future<List<Cookie>> getCookies() {
    return cookieJar.loadForRequest(apiBaseUrl);
  }

  /// Delete all cookies
  Future<void> deleteAllCookies() {
    return cookieJar.deleteAll();
  }

  Future<bool> deleteCookie(String name) async {
    final cookies = await cookieJar.loadForRequest(apiBaseUrl);
    final cookie = cookies.firstWhere((cookie) => cookie.name == name,
        orElse: () => Cookie(name, ''));
    if (cookie.value.isEmpty) {
      return false;
    }

    cookie.expires = DateTime.now().subtract(const Duration(days: 1));
    await cookieJar.saveFromResponse(apiBaseUrl, [cookie]);
    return true;
  }

  /// Check if a specific cookie exists
  Future<bool> hasCookie(String name) async {
    final cookies = await cookieJar.loadForRequest(apiBaseUrl);
    return cookies.any((cookie) =>
        cookie.name == name &&
        (cookie.expires == null || cookie.expires!.isAfter(DateTime.now())));
  }
}

/// Represents a cookie change event
class CookieChangeEvent {
  final CookieChangeEventType type;
  final bool hasAccessToken;
  final bool hasRefreshToken;
  final bool hasMfaToken;

  CookieChangeEvent({
    required this.type,
    required this.hasAccessToken,
    required this.hasRefreshToken,
    required this.hasMfaToken,
  });

  @override
  String toString() {
    return 'CookieChangeEvent{type: $type, hasAccessToken: $hasAccessToken, hasRefreshToken: $hasRefreshToken, hasMfaToken: $hasMfaToken}';
  }
}

/// Types of cookie change events
enum CookieChangeEventType {
  tokenAdded,
  tokenRemoved,
  tokenRefreshed,
}
