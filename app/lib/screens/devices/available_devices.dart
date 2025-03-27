import 'package:flutter/material.dart';
import 'device_name_screen.dart';
import '../responsive_helper.dart';
import 'device_config.dart';

class AvailableDevicesScreen extends StatefulWidget {
  const AvailableDevicesScreen({Key? key}) : super(key: key);

  @override
  State<AvailableDevicesScreen> createState() => _AvailableDevicesScreenState();
}

class _AvailableDevicesScreenState extends State<AvailableDevicesScreen> {
  String? selectedDevice;
  final DeviceConfig config = DeviceConfig();

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);

    return Scaffold(
      backgroundColor: config.backgroundColor,
      appBar: AppBar(
        backgroundColor: config.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, 
            color: config.primaryTextColor,
            size: isDesktop ? config.desktopIconSize : config.mobileIconSize,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          config.availableDevicesTitle,
          style: TextStyle(
            color: config.primaryTextColor,
            fontSize: isDesktop ? config.desktopTitleSize : config.mobileTitleSize,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Center(
        child: Container(
          constraints: BoxConstraints(
            maxWidth: isDesktop ? config.desktopMaxWidth : double.infinity,
          ),
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? config.desktopPadding : config.mobilePadding,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                config.availableDevicesHeaderText,
                style: TextStyle(
                  fontSize: isDesktop ? config.desktopSubtitleSize : config.mobileSubtitleSize,
                  fontWeight: FontWeight.bold,
                  color: config.primaryTextColor,
                ),
              ),
              SizedBox(height: isDesktop ? config.desktopSpacing : config.mobileSpacing),
              Expanded(
                child: GridView.builder(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: isDesktop ? config.desktopGridCrossAxisCount : config.mobileGridCrossAxisCount,
                    childAspectRatio: isDesktop ? config.desktopGridAspectRatio : config.mobileGridAspectRatio,
                    mainAxisSpacing: isDesktop ? config.desktopGridSpacing : config.mobileGridSpacing,
                    crossAxisSpacing: isDesktop ? config.desktopGridSpacing : config.mobileGridSpacing,
                  ),
                  padding: EdgeInsets.zero,
                  itemCount: config.availableDevices.length,
                  itemBuilder: (context, index) {
                    final device = config.availableDevices[index];
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          selectedDevice = device;
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => DeviceNameScreen(
                                deviceName: device,
                              ),
                            ),
                          );
                        });
                      },
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: isDesktop ? config.desktopPadding : config.mobilePadding,
                          vertical: isDesktop ? 24.0 : 16.0, // Increased vertical padding
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white, // Explicit white background
                          borderRadius: BorderRadius.circular(isDesktop ? config.desktopBorderRadius : config.mobileBorderRadius),
                          border: Border.all(
                            color: selectedDevice == device 
                                ? config.selectedBorderColor 
                                : config.borderColor,
                            width: isDesktop ? config.desktopBorderWidth : config.mobileBorderWidth,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.1), // Lighter shadow
                              spreadRadius: 1,
                              blurRadius: 3, // Reduced blur
                              offset: const Offset(0, 1),
                            ),
                          ],
                        ),
                        alignment: Alignment.center, // Center content
                        child: Text(
                          device,
                          style: TextStyle(
                            fontSize: isDesktop ? 18.0 : 16.0, // Explicit font sizes
                            color: Colors.black, // High contrast
                            fontWeight: selectedDevice == device 
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 2, // Prevent overflow
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}