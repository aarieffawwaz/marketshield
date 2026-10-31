import 'package:flutter_test/flutter_test.dart';
import 'package:marketshield/core.dart';
import 'package:marketshield/data/mappers.dart';

void main() {
  test('slugId', () {
    expect(slugId('Balai Desa Sumbermujur'), 'balai-desa-sumbermujur');
    expect(slugId("Children's masks"), 'children-s-masks');
    expect(slugId('Surgical masks (50)'), 'surgical-masks-50');
    expect(slugId('Café  Ünïcode!'), 'cafe-unicode');
  });

  test('bi keeps bundled Indonesian, falls back to API text', () {
    expect(bi('Clean water').id, 'Air Bersih');
    expect(bi('Eye drops').id, isNot('Eye drops'));
    expect(bi('Something new').id, 'Something new');
    expect(biList('-'), isEmpty);
    expect(biList('Food, water, first aid').map((l) => l.id), ['Makanan', 'Air', 'P3K']);
  });

  test('parse posko', () {
    final list = parsePosko({
      'source': 'firestore',
      'data': [
        {'id': 'sdn-penanggal-02', 'name': 'SDN Penanggal 02', 'kind': 'Shelter', 'status': 'full', 'capacity': 260, 'filled': 260, 'has': 'Mats, food', 'needs': 'Eye drops, baby food', 'updated_at': '2026-10-31T15:29:18.046Z'},
        {'id': 'posko-pronojiwo', 'name': 'Posko Pronojiwo', 'kind': 'Aid post', 'status': 'closed', 'capacity': 300, 'filled': 0, 'has': '-', 'needs': 'Moved to Sumbermujur', 'updated_at': '2026-10-31T15:29:18.046Z'},
      ],
    });
    expect(list.first.name, 'SDN Penanggal 02');
    expect(list.first.capacityPct, 100);
    expect(list.first.isShelter, isTrue);
    expect(list.first.km, 6.2);
    expect(list.last.isShelter, isFalse);
    expect(list.last.available, isEmpty);
    expect(list.last.status, 'closed');
  });

  test('parse prices keeps bundled names on id match', () {
    final b = parsePrices({
      'region': 'Kab. Lumajang',
      'data': [
        {'id': 'eye-drops', 'item': 'Eye drops', 'unit': 'per bottle', 'het': 15000, 'market_avg': 19500, 'verified_outlets': 7, 'flagged': false},
        {'id': 'n95-mask', 'item': 'N95 mask', 'unit': 'each', 'het': 12000, 'market_avg': 27500, 'verified_outlets': 4, 'flagged': true},
      ],
    });
    expect(b.region, 'Kab. Lumajang');
    expect(b.featured.id, 'n95-mask');
    expect(b.featured.name.id, 'Masker N95');
    expect(b.featured.unit.id, 'per pcs');
    expect(b.featured.flagged, isTrue);
    expect(b.others.single.id, 'eye-drops');
  });

  test('parse intel, villages, signal check', () {
    final intel = parseIntel({
      'data': [
        {'id': 'a', 'verdict': 'PANIC', 'head': {'id': 'x', 'en': 'y'}, 'context': {'id': 'c', 'en': 'd'}, 'confidence': 0.81, 'created_at': '2026-10-31T13:44:18.046Z'},
        {'id': 'b', 'verdict': 'HOAX', 'head': {'id': 'x', 'en': 'y'}, 'context': {'id': 'c', 'en': 'd'}, 'confidence': 0.94, 'created_at': '2026-10-31T14:44:18.046Z'},
      ],
    });
    expect(intel.first.v, Verdict.hoax);
    expect(intel.first.pct, 94);

    final v = parseVillages({
      'data': [
        {'rank': 2, 'id': 'oro-oro-ombo', 'village': 'Oro-oro Ombo', 'district': 'Pronojiwo', 'exposed_population': 2950, 'driving_layer': 'KRB II + abu (GFS)', 'vulnerability': 0.79, 'needs': 'Masks, torches', 'score': 500},
        {'rank': 1, 'id': 'supiturang', 'village': 'Supiturang', 'district': 'Pronojiwo', 'exposed_population': 4120, 'driving_layer': 'S1 lahar + KRB III', 'vulnerability': 0.82, 'needs': 'Tarps', 'score': 1000},
      ],
    });
    expect(v.first.name, 'Supiturang');
    expect(v.first.api, 1.0);
    expect(v.last.krb, 'II');
    expect(v.last.api, 0.5);
    expect(v.last.needs.map((l) => l.id), ['Masker', 'Senter']);

    final s = parseSignalCheck({'label': 'HOAX', 'confidence': 0.88, 'triggers': ['Sudah Masuk'], 'satellite_check': null, 'nearest_fact': 'PVMBG'});
    expect(s.verdict, Verdict.hoax);
    expect(s.triggers, ['sudah masuk']);
    expect(s.satellite, isNull);
    expect(parseSignalCheck({'label': 'UNVERIFIED', 'confidence': 0.55}).verdict, Verdict.check);
  });

  test('unusable payloads throw', () {
    expect(() => parsePosko({'data': []}), throwsFormatException);
    expect(() => parseSemeru({'data': [{'id': 'merapi', 'level': 2}]}), throwsFormatException);
  });
}
