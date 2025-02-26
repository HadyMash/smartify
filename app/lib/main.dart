import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:smartify/services/auth.dart';

import 'models/mfa.dart';
import 'models/user.dart';
import 'services/mfa.dart';
import 'widgets/mfa_code.dart';

Future<void> main() async {
  await dotenv.load(fileName: '.env');

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    const password = 'password';
    //final salt = SRP.generateSalt();
    const salt = 'e6eb7979923ebb117785a56ab84f94ff';
    //debugPrint('salt: $salt\n');
    //final verifier = SRP.generateVerifier(salt, password);
    //debugPrint('verifier: $verifier\n');
    final keys = SRP.generateKeys();
    debugPrint('keys: a: ${keys.a}, A: ${keys.A}\n');
    //final B = SRP.generateKeys().A;
    final B = BigInt.parse(
        "0x45d1c104c0f75bb2366a8bc2088a66853c7b1d5646b20595ef412e26269181d78e488ac619b8129cac9ec99bb992f6acb1bc4b2d97879067b48977482f405f7e6101e6b1da7d86adb62a43eb38a07a07b4ea139060f3f61605bc023316a89c1b56b1977f0ef996cedf2612244d5303e6b4b068ee2013635a70af4eae7b5e1f8aaf3301d6d2fb4b235cda3133ae6ddaececcde90fdc1e19e1f289167fcbc9a926bcd08f3dab1505754d58305c62089cec6199f998d3a1ec06800293fb2c5c5b954844ba903aa77a7ae33b272c1c68e54fa25d8830fe02d0b0de74210435a4bab833b1db0ed7aa798ef38181adee3aca5c53aec0d73642dc0763075a5e74e40491");
    debugPrint('B: $B\n');
    final proof = SRP.calculateProof(
      email: 'hady@gmail.com',
      password: password,
      a: keys.a,
      A: keys.A,
      B: B,
      salt: salt,
    );
    debugPrint('proof: $proof\n');
    debugPrint('');
    debugPrint(
        'hex\n\nA: 0x${keys.A.toRadixString(16)}\nproof (Mc): 0x${proof.toRadixString(16)}');

    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // TRY THIS: Try running your application with "flutter run". You'll see
        // the application has a purple toolbar. Then, without quitting the app,
        // try changing the seedColor in the colorScheme below to Colors.green
        // and then invoke "hot reload" (save your changes or press the "hot
        // reload" button in a Flutter-supported IDE, or press "r" if you used
        // the command line to start the app).
        //
        // Notice that the counter didn't reset back to zero; the application
        // state is not lost during the reload. To reset the state, use hot
        // restart instead.
        //
        // This works for code too, not just values: Most code changes can be
        // tested with just a hot reload.
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MFATest(),
    );
  }
}

class MFATest extends StatefulWidget {
  const MFATest({super.key});

  @override
  State<MFATest> createState() => _MFATestState();
}

class _MFATestState extends State<MFATest> {
  final userIdController = TextEditingController();
  final totpController = TextEditingController();
  bool isVerify = false;
  MFAFormattedKey? mfaSetup;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MFA Test'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  controller: userIdController,
                  decoration: const InputDecoration(
                    labelText: 'User ID',
                  ),
                ),
                TextField(
                  controller: totpController,
                  decoration: const InputDecoration(
                    labelText: 'TOTP',
                  ),
                ),
                // checkbox
                const Text('Tick for verify, untick for confirm init:'),
                Checkbox(
                  value: isVerify,
                  onChanged: (bool? val) {
                    setState(() {
                      isVerify = val ?? false;
                    });
                  },
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    if (userIdController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('User ID cannot be empty'),
                        ),
                      );
                      return;
                    }

                    final User user =
                        User(userIdController.text, 'example@domain.com');
                    final mfa = MFAService();

                    if (totpController.text.isEmpty) {
                      try {
                        final result = await mfa.initMFA(user);

                        print('result: $result');

                        if (result != null) {
                          setState(() {
                            mfaSetup = result;
                          });
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Failed to initialize MFA'),
                            ),
                          );
                        }
                      } on SocketException {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Error: No internet connection'),
                            ),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Error: $e'),
                            ),
                          );
                        }
                      }
                    } else {
                      // either confirm init or verify
                      try {
                        var func =
                            isVerify ? mfa.verifyCode : mfa.confirmInitMFA;

                        final confirmed = await func(user, totpController.text);

                        print('confirmed: $confirmed');

                        if (confirmed) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('code is correct'),
                              ),
                            );
                          }
                          if (!isVerify) {
                            setState(() {
                              isVerify = true;
                            });
                          }
                        } else {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('code is incorrect'),
                              ),
                            );
                          }
                        }
                      } on SocketException {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Error: No internet connection'),
                            ),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Error: $e'),
                            ),
                          );
                        }
                      }
                    }
                  },
                  child: const Text('Submit'),
                ),
                const SizedBox(height: 20),
                Visibility(
                  visible: mfaSetup != null,
                  child: mfaSetup == null
                      ? const SizedBox()
                      : MFASetup(
                          mfaSetup: mfaSetup!,
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
