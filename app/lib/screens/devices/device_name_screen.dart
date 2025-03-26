import 'package:flutter/material.dart';
import 'device_added_screen.dart';
import '../responsive_helper.dart';
import 'device_config.dart';

class DeviceNameScreen extends StatefulWidget {
  final String deviceName;

  const DeviceNameScreen({
    Key? key,
    required this.deviceName,
  }) : super(key: key);

  @override
  _DeviceNameScreenState createState() => _DeviceNameScreenState();
}

class _DeviceNameScreenState extends State<DeviceNameScreen> {
  late TextEditingController _controller;
  String _selectedLocation = 'Living Room';
  final DeviceConfig config = DeviceConfig();

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.deviceName);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);

    return Scaffold(
      backgroundColor: config.backgroundColor,
      appBar: AppBar(
        backgroundColor: config.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: config.primaryTextColor,
            size: isDesktop ? config.desktopIconSize : config.mobileIconSize,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          config.nameDeviceTitle,
          style: TextStyle(
            color: config.primaryTextColor,
            fontWeight: FontWeight.w600,
            fontSize: isDesktop ? config.desktopTitleSize : config.mobileTitleSize,
          ),
        ),
        centerTitle: true,
      ),
      body: Center(
        child: Container(
          constraints: BoxConstraints(
            maxWidth: isDesktop ? config.desktopMaxWidth : double.infinity,
          ),
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: isDesktop ? config.desktopPadding : config.mobilePadding,
                vertical: isDesktop ? config.desktopVerticalPadding : config.mobileVerticalPadding,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: isDesktop ? config.desktopSpacing : config.mobileSpacing),
                  TextField(
                    controller: _controller,
                    style: TextStyle(
                      fontSize: isDesktop ? config.desktopButtonTextSize : config.mobileButtonTextSize,
                      fontWeight: FontWeight.w500,
                    ),
                    decoration: InputDecoration(
                      hintText: config.deviceNameHint,
                      hintStyle: TextStyle(color: config.secondaryTextColor),
                      suffixIcon: IconButton(
                        icon: Icon(
                          Icons.close,
                          color: config.secondaryTextColor,
                          size: isDesktop ? config.desktopIconSize : config.mobileIconSize,
                        ),
                        onPressed: () => _controller.clear(),
                      ),
                      filled: true,
                      fillColor: config.inputBackgroundColor,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: isDesktop ? config.desktopPadding : config.mobilePadding,
                        vertical: isDesktop ? config.desktopVerticalPadding : config.mobileVerticalPadding,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(isDesktop ? config.desktopBorderRadius : config.mobileBorderRadius),
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(isDesktop ? config.desktopBorderRadius : config.mobileBorderRadius),
                        borderSide: BorderSide(color: config.selectedBorderColor, width: 2),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(isDesktop ? config.desktopBorderRadius : config.mobileBorderRadius),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  SizedBox(height: isDesktop ? config.desktopSpacing * 2 : config.mobileSpacing * 2),
                  Text(
                    config.selectLocationText,
                    style: TextStyle(
                      fontSize: isDesktop ? config.desktopSubtitleSize : config.mobileSubtitleSize,
                      fontWeight: FontWeight.bold,
                      color: config.primaryTextColor,
                    ),
                  ),
                  SizedBox(height: isDesktop ? config.desktopSpacing : config.mobileSpacing),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: isDesktop ? config.desktopLocationGridCrossAxisCount : config.mobileLocationGridCrossAxisCount,
                    mainAxisSpacing: isDesktop ? config.desktopGridSpacing : config.mobileGridSpacing,
                    crossAxisSpacing: isDesktop ? config.desktopGridSpacing : config.mobileGridSpacing,
                    childAspectRatio: isDesktop ? config.desktopLocationGridAspectRatio : config.mobileLocationGridAspectRatio,
                    children: config.deviceLocations.map((location) => _buildLocationButton(location)).toList(),
                  ),
                  SizedBox(height: isDesktop ? config.desktopSpacing * 2 : config.mobileSpacing * 2),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => DeviceAddedScreen(
                              deviceName: _controller.text,
                              location: _selectedLocation,
                            ),
                          ),
                        );
                      },
                      style: config.getElevatedButtonStyle(isDesktop: isDesktop),
                      child: Text(
                        config.continueButtonText,
                        style: config.getButtonTextStyle(isDesktop: isDesktop),
                      ),
                    ),
                  ),
                  SizedBox(height: isDesktop ? config.desktopSpacing : config.mobileSpacing),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLocationButton(String label) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    bool isSelected = _selectedLocation == label;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedLocation = label;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? config.selectedLocationColor : config.inputBackgroundColor,
          borderRadius: BorderRadius.circular(isDesktop ? config.desktopBorderRadius : config.mobileBorderRadius),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: config.shadowColor,
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? config.buttonTextColor : config.unselectedLocationColor,
              fontSize: isDesktop ? config.desktopButtonTextSize : config.mobileButtonTextSize,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}