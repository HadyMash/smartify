// ignore_for_file: non_constant_identifier_names, unused_element, avoid_print

import 'dart:convert'; // for the utf8.encode method
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:convert/convert.dart';
import 'package:http/http.dart' as http;

// TODO: get uri from environment variables
// TODO: get device id dynamically
class AuthService {
  Future<({String userId, String mfaFormattedKey})?> register(
      String email, String password,
      {DateTime? dob, String? sex}) async {
    try {
      final salt = SRP.generateSalt();
      final verifier = SRP.deriveVerifier(email, password, salt);
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
      final uri = Uri.parse('http://localhost:3000/api/auth/register');
      final response = await http.post(uri, body: jsonEncode(body), headers: {
        'Content-Type': 'application/json',
        'x-device-id': '1234',
      });

      print('register response status: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        print('Registration successful');
        // get json body
        final responseBody = jsonDecode(response.body) as Map<String, dynamic>;
        try {
          print('body: $responseBody');
          final userId = responseBody['userId'] as String;
          final mfaFormattedKey = responseBody['formattedKey'] as String;
          return (userId: userId, mfaFormattedKey: mfaFormattedKey);
        } catch (e) {
          print('Error getting body: $e');
        }
      } else {
        if (response.body.isNotEmpty) {
          final error = jsonDecode(response.body) as Map<String, dynamic>;
          print('Error registering: ${error['message'] ?? error['error']}');
        }
      }
    } catch (e) {
      print('Error registering: $e');
    }
    return null;
  }

  /// Initiates an authentication session for the user with the given [email].
  Future<({String salt, BigInt B})?> _initiateAuthSession(String email) async {
    try {
      // initiate auth session
      final uri = Uri.parse('http://localhost:3000/api/auth/init?email=$email');
      print(uri.toString());
      final response = await http.post(uri, headers: {
        'x-device-id': '1234',
      });
      print('init auth response status: ${response.statusCode}');
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // get body
        final responseBody = jsonDecode(response.body) as Map<String, dynamic>;
        print('response body: $responseBody');
        try {
          final salt = responseBody['salt'] as String;
          final BString = responseBody['B'] as String;

          // convert B to BigInt
          final B = BigInt.parse(BString.substring(2), radix: 16);

          return (salt: salt, B: B);
        } catch (e) {
          print('Error getting body: $e');
        }
      } else {
        // error
        if (response.body.isNotEmpty) {
          final error = jsonDecode(response.body) as Map<String, dynamic>;
          print('Error registering: ${error['message'] ?? error['error']}');
        }
      }
    } catch (e) {
      print('Error signing in: $e');
    }
    return null;
  }

  /// Signs the user in with the given [email] and [password]. The user must
  /// complete the MFA challenge after this to complete the sign in process.
  Future signIn(String email, String password) async {
    try {
      // create an auth session
      final session = await _initiateAuthSession(email);
      if (session == null) {
        print('Error initiating auth session');
        return;
      }
      print('session: $session');

      // generate private key
      final a = SRP.generatePrivateKey();
      final proof = SRP.respondToAuthChallenge(
          email, password, session.salt, a, session.B);
      final body = {
        'email': email,
        'A': '0x${proof.A.toRadixString(16)}',
        'Mc': '0x${proof.M.toRadixString(16)}',
      };

      final uri = Uri.parse('http://localhost:3000/api/auth/login');
      final response = await http.post(uri, body: jsonEncode(body), headers: {
        'Content-Type': 'application/json',
        'x-device-id': '1234',
      });

      print('login response status: ${response.statusCode}');
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // get body
        final responseBody = jsonDecode(response.body) as Map<String, dynamic>;
        print('response body: $responseBody');
        try {
          final MsString = responseBody['Ms'] as String;
          print('MsString: $MsString');
          final Ms = BigInt.parse(MsString.substring(2), radix: 16);
          print('Ms: $Ms');
        } catch (e) {
          print('Error getting body: $e');
        }
      } else {
        // error
        if (response.body.isNotEmpty) {
          final error = jsonDecode(response.body) as Map<String, dynamic>;
          print('Error registering: ${error['message'] ?? error['error']}');
        }
      }
    } catch (e) {
      print('Error signing in: $e');
    }
  }
}

/// Client SRP methods
class SRP {
  static String SRP_N_HEX = ("""
  AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294 3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74 7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A 436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D 5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73 03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6 94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F 9E4AFF73""")
      .trim()
      .replaceAll(RegExp(r'[\s\r\n]+'), '');
  static int SRP_GENERATOR = 2;
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
    final HN = hashToBigInt(N.toRadixString(16));
    final Hg = hashToBigInt(g.toRadixString(16));

    // XOR operation (convert to buffer for easier XOR)
    final hnBuffer = hex.decode(HN.toRadixString(16).padLeft(64, '0'));
    final hgBuffer = hex.decode(Hg.toRadixString(16).padLeft(64, '0'));

    final xorBuffer = List<int>.generate(
      hnBuffer.length,
      (i) => hnBuffer[i] ^ (i < hgBuffer.length ? hgBuffer[i] : 0),
    );

    // hash email
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

    print('A: 0x${A.toRadixString(16)}');

    // Step 2: calculate u = H(A | B)
    final u = calcluateU(A, B);

    print('u: 0x${u.toRadixString(16)}');

    // Step 3: calculate x = H(salt | H(email | ':' | password))
    final x = calculateX(email, password, salt);

    print('x: 0x${x.toRadixString(16)}');

    // Step 4: calculate S = (B - k * g^x)^(a + u * x) % N
    final gx = g.modPow(x, N);
    final kgx = (k * gx) % N;

    var base = (B - kgx) % N;
    if (base < BigInt.zero) base += N;

    final exponent = (a + (u * x)) % (N - BigInt.one);

    print('base: 0x${base.toRadixString(16)}');
    print('exponent: 0x${exponent.toRadixString(16)}');

    final S = base.modPow(exponent, N);
    print('S: 0x${S.toRadixString(16)}');

    // Step 5: calculate K = H(S)
    final K = hashToBigInt(S.toRadixString(16));
    print('K: 0x${K.toRadixString(16)}');

    // Step 6: calculate client proof M = H(H(N) XOR H(g) | H(email) | salt | A | B | K)
    final M = calculateClientProof(email, salt, A, B, K);
    print('M: 0x${M.toRadixString(16)}');

    // TEMP
    // TODO: update with proper typing

    return (
      A: A,
      M: M,
      K: K,
    );
  }
}
