// /* eslint-disable @typescript-eslint/no-explicit-any */
// /**
//  * SRP Debug utilities for comparing client and server implementations
//  * REMOVE THIS FILE IN PRODUCTION
//  */

// import crypto from 'crypto';
// import { modPow } from './srp-utils';

// export class SRPDebug {
//   /**
//    * Compare client and server SRP implementations
//    */
//   static compareImplementations(
//     email: string,
//     password: string,
//     salt: string,
//     a: bigint,
//     B: bigint,
//   ): any {
//     // Server implementation
//     const serverImpl = this.serverImplementation(email, password, salt, a, B);

//     // Simulated client implementation
//     const clientImpl = this.simulateClientImplementation(
//       email,
//       password,
//       salt,
//       a,
//       B,
//     );

//     return {
//       serverImplementation: {
//         A: serverImpl.A.toString(16),
//         u: serverImpl.u.toString(16),
//         x: serverImpl.x.toString(16),
//         S: serverImpl.S.toString(16),
//         K: serverImpl.K.toString(16),
//         M: serverImpl.M.toString(16),
//       },
//       clientImplementation: {
//         A: clientImpl.A.toString(16),
//         u: clientImpl.u.toString(16),
//         x: clientImpl.x.toString(16),
//         S: clientImpl.S.toString(16),
//         K: clientImpl.K.toString(16),
//         M: clientImpl.M.toString(16),
//       },
//       differences: {
//         A: serverImpl.A === clientImpl.A ? 'Match' : 'Different',
//         u: serverImpl.u === clientImpl.u ? 'Match' : 'Different',
//         x: serverImpl.x === clientImpl.x ? 'Match' : 'Different',
//         S: serverImpl.S === clientImpl.S ? 'Match' : 'Different',
//         K: serverImpl.K === clientImpl.K ? 'Match' : 'Different',
//         M: serverImpl.M === clientImpl.M ? 'Match' : 'Different',
//       },
//     };
//   }

//   /**
//    * Server implementation of SRP key generation
//    */
//   private static serverImplementation(
//     email: string,
//     password: string,
//     salt: string,
//     a: bigint,
//     B: bigint,
//   ): {
//     A: bigint;
//     u: bigint;
//     x: bigint;
//     S: bigint;
//     K: bigint;
//     M: bigint;
//   } {
//     // A = g^a % N
//     const A = modPow(this.g, a, this.N);

//     // u = H(A | B)
//     const u = this.calculateU(A, B);

//     // x = H(salt | H(email:password))
//     const x = this.calculateX(email, password, salt);

//     // S = (B - k*g^x)^(a + u*x) % N
//     const gx = modPow(this.g, x, this.N);
//     const kgx = (this.k * gx) % this.N;
//     let base = (B - kgx) % this.N;
//     if (base < BigInt(0)) base += this.N;
//     const exponent = (a + u * x) % (this.N - BigInt(1));
//     const S = modPow(base, exponent, this.N);

//     // K = H(S)
//     const K = this.hash(S.toString(16));

//     // M = H(H(N)^H(g) | H(email) | salt | A | B | K)
//     const M = this.calculateClientProof(email, salt, A, B, K);

//     return { A, u, x, S, K, M };
//   }

//   /**
//    * Simulated client implementation of SRP key generation
//    */
//   private static simulateClientImplementation(
//     email: string,
//     password: string,
//     salt: string,
//     a: bigint,
//     B: bigint,
//   ): {
//     A: bigint;
//     u: bigint;
//     x: bigint;
//     S: bigint;
//     K: bigint;
//     M: bigint;
//   } {
//     // 1. Calculate A = g^a % N
//     const A = modPow(this.g, a, this.N);

//     // 2. Calculate u = H(A | B)
//     const u = this.calculateU(A, B);

//     // 3. Calculate x = H(salt | H(email:password))
//     // Modified to match the Dart implementation
//     const identity = this.hashString(`${email}:${password}`);

//     // Concatenate hex salt with identity hash
//     const saltBuffer = Buffer.from(salt, 'hex');
//     const identityBuffer = Buffer.from(identity, 'hex');
//     const saltedIdentity = Buffer.concat([saltBuffer, identityBuffer]);

//     const x = BigInt('0x' + this.hashString(saltedIdentity.toString('hex')));

//     // 4. Calculate S = (B - k*g^x)^(a + u*x) % N
//     const gx = modPow(this.g, x, this.N);
//     const kgx = (this.k * gx) % this.N;
//     let base = (B - kgx) % this.N;
//     if (base < BigInt(0)) base += this.N;
//     const exponent = (a + u * x) % (this.N - BigInt(1));
//     const S = modPow(base, exponent, this.N);

//     // 5. Calculate K = H(S)
//     const K = BigInt('0x' + this.hashString(S.toString(16)));

//     // 6. Calculate M = H(H(N) XOR H(g) | H(email) | salt | A | B | K)
//     // This is where implementations might differ the most
//     const HN = this.hash(this.N.toString(16));
//     const Hg = this.hash(this.g.toString(16));

//     const hnBuffer = Buffer.from(HN.toString(16).padStart(64, '0'), 'hex');
//     const hgBuffer = Buffer.from(Hg.toString(16).padStart(64, '0'), 'hex');
//     const xorBuffer = Buffer.alloc(hnBuffer.length);

//     for (let i = 0; i < hnBuffer.length; i++) {
//       xorBuffer[i] = hnBuffer[i] ^ (i < hgBuffer.length ? hgBuffer[i] : 0);
//     }

//     const Hemail = this.hashString(email);

//     const concatString =
//       xorBuffer.toString('hex') +
//       Hemail +
//       salt +
//       A.toString(16) +
//       B.toString(16) +
//       K.toString(16);

//     const M = BigInt('0x' + this.hashString(concatString));

//     return { A, u, x, S, K, M };
//   }

//   /**
//    * Calculate the parameter x = H(salt | H(email | ':' | password))
//    */
//   private static calculateX(
//     email: string,
//     password: string,
//     salt: string,
//   ): bigint {
//     // First hash: H(email | ':' | password)
//     const identity = this.hashString(`${email}:${password}`);

//     // Concatenate salt with identity hash
//     const saltBuffer = Buffer.from(salt, 'hex');
//     const identityBuffer = Buffer.from(identity, 'hex');
//     const saltedIdentity = Buffer.concat([saltBuffer, identityBuffer]);

//     // Final hash
//     return BigInt('0x' + this.hashString(saltedIdentity.toString('hex')));
//   }

//   /**
//    * Calculate u = H(A | B)
//    */
//   private static calculateU(A: bigint, B: bigint): bigint {
//     const concatenated = A.toString(16) + B.toString(16);
//     return BigInt('0x' + this.hashString(concatenated));
//   }

//   /**
//    * Calculate client proof
//    */
//   private static calculateClientProof(
//     email: string,
//     salt: string,
//     A: bigint,
//     B: bigint,
//     K: bigint,
//   ): bigint {
//     // Hash N and g
//     const HN = this.hash(this.N.toString(16));
//     const Hg = this.hash(this.g.toString(16));

//     // XOR operation
//     const hnBuffer = Buffer.from(HN.toString(16).padStart(64, '0'), 'hex');
//     const hgBuffer = Buffer.from(Hg.toString(16).padStart(64, '0'), 'hex');
//     const xorBuffer = Buffer.alloc(hnBuffer.length);

//     for (let i = 0; i < hnBuffer.length; i++) {
//       xorBuffer[i] = hnBuffer[i] ^ (i < hgBuffer.length ? hgBuffer[i] : 0);
//     }

//     const Hemail = this.hashString(email);

//     const concatString =
//       xorBuffer.toString('hex') +
//       Hemail +
//       salt +
//       A.toString(16) +
//       B.toString(16) +
//       K.toString(16);

//     return BigInt('0x' + this.hashString(concatString));
//   }

//   /**
//    * Hash a string using SHA-256
//    */
//   private static hashString(input: string): string {
//     return crypto.createHash('sha256').update(input).digest('hex');
//   }

//   /**
//    * Hash a value to BigInt
//    */
//   private static hash(input: string): bigint {
//     return BigInt('0x' + this.hashString(input));
//   }

//   // Constants
//   private static readonly SRP_N_HEX =
//     `AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294 3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74 7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A 436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D 5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73 03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6 94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F 9E4AFF73`
//       .trim()
//       .replace(/[\s\r\n]+/g, '');
//   private static readonly SRP_GENERATOR = 2;
//   private static readonly SRP_K = 3;

//   private static readonly N = BigInt('0x' + this.SRP_N_HEX);
//   private static readonly g = BigInt(this.SRP_GENERATOR);
//   private static readonly k = BigInt(this.SRP_K);
// }
