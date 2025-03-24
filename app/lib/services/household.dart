import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class HouseholdService {
  static final String apiBaseUrl =
      dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';

  static Dio dio = Dio(BaseOptions(
    baseUrl: apiBaseUrl,
    connectTimeout: 5000,
    receiveTimeout: 3000,
    headers: {
      "Content-Type": "application/json",
    },
  ));

  // Create a new household
  static Future<Map<String, dynamic>> createHousehold(String name) async {
    const url = '/households/new';
    print('Sending request to: ${dio.options.baseUrl}$url');

    try {
      final response = await dio.post(url, data: {"name": name});
      print('Response: ${response.data}'); // Debugging
      return response.data;
    } catch (e) {
      print('Error: $e'); // Debugging
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Get household details
  static Future<Map<String, dynamic>> getHousehold(String householdId) async {
    final url = '/households/$householdId';

    try {
      final response = await dio.get(url);
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Invite a member to a household
  static Future<Map<String, dynamic>> inviteMember(
      String householdId, String email) async {
    final url = '/households/$householdId/invite';

    try {
      final response = await dio.post(url, data: {"email": email});
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Remove a member from a household
  static Future<Map<String, dynamic>> removeMember(
      String householdId, String memberId) async {
    final url = '/households/$householdId/remove-member';

    try {
      final response = await dio.post(url, data: {"memberId": memberId});
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Delete a household
  static Future<Map<String, dynamic>> deleteHousehold(
      String householdId) async {
    final url = '/households/$householdId';

    try {
      final response = await dio.delete(url);
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Update rooms in a household
  static Future<Map<String, dynamic>> updateRooms(
      String householdId, List<Map<String, dynamic>> rooms) async {
    final url = '/households/$householdId/rooms';

    try {
      final response = await dio.put(url, data: {"rooms": rooms});
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Get household info
  static Future<Map<String, dynamic>> getHouseholdInfo(
      String householdId) async {
    final url = '/households/$householdId/info';

    try {
      final response = await dio.get(url);
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Change user permissions
  static Future<Map<String, dynamic>> changeUserPermissions(
      String householdId, String userId, String newRole) async {
    final url = '/households/$householdId/change-permissions';

    try {
      final response =
          await dio.patch(url, data: {"userId": userId, "role": newRole});
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Respond to household invite
  static Future<Map<String, dynamic>> respondToInvite(
      String inviteId, bool accept) async {
    const url = '/households/invite/respond';

    try {
      final response =
          await dio.post(url, data: {"inviteId": inviteId, "accept": accept});
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Get user's household invites
  static Future<Map<String, dynamic>> getUserInvites() async {
    const url = '/households/invites';

    try {
      final response = await dio.get(url);
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Get all households of a user
  static Future<Map<String, dynamic>> getUserHouseholds() async {
    const url = '/households/households';

    try {
      final response = await dio.get(url);
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }

  // Leave a household
  static Future<Map<String, dynamic>> leaveHousehold(String householdId) async {
    final url = '/households/$householdId/leave';

    try {
      final response = await dio.post(url);
      return response.data;
    } catch (e) {
      return {"success": false, "message": "Error: $e"};
    }
  }
}
