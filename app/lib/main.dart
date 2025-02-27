// ignore_for_file: unused_local_variable, prefer_const_declarations, avoid_print

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
    const email = 'hady@gmail.com';
    const password = 'password';
    ////final salt = SRP.generateSalt();
    const salt = 'e6eb7979923ebb117785a56ab84f94ff';
    final verifier = SRP.deriveVerifier(email, password, salt);

    const BString =
        '0x586d9483b54b8c09f987ee5e1c49e6053c8b5289aedf25176ff84280bd5faa8d6a357f1757165d8292926268fde0d4e0774db44d4a2e1babf96197df397a655377bd870f5dbede11cb00b16bb33350c58b6d10300cb4ffc8d83f7a3637616bbcf1f0d66a04b16674be9b6a7df64c8337fc4c07a6315934292d5e453db68dfe751b1c902fb5190aff696af17023a1b7159cc04c8ae5d28bdfd5b9a682e4762b15c28ac795416dc33254393a41584b34d8c8717cc2398621630375dc1e43e34c0a1c63f23efc57a07a363df4663693a0e2eae5c047f8fb2d1cdfe61fef47ccfc72ab96013272bc2a8aff184e94a77e95b393eccb37aa89dfdc24d3412a9a473643';
    final B = BigInt.parse(BString);

    const aString =
        '0xf1397a8f372866bf49ddf9a661e27e9612f88866ed7be78e741b90abcbb6ee77';
    final a = BigInt.parse(aString);

    final result = SRP.respondToAuthChallenge(email, password, salt, a, B);

    final A = result['A']!;
    final M = result['M']!;
    //final K = result['K']!;

    print('A: ${A.toRadixString(16)}');
    print('M: ${M.toRadixString(16)}');

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
