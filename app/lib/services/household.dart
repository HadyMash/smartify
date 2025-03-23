import 'package:dio/dio.dart';
import 'package:smartify/services/http/http_client.dart';

class HouseholdService {
  late final Dio _dio;
  // ignore: unused_field
  late final SmartifyHttpClient _httpClient;

  HouseholdService._(this._dio, this._httpClient);

  static Future<HouseholdService> create() async {
    final httpClient = await SmartifyHttpClient.instance;
    return HouseholdService._(httpClient.dio, httpClient);
  }
/*
export const householdSchema = householdCreateRequestDataSchema.extend({
  _id: objectIdOrStringSchema.optional(),
  owner: objectIdOrStringSchema,
  members: z.array(memberSchema),
  invites: z.array(householdInviteSchema),
  rooms: z.array(householdRoomSchema).default([defaultRoom]),
  floors: z.number().int().min(1).max(500),
  floorsOffset: z.number().int().optional(),
});
  */

  Future createHousehold(String name, int floors, List<HouseholdRoom> rooms,
      [int? floorsOffset]) async {
    try {
      final body = {
        'name': name,
        'floors': floors,
        'rooms': rooms.map((r) => r.toMap()).toList(),
        if (floorsOffset != null) 'floorsOffset': floorsOffset,
      };

      final response = await _dio.post('/households/new', data: body);

      print('Household created: ${response.data}');

      //final responseBody = response.data;

      try {} catch (e) {
        print('Error creating household: $e');
      }
    } on DioError catch (e) {
      print('Dio Error creating household: ${e.message}');
      if (e.response != null && e.response!.data != null) {
        if (e.response!.data != null) {
          print('error response data: ${e.response!.data}');
          final error = e.response!.data as Map<String, dynamic>;
          print(
              'Error creating household: ${error['error'] ?? error['error']}');
          print('Error creating household details: ${error['details']}');
        }
      }
    } catch (e) {
      print('Error creating household: $e');
    }
  }
}

/*
export const householdRoomSchema = z.object({
  id: z.string(),
  /** Room name */
  name: z
    .string()
    .min(1, { message: 'Room name cannot be empty' }) // Prevent empty strings
    .trim(),
  /** Room type */
  type: householdRoomTypeSchema,
  /** Room floor */
  floor: z.number().int(),
  /**
   * Rooms connected to this room. This is used for laying out rooms in the app
   */
  connectedRooms: z.object({
    top: z.string().optional(),
    bottom: z.string().optional(),
    left: z.string().optional(),
    right: z.string().optional(),
  }),
});
*/

class HouseholdRoom {
  final String id;
  final String name;
  final String type;
  final int floor;
  final RoomConnections connectedRooms;

  const HouseholdRoom({
    required this.id,
    required this.name,
    required this.type,
    required this.floor,
    required this.connectedRooms,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'floor': floor,
      'connectedRooms': connectedRooms.toMap(),
    };
  }
}

class RoomConnections {
  final String? top;
  final String? bottom;
  final String? left;
  final String? right;

  const RoomConnections({
    this.top,
    this.bottom,
    this.left,
    this.right,
  });

  Map<String, dynamic> toMap() {
    return {
      if (top != null) 'top': top,
      if (bottom != null) 'bottom': bottom,
      if (left != null) 'left': left,
      if (right != null) 'right': right,
    };
  }
}
