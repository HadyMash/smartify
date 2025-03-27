import 'package:flutter/material.dart';
import 'constants.dart';
import 'add_schedule_screen.dart';
import '../responsive_helper.dart';
import 'initial_schedule_data.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({Key? key}) : super(key: key);

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  String selectedDay = AppConstants.days[0];
  int _colorIndex = 0;

  final Map<String, List<Map<String, dynamic>>> daySchedules =
      Map.fromIterable(
    AppConstants.days,
    key: (day) => day,
    value: (day) => <Map<String, dynamic>>[],
  );

  final ScrollController _verticalTimeController = ScrollController();
  final ScrollController _verticalScheduleController = ScrollController();
  final ScrollController _horizontalScheduleController = ScrollController();

  @override
  void initState() {
    super.initState();

    _verticalScheduleController.addListener(() {
      _verticalTimeController.jumpTo(_verticalScheduleController.offset);
    });

    for (var day in InitialScheduleData.initialSchedules.keys) {
      for (var timeSlot in InitialScheduleData.initialSchedules[day]!.entries) {
        final startTime = timeSlot.key;
        final schedule = timeSlot.value;
        daySchedules[day]!.add({
          'name': schedule['name'],
          'color': schedule['color'],
          'startTime': startTime,
          'stopTime': schedule['stopTime'],
          'devices': schedule['devices'],
        });
      }
    }
  }

  @override
  void dispose() {
    _verticalTimeController.dispose();
    _verticalScheduleController.dispose();
    _horizontalScheduleController.dispose();
    super.dispose();
  }

  Color _getNextColor() {
    Color color = AppConstants.scheduleColors[_colorIndex];
    _colorIndex = (_colorIndex + 1) % AppConstants.scheduleColors.length;
    return color;
  }

  void _navigateToAddSchedule() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddScheduleScreen(
          existingSchedules: Map.fromIterable(
            daySchedules.keys,
            key: (k) => k,
            value: (k) => Map.fromIterable(
              AppConstants.allTimes,
              key: (time) => time,
              value: (time) => <String, dynamic>{},
            ),
          ),
        ),
      ),
    );

    if (result != null && result != 'delete') {
      setState(() {
        for (String day in result['days']) {
          daySchedules[day]!.add({
            'name': result['name'],
            'color': _getNextColor(),
            'startTime': result['startTime'],
            'stopTime': result['stopTime'],
            'devices': result['devices'],
          });
        }
      });
    }
  }

  void _editSchedule(int scheduleIndex) async {
    final schedule = daySchedules[selectedDay]![scheduleIndex];

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddScheduleScreen(
          editMode: true,
          scheduleName: schedule['name'],
          startTime: schedule['startTime'],
          stopTime: schedule['stopTime'],
          scheduleColor: schedule['color'],
          selectedDays: [selectedDay],
          selectedDevices: List<String>.from(schedule['devices'] ?? []),
          existingSchedules: Map.fromIterable(
            daySchedules.keys,
            key: (k) => k,
            value: (k) => Map.fromIterable(
              AppConstants.allTimes,
              key: (time) => time,
              value: (time) => <String, dynamic>{},
            ),
          ),
        ),
      ),
    );

    if (result != null) {
      setState(() {
        if (result == 'delete') {
          daySchedules[selectedDay]!.removeAt(scheduleIndex);
        } else {
          daySchedules[selectedDay]![scheduleIndex] = {
            'name': result['name'],
            'color': schedule['color'],
            'startTime': result['startTime'],
            'stopTime': result['stopTime'],
            'devices': result['devices'],
          };
        }
      });
    }
  }

  int _timeToMinutes(String timeStr) {
    return AppConstants.convertTimeToMinutes(timeStr);
  }

  double _calculateTimePosition(String timeStr) {
    final minutes = _timeToMinutes(timeStr);
    final hour = minutes ~/ 60;
    final minuteInHour = minutes % 60;
    return (hour * ResponsiveHelper.getHourHeight(context)) +
        (ResponsiveHelper.getHourHeight(context) / 2) +
        (minuteInHour * (ResponsiveHelper.getHourHeight(context) / 60));
  }

  double _calculateScheduleHeight(String startTime, String stopTime) {
    final startMinutes = _timeToMinutes(startTime);
    var stopMinutes = _timeToMinutes(stopTime);

    if (stopMinutes < startMinutes) {
      stopMinutes += 24 * 60;
    }

    final durationMinutes = stopMinutes - startMinutes;
    final minuteHeight = ResponsiveHelper.getHourHeight(context) / 60;

    if (durationMinutes <= 60) {
      return ResponsiveHelper.getHourHeight(context) - 5.0;
    }

    var height = durationMinutes * minuteHeight;
    height -= 5.0;
    return height > 0 ? height : minuteHeight;
  }

  bool _schedulesOverlap(Map<String, dynamic> a, Map<String, dynamic> b) {
    final aStart = _timeToMinutes(a['startTime']);
    var aEnd = _timeToMinutes(a['stopTime']);
    if (aEnd < aStart) aEnd += 24 * 60;

    final bStart = _timeToMinutes(b['startTime']);
    var bEnd = _timeToMinutes(b['stopTime']);
    if (bEnd < bStart) bEnd += 24 * 60;

    return (aStart < bEnd && aEnd > bStart);
  }

  List<Map<String, dynamic>> _splitOvernightSchedules(
      List<Map<String, dynamic>> schedules) {
    final List<Map<String, dynamic>> splitSchedules = [];

    for (final schedule in schedules) {
      if (schedule['startTime'] == null || schedule['stopTime'] == null) {
        print('Warning: Skipping schedule with null startTime or stopTime: $schedule');
        continue;
      }

      final startMinutes = _timeToMinutes(schedule['startTime'] as String);
      final stopMinutes = _timeToMinutes(schedule['stopTime'] as String);

      if (stopMinutes < startMinutes) {
        splitSchedules.add({
          'name': schedule['name'] ?? 'Unnamed Schedule',
          'color': schedule['color'] ?? Colors.grey,
          'startTime': schedule['startTime'] as String,
          'stopTime': '12:00am',
          'devices': schedule['devices'] ?? [],
          'originalIndex': daySchedules[selectedDay]!.indexOf(schedule),
        });
        splitSchedules.add({
          'name': schedule['name'] ?? 'Unnamed Schedule',
          'color': schedule['color'] ?? Colors.grey,
          'startTime': '12:00am',
          'stopTime': schedule['stopTime'] as String,
          'devices': schedule['devices'] ?? [],
          'originalIndex': daySchedules[selectedDay]!.indexOf(schedule),
        });
      } else {
        splitSchedules.add({
          ...schedule,
          'name': schedule['name'] ?? 'Unnamed Schedule',
          'color': schedule['color'] ?? Colors.grey,
          'startTime': schedule['startTime'] as String,
          'stopTime': schedule['stopTime'] as String,
          'devices': schedule['devices'] ?? [],
          'originalIndex': daySchedules[selectedDay]!.indexOf(schedule),
        });
      }
    }

    return splitSchedules;
  }

  List<List<Map<String, dynamic>>> _organizeSchedulesIntoColumns(
      List<Map<String, dynamic>> schedules) {
    final splitSchedules = _splitOvernightSchedules(schedules);

    if (splitSchedules.isEmpty) return [];

    final sortedSchedules = List<Map<String, dynamic>>.from(splitSchedules);
    sortedSchedules.sort((a, b) {
      final aTime = _timeToMinutes(a['startTime']);
      final bTime = _timeToMinutes(b['startTime']);
      return aTime.compareTo(bTime);
    });

    final columns = <List<Map<String, dynamic>>>[];

    for (final schedule in sortedSchedules) {
      bool placed = false;

      for (final column in columns) {
        bool canPlace = true;

        for (final existingSchedule in column) {
          if (_schedulesOverlap(schedule, existingSchedule)) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          column.add(schedule);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.add([schedule]);
      }
    }

    return columns;
  }

  @override
  Widget build(BuildContext context) {
    final scheduleColumns = _organizeSchedulesIntoColumns(daySchedules[selectedDay]!);
    final timeSlotWidth = ResponsiveHelper.getTimeSlotWidth(context);
    final scheduleWidth = ResponsiveHelper.getScheduleWidth(context);
    final horizontalGap = ResponsiveHelper.isDesktop(context) ? 20.0 : 15.0;
    final totalWidth = scheduleColumns.length * (scheduleWidth + horizontalGap);
    final minWidth = MediaQuery.of(context).size.width - timeSlotWidth;

    return Scaffold(
      backgroundColor: Colors.white,
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToAddSchedule,
        backgroundColor: Colors.black,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: SafeArea(
        child: ResponsiveHelper.isDesktop(context)
            ? _buildDesktopLayout(
                scheduleColumns, timeSlotWidth, scheduleWidth, horizontalGap, totalWidth, minWidth)
            : _buildMobileLayout(
                scheduleColumns, timeSlotWidth, scheduleWidth, horizontalGap, totalWidth, minWidth),
      ),
    );
  }

  Widget _buildDesktopLayout(
    List<List<Map<String, dynamic>>> scheduleColumns,
    double timeSlotWidth,
    double scheduleWidth,
    double horizontalGap,
    double totalWidth,
    double minWidth,
  ) {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 1400),
        child: Column(
          children: [
            Padding(
              padding: ResponsiveHelper.getScreenPadding(context),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                    iconSize: 28,
                    padding: const EdgeInsets.all(12),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    'Schedules',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                ],
              ),
            ),
            Container(
              height: 70,
              padding: EdgeInsets.symmetric(horizontal: AppConstants.padding),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: AppConstants.days.length,
                itemBuilder: (context, index) {
                  final day = AppConstants.days[index];
                  final isSelected = day == selectedDay;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        selectedDay = day;
                      });
                    },
                    child: Container(
                      width: 100,
                      margin: EdgeInsets.only(right: AppConstants.spacing),
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.black : Colors.white,
                        borderRadius: BorderRadius.circular(AppConstants.borderRadius),
                        border: Border.all(
                          color: isSelected ? Colors.black : Colors.grey[300]!,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          day,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.black,
                            fontWeight: FontWeight.w500,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: timeSlotWidth,
                        child: NotificationListener<ScrollNotification>(
                          onNotification: (ScrollNotification notification) {
                            return true;
                          },
                          child: SingleChildScrollView(
                            controller: _verticalTimeController,
                            physics: const NeverScrollableScrollPhysics(),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: AppConstants.allTimes.map((time) {
                                return Container(
                                  height: ResponsiveHelper.getHourHeight(context),
                                  padding: const EdgeInsets.only(right: 12.0),
                                  alignment: Alignment.centerRight,
                                  child: Text(
                                    time,
                                    softWrap: false,
                                    overflow: TextOverflow.visible,
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey[600],
                                      height: 1.0,
                                      fontFeatures: const [FontFeature.disable('sups')],
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: SingleChildScrollView(
                          controller: _verticalScheduleController,
                          child: SingleChildScrollView(
                            controller: _horizontalScheduleController,
                            scrollDirection: Axis.horizontal,
                            child: Container(
                              width: totalWidth > minWidth ? totalWidth : minWidth,
                              height: ResponsiveHelper.getHourHeight(context) * AppConstants.allTimes.length,
                              child: Stack(
                                children: [
                                  ...scheduleColumns.asMap().entries.map((columnEntry) {
                                    final columnIndex = columnEntry.key;
                                    final column = columnEntry.value;

                                    return Stack(
                                      children: column.asMap().entries.map((scheduleEntry) {
                                        final schedule = scheduleEntry.value;
                                        final originalIndex = schedule['originalIndex'];

                                        final startPosition = _calculateTimePosition(schedule['startTime']);
                                        final height = _calculateScheduleHeight(
                                          schedule['startTime'],
                                          schedule['stopTime'],
                                        );

                                        return Positioned(
                                          top: startPosition + 2,
                                          left: columnIndex * (scheduleWidth + horizontalGap),
                                          width: scheduleWidth,
                                          height: height - 4,
                                          child: GestureDetector(
                                            onTap: () => _editSchedule(originalIndex),
                                            child: Container(
                                              padding: const EdgeInsets.all(16),
                                              decoration: BoxDecoration(
                                                color: schedule['color'],
                                                borderRadius: BorderRadius.circular(AppConstants.borderRadius),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.black.withOpacity(0.05),
                                                    blurRadius: 4,
                                                    offset: const Offset(0, 2),
                                                  ),
                                                ],
                                              ),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    schedule['name'],
                                                    style: TextStyle(
                                                      fontSize: 16,
                                                      fontWeight: FontWeight.w500,
                                                      color: schedule['color'] == Colors.black
                                                          ? Colors.white
                                                          : Colors.black,
                                                    ),
                                                    overflow: TextOverflow.ellipsis,
                                                    maxLines: 1,
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                    );
                                  }),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileLayout(
    List<List<Map<String, dynamic>>> scheduleColumns,
    double timeSlotWidth,
    double scheduleWidth,
    double horizontalGap,
    double totalWidth,
    double minWidth,
  ) {
    return Column(
      children: [
        Padding(
          padding: EdgeInsets.all(AppConstants.padding),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
              SizedBox(width: AppConstants.spacing),
              Text(
                'Schedules',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
        SizedBox(
          height: 60,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: AppConstants.padding),
            itemCount: AppConstants.days.length,
            itemBuilder: (context, index) {
              final day = AppConstants.days[index];
              final isSelected = day == selectedDay;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    selectedDay = day;
                  });
                },
                child: Container(
                  width: 80,
                  margin: EdgeInsets.only(right: AppConstants.spacing),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.black : Colors.white,
                    borderRadius: BorderRadius.circular(AppConstants.borderRadius),
                    border: Border.all(
                      color: isSelected ? Colors.black : Colors.grey[300]!,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      day,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.black,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: timeSlotWidth,
                child: NotificationListener<ScrollNotification>(
                  onNotification: (ScrollNotification notification) {
                    return true;
                  },
                  child: SingleChildScrollView(
                    controller: _verticalTimeController,
                    physics: const NeverScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: AppConstants.allTimes.map((time) {
                        return Container(
                          height: ResponsiveHelper.getHourHeight(context),
                          padding: const EdgeInsets.only(right: 8.0),
                          alignment: Alignment.centerRight,
                          child: Text(
                            time,
                            softWrap: false,
                            overflow: TextOverflow.visible,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                              height: 1.0,
                              fontFeatures: const [FontFeature.disable('sups')],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  controller: _verticalScheduleController,
                  child: SingleChildScrollView(
                    controller: _horizontalScheduleController,
                    scrollDirection: Axis.horizontal,
                    child: Container(
                      width: totalWidth > minWidth ? totalWidth : minWidth,
                      height: ResponsiveHelper.getHourHeight(context) * AppConstants.allTimes.length,
                      child: Stack(
                        children: [
                          ...scheduleColumns.asMap().entries.map((columnEntry) {
                            final columnIndex = columnEntry.key;
                            final column = columnEntry.value;

                            return Stack(
                              children: column.asMap().entries.map((scheduleEntry) {
                                final schedule = scheduleEntry.value;
                                final originalIndex = schedule['originalIndex'];

                                final startPosition = _calculateTimePosition(schedule['startTime']);
                                final height = _calculateScheduleHeight(
                                  schedule['startTime'],
                                  schedule['stopTime'],
                                );

                                return Positioned(
                                  top: startPosition + 2,
                                  left: columnIndex * (scheduleWidth + horizontalGap),
                                  width: scheduleWidth,
                                  height: height - 4,
                                  child: GestureDetector(
                                    onTap: () => _editSchedule(originalIndex),
                                    child: Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: schedule['color'],
                                        borderRadius: BorderRadius.circular(AppConstants.borderRadius),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            schedule['name'],
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w500,
                                              color: schedule['color'] == Colors.black
                                                  ? Colors.white
                                                  : Colors.black,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                            maxLines: 1,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}