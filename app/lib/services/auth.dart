// ignore_for_file: non_constant_identifier_names, unused_element

import 'dart:convert'; // for the utf8.encode method
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:convert/convert.dart';

class AuthService {}

/// Client SRP methods
//class SRP {
//  static String SRP_N_HEX = ("""
//  AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294 3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74 7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A 436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D 5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73 03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6 94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F 9E4AFF73""")
//      .trim()
//      .replaceAll(RegExp(r'[\s\r\n]+'), '');
//  static int SRP_GENERATOR = 2;
//  static int SRP_K = 3;
//
//  // Prime number used as modulus
//  static BigInt get N => BigInt.parse(SRP_N_HEX, radix: 16);
//  // Generator
//  static BigInt get g => BigInt.from(SRP_GENERATOR);
//  // Multiplier parameter
//  static BigInt get k => BigInt.from(SRP_K);
//
//  /// Generate a random salt
//  static String generateSalt({int length = 16}) {
//    final random = Random.secure();
//    final saltBytes = List<int>.generate(length, (_) => random.nextInt(256));
//    return hex.encode(saltBytes);
//  }
//
//  /// Generate a private key for the client (a)
//  static BigInt generatePrivateKey() {
//    final random = Random.secure();
//    final bytes = List<int>.generate(32, (_) => random.nextInt(256));
//    return BigInt.parse(hex.encode(bytes), radix: 16);
//  }
//
//  /// Generate the verifier for registration
//  static BigInt generateVerifier(String email, String password, String salt) {
//    // Calculate x = H(salt | H(email | ':' | password))
//    final x = calculateX(email, password, salt);
//    // Calculate v = g^x % N
//    return g.modPow(x, N);
//  }
//
//  /// Calculate the client's public key (A)
//  static BigInt calculateA(BigInt a) {
//    // A = g^a % N
//    final A = g.modPow(a, N);
//
//    // Security check: A must not be zero modulo N
//    if (A % N == BigInt.zero) {
//      throw Exception("Invalid client public key: A mod N equals 0");
//    }
//
//    return A;
//  }
//
//  /// Calculate the shared session key (K)
//  static BigInt calculateSessionKey(
//      String email, String password, String salt, BigInt a, BigInt B) {
//    // Verify B != 0 mod N
//    if (B % N == BigInt.zero) {
//      throw Exception("Invalid server public key: B mod N equals 0");
//    }
//
//    // Calculate A = g^a % N
//    final A = calculateA(a);
//
//    // Calculate u = H(A | B)
//    final u = calculateU(A, B);
//
//    // Verify u != 0
//    if (u == BigInt.zero) {
//      throw Exception("Invalid hash parameter: u equals 0");
//    }
//
//    // Calculate x = H(salt | H(email | ':' | password))
//    final x = calculateX(email, password, salt);
//
//    // Calculate S = (B - k * g^x)^(a + u * x) % N
//    final kgx = (k * g.modPow(x, N)) % N;
//    BigInt base = (B - kgx) % N;
//    if (base < BigInt.zero) base += N; // Ensure positive
//
//    final exponent = (a + (u * x)) % (N - BigInt.one);
//    final S = base.modPow(exponent, N);
//
//    // Calculate K = H(S)
//    return hashBigInt(S);
//  }
//
//  /// Calculate the client proof M
//  static BigInt calculateClientProof(
//      String email, String salt, BigInt A, BigInt B, BigInt K) {
//    // Verify inputs are not zero
//    if (A == BigInt.zero || B == BigInt.zero || K == BigInt.zero) {
//      throw Exception("Invalid input parameters: A, B, or K equals 0");
//    }
//
//    // M = H(H(N) XOR H(g) | H(email) | salt | A | B | K)
//    final HN = hashBigInt(N);
//    final Hg = hashBigInt(g);
//    final Hemail = hashString(email);
//
//    // XOR operation on bytes
//    final hnBytes = bigIntToBytes(HN);
//    final hgBytes = bigIntToBytes(Hg);
//    final xorResult = List<int>.generate(
//      hnBytes.length,
//      (i) => i < hgBytes.length ? hnBytes[i] ^ hgBytes[i] : hnBytes[i],
//    );
//
//    // Concatenate all parts
//    final concatParts = [
//      xorResult,
//      utf8.encode(Hemail),
//      hex.decode(salt),
//      bigIntToBytes(A),
//      bigIntToBytes(B),
//      bigIntToBytes(K),
//    ].expand((x) => x).toList();
//
//    // Hash the combined value
//    return hashBytes(concatParts);
//  }
//
//  /// Verify the server proof
//  static bool verifyServerProof(
//      BigInt A, BigInt M, BigInt K, BigInt serverProof) {
//    // Verify inputs are not zero
//    if (A == BigInt.zero || M == BigInt.zero || K == BigInt.zero) {
//      throw Exception("Invalid input parameters: A, M, or K equals 0");
//    }
//
//    // Expected server proof: H(A | M | K)
//    final expectedProof = hashBytes([
//      ...bigIntToBytes(A),
//      ...bigIntToBytes(M),
//      ...bigIntToBytes(K),
//    ]);
//
//    return expectedProof == serverProof;
//  }
//
//  /// Calculate the parameter x
//  static BigInt calculateX(String email, String password, String salt) {
//    if (email.isEmpty || password.isEmpty || salt.isEmpty) {
//      throw Exception("Email, password, and salt must not be empty");
//    }
//
//    final identity = hashString("$email:$password");
//    final saltedIdentity = hex.decode(salt) + utf8.encode(identity);
//    return hashBytes(saltedIdentity);
//  }
//
//  /// Calculate the hash parameter u
//  static BigInt calculateU(BigInt A, BigInt B) {
//    // Verify inputs are valid
//    if (A == BigInt.zero || B == BigInt.zero) {
//      throw Exception("Invalid public keys: A or B equals 0");
//    }
//
//    final bytes = [...bigIntToBytes(A), ...bigIntToBytes(B)];
//    return hashBytes(bytes);
//  }
//
//  /// Hash a string
//  static String hashString(String input) {
//    final bytes = utf8.encode(input);
//    final digest = sha256.convert(bytes);
//    return digest.toString();
//  }
//
//  /// Hash bytes to a BigInt
//  static BigInt hashBytes(List<int> bytes) {
//    final digest = sha256.convert(bytes);
//    return BigInt.parse(digest.toString(), radix: 16);
//  }
//
//  /// Hash a BigInt to another BigInt
//  static BigInt hashBigInt(BigInt value) {
//    return hashBytes(bigIntToBytes(value));
//  }
//
//  /// Convert a BigInt to bytes
//  static List<int> bigIntToBytes(BigInt value) {
//    final hex =
//        value.toRadixString(16).padLeft((value.bitLength + 7) ~/ 8 * 2, '0');
//    return (hex.length % 2 == 0) ? _hexToBytes(hex) : _hexToBytes('0$hex');
//  }
//
//  /// Convert hex string to bytes
//  static List<int> _hexToBytes(String hex) {
//    final result = <int>[];
//    for (var i = 0; i < hex.length; i += 2) {
//      result.add(int.parse(hex.substring(i, i + 2), radix: 16));
//    }
//    return result;
//  }
//
//  /// Simulate the Node server proof calculation
//  static BigInt simulateNodeServerProof({
//    required BigInt A,
//    required BigInt b,
//    required BigInt verifier,
//    required BigInt B,
//    required String email,
//    required String salt,
//    required BigInt clientProof,
//  }) {
//    // 1) Check A != 0 mod N
//    if (A % N == BigInt.zero) {
//      throw Exception("Invalid A");
//    }
//
//    // 2) Calculate u = H(A|B)
//    final u = calculateU(A, B);
//    if (u == BigInt.zero) {
//      throw Exception("Invalid u");
//    }
//
//    // 3) S = (A * (v^u))^b % N
//    final vu = modPow(verifier, u, N);
//    final Avu = (A * vu) % N;
//    final S = modPow(Avu, b, N);
//
//    // 4) K = H(S)
//    final K = _hashHex(S.toRadixString(16));
//
//    // 5) expected M = H(H(N)^H(g) | H(email) | salt | A | B | K)
//    final expectedM = _calculateClientProofNode(email, salt, A, B, K);
//    if (expectedM != clientProof) {
//      throw Exception("Client proof mismatch");
//    }
//
//    // 6) server proof = H(A| M| K)
//    return _calculateServerProofNode(A, clientProof, K);
//  }
//
//  // Minimal Node-like helpers in Dart:
//
//  static BigInt modPow(BigInt base, BigInt exponent, BigInt modulus) {
//    BigInt result = BigInt.one;
//    BigInt curBase = base % modulus;
//    BigInt e = exponent;
//
//    while (e > BigInt.zero) {
//      if (e & BigInt.one == BigInt.one) {
//        result = (result * curBase) % modulus;
//      }
//      e >>= 1;
//      curBase = (curBase * curBase) % modulus;
//    }
//    return result;
//  }
//
//  static BigInt _hashHex(String hexStr) {
//    final digest = sha256.convert(utf8.encode(hexStr));
//    return BigInt.parse(digest.toString(), radix: 16);
//  }
//}

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

  respondToAuthChallenge(
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

    // TEMP
    // TODO: update with proper typing

    return {
      'A': A,
      'M': M,
      'K': K,
    };
  }
}
