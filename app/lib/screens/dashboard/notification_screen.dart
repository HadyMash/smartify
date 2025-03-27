import 'package:flutter/material.dart';
import '../responsive_helper.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({Key? key}) : super(key: key);

  Widget _buildNotificationCard(String time, String message, bool isDesktop) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: EdgeInsets.all(isDesktop ? 20 : 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            time,
            style: TextStyle(
              fontSize: isDesktop ? 16 : 14,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: isDesktop ? 12 : 8),
          Text(
            message,
            style: TextStyle(
              fontSize: isDesktop ? 18 : 16,
              color: Colors.black,
              fontWeight: FontWeight.w500,
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
      backgroundColor: Colors.white,
      appBar: isDesktop ? null : AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Notifications',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: isDesktop ? _buildDesktopLayout(context) : _buildMobileLayout(context),
      ),
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
                  'Notifications',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          
          // Notifications list
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Today',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildNotificationCard('5:45PM',
                      'Garage door left open for 10 minutes. Would you like to close it?', true),
                  _buildNotificationCard('5:36PM',
                      'Living room temperature is high. Would you like to adjust the thermostat?', true),
                  _buildNotificationCard(
                      '5:15PM', 'Lights left on in the bedroom. Turn off?', true),
                  _buildNotificationCard('4:30PM',
                      'Motion detected in the backyard. View live camera feed?', true),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Today',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 16),
          _buildNotificationCard('5:45PM',
              'Garage door left open for 10 minutes. Would you like to close it?', false),
          _buildNotificationCard('5:36PM',
              'Living room temperature is high. Would you like to adjust the thermostat?', false),
          _buildNotificationCard(
              '5:15PM', 'Lights left on in the bedroom. Turn off?', false),
          _buildNotificationCard('4:30PM',
              'Motion detected in the backyard. View live camera feed?', false),
        ],
      ),
    );
  }
}