// TODO: remove once done testing
// ignore_for_file: avoid_print

import 'dart:math';
import 'dart:ui';

import 'package:flutter/material.dart';

class ConfigureFloorsScreen extends StatefulWidget {
  const ConfigureFloorsScreen({super.key});

  @override
  State<ConfigureFloorsScreen> createState() => _ConfigureFloorsScreenState();
}

class _ConfigureFloorsScreenState extends State<ConfigureFloorsScreen> {
  late double selectedHeight;
  final ValueNotifier<double> scrollOffset = ValueNotifier(0);
  final ValueNotifier<double> floorOffset = ValueNotifier(0);

  double sizeMultiplier(double distanceFromCenter, double height) {
    return lerpDouble(
        1, 0.4, max(0, min(1, distanceFromCenter / (height / 2))))!;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // set the selected height to 20% of the smallest device axis
    selectedHeight = MediaQuery.sizeOf(context).shortestSide * 0.4;
  }

  @override
  void dispose() {
    scrollOffset.dispose();
    floorOffset.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.sizeOf(context).height;

    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Configure Floors'),
        backgroundColor: Colors.transparent,
      ),
      body: GestureDetector(
        onVerticalDragStart: (details) {
          // TODO: cancel momentum scrolling when scrolling starts
          print('drag start');
          print(details.localPosition);
        },
        onVerticalDragUpdate: (details) {
          print('drag update: ${details.primaryDelta}');
          scrollOffset.value += details.primaryDelta!;
        },
        onVerticalDragEnd: (details) {
          // TODO: continue scrolling with momentum
          print('drag end');
          print(details.primaryVelocity);
        },
        child: Container(
          height: double.infinity,
          width: double.infinity,
          color: Theme.of(context).scaffoldBackgroundColor,
          child: Stack(
            children: [
              ValueListenableBuilder(
                valueListenable: scrollOffset,
                builder: (context, value, child) {
                  final size =
                      selectedHeight * sizeMultiplier(value.abs(), height);
                  return AnimatedPositioned(
                    duration: const Duration(milliseconds: 50),
                    top: height / 2 - size / 2 + value,
                    left:
                        MediaQuery.sizeOf(context).shortestSide / 2 - size / 2,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 50),
                      width: size,
                      height: size,
                      color: Colors.red,
                      child: Text(value.toString()),
                    ),
                  );
                },
              ),

              // top and bottom gradients
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: 200,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Theme.of(context).scaffoldBackgroundColor,
                        Theme.of(context).scaffoldBackgroundColor.withAlpha(0),
                      ],
                      stops: const [120 / 200, 1],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: height - 200,
                left: 0,
                right: 0,
                child: Container(
                  height: 200,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Theme.of(context).scaffoldBackgroundColor,
                        Theme.of(context).scaffoldBackgroundColor.withAlpha(0),
                      ],
                      stops: const [85 / 160, 1],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.paddingOf(context).bottom),
        child: ElevatedButton(
          onPressed: () {},
          child: const Text('Next'),
        ),
      ),
    );
  }
}
