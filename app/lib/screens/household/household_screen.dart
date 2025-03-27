import 'package:flutter/material.dart';
import 'package:smartify/screens/household/configure_room.dart';
import 'invite_member.dart';
import 'edit_member.dart';
import 'package:smartify/widgets/house_icon.dart';
import 'package:smartify/services/household.dart'; // Import HouseholdService

class Member {
  final String name;
  Member(this.name);
}


class HouseholdScreen extends StatefulWidget {
  const HouseholdScreen({super.key});

  @override
  State<HouseholdScreen> createState() => _HouseholdScreenState();
}

class _HouseholdScreenState extends State<HouseholdScreen> {
  String? _selectedHouseholdId; // Store the selected household ID
  late HouseholdService _householdService;
  List<HouseholdInfo> _households = [];
  List<Member> _members = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeServiceAndData();
  }

  Future<void> _initializeServiceAndData() async {
    setState(() => _isLoading = true);
    _householdService = await HouseholdService.create();
    await _fetchHouseholds();
    if (_households.isNotEmpty) {
      _selectedHouseholdId = _households.first.id;
      await _fetchHouseholdDetails(_selectedHouseholdId!);
    }
    setState(() => _isLoading = false);
  }

  Future<void> _fetchHouseholds() async {
    final households = await _householdService.getUserHouseholds();
    setState(() {
      _households = households.cast<HouseholdInfo>();
    });
  }

  Future<void> _fetchHouseholdDetails(String householdId) async {
    final household = await _householdService.getHousehold(householdId);
    if (household != null) {
      setState(() {
        _members = [
          ...household.members.map((m) => Member(m.name)),
          ...household.invites.map((i) => Member(i.name)),
        ];
      });
    }
  }

  // void _addNewMember(String name) {
  //   setState(() {
  //     _members.add(Member(name, true));
  //   });
  // }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // final selectedHousehold = _households.firstWhere(
    //   (h) => h.id == _selectedHouseholdId,
    //   orElse: () => _households.isNotEmpty
    //       ? _households.first
    //       : const HouseholdInfo(
    //           id: '',
    //           name: 'No Household',
    //           ownerId: '',
    //           floors: 0,
    //           membersCount: 0),
    // );

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Household Icon
              const Center(
                child: HouseIcon(),
              ),
              const SizedBox(height: 16),

              // Centered Dropdown
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colorScheme.secondary),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: DropdownButton<String>(
                  value: _selectedHouseholdId,
                  icon: const Icon(Icons.arrow_drop_down),
                  elevation: 16,
                  style: textTheme.bodyLarge,
                  underline: Container(height: 0),
                  onChanged: (String? value) async {
                    if (value != null) {
                      setState(() {
                        _selectedHouseholdId = value;
                      });
                      await _fetchHouseholdDetails(value);
                    }
                  },
                  items: _households
                      .map<DropdownMenuItem<String>>((HouseholdInfo household) {
                    return DropdownMenuItem<String>(
                      value: household.id,
                      child: Text(household.name),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 32),

              // Members List or No Members Message
              Expanded(
                child: _members.isEmpty
                    ? Center(
                        child: Container(
                          padding: const EdgeInsets.all(16.0),
                          decoration: BoxDecoration(
                            color: Colors.grey[200], // Light grey background
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: Colors.grey[400]!), // Grey border
                          ),
                          child: Text(
                            "No existing members.\nAdd members to see them displayed here.",
                            textAlign: TextAlign.center,
                            style: textTheme.bodyLarge?.copyWith(
                              color: Colors.grey[600], // Darker grey text
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      )
                    : ListView.builder(
                        itemCount: _members.length,
                        itemBuilder: (context, index) {
                          final member = _members[index];
                          return _buildMemberTile(member, context);
                        },
                      ),
              ),

              const SizedBox(height: 16),

              // Bottom Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => InviteMemberScreen(
                              householdId: _selectedHouseholdId!,
                              // onMemberInvited: _addNewMember,
                            ),
                          ),
                        );
                      },
                      child: Text(
                        'Invite Member',
                        style: textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSecondary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        final household = await _householdService
                            .getHousehold(_selectedHouseholdId!);
                        if (household != null) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ConfigureRoomScreen(
                                floorCount: household.floors,
                                finalOffset: household.floorsOffset,
                                isEditing: true,
                                householdName: household.name,
                                rooms: household.rooms,
                                householdId:
                                    household.id, // Pass the household ID
                              ),
                            ),
                          );
                        }
                      },
                      child: Text(
                        'View Rooms',
                        style: textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSecondary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMemberTile(Member member, BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Card(
      child: ListTile(
        leading: const Icon(
          Icons.person,
          color: Colors.black,
          size: 30,
        ),
        title: Text(
          member.name,
          style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        // subtitle: member.isInvited
        //     ? Text(
        //         'Invited',
        //         style: textTheme.bodySmall?.copyWith(
        //           color: Colors.green,
        //           fontWeight: FontWeight.w500,
        //         ),
        //       )
        //     : null,
        trailing: IconButton(
          icon: const Icon(Icons.edit),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const EditMemberScreen()),
            );
          },
        ),
      ),
    );
  }
}
