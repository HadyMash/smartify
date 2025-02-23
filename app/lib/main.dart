import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

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
