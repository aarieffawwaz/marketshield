import 'package:flutter/material.dart';

import '../core.dart';

/// JSON → app-model mappers for the `/api/v1` payloads. Each throws [FormatException] on a payload it
/// cannot use (missing or empty `data`), so the caller keeps the previous good data instead.

class VolcanoStatus {
  final int? level; // PVMBG 1–4, null when the API has no official level
  final DateTime? updatedAt;
  const VolcanoStatus(this.level, this.updatedAt);
}

class SignalCheck {
  final Verdict verdict;
  final int pct;
  final List<String> triggers;
  final String? satellite;
  final String? fact;
  const SignalCheck(this.verdict, this.pct, this.triggers, this.satellite, this.fact);
}

List<Map<String, dynamic>> _rows(Map<String, dynamic> j) {
  final d = j['data'];
  if (d is! List) throw const FormatException('missing data[]');
  final rows = d.whereType<Map<String, dynamic>>().toList();
  if (rows.isEmpty) throw const FormatException('empty data[]');
  return rows;
}

String _s(Object? v) => v is String ? v : (v?.toString() ?? '');
int _i(Object? v) => v is num ? v.round() : int.tryParse('$v') ?? 0;
double _d(Object? v) => v is num ? v.toDouble() : double.tryParse('$v') ?? 0;
DateTime? _t(Object? v) => v is String ? DateTime.tryParse(v) : null;

L _bil(Object? v) {
  if (v is Map) {
    final id = _s(v['id']), en = _s(v['en']);
    return L(id.isEmpty ? en : id, en.isEmpty ? id : en);
  }
  final s = _s(v);
  return L(s, s);
}

Verdict verdictOf(String label) => switch (label.toUpperCase()) {
      'HOAX' => Verdict.hoax,
      'PANIC' => Verdict.panic,
      'VERIFIED' => Verdict.verified,
      'OFFICIAL' => Verdict.official,
      _ => Verdict.check,
    };

int _pct(Object? confidence) => (_d(confidence) * 100).round().clamp(0, 100);

/// `GET /volcanoes` → Semeru's official level.
VolcanoStatus parseSemeru(Map<String, dynamic> j) {
  final r = _rows(j).firstWhere((r) => r['id'] == 'semeru', orElse: () => throw const FormatException('no semeru'));
  final lvl = r['level'];
  return VolcanoStatus(lvl is num ? lvl.toInt() : null, _t(r['updated_at']));
}

/// `GET /posko?volcano=semeru`.
List<Posko> parsePosko(Map<String, dynamic> j) {
  final bundled = {for (final p in poskoList) p.id: p};
  final out = [
    for (final r in _rows(j))
      () {
        final id = _s(r['id']);
        final b = bundled[id];
        final cap = _i(r['capacity']), filled = _i(r['filled']);
        final status = _s(r['status']);
        return Posko(
          b?.name ?? _s(r['name']),
          bi(_s(r['kind'])),
          b?.km ?? poskoKmById[id],
          cap > 0 ? (filled * 100 / cap).round().clamp(0, 100) : 0,
          biList(_s(r['has'])),
          biList(_s(r['needs'])),
          b?.open24 ?? false,
          status: const {'open', 'full', 'closed'}.contains(status) ? status : 'open',
          updatedAt: _t(r['updated_at']),
        );
      }(),
  ];
  out.sort((a, b) => (a.km ?? double.infinity).compareTo(b.km ?? double.infinity));
  return out;
}

IconData _priceIcon(String id) {
  if (id.contains('mask')) return Icons.masks_outlined;
  if (id.contains('water')) return Icons.water_drop_outlined;
  if (id.contains('eye')) return Icons.medication_outlined;
  if (id.contains('torch')) return Icons.flashlight_on_outlined;
  if (id.contains('oxygen')) return Icons.air;
  if (id.contains('goggle')) return Icons.visibility_outlined;
  if (id.contains('bag')) return Icons.backpack_outlined;
  if (id.contains('rice')) return Icons.rice_bowl_outlined;
  if (id.contains('oil')) return Icons.oil_barrel_outlined;
  return Icons.inventory_2_outlined;
}

/// `GET /prices`. Units always come from the API (bundled units belong to bundled prices).
PriceBoard parsePrices(Map<String, dynamic> j) {
  final bundled = {for (final h in hetItems) h.id: h};
  final items = [
    for (final r in _rows(j))
      () {
        final id = _s(r['id']).isEmpty ? slugId(_s(r['item'])) : _s(r['id']);
        final b = bundled[id];
        return HetItem(
          b?.name ?? bi(_s(r['item'])),
          bi(_s(r['unit'])),
          _i(r['het']),
          _i(r['market_avg']),
          _i(r['verified_outlets']),
          b?.icon ?? _priceIcon(id),
          flagged: r['flagged'] == true,
        );
      }(),
  ];
  final region = _s(j['region']);
  return PriceBoard(region.isEmpty ? 'Candipuro' : region, items);
}

/// `GET /intel`, newest first.
List<FeedItem> parseIntel(Map<String, dynamic> j) {
  final out = [
    for (final r in _rows(j))
      () {
        final at = _t(r['created_at']);
        return FeedItem(verdictOf(_s(r['verdict'])), _pct(r['confidence']), _bil(r['head']), _bil(r['context']),
            at == null ? const L('—', '—') : ago(at),
            at: at);
      }(),
  ];
  out.sort((a, b) => (b.at ?? DateTime(0)).compareTo(a.at ?? DateTime(0)));
  return out;
}

/// `GET /alerts`, newest first.
List<AlertItem> parseAlerts(Map<String, dynamic> j) {
  final out = [
    for (final r in _rows(j)) AlertItem(_s(r['kind']), _bil(r['text']), const L('', ''), at: _t(r['created_at'])),
  ];
  out.sort((a, b) => (b.at ?? DateTime(0)).compareTo(a.at ?? DateTime(0)));
  return out;
}

final _krb = RegExp(r'KRB\s*(III|II|I)\b');

/// `GET /villages/priority`. The index shown is the API score normalised to the top village (0–1).
List<Village> parseVillages(Map<String, dynamic> j) {
  final rows = _rows(j)..sort((a, b) => _i(a['rank']).compareTo(_i(b['rank'])));
  final bundled = {for (final v in villages) v.id: v};
  final top = rows.map((r) => _d(r['score'])).fold<double>(0, (a, b) => b > a ? b : a);
  return [
    for (final r in rows)
      () {
        final b = bundled[_s(r['id'])];
        return Village(
          _s(r['village']),
          _s(r['district']),
          _i(r['exposed_population']),
          b?.krb ?? _krb.firstMatch(_s(r['driving_layer']))?.group(1) ?? '',
          top > 0 ? _d(r['score']) / top : 0,
          b?.unmetPct ?? (_d(r['vulnerability']) * 100).round().clamp(0, 100),
          needs: biList(_s(r['needs'])),
        );
      }(),
  ];
}

/// `POST /signals/check` response.
SignalCheck parseSignalCheck(Map<String, dynamic> j) {
  if (j['label'] is! String) throw const FormatException('missing label');
  final sat = j['satellite_check'], fact = j['nearest_fact'];
  return SignalCheck(
    verdictOf(j['label'] as String),
    _pct(j['confidence']),
    [for (final t in (j['triggers'] is List ? j['triggers'] as List : const [])) _s(t).toLowerCase()],
    sat is String && sat.isNotEmpty ? sat : null,
    fact is String && fact.isNotEmpty ? fact : null,
  );
}
