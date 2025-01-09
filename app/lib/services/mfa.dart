import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

// ! temp
// TODO: replace with actual user
class User {
  final String id;
  final String email;

  User(this.id, this.email);

  // from json
  User.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        email = json['email'];

  // convert to json
  Map<String, String> toJson() {
    return <String, String>{
      'id': id,
      'email': email,
    };
  }
}

// ! temp class
// TODO: replace with actual data class
class MFAFormattedKey {
  final String _formattedKey;
  final String _qrCodeUri;
  MFAFormattedKey(this._formattedKey, this._qrCodeUri);

  // from json
  MFAFormattedKey.fromJson(Map<String, dynamic> json)
      : _formattedKey = json['formattedKey'],
        _qrCodeUri = json['uri'];

  String get formattedKey => _formattedKey;
  String get qrCodeUri => _qrCodeUri;
}

// TODO: remove user args and get auth from auth service
class MFAService {
  final String _apiUrl;
  final _contentTypeHeader = <String, String>{
    'Content-Type': 'application/json; charset=UTF-8',
  };

  MFAService() : _apiUrl = dotenv.get('API_URL');

  /// Initialize MFA for the [user].
  Future<MFAFormattedKey?> initMFA(User user) async {
    final response = await http.post(
      Uri.parse('$_apiUrl/auth/mfa/init'),
      headers: <String, String>{
        ..._contentTypeHeader,
      },
      body: jsonEncode(
        <String, dynamic>{
          'user': user.toJson(),
        },
      ),
    );

    // TODO: proper error handling

    if (response.statusCode >= 400 && response.statusCode < 500) {
      throw Exception('Failed to initialize MFA');
    }

    if (response.statusCode >= 500) {
      throw Exception('Server error');
    }

    try {
      var body = jsonDecode(response.body);
      print(body);

      if (body['error'] != null) {
        print('throwing becuase there is an error');
        throw Exception(body['error']);
      }

      if (body['formattedKey'] == null) {
        print('throwing becuase there is no formattedKey');
        throw Exception('Failed to initialize MFA');
      }
      if (body['uri'] == null) {
        print('throwing becaause there is no uri');
        throw Exception('Failed to initialize MFA');
      }

      print('returning formatted keyh from json');
      return MFAFormattedKey.fromJson(body);
    } on FormatException {
      throw Exception('Failed to decode response body');
    }
  }

  Future<bool> confirmInitMFA(User user, String code) async {
    final response = await http.post(
      Uri.parse('$_apiUrl/auth/mfa/confirm-init'),
      headers: <String, String>{
        ..._contentTypeHeader,
      },
      body: jsonEncode(
        <String, dynamic>{
          'user': user.toJson(),
          'token': code,
        },
      ),
    );
    // TODO: proper error handling

    // don't include 400 because we don't want to throw if it's 400 (just means the code is incorrect)
    // TODO: better error communication (invalid code format etc)
    if (response.statusCode > 400 && response.statusCode < 500) {
      throw Exception('Failed to initialize MFA');
    }

    if (response.statusCode >= 500) {
      throw Exception('Server error');
    }

    return response.statusCode == 200;
  }

  Future<bool> verifyCode(User user, String code) async {
    final response = await http.post(
      Uri.parse('$_apiUrl/auth/mfa/verify'),
      headers: <String, String>{
        ..._contentTypeHeader,
      },
      body: jsonEncode(
        <String, dynamic>{
          'user': user.toJson(),
          'token': code,
        },
      ),
    );

    // TODO: proper error handling

    // TODO: better error communication (invalid code format, mfa not setup, etc)

    // don't include 400 because we don't want to throw if it's 400 (just means the code is incorrect)
    if (response.statusCode > 400 && response.statusCode < 500) {
      throw Exception('Failed to initialize MFA');
    }

    if (response.statusCode >= 500) {
      throw Exception('Server error');
    }

    return response.statusCode == 200;
  }
}
