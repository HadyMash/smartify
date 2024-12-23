# Smartify

To run the app, you will need to have Flutter installed. You also need an Android or iOS device or an emulator to run the app.

## Getting Started

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

# Conventions

All code should be in the `lib` directory. `main.dart` is the entry point. **ALL** code you write should be documented using doc comments (`///`). You should also comment your code as needed. Don't write unnecessary comments, and don't write comments that just repeat the code. Your comments should explain the logic behind the code or why you wrote something or do something, so it's easy to follow and understand you're reasoning.

**IMPORTANT:** You should not hard code or commit any sensitive information, such as API keys, passwords, etc. You should use environment variables for these. You should also not commit any `.env` files or any other sensitive information.

Any pages/screens should be under the `lib/screens` directory. You should also group similar pages together, for example, `lib/screens/auth` for all authentication screens and `lib/screens/home` for all home screens. You may create subdirectories as needed.

All common widgets should be under the `lib/widgets` directory. You should group similar widgets together, for example, `lib/widgets/buttons` for all buttons and `lib/widgets/cards` for all cards. You may create subdirectories as needed.

All services should be under the `lib/services` directory. You may also group them under subdirectories if needed.

All data classes should be under the `lib/data` directory. You may also group them under subdirectories if needed.

Any constants should be in the `lib/constants.dart` file.

You should also use the dart formatter to format your code. You can run `flutter format .` in the root directory to format all your code, or use the format option in your IDE.
