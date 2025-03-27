import 'package:flutter/material.dart';
import 'add_routine_screen.dart';
import '../responsive_helper.dart';
import 'routine_config.dart';

class RoutinesScreen extends StatefulWidget {
  const RoutinesScreen({Key? key}) : super(key: key);

  @override
  State<RoutinesScreen> createState() => _RoutinesScreenState();
}

class _RoutinesScreenState extends State<RoutinesScreen> {
  late List<Map<String, dynamic>> routines;
  final RoutineConfig config = RoutineConfig();

  @override
  void initState() {
    super.initState();
    routines = List.from(config.defaultRoutines);
  }

  void _deleteRoutine(int index) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(config.deleteTitle),
          content: Text(config.deleteMessage),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(config.cancelButton),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  routines.removeAt(index);
                });
                Navigator.pop(context);
              },
              child: Text(
                config.deleteButton,
                style: TextStyle(color: config.deleteButtonColor),
              ),
            ),
          ],
        );
      },
    );
  }

  void _toggleRoutine(int index) {
    setState(() {
      routines[index]['isActive'] = !routines[index]['isActive'];
    });
  }

  void _addNewRoutine(Map<String, dynamic> newRoutine) {
    setState(() {
      newRoutine['isActive'] = false;
      routines.add(newRoutine);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = ResponsiveHelper.isDesktop(context);
    
    return Scaffold(
      backgroundColor: config.backgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.all(config.getPadding(isDesktop)),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(config.backIcon),
                    onPressed: () => Navigator.pop(context),
                  ),
                  SizedBox(width: config.getSpacing(isDesktop) / 2),
                  Text(
                    config.title,
                    style: TextStyle(
                      fontSize: config.getTitleSize(isDesktop),
                      fontWeight: FontWeight.bold,
                      color: config.textColor,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(config.getPadding(isDesktop)),
                child: isDesktop
                    ? GridView.builder(
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: MediaQuery.of(context).size.width > 1400 
                              ? config.desktopGridCrossAxisCount + 1 
                              : config.desktopGridCrossAxisCount,
                          childAspectRatio: config.desktopGridChildAspectRatio,
                          crossAxisSpacing: config.desktopGridSpacing,
                          mainAxisSpacing: config.desktopGridSpacing,
                        ),
                        itemCount: routines.length,
                        itemBuilder: (context, index) {
                          return _buildRoutineCard(
                            name: routines[index]['name'],
                            icon: routines[index]['icon'],
                            isActive: routines[index]['isActive'],
                            index: index,
                            isDesktop: true,
                          );
                        },
                      )
                    : ListView.builder(
                        itemCount: routines.length,
                        itemBuilder: (context, index) {
                          return _buildRoutineCard(
                            name: routines[index]['name'],
                            icon: routines[index]['icon'],
                            isActive: routines[index]['isActive'],
                            index: index,
                            isDesktop: false,
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const AddRoutineScreen(),
            ),
          );
          if (result != null) {
            _addNewRoutine(result);
          }
        },
        backgroundColor: config.fabColor,
        child: Icon(config.addIcon, color: config.fabIconColor),
      ),
    );
  }

  Widget _buildRoutineCard({
    required String name,
    required IconData icon,
    required bool isActive,
    required int index,
    required bool isDesktop,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: isDesktop ? 0 : config.getSpacing(isDesktop)),
      padding: EdgeInsets.all(config.getCardPadding(isDesktop)),
      decoration: BoxDecoration(
        color: config.backgroundColor,
        borderRadius: BorderRadius.circular(config.getBorderRadius(isDesktop)),
        border: Border.all(color: config.borderColor),
        boxShadow: [
          BoxShadow(
            color: config.shadowColor,
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: config.getIconSize(isDesktop), color: config.textColor),
              SizedBox(width: isDesktop ? 20 : 16),
              Expanded(
                child: Text(
                  name,
                  style: TextStyle(
                    fontSize: config.getTextSize(isDesktop),
                    fontWeight: FontWeight.w500,
                    color: config.textColor,
                  ),
                ),
              ),
              Switch(
                value: isActive,
                onChanged: (value) => _toggleRoutine(index),
                activeColor: config.activeSwitchColor,
                inactiveThumbColor: config.inactiveSwitchColor,
              ),
            ],
          ),
          SizedBox(height: isDesktop ? 16 : 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              IconButton(
                icon: Icon(
                  config.editIcon,
                  color: config.editIconColor,
                  size: config.getIconSize(isDesktop) * 0.67,
                ),
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AddRoutineScreen(
                        routineName: routines[index]['name'],
                        routineIcon: routines[index]['icon'],
                      ),
                    ),
                  );
                  if (result != null) {
                    setState(() {
                      routines[index] = {
                        ...result,
                        'isActive': routines[index]['isActive'],
                      };
                    });
                  }
                },
              ),
              IconButton(
                icon: Icon(
                  config.deleteIcon,
                  color: config.deleteIconColor,
                  size: config.getIconSize(isDesktop) * 0.67,
                ),
                onPressed: () => _deleteRoutine(index),
              ),
            ],
          ),
        ],
      ),
    );
  }
}