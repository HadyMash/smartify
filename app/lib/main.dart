// ignore_for_file: unused_local_variable, prefer_const_declarations, avoid_print, constant_identifier_names, non_constant_identifier_names

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:smartify/screens/auth/sign_in.dart';

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
    ////const email = 'hady@gmail.com';
    ////const password = 'password';
    ////////final salt = SRP.generateSalt();
    ////const salt = 'e6eb7979923ebb117785a56ab84f94ff';
    ////final verifier = SRP.deriveVerifier(email, password, salt);
    ////
    ////const BString =
    ////    '0x586d9483b54b8c09f987ee5e1c49e6053c8b5289aedf25176ff84280bd5faa8d6a357f1757165d8292926268fde0d4e0774db44d4a2e1babf96197df397a655377bd870f5dbede11cb00b16bb33350c58b6d10300cb4ffc8d83f7a3637616bbcf1f0d66a04b16674be9b6a7df64c8337fc4c07a6315934292d5e453db68dfe751b1c902fb5190aff696af17023a1b7159cc04c8ae5d28bdfd5b9a682e4762b15c28ac795416dc33254393a41584b34d8c8717cc2398621630375dc1e43e34c0a1c63f23efc57a07a363df4663693a0e2eae5c047f8fb2d1cdfe61fef47ccfc72ab96013272bc2a8aff184e94a77e95b393eccb37aa89dfdc24d3412a9a473643';
    ////final B = BigInt.parse(BString);
    ////
    ////const aString =
    ////    '0xf1397a8f372866bf49ddf9a661e27e9612f88866ed7be78e741b90abcbb6ee77';
    ////final a = BigInt.parse(aString);
    ////
    ////final result = SRP.respondToAuthChallenge(email, password, salt, a, B);
    ////
    ////print('A: 0x${result.A.toRadixString(16)}');
    ////print('Mc: 0x${result.M.toRadixString(16)}');
    //
    //// api test
    //const email = 'hady@gmail.com';
    //const password = 'password';
    ////const salt = 'e6eb7979923ebb117785a56ab84f94ff';
    ////final salt = SRP.generateSalt();
    ////print(salt);
    //const salt = 'e231b0fd7f9106a2ca2cc2fc81167495';
    //final verifier = SRP.deriveVerifier(email, password, salt);
    ////print('verifier: 0x${verifier.toRadixString(16)}');
    //final BString =
    //    '0x982d84e26544a62e722528d94c60dac8082dfd38b33a9558ebd9db190cd5a4fcefa13b466447b03da5ee7e72328d46e2b3d3f523b6dd1d8b3a0bceb628b093b84ba34be6577d075f819cc10a6b5beb17d2b9778b026bed4260c3ddf3ad15c132479828691c7db816de2cdf067df0b78733553c88fa7bcc5d7149bf426a943b28dfe68bd17dab93b19fa4ee57c5113e410e34b302d4ecb72dc8fcf6b00bbb6150d7504f2123868e95e06761ac6d21c3aaa6f1f3b7a35bba1828af129247f5f615eb27e88a3c5de1dc0a3c81b70d2f56f7022266d7024955b945326e5c7ed9921cb3463e5d6d9c723784c53dedce35c9d3875dc29f00fe695d41bc5e5cdde35d04';
    //
    ////const BString =
    ////    '0x4301fd8a79bda87196fd2aa6a47d06642d6eaceb572aba4d5b48e6036cb87448cc6e6d2c2bd232308dd48f69fb9aa3526fc1bccd00c32b9fa023151e95147b8290792bd2d4927e547f10237b829c03cb783c033a9fe3bb89c869cc0b6b772f0f778785b0de5f7e2f20ca78bbca62e26dbd731df08f1bd1d5703ea865e0d86ef5925413536d1ff28200b129cc39084ecc465280dec04aa11253650809150ef8a542cab6a0e2dabd8333f84748b6f3d5f85d552eeba800fe24637df378925312d8ea9f4cceee4dfce82f623cdf59a6683eb8b8d244a994a20c52bb88b17f5996355434269975fd46cc77fdcf385d414e2fbcef730f9291c6d750eeee947ea3467a';
    //final B = BigInt.parse(BString);
    ////final a = SRP.generatePrivateKey();
    //final a = BigInt.parse(
    //    '0x31fbe9b30e7a5037f37137483b0909e0dce1c4ac4de47a269879e4481044d282');
    //final A = SRP.derivePublicKey(a);
    //
    ////final a = BigInt.parse(
    ////    '0xf1397a8f372866bf49ddf9a661e27e9612f88866ed7be78e741b90abcbb6ee77');
    ////
    //final result = SRP.respondToAuthChallenge(email, password, salt, a, B);
    //
    //print('A: 0x${result.A.toRadixString(16)}');
    //print('Mc: 0x${result.M.toRadixString(16)}');

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
      home: const SignInScreen(),
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
