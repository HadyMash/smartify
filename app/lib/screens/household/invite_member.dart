import 'package:flutter/material.dart';
import '/widgets/back_button.dart';
import 'package:smartify/services/household.dart'; // Import HouseholdService

class InviteMemberScreen extends StatefulWidget {
  final String householdId; // Required to pass household ID

  const InviteMemberScreen({
    super.key,
    required this.householdId,
  });

  @override
  State<InviteMemberScreen> createState() => _InviteMemberScreenState();
}

class _InviteMemberScreenState extends State<InviteMemberScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  String _role = 'dweller'; // Default role
  bool _appliances = false; // Default permissions (all unselected for dweller)
  bool _health = false;
  bool _security = false;
  bool _energy = false;
  bool _isLoading = false;
  late HouseholdService _householdService;

  @override
  void initState() {
    super.initState();
    _initializeService();
  }

  Future<void> _initializeService() async {
    _householdService = await HouseholdService.create();
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  bool _isRoleLocked() {
    // Permissions are locked (all enabled) for owner and admin
    return _role == 'owner' || _role == 'admin';
  }

  Future<void> _inviteMember() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        final invite = await _householdService.inviteMember(
          widget.householdId,
          _role,
          HouseholdPermissions(
            appliances: _appliances,
            health: _health,
            security: _security,
            energy: _energy,
          ),
          _emailController.text,
        );

        setState(() => _isLoading = false);

        if (invite != null) {
          Navigator.pop(context); // Pop back to HouseholdScreen
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Member invited successfully!')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to invite member')),
          );
        }
      } catch (e) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const CustomBackButton(),
                    const SizedBox(width: 16),
                    Text(
                      'Invite Member',
                      style: textTheme.displayMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                Center(
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.person_outline,
                      size: 50,
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                // Role Dropdown
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    border: Border.all(color: theme.colorScheme.secondary),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButton<String>(
                    value: _role,
                    isExpanded: true,
                    icon: const Icon(Icons.arrow_drop_down),
                    elevation: 16,
                    style: textTheme.bodyLarge,
                    underline: Container(height: 0),
                    onChanged: (String? value) {
                      if (value != null) {
                        setState(() {
                          _role = value;
                          if (_isRoleLocked()) {
                            // Lock permissions to true for admin
                            _appliances = true;
                            _health = true;
                            _security = true;
                            _energy = true;
                          } else {
                            // Set all to false for dweller
                            _appliances = false;
                            _health = false;
                            _security = false;
                            _energy = false;
                          }
                        });
                      }
                    },
                    items: ['admin', 'dweller'] // Removed 'owner' from the list
                        .map<DropdownMenuItem<String>>((String role) {
                      return DropdownMenuItem<String>(
                        value: role,
                        child: Text(role.capitalize()),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 16),
                // Email Field
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter an email';
                    }
                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                // Permissions Checkboxes with black border and black checkmark
                _buildCheckboxTile(
                  title: 'Appliances',
                  value: _appliances,
                  onChanged: _isRoleLocked()
                      ? null
                      : (value) => setState(() => _appliances = value ?? false),
                  enabled: !_isRoleLocked(),
                  theme: theme,
                ),
                _buildCheckboxTile(
                  title: 'Health',
                  value: _health,
                  onChanged: _isRoleLocked()
                      ? null
                      : (value) => setState(() => _health = value ?? false),
                  enabled: !_isRoleLocked(),
                  theme: theme,
                ),
                _buildCheckboxTile(
                  title: 'Security',
                  value: _security,
                  onChanged: _isRoleLocked()
                      ? null
                      : (value) => setState(() => _security = value ?? false),
                  enabled: !_isRoleLocked(),
                  theme: theme,
                ),
                _buildCheckboxTile(
                  title: 'Energy',
                  value: _energy,
                  onChanged: _isRoleLocked()
                      ? null
                      : (value) => setState(() => _energy = value ?? false),
                  enabled: !_isRoleLocked(),
                  theme: theme,
                ),
                const SizedBox(height: 32),
                // Confirm Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _inviteMember,
                    child: _isLoading
                        ? const CircularProgressIndicator()
                        : Text(
                            'Confirm',
                            style: textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.onSecondary,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Custom CheckboxTile with black border and black checkmark
  Widget _buildCheckboxTile({
    required String title,
    required bool value,
    required ValueChanged<bool?>? onChanged,
    required bool enabled,
    required ThemeData theme,
  }) {
    return ListTile(
      title: Text(title),
      leading: Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(
          border: Border.all(
            color: enabled
                ? Colors.black
                : Colors.grey, // Black for enabled, gray for disabled
            width: 2,
          ),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Checkbox(
          value: value,
          onChanged: onChanged,
          checkColor: Colors.black, // Black checkmark for all states
          fillColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return Colors.grey
                  .withOpacity(0.5); // Gray fill for disabled state
            }
            return Colors.transparent; // Transparent fill for other states
          }),
          side: WidgetStateBorderSide.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return const BorderSide(
                  color: Colors.grey,
                  width: 2); // Gray border for disabled state
            }
            return const BorderSide(
                color: Colors.black,
                width: 2); // Black border for enabled state
          }),
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          visualDensity: VisualDensity.compact,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 0),
    );
  }
}

// Extension to capitalize the first letter of role strings
extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1).toLowerCase()}";
  }
}
