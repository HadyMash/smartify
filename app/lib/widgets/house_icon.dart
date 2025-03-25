import 'package:flutter/material.dart';

class HouseIcon extends StatelessWidget {
  final double size; // Customizable size
  final Color? backgroundColor;
  final Color? iconColor;

  const HouseIcon({
    super.key,
    this.size = 80, // Default size
    this.backgroundColor,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor ?? theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Icon(
        Icons.home_outlined,
        size: size * 0.5, // Adjust size proportionally
        color: iconColor ?? theme.colorScheme.onSurface,
      ),
    );
  }
}
