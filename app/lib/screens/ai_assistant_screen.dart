import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'responsive_helper.dart';
import 'ai_config.dart';

class AiAssistantScreen extends StatefulWidget {
  const AiAssistantScreen({Key? key}) : super(key: key);

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen>
    with TickerProviderStateMixin {
  late AnimationController _waveController;
  bool isMicActive = false;
  final AiConfig config = AiConfig();

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      duration: config.waveDuration,
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Scaffold(
      backgroundColor: config.backgroundColor,
      appBar: isDesktop
          ? null
          : AppBar(
              backgroundColor: config.backgroundColor,
              elevation: 0,
              leading: IconButton(
                icon: Icon(config.backIcon, color: config.titleColor),
                onPressed: () => Navigator.pop(context),
              ),
              title: Text(
                config.title,
                style: TextStyle(
                  color: config.titleColor,
                  fontWeight: config.appBarFontWeight,
                  fontSize: config.titleFontSizeMobile,
                ),
              ),
            ),
      body: isDesktop ? _buildDesktopLayout(context) : _buildMobileLayout(context),
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Top bar with back button
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: config.topBarPaddingHorizontal,
              vertical: config.topBarPaddingVertical,
            ),
            decoration: BoxDecoration(
              color: config.backgroundColor,
              border: Border(bottom: BorderSide(color: config.borderColor)),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(config.backIcon, color: config.titleColor),
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(width: 16),
                Text(
                  config.title,
                  style: TextStyle(
                    fontSize: config.titleFontSizeDesktop,
                    fontWeight: config.titleFontWeight,
                    color: config.titleColor,
                  ),
                ),
              ],
            ),
          ),
          
          // Main content
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(config.desktopPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    config.greetingText,
                    style: TextStyle(
                      fontSize: config.greetingFontSizeDesktop,
                      color: config.textColor,
                      height: config.greetingLineHeight,
                    ),
                  ),
                  SizedBox(height: config.desktopSpacing),
                  Container(
                    padding: EdgeInsets.all(config.examplePadding),
                    decoration: BoxDecoration(
                      color: config.exampleBackgroundColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      config.exampleCommand,
                      style: TextStyle(
                        color: config.exampleTextColor,
                        fontSize: config.exampleFontSizeDesktop,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Microphone button
          Padding(
            padding: EdgeInsets.only(bottom: config.micButtonBottomMargin),
            child: GestureDetector(
              onTapDown: (_) => setState(() => isMicActive = true),
              onTapUp: (_) => setState(() => isMicActive = false),
              onTapCancel: () => setState(() => isMicActive = false),
              child: Container(
                width: config.micButtonSize,
                height: config.micButtonSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isMicActive ? config.micActiveColor : config.micInactiveColor,
                  border: Border.all(color: config.borderColor, width: 2),
                ),
                child: Icon(
                  config.micIcon,
                  size: config.micButtonSize * 0.45,
                  color: isMicActive ? config.micIconActiveColor : config.micIconInactiveColor,
                ),
              ),
            ),
          ),
          
          // Wave animation
          SizedBox(
            height: config.waveHeight,
            child: AnimatedBuilder(
              animation: _waveController,
              builder: (context, child) {
                return CustomPaint(
                  size: Size(double.infinity, config.waveHeight),
                  painter: WavePainter(
                    animation: _waveController,
                    waveColor: config.waveColor,
                    baseHeightFactor: config.waveBaseHeightFactor,
                    amplitudeFactor: config.waveAmplitudeFactor,
                    frequency: config.waveFrequency,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(config.mobilePadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  config.greetingText,
                  style: TextStyle(
                    fontSize: config.greetingFontSizeMobile,
                    color: config.textColor,
                    height: config.greetingLineHeight,
                  ),
                ),
                SizedBox(height: config.mobileSpacing),
                Container(
                  padding: EdgeInsets.all(config.mobileExamplePadding),
                  decoration: BoxDecoration(
                    color: config.exampleBackgroundColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    config.exampleCommand,
                    style: TextStyle(
                      color: config.exampleTextColor,
                      fontSize: config.exampleFontSizeMobile,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: config.mobileSpacing),
        // Microphone button
        GestureDetector(
          onTapDown: (_) => setState(() => isMicActive = true),
          onTapUp: (_) => setState(() => isMicActive = false),
          onTapCancel: () => setState(() => isMicActive = false),
          child: Container(
            margin: EdgeInsets.only(bottom: config.micButtonBottomMargin),
            width: config.mobileMicButtonSize,
            height: config.mobileMicButtonSize,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isMicActive ? config.micActiveColor : config.micInactiveColor,
              border: Border.all(color: config.borderColor, width: 2),
            ),
            child: Icon(
              config.micIcon,
              size: config.mobileMicButtonSize * 0.43,
              color: isMicActive ? config.micIconActiveColor : config.micIconInactiveColor,
            ),
          ),
        ),
        // Wave animation
        SizedBox(
          height: config.waveHeight,
          child: AnimatedBuilder(
            animation: _waveController,
            builder: (context, child) {
              return CustomPaint(
                size: Size(double.infinity, config.waveHeight),
                painter: WavePainter(
                  animation: _waveController,
                  waveColor: config.waveColor,
                  baseHeightFactor: config.waveBaseHeightFactor,
                  amplitudeFactor: config.waveAmplitudeFactor,
                  frequency: config.waveFrequency,
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class WavePainter extends CustomPainter {
  final Animation<double> animation;
  final Color waveColor;
  final double baseHeightFactor;
  final double amplitudeFactor;
  final double frequency;

  WavePainter({
    required this.animation,
    required this.waveColor,
    required this.baseHeightFactor,
    required this.amplitudeFactor,
    required this.frequency,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    final paint = Paint()
      ..color = waveColor
      ..style = PaintingStyle.fill;

    final baseHeight = size.height * baseHeightFactor;
    final amplitude = size.height * amplitudeFactor;

    path.moveTo(0, size.height);

    for (var x = 0.0; x <= size.width; x++) {
      final y = baseHeight +
          math.sin((x / size.width * frequency) + animation.value * frequency) *
              amplitude;
      path.lineTo(x, y);
    }

    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(WavePainter oldDelegate) => true;
}