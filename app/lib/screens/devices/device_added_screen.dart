import 'package:flutter/material.dart';
import 'devices_screen.dart';
import '../responsive_helper.dart';
import 'device_config.dart';

class DeviceAddedScreen extends StatelessWidget {
  final String deviceName;
  final String location;

  DeviceAddedScreen({
    Key? key,
    required this.deviceName,
    required this.location,
  }) : super(key: key);

  final DeviceConfig config = DeviceConfig();

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);

    return Scaffold(
      backgroundColor: config.backgroundColor,
      body: SafeArea(
        child: Center(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: isDesktop ? config.desktopMaxWidth : double.infinity,
            ),
            padding: EdgeInsets.all(isDesktop ? config.desktopPadding : config.mobilePadding),
            child: Column(
              children: [
                const Spacer(),
                Icon(
                  Icons.check_circle,
                  color: config.successColor,
                  size: isDesktop ? config.desktopSuccessIconSize : config.mobileSuccessIconSize,
                ),
                SizedBox(height: isDesktop ? config.desktopSpacing : config.mobileSpacing),
                Text(
                  config.deviceAddedTitle,
                  textAlign: TextAlign.center,
                  style: config.getTitleStyle(isDesktop: isDesktop),
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DevicesScreen(
                            newDevice: {
                              'deviceName': deviceName,
                              'location': location,
                            },
                          ),
                        ),
                        (route) => false,
                      );
                    },
                    style: config.getElevatedButtonStyle(isDesktop: isDesktop),
                    child: Text(
                      config.returnButtonText,
                      style: config.getButtonTextStyle(isDesktop: isDesktop),
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
}