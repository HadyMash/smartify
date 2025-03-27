import 'package:flutter/material.dart';
import 'available_devices.dart';
import '../responsive_helper.dart';
import 'device_config.dart';

class AddDeviceScreen extends StatefulWidget {
  const AddDeviceScreen({Key? key}) : super(key: key);

  @override
  State<AddDeviceScreen> createState() => _AddDeviceScreenState();
}

class _AddDeviceScreenState extends State<AddDeviceScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  final DeviceConfig config = DeviceConfig();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: config.scanAnimationDuration,
    )..repeat(reverse: true);

    _animation = Tween<double>(
      begin: config.scanAnimationStart,
      end: config.scanAnimationEnd,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: config.scanAnimationCurve,
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _navigateToAvailableDevicesScreen() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const AvailableDevicesScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    final scanSize = isDesktop ? config.desktopScanSize : config.mobileScanSize;
    final outerScanSize = isDesktop ? config.desktopOuterScanSize : config.mobileOuterScanSize;

    return Scaffold(
      backgroundColor: config.backgroundColor,
      body: SafeArea(
        child: Center(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: isDesktop ? config.desktopMaxWidth : double.infinity,
            ),
            padding: EdgeInsets.symmetric(
              horizontal: isDesktop ? config.desktopPadding : config.mobilePadding,
              vertical: isDesktop ? config.desktopVerticalPadding : config.mobileVerticalPadding,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        Icons.arrow_back,
                        color: config.primaryTextColor,
                        size: isDesktop ? config.desktopIconSize : config.mobileIconSize,
                      ),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Expanded(
                      child: Text(
                        config.addDeviceTitle,
                        textAlign: TextAlign.center,
                        style: config.getTitleStyle(isDesktop: isDesktop),
                      ),
                    ),
                    SizedBox(width: isDesktop ? config.desktopIconSize * 2 : config.mobileIconSize * 2),
                  ],
                ),
                SizedBox(height: isDesktop ? config.desktopSpacing : config.mobileSpacing),
                Text(
                  config.scanInstructionText,
                  textAlign: TextAlign.center,
                  style: config.getSubtitleStyle(isDesktop: isDesktop),
                ),
                const Spacer(),
                Center(
                  child: GestureDetector(
                    onTap: _navigateToAvailableDevicesScreen,
                    child: AnimatedBuilder(
                      animation: _animation,
                      builder: (context, child) {
                        return Stack(
                          alignment: Alignment.center,
                          children: [
                            Transform.scale(
                              scale: _animation.value,
                              child: Container(
                                width: outerScanSize,
                                height: outerScanSize,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: config.borderColor.withOpacity(0.3),
                                    width: isDesktop ? config.desktopBorderWidth : config.mobileBorderWidth,
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              width: scanSize,
                              height: scanSize,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: config.borderColor,
                                  width: isDesktop ? config.desktopInnerBorderWidth : config.mobileInnerBorderWidth,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  config.scanButtonText,
                                  style: TextStyle(
                                    fontSize: isDesktop ? config.desktopTitleSize : config.mobileTitleSize,
                                    color: config.secondaryTextColor,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
                const Spacer(),
                TextButton(
                  onPressed: _navigateToAvailableDevicesScreen,
                  child: Text(
                    config.skipButtonText,
                    style: TextStyle(
                      color: config.primaryTextColor,
                      fontSize: isDesktop ? config.desktopButtonTextSize : config.mobileButtonTextSize,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                SizedBox(height: isDesktop ? config.desktopSpacing : config.mobileSpacing),
              ],
            ),
          ),
        ),
      ),
    );
  }
}