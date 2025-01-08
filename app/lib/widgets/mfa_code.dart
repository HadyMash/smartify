import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:smartify/services/mfa.dart';

// TODO: update style (this is just a placeholder for testing)
class MFASetup extends StatelessWidget {
  final MFAFormattedKey mfaSetup;

  const MFASetup({super.key, required this.mfaSetup});

  @override
  Widget build(BuildContext context) {
    // get max dimension and set it to the width and height
    final double maxDimension = MediaQuery.of(context).size.shortestSide * 0.85;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: maxDimension,
          height: maxDimension,
          child: QrImageView(
            data: mfaSetup.qrCodeUri,
            version: QrVersions.auto,
            size: maxDimension,
          ),
        ),
        const SizedBox(height: 20),
        Container(
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.all(8),
          width: double.infinity,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              //Flex(
              //  direction: Axis.horizontal,
              //  children: [
              Text(mfaSetup.formattedKey),
              //  ],
              //),
              IconButton(
                onPressed: () async {
                  // copy key to clipboard
                  await Clipboard.setData(
                      ClipboardData(text: mfaSetup.formattedKey));
                },
                icon: const Icon(Icons.copy),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
