import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smartify/dashboard_screen.dart';
import 'package:smartify/widgets/back_button.dart';
import 'package:smartify/services/auth.dart';
import 'package:smartify/services/household.dart';

class HouseholdInvitesScreen extends StatefulWidget {
  const HouseholdInvitesScreen({super.key, required AuthService authService});

  @override
  _HouseholdInvitesScreenState createState() => _HouseholdInvitesScreenState();
}

class _HouseholdInvitesScreenState extends State<HouseholdInvitesScreen> {
  bool _isLoading = true;
  bool _hasInvites = false;
  List<Map<String, dynamic>> _invites = [];

  @override
  void initState() {
    super.initState();
    _loadInvites();
  }

  Future<void> _loadInvites() async {
    try {
      final householdService =
          Provider.of<HouseholdService>(context, listen: false);
      final invites = await householdService.getUserInvites();

      setState(() {
        _invites = invites
            .map((invite) => {
                  'inviteId': invite.inviteId,
                  'householdName': invite.householdName,
                  'senderName': invite.senderName,
                })
            .toList();
        _hasInvites = _invites.isNotEmpty;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load invites: ${e.toString()}')),
      );
    }
  }

  Future<void> _respondToInvite(String inviteId, bool accept) async {
    try {
      final householdService =
          Provider.of<HouseholdService>(context, listen: false);
      final authService = Provider.of<AuthService>(context);
      final household = await householdService.respondToInvite(
        inviteId: inviteId,
        response: accept,
      );

      if (accept) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
              builder: (context) => DashboardScreen(authService: authService)),
        );
      } else if (accept) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully joined household')),
        );
        _loadInvites(); // Refresh the invites list
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invite declined')),
        );
        _loadInvites(); // Refresh the invites list
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to respond: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final authService = Provider.of<AuthService>(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 16),
                  Text(
                    'Household Invites',
                    style: textTheme.displayMedium,
                  ),
                ],
              ),
              const SizedBox(height: 48),
              if (_isLoading)
                const Center(child: CircularProgressIndicator())
              else ...[
                // House Icon
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Icon(
                      Icons.mail_outline,
                      size: 40,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Description Text
                Center(
                  child: Text(
                    _hasInvites
                        ? 'You have ${_invites.length} pending invite(s)'
                        : 'No pending invites found',
                    textAlign: TextAlign.center,
                    style: textTheme.bodyLarge,
                  ),
                ),
                const SizedBox(height: 24),

                if (_hasInvites)
                  Expanded(
                    child: ListView.builder(
                      itemCount: _invites.length,
                      itemBuilder: (context, index) {
                        final invite = _invites[index];
                        return Card(
                          elevation: 2,
                          margin: const EdgeInsets.only(bottom: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.home_work_outlined,
                                      size: 24,
                                      color: theme.colorScheme.onSurface,
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Text(
                                        invite['householdName'],
                                        style: textTheme.bodyLarge?.copyWith(
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'From: ${invite['senderName']}',
                                  style: textTheme.bodyMedium?.copyWith(
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.6),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    TextButton(
                                      onPressed: () => _respondToInvite(
                                          invite['inviteId'], false),
                                      style: TextButton.styleFrom(
                                        foregroundColor: Colors.red,
                                      ),
                                      child: const Text('Decline'),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton(
                                      onPressed: () => _respondToInvite(
                                          invite['inviteId'], true),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor:
                                            theme.colorScheme.secondary,
                                        foregroundColor:
                                            theme.colorScheme.onSecondary,
                                      ),
                                      child: const Text('Accept'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
