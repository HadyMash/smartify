import 'package:flutter/material.dart';
import 'package:smartify/screens/household/delete_confirm.dart';
import '/widgets/back_button.dart';

class DeleteHouseholdScreen extends StatefulWidget {
  const DeleteHouseholdScreen({super.key});

  @override
  State<DeleteHouseholdScreen> createState() => _DeleteHouseholdScreenState();
}

class _DeleteHouseholdScreenState extends State<DeleteHouseholdScreen> {
  bool _isConfirmed = false;

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
              Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 16),
                  Text(
                    'Delete Household',
                    style: textTheme.displayMedium,
                  ),
                ],
              ),
              const Spacer(),
              Icon(
                Icons.warning_rounded,
                size: 64,
                color: Colors.red[700],
              ),
              const SizedBox(height: 24),
              Text(
                'Delete Household',
                style: textTheme.displayMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Any added rooms, household members, their roles and permissions and household details will be deleted once you delete the household.',
                style: textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Note: Household deletion is permanent and cannot be undone.',
                style: textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Checkbox(
                    value: _isConfirmed,
                    onChanged: (bool? value) {
                      setState(() {
                        _isConfirmed = value ?? false;
                      });
                    },
                    activeColor: theme.colorScheme.secondary,
                  ),
                  Expanded(
                    child: Text(
                      'I understand the consequences of deleting my Household.',
                      style: textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isConfirmed
                          ? () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      const DeleteHouseholdConfirmScreen(),
                                ),
                              );
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red[700],
                        disabledBackgroundColor: Colors.red[200],
                      ),
                      child: Text(
                        'DELETE THE HOUSEHOLD',
                        style: textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey[300],
                      ),
                      child: Text(
                        'CANCEL',
                        style: textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
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
}
