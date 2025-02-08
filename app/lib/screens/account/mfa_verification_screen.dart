import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'mfa_setup_complete_screen.dart'; // Ensure this import is correct

class MFAVerificationScreen extends StatefulWidget {
  const MFAVerificationScreen({Key? key}) : super(key: key);

  @override
  _MFAVerificationScreenState createState() => _MFAVerificationScreenState();
}

class _MFAVerificationScreenState extends State<MFAVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (index) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(
    6,
    (index) => FocusNode(),
  );
  bool _isError = false;

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _verifyCode() {
    String code = _controllers.map((controller) => controller.text).join();
    if (code.length != 6) {
      setState(() => _isError = true);
    } else {
      // Add your verification logic here
      // For demo purposes, we'll assume the code is correct and navigate to the confirmation screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const MFASetupCompleteScreen(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Back Button
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Title and Description
              const Text(
                'Verify your MFA Setup',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Enter the 6-digit code generated in your authenticator app to complete the setup',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),

              // Code Input Fields
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(
                  6,
                  (index) => SizedBox(
                    width: 40,
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      decoration: InputDecoration(
                        counterText: '',
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: _isError ? Colors.red : Colors.grey,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: _isError ? Colors.red : Colors.black,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onChanged: (value) {
                        if (value.isNotEmpty && index < 5) {
                          _focusNodes[index + 1].requestFocus();
                        }
                      },
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    ),
                  ),
                ),
              ),

              // Verify Button
              const Spacer(),
              ElevatedButton(
                onPressed: _verifyCode,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Verify',
                  style: TextStyle(color: Colors.white),
                ),
              ),

              // Error Message
              if (_isError)
                const Padding(
                  padding: EdgeInsets.only(top: 16),
                  child: Text(
                    'The code you entered is incorrect. Please try again.',
                    style: TextStyle(
                      color: Colors.red,
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}