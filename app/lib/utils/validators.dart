import 'package:email_validator/email_validator.dart';

String? validateEmail(String? email) {
  //return email != null && EmailValidator.validate(email);
  if (email == null) {
    return 'Email is required';
  }
  if (!EmailValidator.validate(email)) {
    return 'Enter a valid email address';
  }
  return null;
}

String? validatePassword(String? password) {
  if (password == null) {
    return 'Password is required';
  }
  // check password longer than 8 characters
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  // check password has lowercase characters
  if (!password.contains(RegExp(r'[a-z]'))) {
    return 'Password must contain lowercase characters';
  }
  // check password has uppercase characters
  if (!password.contains(RegExp(r'[A-Z]'))) {
    return 'Password must contain uppercase characters';
  }
  // check password has number characters
  if (!password.contains(RegExp(r'[0-9]'))) {
    return 'Password must contain number characters';
  }
  // check password has special characters
  // if (!password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
  //   return 'Password must contain special characters';
  // }
  return null;
}
