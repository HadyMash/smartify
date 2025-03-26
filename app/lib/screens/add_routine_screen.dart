import 'package:flutter/material.dart';
import 'responsive_helper.dart';
import 'routine_config.dart';

class AddRoutineScreen extends StatefulWidget {
  final bool editMode;
  final String? routineName;
  final IconData? routineIcon;

  const AddRoutineScreen({
    Key? key,
    this.editMode = false,
    this.routineName,
    this.routineIcon,
  }) : super(key: key);

  @override
  State<AddRoutineScreen> createState() => _AddRoutineScreenState();
}

class _AddRoutineScreenState extends State<AddRoutineScreen> {
  final TextEditingController _routineNameController = TextEditingController();
  IconData? _selectedIcon;
  Set<String> selectedDevices = {};
  final RoutineConfig config = RoutineConfig();

  @override
  void initState() {
    super.initState();
    if (widget.routineName != null) {
      _routineNameController.text = widget.routineName!;
    }
    if (widget.routineIcon != null) {
      _selectedIcon = widget.routineIcon;
    }
  }

  void _showDeviceSelectionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        final isDesktop = ResponsiveHelper.isDesktop(context);
        
        return AlertDialog(
          title: Text(config.selectDeviceTitle),
          content: SingleChildScrollView(
            child: Container(
              width: isDesktop ? 500 : double.maxFinite,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: config.deviceIcons.entries.map((entry) {
                  final device = entry.key;
                  final iconData = entry.value;

                  return ListTile(
                    leading: Icon(
                      iconData['icon'],
                      color: iconData['color'],
                      size: config.getIconSize(isDesktop),
                    ),
                    title: Text(
                      device,
                      style: TextStyle(
                        fontSize: config.getTextSize(isDesktop),
                        color: config.textColor,
                      ),
                    ),
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
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                config.cancelButton,
                style: TextStyle(
                  fontSize: config.getTextSize(isDesktop),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showCustomIconPicker() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        final isDesktop = ResponsiveHelper.isDesktop(context);
        
        return AlertDialog(
          title: Text(config.selectIconLabel),
          content: Container(
            width: isDesktop ? 500 : double.maxFinite,
            height: isDesktop ? 400 : 300,
            child: GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: isDesktop ? 6 : 5,
                childAspectRatio: 1.0,
                crossAxisSpacing: isDesktop ? 8 : 10,
                mainAxisSpacing: isDesktop ? 8 : 10,
              ),
              itemCount: config.commonIcons.length,
              itemBuilder: (context, index) {
                return InkWell(
                  onTap: () {
                    setState(() {
                      _selectedIcon = config.commonIcons[index];
                    });
                    Navigator.pop(context);
                  },
                  child: Icon(
                    config.commonIcons[index],
                    size: config.getIconSize(isDesktop),
                    color: config.textColor,
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  void _deleteRoutine() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(config.deleteTitle),
          content: Text(config.deleteMessage),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(config.cancelButton),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context, 'delete');
              },
              child: Text(
                config.deleteButton,
                style: TextStyle(color: config.deleteButtonColor),
              ),
            ),
          ],
        );
      },
    );
  }

  bool _validateForm() {
    if (_routineNameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${config.routineNameLabel} cannot be empty')),
      );
      return false;
    }

    if (_selectedIcon == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${config.selectIconLabel} cannot be empty')),
      );
      return false;
    }

    return true;
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Scaffold(
      backgroundColor: config.backgroundColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.all(config.getPadding(isDesktop)),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(config.backIcon),
                    onPressed: () => Navigator.pop(context),
                    iconSize: config.getIconSize(isDesktop),
                  ),
                  SizedBox(width: config.getSpacing(isDesktop)),
                  Text(
                    widget.editMode ? config.editTitle : config.addTitle,
                    style: TextStyle(
                      fontSize: config.getTitleSize(isDesktop),
                      fontWeight: FontWeight.bold,
                      color: config.textColor,
                    ),
                  ),
                  if (widget.editMode) ...[
                    const Spacer(),
                    IconButton(
                      icon: Icon(
                        config.deleteIcon,
                        color: config.deleteButtonColor,
                      ),
                      onPressed: _deleteRoutine,
                      iconSize: config.getIconSize(isDesktop),
                    ),
                  ],
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                child: isDesktop ? _buildDesktopLayout() : _buildMobileLayout(),
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
        padding: EdgeInsets.all(config.desktopPadding),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                color: config.backgroundColor,
                borderRadius: BorderRadius.circular(config.desktopBorderRadius),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              padding: EdgeInsets.all(config.desktopPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildNameInput(),
                  SizedBox(height: config.desktopSpacing),
                  _buildIconPicker(),
                  SizedBox(height: config.desktopSpacing),
                  _buildDeviceSection(),
                  SizedBox(height: config.desktopSpacing),
                  _buildSaveButton(),
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
      padding: EdgeInsets.all(config.mobilePadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              color: config.backgroundColor,
              borderRadius: BorderRadius.circular(config.mobileBorderRadius),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            padding: EdgeInsets.all(config.mobilePadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildNameInput(),
                SizedBox(height: config.mobileSpacing),
                _buildIconPicker(),
                SizedBox(height: config.mobileSpacing),
                _buildDeviceSection(),
                SizedBox(height: config.mobileSpacing),
                _buildSaveButton(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNameInput() {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          config.routineNameLabel,
          style: TextStyle(
            fontSize: config.getTextSize(isDesktop),
            fontWeight: FontWeight.w500,
            color: config.textColor,
          ),
        ),
        SizedBox(height: config.getSpacing(isDesktop)),
        Container(
          decoration: BoxDecoration(
            color: config.backgroundColor,
            borderRadius: BorderRadius.circular(config.getBorderRadius(isDesktop)),
            border: Border.all(color: config.borderColor),
          ),
          child: TextField(
            controller: _routineNameController,
            style: TextStyle(
              fontSize: config.getTextSize(isDesktop),
              color: config.textColor,
            ),
            decoration: InputDecoration(
              hintText: config.routineNameHint,
              hintStyle: TextStyle(color: config.hintTextColor),
              border: InputBorder.none,
              contentPadding: EdgeInsets.all(config.getSpacing(isDesktop)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildIconPicker() {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          config.selectIconLabel,
          style: TextStyle(
            fontSize: config.getTextSize(isDesktop),
            fontWeight: FontWeight.w500,
            color: config.textColor,
          ),
        ),
        SizedBox(height: config.getSpacing(isDesktop)),
        ElevatedButton.icon(
          onPressed: _showCustomIconPicker,
          icon: _selectedIcon != null
              ? Icon(_selectedIcon, size: config.getIconSize(isDesktop) * 0.8)
              : Icon(config.addIcon, size: config.getIconSize(isDesktop) * 0.8),
          label: Text(
            config.pickIconButton,
            style: TextStyle(
              fontSize: config.getTextSize(isDesktop),
              color: config.textColor,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: config.backgroundColor,
            foregroundColor: config.textColor,
            padding: EdgeInsets.symmetric(
              vertical: config.getSpacing(isDesktop),
              horizontal: config.getSpacing(isDesktop) * 1.5,
            ),
            side: BorderSide(color: config.borderColor),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(config.getBorderRadius(isDesktop)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDeviceSection() {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          config.selectedDevicesLabel,
          style: TextStyle(
            fontSize: config.getTextSize(isDesktop),
            fontWeight: FontWeight.w500,
            color: config.textColor,
          ),
        ),
        SizedBox(height: config.getSpacing(isDesktop)),
        ...selectedDevices.map((device) {
          final iconData = config.deviceIcons[device]!;
          return Container(
            margin: EdgeInsets.only(bottom: config.getSpacing(isDesktop)),
            padding: EdgeInsets.all(config.getSpacing(isDesktop)),
            decoration: BoxDecoration(
              color: config.backgroundColor,
              borderRadius: BorderRadius.circular(config.getBorderRadius(isDesktop)),
              border: Border.all(color: config.borderColor),
            ),
            child: Row(
              children: [
                Icon(
                  iconData['icon'],
                  size: config.getIconSize(isDesktop),
                  color: iconData['color'],
                ),
                SizedBox(width: config.getSpacing(isDesktop)),
                Expanded(
                  child: Text(
                    device,
                    style: TextStyle(
                      fontSize: config.getTextSize(isDesktop),
                      color: config.textColor,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(config.closeIcon),
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
        SizedBox(height: config.getSpacing(isDesktop)),
        ElevatedButton.icon(
          onPressed: _showDeviceSelectionDialog,
          icon: Icon(config.addIcon, color: config.buttonTextColor),
          label: Text(
            config.addDeviceButton,
            style: TextStyle(
              color: config.buttonTextColor,
              fontSize: config.getTextSize(isDesktop),
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: config.buttonColor,
            padding: EdgeInsets.symmetric(
              vertical: config.getSpacing(isDesktop),
              horizontal: config.getSpacing(isDesktop) * 1.5,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(config.getBorderRadius(isDesktop)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSaveButton() {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {
          if (_validateForm()) {
            Navigator.pop(context, {
              'name': _routineNameController.text,
              'icon': _selectedIcon,
              'devices': selectedDevices.toList(),
            });
          }
        },
        style: ButtonStyle(
          backgroundColor: MaterialStatePropertyAll<Color>(config.buttonColor),
          padding: MaterialStatePropertyAll<EdgeInsets>(
            EdgeInsets.symmetric(
              vertical: config.getSpacing(isDesktop),
              horizontal: config.getSpacing(isDesktop) * 1.5,
            ),
          ),
          shape: MaterialStatePropertyAll<RoundedRectangleBorder>(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(config.getBorderRadius(isDesktop)),
            ),
          ),
        ),
        child: Text(
          config.saveButton,
          style: TextStyle(
            fontSize: config.getTextSize(isDesktop),
            color: config.buttonTextColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _routineNameController.dispose();
    super.dispose();
  }
}