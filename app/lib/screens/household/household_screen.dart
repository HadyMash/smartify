import 'package:flutter/material.dart';
import 'invite_member.dart';
import 'edit_member.dart';
import 'room_screen.dart';
import 'package:smartify/widgets/house_icon.dart';

class Member {
  final String name;
  final bool isInvited;

  Member(this.name, this.isInvited);
}

class HouseholdScreen extends StatefulWidget {
  const HouseholdScreen({super.key});

  @override
  State<HouseholdScreen> createState() => _HouseholdScreenState();
}

class _HouseholdScreenState extends State<HouseholdScreen> {
  String _selectedHousehold = 'Wayne Manor';
  final List<String> _households = ['Wayne Manor', 'Batcave', 'Penthouse'];

  final List<Member> _members = [
    Member('Batman', false),
    Member('Alfred', false),
    Member('Robin', false),
    Member('Alex', true), // Example of an invited member
  ];

  void _addNewMember(String name) {
    setState(() {
      _members.add(Member(name, true));
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

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
                  value: _selectedHousehold,
                  icon: const Icon(Icons.arrow_drop_down),
                  elevation: 16,
                  style: textTheme.bodyLarge,
                  underline: Container(height: 0),
                  onChanged: (String? value) {
                    if (value != null) {
                      setState(() {
                        _selectedHousehold = value;
                      });
                    }
                  },
                  items:
                      _households.map<DropdownMenuItem<String>>((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 32),

              // Members List
              Expanded(
                child: ListView.builder(
                  itemCount: _members.length,
                  itemBuilder: (context, index) {
                    final member = _members[index];
                    return _buildMemberTile(member, context);
                  },
                ),
              ),

              // Plus Icon Button
              Align(
                alignment: Alignment.center,
                child: IconButton(
                  icon: const Icon(
                    Icons.add,
                    color: Colors.black,
                    size: 30,
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => InviteMemberScreen(
                          onMemberInvited: _addNewMember,
                        ),
                      ),
                    );
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
                              onMemberInvited: _addNewMember,
                            ),
                          ),
                        );
                      },
                      child: Text(
                        'Add Member',
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
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => const RoomsScreen()),
                        );
                      },
                      child: Text(
                        'Rooms',
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
          Icons.person, // User icon
          color: Colors.black, // Icon color set to black
          size: 30, // Adjust icon size if needed
        ),
        title: Text(
          member.name,
          style: textTheme.bodyLarge
              ?.copyWith(fontWeight: FontWeight.bold), // Bold text
        ),
        subtitle: member.isInvited
            ? Text(
                'Invited',
                style: textTheme.bodySmall?.copyWith(
                  color: Colors.green,
                  fontWeight: FontWeight.w500,
                ),
              )
            : null,
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
