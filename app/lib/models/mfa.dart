class MFAFormattedKey {
  final String _formattedKey;
  final String _qrCodeUri;
  MFAFormattedKey(this._formattedKey, this._qrCodeUri);

  // from json
  MFAFormattedKey.fromJson(Map<String, dynamic> json)
      : _formattedKey = json['formattedKey'],
        _qrCodeUri = json['uri'];

  String get formattedKey => _formattedKey;
  String get qrCodeUri => _qrCodeUri;
}
