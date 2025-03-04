import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CameraFullscreen extends StatefulWidget {
  final String cameraId;

  const CameraFullscreen({
    Key? key,
    required this.cameraId,
  }) : super(key: key);

  @override
  State<CameraFullscreen> createState() => _CameraFullscreenState();
}

class _CameraFullscreenState extends State<CameraFullscreen> {
  bool isMicActive = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.grey[200],
              ),
              child: const Center(
                child: Icon(
                  Icons.videocam_off_outlined,
                  size: 48,
                  color: Colors.grey,
                ),
              ),
            ),
            Positioned(
              top: 16,
              left: 16,
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            Positioned(
              bottom: 32,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  Text(
                    'Camera ${widget.cameraId}',
                    style: GoogleFonts.lato(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTapDown: (_) => setState(() => isMicActive = true),
                    onTapUp: (_) => setState(() => isMicActive = false),
                    onTapCancel: () => setState(() => isMicActive = false),
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isMicActive ? Colors.red : Colors.white,
                      ),
                      child: Icon(
                        Icons.mic,
                        color: isMicActive ? Colors.white : Colors.black,
                        size: 32,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
