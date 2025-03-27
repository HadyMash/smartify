enum Sex {
  male,
  female,
}

class User {
  final String id;
  final String email;
  final DateTime? dob;
  final Sex? sex;

  User(this.id, this.email, {this.dob, this.sex});

  User.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        email = json['email'],
        dob = json['dob'] != null ? DateTime.parse(json['dob']) : null,
        sex = Sex.male; // TODO: check if 'm' or 'f'

  // convert to json
  Map<String, String?> toJson() {
    return <String, String?>{
      'id': id,
      'email': email,
      'dob': dob?.toIso8601String(),
      'sex': sex == Sex.male ? 'm' : 'f',
    };
  }
}
