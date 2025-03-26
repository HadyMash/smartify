import 'package:flutter/material.dart';
import 'responsive_helper.dart';
import 'security_config.dart';

class CameraFullscreen extends StatefulWidget {
  final String cameraId;

  const CameraFullscreen({
    Key? key,
    required this.cameraId,
  }) : super(key: key);

  @override
  State<CameraFullscreen> createState() => _CameraFullscreenState();
}

class _CameraFullscreenState extends State<CameraFullscreen> {
  bool isMicActive = false;
  final SecurityConfig config = SecurityConfig();

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Scaffold(
      backgroundColor: config.fullscreenBackgroundColor,
      body: SafeArea(
        child: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                color: config.cameraBackgroundColor,
              ),
              child: Center(
                child: Icon(
                  config.cameraOffIcon,
                  size: config.cameraFullScreenOffIconSize,
                  color: config.cameraOffIconColor,
                ),
              ),
            ),
            Positioned(
              top: config.cameraFullScreenTopPadding,
              left: config.cameraFullScreenTopPadding,
              child: IconButton(
                icon: Icon(config.backIcon, color: config.textColor),
                onPressed: () => Navigator.pop(context),
                iconSize: isDesktop ? config.desktopIconSizeMedium : config.mobileIconSizeMedium,
              ),
            ),
            Positioned(
              bottom: isDesktop
                  ? config.cameraFullScreenBottomPaddingDesktop
                  : config.cameraFullScreenBottomPaddingMobile,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  Text(
                    '${config.cameraLabelPrefix}${widget.cameraId}',
                    style: TextStyle(
                      color: config.whiteTextColor,
                      fontSize: isDesktop
                          ? config.desktopCameraFullScreenFontSize
                          : config.mobileCameraFullScreenFontSize,
                      fontWeight: config.mediumFontWeight,
                    ),
                  ),
                  SizedBox(height: isDesktop
                      ? config.cameraFullScreenSpacingDesktop
                      : config.cameraFullScreenSpacingMobile),
                  GestureDetector(
                    onTapDown: (_) => setState(() => isMicActive = true),
                    onTapUp: (_) => setState(() => isMicActive = false),
                    onTapCancel: () => setState(() => isMicActive = false),
                    child: Container(
                      width: isDesktop ? config.desktopMicButtonSize : config.mobileMicButtonSize,
                      height: isDesktop ? config.desktopMicButtonSize : config.mobileMicButtonSize,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isMicActive ? config.micActiveColor : config.micInactiveColor,
                      ),
                      child: Icon(
                        config.micIcon,
                        color: isMicActive ? config.whiteTextColor : config.textColor,
                        size: isDesktop ? config.desktopIconSizeLarge : config.mobileIconSizeLarge,
                      ),
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
}