import 'package:flutter/material.dart';
import 'constants.dart';
import '../responsive_helper.dart';

class AddScheduleScreen extends StatefulWidget {
  final bool editMode;
  final String? scheduleName;
  final String? startTime;
  final String? stopTime;
  final Color? scheduleColor;
  final List<String>? selectedDays;
  final List<String>? selectedDevices;
  final Map<String, Map<String, Map<String, dynamic>>>? existingSchedules;

  const AddScheduleScreen({
    Key? key,
    this.editMode = false,
    this.scheduleName,
    this.startTime,
    this.stopTime,
    this.scheduleColor,
    this.selectedDays,
    this.selectedDevices,
    this.existingSchedules,
  }) : super(key: key);

  @override
  State<AddScheduleScreen> createState() => _AddScheduleScreenState();
}

class _AddScheduleScreenState extends State<AddScheduleScreen> {
  final TextEditingController _scheduleNameController = TextEditingController();
  Set<String> selectedDays = {};
  Set<String> selectedDevices = {};

  late TimeOfDay _startTime;
  late TimeOfDay _stopTime;

  @override
  void initState() {
    super.initState();
    if (widget.editMode) {
      _scheduleNameController.text = widget.scheduleName ?? '';
      selectedDays = Set.from(widget.selectedDays ?? []);
      selectedDevices = Set.from(widget.selectedDevices ?? []);
      _startTime = widget.startTime != null
          ? AppConstants.parseTimeString(widget.startTime!)
          : AppConstants.config.defaultStartTime;
      _stopTime = widget.stopTime != null
          ? AppConstants.parseTimeString(widget.stopTime!)
          : AppConstants.config.defaultStopTime;
    } else {
      _startTime = AppConstants.config.defaultStartTime;
      _stopTime = AppConstants.config.defaultStopTime;
    }
  }

  void _deleteSchedule() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Delete Schedule'),
          content: const Text('Are you sure you want to delete this schedule?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context, 'delete');
              },
              child: const Text(
                'Delete',
                style: TextStyle(color: Colors.red),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showDeviceSelectionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Select Device'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: AppConstants.deviceIcons.entries.map((entry) {
                final device = entry.key;
                final iconData = entry.value;

                return ListTile(
                  leading: Icon(
                    iconData['icon'],
                    color: iconData['color'] ?? Color(iconData['colorValue']),
                  ),
                  title: Text(device),
                  onTap: () {
                    setState(() {
                      selectedDevices.add(device);
                    });
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  bool _validateForm() {
    if (_scheduleNameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a schedule name')),
      );
      return false;
    }

    if (selectedDays.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one day')),
      );
      return false;
    }

    if (selectedDevices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one device')),
      );
      return false;
    }

    final startMinutes = _startTime.hour * 60 + _startTime.minute;
    final stopMinutes = _stopTime.hour * 60 + _stopTime.minute;

    if (startMinutes == stopMinutes) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Start and stop times cannot be the same')),
      );
      return false;
    }

    return true;
  }

  Future<void> _selectTime(BuildContext context, bool isStartTime) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStartTime ? _startTime : _stopTime,
      builder: (BuildContext context, Widget? child) {
        return Theme(
          data: ThemeData.light().copyWith(
            primaryColor: Colors.black,
            colorScheme: const ColorScheme.light(
              primary: Colors.black,
            ),
            buttonTheme: const ButtonThemeData(
              colorScheme: ColorScheme.light(
                primary: Colors.black,
              ),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isStartTime) {
          _startTime = picked;
        } else {
          _stopTime = picked;
        }
      });
    }
  }

  Widget _buildTimePickerButton(String title, TimeOfDay time, bool isStartTime) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: ResponsiveHelper.getFontSize(context, 18),
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: AppConstants.spacing),
        GestureDetector(
          onTap: () => _selectTime(context, isStartTime),
          child: Container(
            width: double.infinity,
            padding: ResponsiveHelper.getBoxPadding(context),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(AppConstants.borderRadius),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppConstants.formatTimeOfDay(time),
                  style: TextStyle(
                    fontSize: ResponsiveHelper.getFontSize(context, 16),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Icon(Icons.access_time, color: Colors.grey[600]),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: ResponsiveHelper.getScreenPadding(context),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                    iconSize: ResponsiveHelper.isDesktop(context) ? 28 : 24,
                  ),
                  SizedBox(width: ResponsiveHelper.isDesktop(context) ? 16 : AppConstants.spacing),
                  Text(
                    widget.editMode ? 'Edit Schedule' : 'Add Schedule',
                    style: TextStyle(
                      fontSize: ResponsiveHelper.getFontSize(context, 24),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (widget.editMode) ...[
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: _deleteSchedule,
                      iconSize: ResponsiveHelper.isDesktop(context) ? 28 : 24,
                    ),
                  ],
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                child: ResponsiveHelper.isDesktop(context)
                    ? _buildDesktopLayout()
                    : _buildMobileLayout(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDesktopLayout() {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 1200),
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(32),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildNameInput(),
                        const SizedBox(height: 32),
                        _buildDaySelector(),
                        const SizedBox(height: 32),
                        _buildTimeSelectors(),
                      ],
                    ),
                  ),
                  const SizedBox(width: 48),
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildDeviceSection(),
                        const SizedBox(height: 48),
                        _buildSaveButton(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileLayout() {
    return Padding(
      padding: EdgeInsets.all(AppConstants.padding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildNameInput(),
          SizedBox(height: 24),
          _buildDaySelector(),
          SizedBox(height: 24),
          _buildTimeSelectors(),
          SizedBox(height: 24),
          _buildDeviceSection(),
          SizedBox(height: 24),
          _buildSaveButton(),
          SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildNameInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Schedule Name',
          style: TextStyle(
            fontSize: ResponsiveHelper.getFontSize(context, 18),
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: AppConstants.spacing),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppConstants.borderRadius),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: TextField(
            controller: _scheduleNameController,
            style: TextStyle(
              fontSize: ResponsiveHelper.getFontSize(context, 16),
            ),
            decoration: InputDecoration(
              hintText: 'Enter schedule name',
              hintStyle: TextStyle(color: Colors.grey[400]),
              border: InputBorder.none,
              contentPadding: ResponsiveHelper.getBoxPadding(context),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDaySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Days',
          style: TextStyle(
            fontSize: ResponsiveHelper.getFontSize(context, 18),
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: AppConstants.padding),
        Wrap(
          spacing: ResponsiveHelper.isDesktop(context) ? 16 : AppConstants.spacing,
          runSpacing: ResponsiveHelper.isDesktop(context) ? 16 : AppConstants.spacing,
          children: AppConstants.days.map((day) {
            final isSelected = selectedDays.contains(day);
            return GestureDetector(
              onTap: () {
                setState(() {
                  if (isSelected) {
                    selectedDays.remove(day);
                  } else {
                    selectedDays.add(day);
                  }
                });
              },
              child: Container(
                padding: ResponsiveHelper.getButtonPadding(context),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.black : Colors.white,
                  borderRadius: BorderRadius.circular(AppConstants.borderRadius),
                  border: Border.all(
                    color: isSelected ? Colors.black : Colors.grey[300]!,
                  ),
                ),
                child: Text(
                  day,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.black,
                    fontSize: ResponsiveHelper.getFontSize(context, 14),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTimeSelectors() {
    return Row(
      children: [
        Expanded(
          child: _buildTimePickerButton('Start Time', _startTime, true),
        ),
        SizedBox(width: ResponsiveHelper.isDesktop(context) ? 32 : 16),
        Expanded(
          child: _buildTimePickerButton('Stop Time', _stopTime, false),
        ),
      ],
    );
  }

  Widget _buildDeviceSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Selected Devices',
          style: TextStyle(
            fontSize: ResponsiveHelper.getFontSize(context, 18),
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: AppConstants.padding),
        ...selectedDevices.map((device) {
          final iconData = AppConstants.deviceIcons[device]!;
          return Container(
            margin: EdgeInsets.only(bottom: ResponsiveHelper.isDesktop(context) ? 16 : 12),
            padding: ResponsiveHelper.getBoxPadding(context),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppConstants.borderRadius),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Row(
              children: [
                Icon(
                  iconData['icon'],
                  size: ResponsiveHelper.isDesktop(context) ? 28 : 24,
                  color: iconData['color'] ?? Color(iconData['colorValue']),
                ),
                SizedBox(width: ResponsiveHelper.isDesktop(context) ? 16 : 12),
                Expanded(
                  child: Text(
                    device,
                    style: TextStyle(
                      fontSize: ResponsiveHelper.getFontSize(context, 16),
                      color: Colors.black,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    setState(() {
                      selectedDevices.remove(device);
                    });
                  },
                ),
              ],
            ),
          );
        }).toList(),
        SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: _showDeviceSelectionDialog,
          icon: const Icon(Icons.add, color: Colors.white),
          label: Text(
            'Add Device',
            style: TextStyle(
              color: Colors.white,
              fontSize: ResponsiveHelper.getFontSize(context, 16),
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black,
            padding: ResponsiveHelper.getButtonPadding(context),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConstants.borderRadius),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSaveButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {
          if (_validateForm()) {
            Navigator.pop(context, {
              'name': _scheduleNameController.text,
              'startTime': AppConstants.formatTimeOfDay(_startTime),
              'stopTime': AppConstants.formatTimeOfDay(_stopTime),
              'days': selectedDays.toList(),
              'devices': selectedDevices.toList(),
            });
          }
        },
        style: ButtonStyle(
          backgroundColor: const MaterialStatePropertyAll<Color>(Colors.black),
          padding: MaterialStatePropertyAll<EdgeInsets>(
            ResponsiveHelper.getButtonPadding(context),
          ),
          shape: MaterialStatePropertyAll<RoundedRectangleBorder>(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConstants.borderRadius),
            ),
          ),
        ),
        child: Text(
          'Save',
          style: TextStyle(
            fontSize: ResponsiveHelper.getFontSize(context, 16),
            color: Colors.white,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _scheduleNameController.dispose();
    super.dispose();
  }
}