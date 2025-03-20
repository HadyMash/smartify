import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:convert/convert.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';
import 'package:smartify/models/mfa.dart';
import 'package:smartify/utils/device_id.dart';

class AuthService {
  // Token names
  // ignore: unused_field, constant_identifier_names
  static const String _ID_TOKEN_NAME = 'id-token';
  // ignore: unused_field, constant_identifier_names
  static const String _REFRESH_TOKEN_NAME = 'refresh-token';
  // ignore: unused_field, constant_identifier_names
  static const String _ACCESS_TOKEN_NAME = 'access-token';
  // ignore: unused_field, constant_identifier_names
  static const String _MFA_TOKEN_NAME = 'mfa-token';

  final Dio _dio;
  final CookieJar _cookieJar;
  final Uri _apiBaseUrl;

  static AuthState _currentAuthState = AuthState.signedOut;

  final StreamController<AuthEvent> _eventStream =
      StreamController<AuthEvent>.broadcast();
  Stream<AuthEvent> get authEventStream => _eventStream.stream;
  AuthState get state => _currentAuthState;

  AuthService._(this._dio, this._cookieJar, this._apiBaseUrl);

  /// factory method to create an instance of AuthService
  static Future<AuthService> create() async {
    final apiBaseUrl =
        Uri.parse(dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api');

    final Dio dio = Dio(BaseOptions(
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
    final cookieJar = PersistCookieJar(storage: FileStorage(cookiePath));

    dio.interceptors.add(CookieManager(cookieJar));

    final cookies = await cookieJar.loadForRequest(apiBaseUrl);
    var authState = AuthState.signedOut;
    if (cookies.any((cookie) =>
        (cookie.name == _ACCESS_TOKEN_NAME ||
            cookie.name == _REFRESH_TOKEN_NAME) &&
        cookie.expires != null &&
        cookie.expires!.isAfter(DateTime.now()))) {
      authState = AuthState.signedIn;
    }

    _currentAuthState = authState;

    return AuthService._(dio, cookieJar, apiBaseUrl);
  }

  // TEMP
  Future<List<Cookie>> getCookies() {
    return _cookieJar.loadForRequest(_apiBaseUrl);
  }

  /// Registers a new user with the given email and password and optional data
  /// This will also sign the user in, and only need to confirm setting up MFA
  Future<MFAFormattedKey?> register(String email, String password,
      {DateTime? dob, String? sex}) async {
    try {
      if (state != AuthState.signedOut) {
        print('Error registering: user is already signed in');
        return null;
      }
      final salt = _SRP.generateSalt();
      final verifier = _SRP.deriveVerifier(email, password, salt);
      final body = {
        'email': email,
        'salt': salt,
        'verifier': '0x${verifier.toRadixString(16)}',
      };
      if (dob != null) {
        body['dob'] = dob.toIso8601String();
      }
      if (sex != null) {
        body['sex'] = sex;
      }
      final response = await _dio.post(
        '/auth/register',
        data: body,
      );

      print("Response Status Code: ${response.statusCode}");
      print("Response Body: ${response.data}");

      // get json body
      final responseBody = response.data as Map<String, dynamic>;
      try {
        // TEMP: check cookies
        final cookies = await _cookieJar.loadForRequest(_apiBaseUrl);
        print(cookies);
        //final userId = responseBody['userId'] as String;
        final mfaFormattedKey = responseBody['mfaFormattedKey'] as String?;
        final mfaQRUri = responseBody['mfaQRUri'] as String?;
        if (mfaFormattedKey == null || mfaQRUri == null) {
          print('Error registering: MFA key or QR URI not found');
          return null;
        }

        _currentAuthState = AuthState.signedInMFAConfirm;
        _eventStream.add(AuthEvent(AuthEventType.authStateChanged, state));

        return MFAFormattedKey(
          mfaFormattedKey,
          mfaQRUri,
        );
      } catch (e) {
        print('Error getting body: $e');
      }
    } on DioError catch (e) {
      print('Dio Error registering: ${e.message}');
      if (e.response != null && e.response!.data != null) {
        if (e.response!.data != null) {
          final error = e.response!.data as Map<String, dynamic>;
          print('Error registering: ${error['message'] ?? error['error']}');
        }
      }
    } catch (e) {
      print('Error registering: $e');
    }
    return null;
  }

  /// Initiates a server side SRP auth session and gets the salt and B values
  Future<({String salt, BigInt B})?> _initiateAuthSession(String email) async {
    try {
      if (state == AuthState.signedInMFAVerify ||
          state == AuthState.signedInMFAConfirm) {
        throw Exception('User is already signed in');
      }

      final response = await _dio.post('/auth/init', queryParameters: {
        'email': email,
      });

      final responseBody = response.data as Map<String, dynamic>;
      final salt = responseBody['salt'] as String;
      final BString = responseBody['B'] as String;
      final B = BigInt.parse(BString.substring(2), radix: 16);

      return (salt: salt, B: B);
    } on DioError catch (e) {
      throw Exception(
          e.response?.data['message'] ?? 'Failed to initiate session');
    } catch (e) {
      throw Exception('Failed to initiate session: $e');
    }
  }

  /// Signs the user in with the given email and password
  Future<({bool success, String? error, MFAFormattedKey? mfa})?> signIn(
      String email, String password) async {
    try {
      if (state != AuthState.signedOut) {
        throw Exception('User is already signed in');
      }

      final session = await _initiateAuthSession(email);
      if (session == null) throw Exception('Failed to initiate session');

      final a = _SRP.generatePrivateKey();
      final proof = _SRP.respondToAuthChallenge(
          email, password, session.salt, a, session.B);

      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'A': '0x${proof.A.toRadixString(16)}',
        'Mc': '0x${proof.M.toRadixString(16)}',
      });
      print('Response Status Code: ${response.statusCode}');

      final responseBody = response.data as Map<String, dynamic>;
      final mfa = MFAFormattedKey.fromJson(responseBody);
      print('MFA: $mfa');

      _currentAuthState = AuthState.signedInMFAVerify;
      _eventStream.add(AuthEvent(AuthEventType.authStateChanged, state));

      return (success: true, error: null, mfa: mfa);
    } on DioError catch (e) {
      print('Dio Error signing in: ${e.message}');
      return (
        success: false,
        error: e.response?.data['message'] as String?,
        mfa: null
      );
    } catch (e) {
      return (success: false, error: 'Sign-in failed', mfa: null);
    }
  }

  /// Verifies the MFA code
  Future<bool> verifyMFA(String code) async {
    try {
      await _dio.post('/auth/mfa/verify', data: {'code': code});

      _currentAuthState = AuthState.signedIn;
      _eventStream.add(AuthEvent(AuthEventType.authStateChanged, state));
      return true;
    } on DioError catch (e) {
      throw Exception(e.response?.data['message'] ?? 'MFA verification failed');
    } catch (e) {
      throw Exception('MFA verification failed: $e');
    }
  }

  /// Confirms setting up the user's MFA by verifying the MFA code
  Future<bool> confirmMFA(String code) async {
    try {
      await _dio.post('/auth/mfa/confirm', data: {'code': code});

      _currentAuthState = AuthState.signedIn;
      _eventStream.add(AuthEvent(AuthEventType.authStateChanged, state));
      return true;
    } on DioError catch (e) {
      throw Exception(e.response?.data['message'] ?? 'MFA confirmation failed');
    } catch (e) {
      throw Exception('MFA confirmation failed: $e');
    }
  }

  /// Signs the user out
  Future<void> signOut() async {
    try {
      await _dio.get('/auth/logout');
    } catch (e) {
      try {
        await _cookieJar.deleteAll();
      } catch (_) {}
    } finally {
      _currentAuthState = AuthState.signedOut;
      _eventStream.add(AuthEvent(AuthEventType.authStateChanged, state));
    }
  }

  Future<void> changePassword(String newPassword) async {
    if (_currentAuthState != AuthState.signedIn) {
      throw Exception('User is not signed in');
    }
    try {
      // get email
      final userResponse = await _dio.get('/auth/user');
      final user = userResponse.data as Map<String, dynamic>;
      if (user['email'] == null) {
        throw Exception('Email not found');
      }
      final email = user['email'] as String;
      print('Email: $email');

      // generate new salt and verifier
      final salt = _SRP.generateSalt();
      final verifier = _SRP.deriveVerifier(email, newPassword, salt);
      print('new salt: $salt');
      print('new verifier: $verifier');
      final response = await _dio.patch('/auth/password/change', data: {
        'salt': salt,
        'verifier': '0x${verifier.toRadixString(16)}',
      });

      print('Password changed status: ${response.statusCode}');
      return;
    } on DioError catch (e) {
      throw Exception(e.response?.data['message'] ?? 'MFA confirmation failed');
    } catch (e) {
      throw Exception('MFA confirmation failed: $e');
    }
  }
}

/// Client SRP methods
class _SRP {
  // ignore: non_constant_identifier_names
  static String SRP_N_HEX = ("""
  AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294 3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74 7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A 436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D 5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73 03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6 94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F 9E4AFF73""")
      .trim()
      .replaceAll(RegExp(r'[\s\r\n]+'), '');
  // ignore: non_constant_identifier_names
  static int SRP_GENERATOR = 2;
  // ignore: non_constant_identifier_names
  static int SRP_K = 3;

  // Prime number used as modulus
  static BigInt get N => BigInt.parse(SRP_N_HEX, radix: 16);
  // Generator
  static BigInt get g => BigInt.from(SRP_GENERATOR);
  // Multiplier parameter
  static BigInt get k => BigInt.from(SRP_K);

  // helpers

  static String hashString(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// Hashes the input and returns it as a BigInt
  static BigInt hashToBigInt(String input) {
    return BigInt.parse(hashString(input), radix: 16);
  }

  static generateSalt([int length = 16]) {
    final random = Random.secure();
    final saltBytes = List<int>.generate(length, (_) => random.nextInt(256));
    return hex.encode(saltBytes);
  }

  static BigInt _randomBigInt(int length) {
    final random = Random.secure();
    final bytes = List<int>.generate(length, (_) => random.nextInt(256));
    return BigInt.parse(hex.encode(bytes), radix: 16);
  }

  static BigInt generatePrivateKey() {
    return _randomBigInt(32);
  }

  static BigInt deriveVerifier(String email, String password, String salt) {
    final x = calculateX(email, password, salt);
    return g.modPow(x, N);
  }

  static BigInt derivePublicKey(BigInt a) {
    final A = g.modPow(a, N);
    if (A % N == BigInt.zero) {
      throw Exception("Invalid client public key: A mod N equals 0");
    }
    return A;
  }

  static BigInt calcluateU(BigInt A, BigInt B) {
    final concatenated = A.toRadixString(16) + B.toRadixString(16);
    return BigInt.parse(hashString(concatenated), radix: 16);
  }

  static BigInt calculateX(String email, String password, String salt) {
    if (email.isEmpty || password.isEmpty || salt.isEmpty) {
      throw Exception("Email, password, and salt must not be empty");
    }

    // First H(email | ':' | password)
    final identity = hashString('$email:$password');

    // convert salt from hex to buffer
    final saltBuffer = hex.decode(salt);

    // convert identity to buffer
    final identityBuffer = hex.decode(identity);

    // concatenate salt with identity hash bytes
    final saltedIdentity = [...saltBuffer, ...identityBuffer];

    // final hash H(salt | H(email | ':' | password))
    final result = hashString(hex.encode(saltedIdentity));
    return BigInt.parse(result, radix: 16);
  }

  static BigInt calculateClientProof(
      String email, String salt, BigInt A, BigInt B, BigInt K) {
    // Hash N and g
    // ignore: non_constant_identifier_names
    final HN = hashToBigInt(N.toRadixString(16));
    // ignore: non_constant_identifier_names
    final Hg = hashToBigInt(g.toRadixString(16));

    // XOR operation (convert to buffer for easier XOR)
    final hnBuffer = hex.decode(HN.toRadixString(16).padLeft(64, '0'));
    final hgBuffer = hex.decode(Hg.toRadixString(16).padLeft(64, '0'));

    final xorBuffer = List<int>.generate(
      hnBuffer.length,
      (i) => hnBuffer[i] ^ (i < hgBuffer.length ? hgBuffer[i] : 0),
    );

    // hash email
    // ignore: non_constant_identifier_names
    final Hemail = hashString(email);

    // concat
    final concatString = hex.encode(xorBuffer) +
        Hemail +
        salt +
        A.toRadixString(16) +
        B.toRadixString(16) +
        K.toRadixString(16);

    return hashToBigInt(concatString);
  }

  static ({BigInt A, BigInt M, BigInt K}) respondToAuthChallenge(
      String email, String password, String salt, BigInt a, BigInt B) {
    // Step 1: derive public key
    final A = derivePublicKey(a);

    // Step 2: calculate u = H(A | B)
    final u = calcluateU(A, B);

    // Step 3: calculate x = H(salt | H(email | ':' | password))
    final x = calculateX(email, password, salt);

    // Step 4: calculate S = (B - k * g^x)^(a + u * x) % N
    final gx = g.modPow(x, N);
    final kgx = (k * gx) % N;

    var base = (B - kgx) % N;
    if (base < BigInt.zero) base += N;

    final exponent = (a + (u * x)) % (N - BigInt.one);

    final S = base.modPow(exponent, N);

    // Step 5: calculate K = H(S)
    final K = hashToBigInt(S.toRadixString(16));

    // Step 6: calculate client proof M = H(H(N) XOR H(g) | H(email) | salt | A | B | K)
    final M = calculateClientProof(email, salt, A, B, K);

    return (
      A: A,
      M: M,
      K: K,
    );
  }
}

class AuthEvent {
  /// The type of event that ocurred
  final AuthEventType type;

  /// The current authentication state
  final AuthState state;
  AuthEvent(this.type, this.state);
}

enum AuthEventType {
  authStateChanged,
  tokenRefresh,
}

/// The user's current authentication state
enum AuthState {
  /// The user is signed out.
  signedOut,

  /// The user is signed in
  signedIn,

  /// The user is signed in and needs to verify their MFA code.
  signedInMFAVerify,

  /// The user is signed in and needs to setup their MFA and confirm setting it
  /// up correctly
  signedInMFAConfirm,
}
