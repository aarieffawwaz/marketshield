import 'package:flutter_test/flutter_test.dart';
import 'package:marketshield/core.dart';

void main() {
  test('rupiah formatting', () {
    expect(rp(150000), 'Rp150.000');
    expect(rp(7000), 'Rp7.000');
  });
}
