import 'package:flutter/material.dart';
import 'camera_fullscreen.dart';
import 'locks_screen.dart';
import '../../../screens/devices/devices_screen.dart';
import '../../dashboard_screen.dart';
import '../responsive_helper.dart';
import 'security_config.dart';

class SecurityScreen extends StatefulWidget {
  final String? title;
  final List<String>? cameraIds;
  final Map<String, String>? cameraLabels;
  final Widget? additionalWidget;
  final bool showBottomNavigation;

  const SecurityScreen({
    Key? key,
    this.title,
    this.cameraIds,
    this.cameraLabels,
    this.additionalWidget,
    this.showBottomNavigation = true,
  }) : super(key: key);

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  late String pinnedCameraId;
  late List<String> availableCameraIds;
  late Map<String, String> cameraLabels;
  final SecurityConfig config = SecurityConfig();

  @override
  void initState() {
    super.initState();
    availableCameraIds = widget.cameraIds ?? config.defaultCameraIds;
    cameraLabels = widget.cameraLabels ??
        Map.fromIterable(availableCameraIds, key: (e) => e, value: (e) => '${config.cameraLabelPrefix}$e');
    pinnedCameraId = availableCameraIds.first;
  }

  Widget _buildEmptyCamera(String cameraId, {bool isPinned = false}) {
    String label = cameraLabels[cameraId] ?? '${config.cameraLabelPrefix}$cameraId';
    
    return Container(
      decoration: BoxDecoration(
        color: config.cameraBackgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        children: [
          Center(
            child: Icon(
              config.cameraOffIcon,
              size: config.cameraOffIconSize,
              color: config.inactiveTextColor,
            ),
          ),
          if (isPinned)
            Positioned(
              top: 8,
              left: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: config.cameraLabelBackgroundColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  label,
                  style: TextStyle(
                    color: config.whiteTextColor,
                    fontSize: config.cameraLabelFontSize,
                  ),
                ),
              ),
            ),
          if (isPinned)
            Positioned(
              top: 8,
              right: 8,
              child: IconButton(
                icon: Icon(config.fullscreenIcon, color: config.textColor),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CameraFullscreen(cameraId: cameraId),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Scaffold(
      body: SafeArea(
        child: isDesktop 
            ? _buildDesktopLayout(context)
            : _buildMobileLayout(context),
      ),
      bottomNavigationBar: widget.showBottomNavigation && !isDesktop
          ? CustomNavBar( // Already removed 'const' here
              currentIndex: config.securityNavIndex,
              onTap: (index) {
                if (index == 2) { // Home button
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const DashboardScreen(),
                    ),
                  );
                } else if (index == 1) { // Devices button
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const DevicesScreen(),
                    ),
                  );
                }
              },
            )
          : null,
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Row(
      children: [
        Container(
          width: config.sidebarWidth,
          height: double.infinity,
          decoration: BoxDecoration(
            color: config.sidebarBackgroundColor,
            border: Border(right: BorderSide(color: config.sidebarBorderColor)),
          ),
          child: Column(
            children: [
              Padding(
                padding: EdgeInsets.all(config.desktopPadding),
                child: Row(
                  children: [
                    Icon(config.appIcon, size: config.mobileIconSizeMedium),
                    SizedBox(width: config.desktopSpacingMedium),
                    Text(
                      config.appTitle,
                      style: TextStyle(
                        fontSize: config.desktopSidebarFontSize,
                        fontWeight: config.boldFontWeight,
                      ),
                    ),
                  ],
                ),
              ),
              _buildSidebarItem(context, config.energyIcon, config.sidebarLabels[0], false),
              _buildSidebarItem(context, config.devicesIcon, config.sidebarLabels[1], false, onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const DevicesScreen()),
                );
              }),
              _buildSidebarItem(context, config.homeIcon, config.sidebarLabels[2], false, onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const DashboardScreen()),
                );
              }),
              _buildSidebarItem(context, config.securityIcon, config.sidebarLabels[3], true),
              _buildSidebarItem(context, config.settingsIcon, config.sidebarLabels[4], false),
            ],
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.all(config.desktopPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title ?? config.defaultTitle,
                    style: TextStyle(
                      fontSize: config.desktopTitleFontSize,
                      fontWeight: config.boldFontWeight,
                    ),
                  ),
                  SizedBox(height: config.desktopSpacingLarge),
                  Text(
                    config.cameraSectionLabel,
                    style: TextStyle(
                      fontSize: config.mobileSectionFontSize,
                      fontWeight: config.mediumFontWeight,
                    ),
                  ),
                  SizedBox(height: config.desktopSpacingMedium),
                  AspectRatio(
                    aspectRatio: config.cameraAspectRatio,
                    child: _buildEmptyCamera(pinnedCameraId, isPinned: true),
                  ),
                  SizedBox(height: config.desktopSpacingLarge),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: config.desktopCameraGridCount,
                    mainAxisSpacing: config.desktopSpacingMedium,
                    crossAxisSpacing: config.desktopSpacingMedium,
                    childAspectRatio: config.cardAspectRatio,
                    children: availableCameraIds
                        .where((id) => id != pinnedCameraId)
                        .map((id) => GestureDetector(
                              onTap: () {
                                setState(() {
                                  pinnedCameraId = id;
                                });
                              },
                              child: _buildEmptyCamera(id),
                            ))
                        .toList(),
                  ),
                  SizedBox(height: config.desktopPadding),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const LocksScreen()),
                      );
                    },
                    child: Container(
                      padding: EdgeInsets.all(config.mobilePadding),
                      decoration: BoxDecoration(
                        color: config.backgroundColor,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: config.shadowColor,
                            blurRadius: config.shadowBlurRadius,
                            offset: config.shadowOffset,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            config.locksSectionLabel,
                            style: TextStyle(
                              fontSize: config.mobileCardFontSize,
                              fontWeight: config.mediumFontWeight,
                            ),
                          ),
                          Icon(config.arrowForwardIcon, size: config.arrowIconSize),
                        ],
                      ),
                    ),
                  ),
                  if (widget.additionalWidget != null) ...[
                    SizedBox(height: config.desktopSpacingLarge),
                    widget.additionalWidget!,
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSidebarItem(BuildContext context, IconData icon, String label, bool isActive, {VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(
          horizontal: config.sidebarItemPaddingHorizontal,
          vertical: config.sidebarItemPaddingVertical,
        ),
        decoration: BoxDecoration(
          color: isActive ? config.cameraBackgroundColor : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: config.sidebarIconSize,
              color: config.textColor,
            ),
            SizedBox(width: config.desktopSpacingMedium),
            Text(
              label,
              style: TextStyle(
                fontSize: config.mobileStatusFontSize,
                fontWeight: isActive ? config.semiBoldFontWeight : config.normalFontWeight,
                color: config.textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.all(config.mobilePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title ?? config.defaultTitle,
              style: TextStyle(
                fontSize: config.mobileTitleFontSize,
                fontWeight: config.boldFontWeight,
              ),
            ),
            SizedBox(height: config.mobileSpacingLarge),
            Text(
              config.cameraSectionLabel,
              style: TextStyle(
                fontSize: config.mobileSectionFontSize,
                fontWeight: config.mediumFontWeight,
              ),
            ),
            SizedBox(height: config.mobileSpacingMedium),
            AspectRatio(
              aspectRatio: config.cameraAspectRatio,
              child: _buildEmptyCamera(pinnedCameraId, isPinned: true),
            ),
            SizedBox(height: config.mobileSpacingMedium),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: config.mobileCameraGridCount,
              mainAxisSpacing: config.mobileSpacingMedium,
              crossAxisSpacing: config.mobileSpacingMedium,
              childAspectRatio: config.cardAspectRatio,
              children: availableCameraIds
                  .where((id) => id != pinnedCameraId)
                  .map((id) => GestureDetector(
                        onTap: () {
                          setState(() {
                            pinnedCameraId = id;
                          });
                        },
                        child: _buildEmptyCamera(id),
                      ))
                  .toList(),
            ),
            SizedBox(height: config.desktopSpacingLarge),
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const LocksScreen()),
                );
              },
              child: Container(
                padding: EdgeInsets.all(config.mobilePadding),
                decoration: BoxDecoration(
                  color: config.backgroundColor,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: config.shadowColor,
                      blurRadius: config.shadowBlurRadius,
                      offset: config.shadowOffset,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      config.locksSectionLabel,
                      style: TextStyle(
                        fontSize: config.mobileCardFontSize,
                        fontWeight: config.mediumFontWeight,
                      ),
                    ),
                    Icon(config.arrowForwardIcon, size: config.arrowIconSize),
                  ],
                ),
              ),
            ),
            if (widget.additionalWidget != null) ...[
              SizedBox(height: config.desktopSpacingLarge),
              widget.additionalWidget!,
            ],
          ],
        ),
      ),
    );
  }
}

class CustomNavBar extends StatelessWidget { // Removed 'const' from constructor
  final int currentIndex;
  final Function(int) onTap;
  final SecurityConfig config = SecurityConfig();

  CustomNavBar({ // Removed 'const' here
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        backgroundColor: config.backgroundColor,
        selectedItemColor: config.whiteTextColor,
        unselectedItemColor: config.textColor,
        type: BottomNavigationBarType.fixed,
        items: [
          _buildNavItem(config.energyIcon, config.navBarLabels[0]),
          _buildNavItem(config.devicesIcon, config.navBarLabels[1]),
          _buildNavItem(config.homeIcon, config.navBarLabels[2]),
          _buildNavItem(config.securityIcon, config.navBarLabels[3]),
          _buildNavItem(config.settingsIcon, config.navBarLabels[4]),
        ],
      ),
    );
  }

  BottomNavigationBarItem _buildNavItem(IconData icon, String label) {
    return BottomNavigationBarItem(
      icon: Icon(icon, size: config.navIconSize),
      activeIcon: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [config.navGradientStart, config.navGradientEnd],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Icon(icon, color: config.whiteTextColor, size: config.navIconSize),
      ),
      label: label,
    );
  }
}