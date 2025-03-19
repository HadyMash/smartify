import 'package:flutter/material.dart';
import 'package:smartify/services/auth.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  // TEMP
  final TextEditingController _mfaController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign In'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(hintText: 'Email'),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(hintText: 'Password'),
                ),
                // TEMP
                const SizedBox(height: 16),
                TextFormField(
                  controller: _mfaController,
                  decoration: const InputDecoration(hintText: 'MFA Code'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    //final result = await as.register(
                    //    _emailController.text, _passwordController.text);
                    final result =
                        await as.register('hady@gmail.com', 'Passowrd1!');
                    debugPrint('result: $result');
                  },
                  child: const Text('Register'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    //await as.signIn(
                    //    _emailController.text, _passwordController.text);
                    final result =
                        await as.signIn('hady@gmail.com', 'Passowrd1!');
                    print('sign in result: $result');
                  },
                  child: const Text('Sign In'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    print(
                        'verify mfa result: ${await as.verifyMFA(_mfaController.text)}');
                  },
                  child: const Text('verify mfa'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    print(
                        'verify mfa result: ${await as.confirmMFASetup(_mfaController.text)}');
                  },
                  child: const Text('confirm mfa'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    await as.signOut();
                  },
                  child: const Text('sign out'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final as = await AuthService.create();
                    print(await as.getCookies());
                  },
                  child: const Text('print cookies'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
