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

  Future<Household?> createHousehold(
      String name, int floors, List<HouseholdRoom> rooms,
      [int? floorsOffset]) async {
    try {
      final body = {
        'name': name,
        'floors': floors,
        'rooms': rooms.map((r) => r.toMap()).toList(),
        if (floorsOffset != null) 'floorsOffset': floorsOffset,
      };

      final response = await _dio.post('/households/new', data: body);

      final responseBody = response.data;

      try {
        final household = Household(
          id: responseBody['_id'],
          name: responseBody['name'],
          ownerId: responseBody['owner'],
          floors: responseBody['floors'],
          floorsOffset: responseBody['floorsOffset'],
          rooms: (responseBody['rooms'] as List)
              .map((r) => HouseholdRoom(
                    id: r['id'],
                    name: r['name'],
                    type: r['type'],
                    floor: r['floor'],
                    connectedRooms: RoomConnections(
                      top: r['connectedRooms']['top'],
                      bottom: r['connectedRooms']['bottom'],
                      left: r['connectedRooms']['left'],
                      right: r['connectedRooms']['right'],
                    ),
                  ))
              .toList(),
          members: (responseBody['members'] as List)
              .map((m) => HouseholdMember(
                    id: m['_id'],
                    name: m['name'],
                    role: m['role'],
                    permissions: HouseholdPermissions(
                      appliances: m['permissions']['appliances'],
                      health: m['permissions']['health'],
                      security: m['permissions']['security'],
                      energy: m['permissions']['energy'],
                    ),
                  ))
              .toList(),
          invites: (responseBody['invites'] as List)
              .map((i) => HouseholdInvite(
                    inviteId: i['_id'],
                    userId: i['userId'],
                  ))
              .toList(),
        );
        print('Household: $household');
        return household;
      } catch (e) {
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
    return null;
  }

  Future<List<HouseholdInfo>> getHouseholds() async {
    try {
      final response = await _dio.get('/households');

      return (response.data as List)
          .map((h) => HouseholdInfo(
                id: h['_id'],
                name: h['name'],
                ownerId: h['owner'],
                floors: h['floors'],
                membersCount: h['members'],
              ))
          .toList();
    } on DioError catch (e) {
      print('Dio Error getting households: ${e.message}');
      if (e.response != null && e.response!.data != null) {
        if (e.response!.data != null) {
          print('error response data: ${e.response!.data}');
          final error = e.response!.data as Map<String, dynamic>;
          print(
              'Error getting households: ${error['error'] ?? error['error']}');
          print('Error getting households details: ${error['details']}');
        }
      }
    } catch (e) {
      print('Error getting households: $e');
    }
    return [];
  }
}

class HouseholdInfo {
  final String id;
  final String name;
  final String ownerId;
  final int floors;
  final int membersCount;
  const HouseholdInfo({
    required this.id,
    required this.name,
    required this.ownerId,
    required this.floors,
    required this.membersCount,
  });

  @override
  String toString() {
    return 'HouseholdInfo{id: $id, name: $name, ownerId: $ownerId, floors: $floors, membersCount: $membersCount}';
  }
}

class Household {
  final String id;
  final String name;
  final String ownerId;
  final int floors;
  final int floorsOffset;
  final List<HouseholdRoom> rooms;
  final List<HouseholdMember> members;
  final List<HouseholdInvite> invites;

  const Household({
    required this.id,
    required this.name,
    required this.ownerId,
    required this.floors,
    required this.floorsOffset,
    required this.rooms,
    required this.members,
    required this.invites,
  });
}

class HouseholdMember {
  final String id;
  final String name;
  final String? role;
  final HouseholdPermissions? permissions;

  const HouseholdMember(
      {required this.id, required this.name, this.role, this.permissions});
}

class HouseholdPermissions {
  final bool appliances;
  final bool health;
  final bool security;
  final bool energy;

  const HouseholdPermissions(
      {required this.health,
      required this.security,
      required this.appliances,
      required this.energy});
}

class HouseholdInvite {
  final String inviteId;
  final String userId;

  const HouseholdInvite({required this.inviteId, required this.userId});
}

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
