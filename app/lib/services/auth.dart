// ignore_for_file: unused_local_variable, unused_element, unused_field, non_constant_identifier_names, unused_element_parameter

import 'dart:convert'; // for the utf8.encode method
import 'dart:math';
import 'package:crypto/crypto.dart' as crypto;
import 'package:convert/convert.dart';

class AuthService {}

// TODO: implement the safeguards (checking for == 0, etc)

/// Client SRP methdos
class SRP {
  static String SRP_N_HEX = ("""
  AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294 3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74 7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A 436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D 5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73 03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6 94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F 9E4AFF73""")
      .trim()
      .replaceAll(RegExp(r'[\s\r\n]+'), '');
  static int SRP_GENERATOR = 2;

  static List<int> _randomBytes(int length) {
    var random = Random.secure();
    var values = List<int>.generate(length, (i) => random.nextInt(256));
    return values;
  }

  /// hash a String and return it's digest
  static crypto.Digest _hashString(String s) {
    return crypto.sha256.convert(utf8.encode(s));
  }

  /// has a BigInt and return it's digest
  static crypto.Digest _hashBigInt(BigInt b) {
    return crypto.sha256.convert(utf8.encode(b.toRadixString(16)));
  }

  /// Generate a random salt
  static String generateSalt() => hex.encode(_randomBytes(16));

  /// Generate a random verifier
  static String generateVerifier(String salt, String password) {
    // Calculate x = H(salt | H(P))

    // H(P)
    final innerHash = crypto.sha256.convert(utf8.encode(password));
    final outerHash =
        crypto.sha256.convert([...hex.decode(salt), ...innerHash.bytes]);

    final x = BigInt.parse('0x${outerHash.toString()}');

    // calculate v = g^x mod N
    final N = BigInt.parse('0x$SRP_N_HEX');
    final g = BigInt.from(SRP_GENERATOR);
    final v = g.modPow(x, N);

    return v.toRadixString(16);
  }

  /// Generate the SRP Client keys
  static ({BigInt a, BigInt A}) generateKeys() {
    final N = BigInt.parse('0x$SRP_N_HEX');
    final g = BigInt.from(SRP_GENERATOR);
    final a = BigInt.parse(hex.encode(_randomBytes(32)), radix: 16);
    final A = g.modPow(a, N);
    return (a: a, A: A);
  }

  static BigInt calculateProof({
    required String email,
    required String password,
    required String salt,
    required BigInt B,
    required BigInt a,
    required BigInt A,
  }) {
    final N = BigInt.parse('0x$SRP_N_HEX');
    final g = BigInt.from(SRP_GENERATOR);

    // Calculate k = H(N | g) - keep this part
    final k = BigInt.parse(
        '0x${_hashString(N.toRadixString(16) + g.toRadixString(16)).toString()}');
    print('k: ${k.toRadixString(16)}');

    // Calculate x = H(salt | H(password)) - keep this part
    final hashPassword = _hashString(password).toString();
    final x = BigInt.parse('0x${_hashString('$salt$hashPassword').toString()}');

    // Calculate u = H(A | B) - keep this part
    final u = BigInt.parse(
        '0x${_hashString(A.toRadixString(16) + B.toRadixString(16)).toString()}');

    print('Client-side values:');
    print('A: ${A.toRadixString(16)}');
    print('B: ${B.toRadixString(16)}');
    print('u: ${u.toRadixString(16)}');
    print('x: ${x.toRadixString(16)}');
    print('a: ${a.toRadixString(16)}');

    // Calculate v = g^x mod N
    final v = g.modPow(x, N);

    // MODIFY THIS SECTION: Match the server S calculation exactly
    // Calculate S = (B - k * g^x)^(a + u*x) % N
    final g_x = g.modPow(x, N);
    final k_g_x = (k * g_x) % N;

    // Ensure positive modulo if B < k*g^x
    final B_minus_kgx = ((B - k_g_x) % N + N) % N;

    // Calculate a + u*x
    final a_plus_ux = (a + u * x) % (N - BigInt.one);

    // Finally calculate S
    final S = B_minus_kgx.modPow(a_plus_ux, N);
    print('S: ${S.toRadixString(16)}');

    // Calculate shared session key K = H(S)
    final K = _hashBigInt(S).toString();

    // calculate client proof Mc = H(H(N) xor H(g) | H(email) | salt | A | B | K)
    final HN = _hashBigInt(N).bytes;
    final Hg = _hashBigInt(g).bytes;
    final He = _hashString(email).toString();

    // Ensure consistent hex encoding between client and server
    final xorResult = _xorLists(HN, Hg);
    final xorHex = hex.encode(xorResult);
    final AHex = A.toRadixString(16);
    final BHex = B.toRadixString(16);

    // Ensure hex values have even length for consistent encoding
    final AHexPadded = AHex.padLeft((AHex.length + 1) & ~1, '0');
    final BHexPadded = BHex.padLeft((BHex.length + 1) & ~1, '0');

    final combined = '$xorHex$He$salt$AHexPadded$BHexPadded$K';
    print('Client combined string: $combined');

    // Convert to BigInt first, then to hex string to match server format
    final Mc = _hashString(combined);
    final McHex = Mc.toString();
    return BigInt.parse('0x$McHex');
  }

  /// Verify the server proof [Ms] by calculating it ourselves using the client
  /// public key [A], the client proof [Mc] and the shared session key [K].
  static bool verifyServerProof({
    required BigInt A,
    required BigInt Mc,
    required String K,
    required String Ms,
  }) {
    final expectedMs =
        _hashString(A.toRadixString(16) + Mc.toRadixString(16) + K).toString();

    return Ms == expectedMs;
  }

  /// xor two lists of integers
  ///
  /// If the lists have different lengths, the result will have the length of
  /// the shortest list
  static _xorLists(List<int> a, List<int> b) {
    return List<int>.generate(min(a.length, b.length), (i) => a[i] ^ b[i]);
  }
}
