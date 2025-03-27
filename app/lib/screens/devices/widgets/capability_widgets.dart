import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'device_components.dart';

class CapabilityWidgets {
  // Value Widget (Read-only)
  static Widget buildReadOnlyValue({
    required String value,
    String? label,
  }) {
    return DeviceComponents.buildValueDisplay(
      value: value,
      label: label,
    );
  }

  // Value Widget (Editable)
  static Widget buildEditableValue({
    required String value,
    required Function(String) onChanged,
    String? label,
  }) {
    return TextField(
      controller: TextEditingController(text: value),
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  // Switch Widget (Read-only)
  static Widget buildReadOnlySwitch({
    required bool value,
    String? label,
  }) {
    return DeviceComponents.buildValueDisplay(
      value: value ? "ON" : "OFF",
      label: label,
      icon: value ? Icons.toggle_on : Icons.toggle_off,
    );
  }

  // Switch Widget (Editable)
  static Widget buildEditableSwitch({
    required bool value,
    required Function(bool) onChanged,
    String? label,
  }) {
    return DeviceComponents.buildSwitch(
      value: value,
      onChanged: onChanged,
      label: label,
    );
  }

  // Range Widget (Read-only)
  static Widget buildReadOnlyRange({
    required double value,
    String? label,
    String? unit,
  }) {
    return DeviceComponents.buildValueDisplay(
      value: unit != null ? "$value$unit" : value.toString(),
      label: label,
    );
  }

  // Range Widget (Editable)
  static Widget buildEditableRange({
    required double value,
    required double min,
    required double max,
    required Function(double) onChanged,
    String? label,
    String? unit,
  }) {
    return DeviceComponents.buildRangeSlider(
      value: value,
      min: min,
      max: max,
      onChanged: onChanged,
      label: label,
      unit: unit,
    );
  }

  // Number Widget (Read-only)
  static Widget buildReadOnlyNumber({
    required num value,
    String? label,
  }) {
    return DeviceComponents.buildValueDisplay(
      value: value.toString(),
      label: label,
    );
  }

  // Number Widget (Editable)
  static Widget buildEditableNumber({
    required num value,
    required Function(num) onChanged,
    String? label,
  }) {
    return TextField(
      controller: TextEditingController(text: value.toString()),
      keyboardType: TextInputType.number,
      onChanged: (val) => onChanged(num.tryParse(val) ?? value),
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  // Mode Widget (Read-only)
  static Widget buildReadOnlyMode({
    required String value,
    String? label,
  }) {
    return DeviceComponents.buildValueDisplay(
      value: value,
      label: label,
      icon: Icons.mode,
    );
  }

  // Mode Widget (Editable)
  static Widget buildEditableMode({
    required String selectedMode,
    required List<String> modes,
    required Function(String) onChanged,
    String? label,
  }) {
    return DeviceComponents.buildModeSelector(
      selectedMode: selectedMode,
      modes: modes,
      onModeChanged: onChanged,
      label: label,
    );
  }

  // Date Widget (Read-only)
  static Widget buildReadOnlyDate({
    required String date,
    String? label,
  }) {
    return DeviceComponents.buildValueDisplay(
      value: date,
      label: label,
      icon: Icons.calendar_today,
    );
  }

  // Date Widget (Editable)
  static Widget buildEditableDate({
    required DateTime date,
    required Function(DateTime) onChanged,
    String? label,
    required BuildContext context,
  }) {
    return InkWell(
      onTap: () async {
        final DateTime? picked = await showDatePicker(
          context: context,
          initialDate: date,
          firstDate: DateTime(2000),
          lastDate: DateTime(2100),
        );
        if (picked != null) onChanged(picked);
      },
      child: DeviceComponents.buildValueDisplay(
        value: date.toString().split(' ')[0],
        label: label,
        icon: Icons.calendar_today,
      ),
    );
  }

  // Image Widget (Read-only)
  static Widget buildReadOnlyImage({
    required Uint8List imageBytes,
    String? label,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null)
          Text(
            label,
            style: const TextStyle(fontSize: 16, color: Colors.grey),
          ),
        const SizedBox(height: 8),
        Image.memory(
          imageBytes,
          fit: BoxFit.cover,
        ),
      ],
    );
  }

  // Action Widget
  static Widget buildActionWidget({
    required String label,
    required VoidCallback onPressed,
    IconData? icon,
    Map<String, dynamic>? arguments,
  }) {
    return DeviceComponents.buildActionButton(
      label: label,
      onPressed: onPressed,
      icon: icon ?? Icons.play_arrow,
    );
  }

  // Multi-Switch Widget (Read-only)
  static Widget buildReadOnlyMultiSwitch({
    required List<bool> values,
    required List<String> labels,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildReadOnlySwitch(
          value: values[index],
          label: labels[index],
        ),
      ),
    );
  }

  // Multi-Switch Widget (Editable)
  static Widget buildEditableMultiSwitch({
    required List<bool> values,
    required List<String> labels,
    required Function(int, bool) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildEditableSwitch(
          value: values[index],
          label: labels[index],
          onChanged: (value) => onChanged(index, value),
        ),
      ),
    );
  }

  // Multi-Mode Widget (Read-only)
  static Widget buildReadOnlyMultiMode({
    required List<String> values,
    required List<String> labels,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildReadOnlyMode(
          value: values[index],
          label: labels[index],
        ),
      ),
    );
  }

  // Multi-Mode Widget (Editable)
  static Widget buildEditableMultiMode({
    required List<String> selectedModes,
    required List<List<String>> availableModes,
    required List<String> labels,
    required Function(int, String) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        selectedModes.length,
        (index) => buildEditableMode(
          selectedMode: selectedModes[index],
          modes: availableModes[index],
          label: labels[index],
          onChanged: (value) => onChanged(index, value),
        ),
      ),
    );
  }

  // Multi-Range Widget (Read-only)
  static Widget buildReadOnlyMultiRange({
    required List<double> values,
    required List<String> labels,
    List<String>? units,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildReadOnlyRange(
          value: values[index],
          label: labels[index],
          unit: units != null && units.length > index ? units[index] : null,
        ),
      ),
    );
  }

  // Multi-Range Widget (Editable)
  static Widget buildEditableMultiRange({
    required List<double> values,
    required List<double> mins,
    required List<double> maxs,
    required List<String> labels,
    required Function(int, double) onChanged,
    List<String>? units,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildEditableRange(
          value: values[index],
          min: mins[index],
          max: maxs[index],
          label: labels[index],
          unit: units != null && units.length > index ? units[index] : null,
          onChanged: (value) => onChanged(index, value),
        ),
      ),
    );
  }

  // Multi-Number Widget (Read-only)
  static Widget buildReadOnlyMultiNumber({
    required List<num> values,
    required List<String> labels,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildReadOnlyNumber(
          value: values[index],
          label: labels[index],
        ),
      ),
    );
  }

  // Multi-Number Widget (Editable)
  static Widget buildEditableMultiNumber({
    required List<num> values,
    required List<String> labels,
    required Function(int, num) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildEditableNumber(
          value: values[index],
          label: labels[index],
          onChanged: (value) => onChanged(index, value),
        ),
      ),
    );
  }

  // Multi-Value Widget (Read-only)
  static Widget buildReadOnlyMultiValue({
    required List<String> values,
    required List<String> labels,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildReadOnlyValue(
          value: values[index],
          label: labels[index],
        ),
      ),
    );
  }

  // Multi-Value Widget (Editable)
  static Widget buildEditableMultiValue({
    required List<String> values,
    required List<String> labels,
    required Function(int, String) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(
        values.length,
        (index) => buildEditableValue(
          value: values[index],
          label: labels[index],
          onChanged: (value) => onChanged(index, value),
        ),
      ),
    );
  }
}