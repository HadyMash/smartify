import 'package:flutter/material.dart';
import 'package:smartify/dashboard_screen.dart';
import 'package:smartify/widgets/back_button.dart';
import 'package:smartify/services/auth.dart'; // Assuming you are using this service
import 'package:smartify/services/household.dart'; // Import HouseholdService
// Import DashboardScreen

class HouseholdInvitesScreen extends StatefulWidget {
  final AuthService authService; // Add AuthService parameter

  const HouseholdInvitesScreen({
    super.key,
    required this.authService, // Pass AuthService to constructor
  });

  @override
  _HouseholdInvitesScreenState createState() => _HouseholdInvitesScreenState();
}

class _HouseholdInvitesScreenState extends State<HouseholdInvitesScreen> {
  bool _hasInvites = false;
  List<Map<String, dynamic>> _invites = []; // To store invite data

  @override
  void initState() {
    super.initState();
    _fetchUserInvites();
  }

  // Fetch invites when the screen is initialized
  Future<void> _fetchUserInvites() async {
    final result = await HouseholdService.getUserInvites();
    if (result['success']) {
      setState(() {
        _invites = List<Map<String, dynamic>>.from(result['invites']);
        _hasInvites = _invites.isNotEmpty;
      });
    } else {
      setState(() {
        _hasInvites = false;
      });
      _showError(result['message']);
    }
  }

  Future<void> _respondToInvite(String inviteId, bool accept) async {
    final result = await HouseholdService.respondToInvite(inviteId, accept);
    if (result['success']) {
      if (accept) {
        // Fetch updated household data after joining
        final householdData = result[
            'household']; // Ensure the backend response includes household data

        if (householdData != null) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => DashboardScreen(
                authService: widget.authService,
              ),
            ),
          );
        } else {
          _showError("Failed to fetch household data.");
        }
      } else {
        _fetchUserInvites(); // Refresh invites list if declined
      }
    } else {
      _showError(result['message']);
    }
  }

  // Show error messages
  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 16),
                  Text(
                    'Household',
                    style: textTheme.displayMedium,
                  ),
                ],
              ),
              const SizedBox(height: 48),

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
                    Icons.home_outlined,
                    size: 40,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Description Text
              Center(
                child: Text(
                  'You can join existing households with an invite.',
                  textAlign: TextAlign.center,
                  style: textTheme.bodyLarge,
                ),
              ),
              const SizedBox(height: 24),

              // Invites Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Icon(
                      Icons.mail_outline,
                      size: 20,
                      color: theme.colorScheme.onSurface,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Invites (${_hasInvites ? _invites.length : "0"})',
                      style: textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              if (_hasInvites)
                // Invite Cards
                ..._invites.map((invite) {
                  return Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Icon(
                            Icons.person_outline,
                            size: 24,
                            color: theme.colorScheme.onSurface,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  invite['senderName'] ?? 'Unknown',
                                  style: textTheme.bodyLarge?.copyWith(
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  invite['householdName'] ??
                                      'Unnamed Household',
                                  style: textTheme.bodyMedium?.copyWith(
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.6),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: 36,
                            child: ElevatedButton(
                              onPressed: () {
                                _respondToInvite(
                                    invite['inviteId'], true); // Accept invite
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: theme.colorScheme.secondary,
                                foregroundColor: theme.colorScheme.onSecondary,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              child: const Text('Accept'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                })
              else
                // No Invites Message
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text(
                      'No invites here. You need an invite from a household owner to join.',
                      textAlign: TextAlign.center,
                      style: textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
