// import 'dart:convert';
// import 'package:convert/convert.dart';
// import 'package:crypto/crypto.dart';
// import '../services/auth.dart';

// class SRPDebugger {
//   /// Generate detailed debug information about SRP calculations
//   static Map<String, String> debugSRPCalculation(
//       String email, String password, String salt, BigInt a, BigInt B) {
//     final result = <String, String>{};

//     try {
//       // Step 1: Calculate A = g^a % N
//       final A = SRP.g.modPow(a, SRP.N);
//       result['A'] = "0x${A.toRadixString(16)}";

//       // Step 2: Calculate u = H(A | B)
//       final u = SRP.calculateU(A, B);
//       result['u'] = "0x${u.toRadixString(16)}";

//       // Step 3: Calculate x = H(salt | H(email:password))
//       final x = SRP.calculateX(email, password, salt);
//       result['x'] = "0x${x.toRadixString(16)}";

//       // Step 4: Calculate S = (B - k*g^x)^(a + u*x) % N
//       final gx = SRP.g.modPow(x, SRP.N);
//       result['gx'] = "0x${gx.toRadixString(16)}";

//       final kgx = (SRP.k * gx) % SRP.N;
//       result['kgx'] = "0x${kgx.toRadixString(16)}";

//       BigInt base = (B - kgx) % SRP.N;
//       if (base < BigInt.zero) base += SRP.N;
//       result['base'] = "0x${base.toRadixString(16)}";

//       final exponent = (a + (u * x)) % (SRP.N - BigInt.one);
//       result['exponent'] = "0x${exponent.toRadixString(16)}";

//       final S = base.modPow(exponent, SRP.N);
//       result['S'] = "0x${S.toRadixString(16)}";

//       // Step 5: Calculate K = H(S)
//       final K = SRP.hashBigInt(S);
//       result['K'] = "0x${K.toRadixString(16)}";

//       // Step 6: Calculate M = H(H(N) XOR H(g) | H(email) | salt | A | B | K)
//       final M = SRP.calculateClientProof(email, salt, A, B, K);
//       result['M'] = "0x${M.toRadixString(16)}";

//       // Add detailed hash breakdowns to debug possible issues
//       result['hash_email_password'] = SRP.hashString("$email:$password");
//       result['hex_salt'] = salt;

//       // Compare with raw SHA-256 calculation
//       final rawSha = sha256.convert(utf8.encode("$email:$password")).toString();
//       result['raw_sha256_email_password'] = rawSha;
//     } catch (e) {
//       result['error'] = e.toString();
//     }

//     return result;
//   }
// }
