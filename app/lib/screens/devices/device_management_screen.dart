import 'package:flutter/material.dart';
import '../models/device_capability.dart';
import '../models/device_info.dart';
import 'widgets/device_components.dart';
import '../responsive_helper.dart';

class DeviceManagementScreen extends StatefulWidget {
  final DeviceInfo device;
  final String room;
  final List<DeviceCapability> capabilities;

  const DeviceManagementScreen({
    Key? key,
    required this.device,
    required this.room,
    required this.capabilities,
  }) : super(key: key);

  @override
  State<DeviceManagementScreen> createState() => _DeviceManagementScreenState();
}

class _DeviceManagementScreenState extends State<DeviceManagementScreen> {
  late Map<String, dynamic> deviceState;

  @override
  void initState() {
    super.initState();
    deviceState = {
      for (var capability in widget.capabilities)
        capability.id: capability.value
    };
  }

  void updateCapabilityValue(String id, dynamic value) {
    setState(() {
      deviceState[id] = value;
    });
    print('Updated $id to $value');
  }

  Widget buildCapabilityControl(DeviceCapability capability, bool isDesktop) {
    final config = capability.config;
    double controlWidth;
    if (isDesktop) {
      switch (capability.type) {
        case CapabilityType.range:
        case CapabilityType.mode:
          controlWidth = 400.0; // Wider for sliders and dropdowns
          break;
        case CapabilityType.toggle:
          controlWidth = 250.0; // Narrower for toggles
          break;
        default:
          controlWidth = 300.0;
      }
    } else {
      controlWidth = double.infinity;
    }

    return Container(
      width: controlWidth,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: _buildControlWidget(capability, config, controlWidth),
      ),
    );
  }

  Widget _buildControlWidget(DeviceCapability capability, Map<String, dynamic>? config, double controlWidth) {
    switch (capability.type) {
      case CapabilityType.toggle:
        return DeviceComponents.buildSwitch(
          value: deviceState[capability.id] as bool,
          onChanged: (value) => updateCapabilityValue(capability.id, value),
          label: capability.name,
        );

      case CapabilityType.range:
        return DeviceComponents.buildRangeSlider(
          value: deviceState[capability.id] as double,
          min: config?['min'] ?? 0.0,
          max: config?['max'] ?? 100.0,
          onChanged: (value) => updateCapabilityValue(capability.id, value),
          label: capability.name,
          unit: config?['unit'],
        );

      case CapabilityType.mode:
        return DeviceComponents.buildModeSelector(
          selectedMode: deviceState[capability.id] as String,
          modes: (config?['modes'] as List<dynamic>?)?.cast<String>() ?? [],
          onModeChanged: (value) => updateCapabilityValue(capability.id, value),
          icons: (config?['icons'] as List<dynamic>?)?.cast<IconData>(),
          label: capability.name,
        );

      case CapabilityType.action:
        return DeviceComponents.buildActionButton(
          label: capability.name,
          onPressed: () => updateCapabilityValue(capability.id, null),
          icon: config?['icon'] as IconData?,
        );

      case CapabilityType.value:
        return DeviceComponents.buildValueDisplay(
          value: deviceState[capability.id].toString(),
          label: capability.name,
          icon: config?['icon'] as IconData?,
        );

      case CapabilityType.number:
        return TextField(
          controller: TextEditingController(text: deviceState[capability.id].toString()),
          keyboardType: TextInputType.number,
          onChanged: (val) => updateCapabilityValue(capability.id, num.tryParse(val) ?? deviceState[capability.id]),
          decoration: InputDecoration(
            labelText: capability.name,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );

      case CapabilityType.multiswitch:
        final values = deviceState[capability.id] as List<bool>? ?? [false];
        final options = (config?['options'] as List<dynamic>?)?.cast<String>() ?? [];
        return Column(
          children: List.generate(values.length, (index) => DeviceComponents.buildSwitch(
            value: values[index],
            onChanged: (value) {
              values[index] = value;
              updateCapabilityValue(capability.id, values);
            },
            label: options.length > index ? options[index] : '${capability.name} $index',
          )),
        );

      case CapabilityType.multimode:
        final values = deviceState[capability.id] as List<String>? ?? [''];
        final modesList = (config?['modes'] as List<dynamic>?)?.cast<List<String>>() ?? [];
        return Column(
          children: List.generate(values.length, (index) => DeviceComponents.buildModeSelector(
            selectedMode: values[index],
            modes: modesList.isNotEmpty && modesList.length > index ? modesList[index] : [],
            onModeChanged: (value) {
              values[index] = value;
              updateCapabilityValue(capability.id, values);
            },
            label: '${capability.name} $index',
          )),
        );

      case CapabilityType.multirange:
        final values = deviceState[capability.id] as List<double>? ?? [0.0];
        final mins = (config?['mins'] as List<dynamic>?)?.cast<double>() ?? [0.0];
        final maxs = (config?['maxs'] as List<dynamic>?)?.cast<double>() ?? [100.0];
        return Column(
          children: List.generate(values.length, (index) => DeviceComponents.buildRangeSlider(
            value: values[index],
            min: mins.length > index ? mins[index] : 0.0,
            max: maxs.length > index ? maxs[index] : 100.0,
            onChanged: (value) {
              values[index] = value;
              updateCapabilityValue(capability.id, values);
            },
            label: '${capability.name} $index',
            unit: config?['unit'],
          )),
        );

      case CapabilityType.multinumber:
        final values = deviceState[capability.id] as List<num>? ?? [0];
        return Column(
          children: List.generate(values.length, (index) => TextField(
            controller: TextEditingController(text: values[index].toString()),
            keyboardType: TextInputType.number,
            onChanged: (val) {
              values[index] = num.tryParse(val) ?? values[index];
              updateCapabilityValue(capability.id, values);
            },
            decoration: InputDecoration(
              labelText: '${capability.name} $index',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          )),
        );

      case CapabilityType.multivalue:
        final values = deviceState[capability.id] as List<String>? ?? [''];
        return Column(
          children: List.generate(values.length, (index) => DeviceComponents.buildValueDisplay(
            value: values[index],
            label: '${capability.name} $index',
          )),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Scaffold(
      appBar: isDesktop ? null : AppBar(
        title: Text(widget.device.name),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: isDesktop 
          ? _buildDesktopLayout(context)
          : _buildMobileLayout(context),
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: Colors.grey.shade200),
              ),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.black),
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(width: 16),
                Text(
                  widget.device.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          
          // Device content
          Expanded(
            child: SingleChildScrollView(
              padding: ResponsiveHelper.getScreenPadding(context),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 1400),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Device Header with Power Button
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Icon(
                                widget.device.icon,
                                size: 64,
                                color: widget.device.color,
                              ),
                              const SizedBox(width: 24),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.device.name,
                                    style: const TextStyle(
                                      fontSize: 32,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    widget.room,
                                    style: TextStyle(
                                      fontSize: 20,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        // Power button in top right
                        _buildPowerButton(),
                      ],
                    ),
                    SizedBox(height: ResponsiveHelper.getSpacing(context, 48.0)),

                    // Controls layout
                    _buildControlsLayout(context),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPowerButton() {
    final powerCapability = widget.capabilities.firstWhere(
      (cap) => cap.type == CapabilityType.toggle && cap.name.toLowerCase().contains('power'),
      orElse: () => widget.capabilities.firstWhere(
        (cap) => cap.type == CapabilityType.toggle,
        orElse: () => DeviceCapability(id: 'power', name: 'Power', type: CapabilityType.toggle, value: false),
      ),
    );

    return Card(
      elevation: 4,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SizedBox(
          width: 200,
          child: buildCapabilityControl(powerCapability, true),
        ),
      ),
    );
  }

  Widget _buildControlsLayout(BuildContext context) {
    final nonPowerCapabilities = widget.capabilities.where((cap) {
      final isPower = cap.type == CapabilityType.toggle && 
                     cap.name.toLowerCase().contains('power');
      return !isPower;
    }).toList();

    final sliders = nonPowerCapabilities.where((cap) => 
      cap.type == CapabilityType.range || 
      cap.type == CapabilityType.multirange
    ).toList();

    final otherControls = nonPowerCapabilities.where((cap) => 
      cap.type != CapabilityType.range && 
      cap.type != CapabilityType.multirange
    ).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sliders - Full width
        if (sliders.isNotEmpty) ...[
          ...sliders.map((capability) => Padding(
            padding: const EdgeInsets.only(bottom: 24.0),
            child: Card(
              elevation: 4,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.grey.shade200, width: 1),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: buildCapabilityControl(capability, true),
              ),
            ),
          )),
          const SizedBox(height: 24),
        ],

        // Other controls - Grid layout
        if (otherControls.isNotEmpty)
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: MediaQuery.of(context).size.width >= 1400 ? 3 : 2,
            crossAxisSpacing: 24,
            mainAxisSpacing: 24,
            childAspectRatio: 2,
            children: otherControls.map((capability) => Card(
              elevation: 4,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.grey.shade200, width: 1),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: buildCapabilityControl(capability, true),
              ),
            )).toList(),
          ),
      ],
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  widget.device.icon,
                  size: 48,
                  color: widget.device.color,
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.device.name,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      widget.room,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 32),
            ...widget.capabilities.map((capability) => Padding(
                  padding: const EdgeInsets.only(bottom: 24.0),
                  child: buildCapabilityControl(capability, false),
                )),
          ],
        ),
      ),
    );
  }
}