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

class _ConfigureFloorsScreenState extends State<ConfigureFloorsScreen>
    with TickerProviderStateMixin {
  static const double minSizeMultiplier = 0.4;
  static const double maxMomentumDuration = 1.5; // maximum seconds for momentum
  static const double minMomentumDuration = 0.3; // minimum seconds for momentum
  static const double velocityMultiplier =
      0.0008; // adjusts velocity to duration

  late double selectedHeight;
  late AnimationController _snapController;
  late AnimationController _momentumController;
  double? _lastVelocity;

  final List<_FloorData> _floors = [];

  double sizeMultiplier(double distanceFromCenter, double height) {
    return lerpDouble(1, minSizeMultiplier,
        max(0, min(1, distanceFromCenter / (height / 2))))!;
  }

  @override
  void initState() {
    super.initState();
    _snapController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _momentumController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: (minMomentumDuration * 1000).toInt()),
    );

    _momentumController.addListener(_handleMomentumScroll);
  }

  @override
  void dispose() {
    _snapController.dispose();
    _momentumController.dispose();
    super.dispose();
  }

  void _handleMomentumScroll() {
    if (_lastVelocity == null) return;

    final double progress = _momentumController.value;
    // Apply easing to the velocity
    final double currentVelocity = _lastVelocity! * (1 - progress);

    setState(() {
      for (var item in _floors) {
        item.position += currentVelocity * (1 / 60); // Assuming 60fps
      }

      // Check for new floors needed during momentum scroll
      if (_floors.first.position > 150) {
        _addItemToTop();
      }
      if (_floors.last.position < MediaQuery.sizeOf(context).height - 200) {
        _addItemToBottom();
      }
      _removeOffscreenWidgets();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // set the selected height to 20% of the smallest device axis
    selectedHeight = MediaQuery.sizeOf(context).shortestSide * 0.4;

    // TODO: dynamically calculate number of floors to show based on height
    _initialiseFloors(5, MediaQuery.sizeOf(context).height);
  }

  void _initialiseFloors(int visibleFloors, double screenHeight) {
    if (_floors.isNotEmpty) return;
    // get nearest odd number
    final nearestOdd = visibleFloors.isEven ? visibleFloors + 1 : visibleFloors;

    // make list so that it's -N, -N+1, ..., G, 1, 2, ..., N

    // add positive floors
    _floors.addAll(List.generate(
      (nearestOdd - 1) ~/ 2,
      (index) {
        final int floor = ((nearestOdd - 1) ~/ 2 - index);
        return _FloorData(
          floor,
          (screenHeight / 2) - selectedHeight * floor,
        );
      },
    ));

    for (var i = 0; i < (nearestOdd - 1) ~/ 2; i++) {
      final int floor = ((nearestOdd - 1) ~/ 2 - i);
      print((screenHeight / 2) - selectedHeight * floor);
    }

    // add ground floor
    _floors.add(_FloorData(0, screenHeight / 2));

    // add basement floors
    _floors.addAll(List.generate(
      (nearestOdd - 1) ~/ 2,
      (index) {
        final int floor = index + 1;
        return _FloorData(
          -floor,
          (screenHeight / 2) + selectedHeight * (index + 1),
        );
      },
    ));

    for (var floor in _floors) {
      print(floor);
    }
  }

  void _snapToCenter() {
    if (_floors.isEmpty) return;

    final screenCenter = MediaQuery.sizeOf(context).height / 2;

    // Find the floor closest to center
    int closestIndex = 0;
    double smallestDistance = double.infinity;

    for (int i = 0; i < _floors.length; i++) {
      final distance = (_floors[i].position - screenCenter).abs();
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = i;
      }
    }

    //_selectedFloorIndex = closestIndex;

    // Store initial positions
    final initialPositions = Map.fromEntries(
        _floors.map((floor) => MapEntry(floor, floor.position)));

    final targetCenter = screenCenter;
    final startingPosition = _floors[closestIndex].position;
    final totalOffset = targetCenter - startingPosition;

    // Create and configure animation
    final Animation<double> animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _snapController,
      curve: Curves.easeOutCubic,
    ));

    animation.addListener(() {
      setState(() {
        for (var floor in _floors) {
          floor.position =
              initialPositions[floor]! + (totalOffset * animation.value);
        }
      });
    });

    _snapController.forward(from: 0);
  }

  void _handleScroll(DragUpdateDetails details) {
    _snapController.stop();
    _momentumController.stop();
    setState(() {
      //_scrollPosition += details.primaryDelta!;

      for (var item in _floors) {
        item.position += details.primaryDelta!;
      }

      // check if items need to be added to the top
      print(_floors.first.position);
      if (_floors.first.position > 150) {
        _addItemToTop();
      }

      // check if items need to be added to the bottom
      if (_floors.last.position < MediaQuery.sizeOf(context).height - 200) {
        _addItemToBottom();
      }

      _removeOffscreenWidgets();
    });
  }

  void _addItemToBottom() {
    if (_floors.isEmpty) return;

    final lastItem = _floors.last;
    final newFloor =
        _FloorData(lastItem.floor - 1, lastItem.position + selectedHeight);

    _floors.add(newFloor);
  }

  void _addItemToTop() {
    if (_floors.isEmpty) return;

    final firstItem = _floors.first;
    final newFloor =
        _FloorData(firstItem.floor + 1, firstItem.position - selectedHeight);

    //_floors.add(newFloor);
    _floors.insert(0, newFloor);
  }

  void _removeOffscreenWidgets() {
    _floors.removeWhere((floor) =>
        floor.position < -selectedHeight ||
        floor.position > MediaQuery.sizeOf(context).height + selectedHeight);
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
        onVerticalDragStart: (_) {
          _snapController.stop();
        },
        onVerticalDragUpdate: _handleScroll,
        onVerticalDragEnd: (details) {
          _lastVelocity = details.primaryVelocity;
          if (_lastVelocity != null && _lastVelocity!.abs() > 100) {
            // Calculate duration based on velocity
            final velocityDuration = (_lastVelocity!.abs() * velocityMultiplier)
                .clamp(minMomentumDuration, maxMomentumDuration);

            // Update momentum controller duration
            _momentumController.duration = Duration(
              milliseconds: (velocityDuration * 1000).toInt(),
            );

            // Apply momentum
            _momentumController.forward(from: 0).then((_) {
              _snapToCenter(); // Snap after momentum settles
            });
          } else {
            // If velocity is low, snap immediately
            _snapToCenter();
          }
        },
        child: Container(
          height: double.infinity,
          width: double.infinity,
          color: Theme.of(context).scaffoldBackgroundColor,
          child: Stack(
            children: [
              ..._floors.map((floor) {
                //final size = selectedHeight *
                //    sizeMultiplier(floor.position.abs(), height);

                final size = selectedHeight;

                //final isSelected = _selectedFloorIndex != null &&
                //    _floors.indexOf(floor) == _selectedFloorIndex;
                return AnimatedPositioned(
                  duration: const Duration(milliseconds: 100),
                  curve: Curves.easeOutCubic,
                  key: ValueKey(floor.floor),
                  top: floor.position - size / 2,
                  left: MediaQuery.sizeOf(context).shortestSide / 2 - size / 2,
                  child: TweenAnimationBuilder(
                    duration: const Duration(milliseconds: 100),
                    curve: Curves.easeOutCubic,
                    tween: Tween<double>(
                      begin: sizeMultiplier(
                          ((height / 2) - floor.position).abs(), height),
                      end: sizeMultiplier(
                          ((height / 2) - floor.position).abs(), height),
                    ),
                    builder: (context, double scale, child) {
                      return Transform.scale(
                        scale: scale,
                        child: child!,
                      );
                    },
                    child: _Floor(size: size, floor: floor.floor),
                  ),
                );
              }),

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

class _FloorData {
  int floor;
  double position;

  _FloorData(this.floor, this.position);

  @override
  String toString() {
    return 'Floor: $floor, Position: $position';
  }
}

class _Floor extends StatelessWidget {
  const _Floor({
    required this.size,
    required this.floor,
  });

  final double size;
  final int floor;

  @override
  Widget build(BuildContext context) {
    return Container(
      //duration: const Duration(milliseconds: 50),
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.red,
        borderRadius: BorderRadius.circular(8),
      ),
      child: FittedBox(
        fit: BoxFit.contain,
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Text(
            floor == 0 ? 'G' : '${floor < 0 ? 'B' : 'L'}${floor.abs()}',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
