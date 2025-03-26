import 'package:flutter/material.dart';
import 'responsive_helper.dart';
import 'security_config.dart';

class LocksScreen extends StatefulWidget {
  const LocksScreen({Key? key}) : super(key: key);

  @override
  State<LocksScreen> createState() => _LocksScreenState();
}

class _LocksScreenState extends State<LocksScreen> {
  late Map<String, bool> locks;
  late Map<String, bool> alarms;
  final SecurityConfig config = SecurityConfig();

  @override
  void initState() {
    super.initState();
    locks = Map.from(config.defaultLocks);
    alarms = Map.from(config.defaultAlarms);
  }

  Widget _buildDeviceCard(String name, bool isActive, bool isAlarm, bool isDesktop) {
    return Container(
      padding: EdgeInsets.all(isDesktop ? config.desktopPadding : config.mobilePadding),
      margin: EdgeInsets.only(bottom: config.locksCardMarginBottom),
      decoration: BoxDecoration(
        color: isActive ? config.backgroundColor : config.fullscreenBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: isActive ? Border.all(color: config.sidebarBorderColor) : null,
        boxShadow: [
          BoxShadow(
            color: config.lockCardShadowColor,
            spreadRadius: config.shadowSpreadRadius,
            blurRadius: config.lockCardShadowBlurRadius,
            offset: config.shadowOffset,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(
                isAlarm
                    ? (isActive ? config.alarmActiveIcon : config.alarmInactiveIcon)
                    : (isActive ? config.lockOpenIcon : config.lockClosedIcon),
                color: isActive ? config.textColor : config.whiteTextColor,
                size: isDesktop ? config.desktopIconSizeLarge : config.mobileIconSizeLarge,
              ),
              if (isDesktop)
                Switch(
                  value: isActive,
                  onChanged: (value) {
                    setState(() {
                      if (isAlarm) {
                        alarms[name] = value;
                      } else {
                        locks[name] = value;
                      }
                    });
                  },
                  activeColor: config.switchActiveColor,
                ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: TextStyle(
                  fontSize: isDesktop ? config.desktopCardFontSize : config.mobileCardFontSize,
                  fontWeight: config.mediumFontWeight,
                  color: isActive ? config.textColor : config.whiteTextColor,
                ),
              ),
              SizedBox(height: isDesktop ? 10 : 8),
              Text(
                isAlarm
                    ? (isActive ? config.alarmActiveText : config.alarmInactiveText)
                    : (isActive ? config.lockOpenText : config.lockClosedText),
                style: TextStyle(
                  fontSize: isDesktop ? config.desktopStatusFontSize : config.mobileStatusFontSize,
                  color: isActive ? config.inactiveTextColor : config.inactiveAlarmTextColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
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
              padding: EdgeInsets.all(isDesktop ? config.desktopPadding : config.mobilePadding),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(config.backIcon),
                    onPressed: () => Navigator.pop(context),
                    iconSize: isDesktop ? config.desktopIconSizeMedium : config.mobileIconSizeMedium,
                  ),
                  SizedBox(width: isDesktop ? config.desktopSpacingMedium : config.mobileSpacingMedium),
                  Text(
                    config.defaultTitle,
                    style: TextStyle(
                      fontSize: isDesktop ? config.desktopTitleFontSize : config.mobileTitleFontSize,
                      fontWeight: config.boldFontWeight,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: isDesktop ? config.desktopPadding : config.mobilePadding),
              child: Text(
                config.devicesSectionLabel,
                style: TextStyle(
                  fontSize: isDesktop ? config.desktopSectionFontSize : config.mobileSectionFontSize,
                  fontWeight: config.mediumFontWeight,
                ),
              ),
            ),
            SizedBox(height: isDesktop ? config.desktopSpacingLarge : config.mobileSpacingLarge),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: isDesktop ? config.desktopPadding : config.mobilePadding),
                child: isDesktop ? _buildDesktopLayout() : _buildMobileLayout(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDesktopLayout() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: config.desktopLocksGridCount,
      crossAxisSpacing: config.desktopSpacingMedium,
      mainAxisSpacing: config.desktopSpacingMedium,
      childAspectRatio: config.desktopLocksAspectRatio,
      children: [
        ...locks.entries.map((entry) {
          return _buildDeviceCard(entry.key, entry.value, false, true);
        }).toList(),
        ...alarms.entries.map((entry) {
          return _buildDeviceCard(entry.key, entry.value, true, true);
        }).toList(),
      ],
    );
  }

  Widget _buildMobileLayout() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            children: locks.entries.map((entry) {
              return GestureDetector(
                onTap: () {
                  setState(() {
                    locks[entry.key] = !entry.value;
                  });
                },
                child: _buildDeviceCard(entry.key, entry.value, false, false),
              );
            }).toList(),
          ),
        ),
        SizedBox(width: config.desktopSpacingMedium),
        Expanded(
          child: Column(
            children: alarms.entries.map((entry) {
              return GestureDetector(
                onTap: () {
                  setState(() {
                    alarms[entry.key] = !entry.value;
                  });
                },
                child: _buildDeviceCard(entry.key, entry.value, true, false),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}