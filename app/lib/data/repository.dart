import 'dart:async';
import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core.dart';
import 'api.dart';
import 'mappers.dart';

/// Where the data on screen came from.
enum Origin { bundled, cache, live }

/// One API endpoint: current value plus its provenance. Starts with bundled data so the first frame never waits.
class Live<T> {
  final String path;
  final T Function(Map<String, dynamic>) _parse;
  final T bundled;
  T value;
  Origin origin = Origin.bundled;
  DateTime? at; // when the shown data was fetched from the network (live or cached copy)
  bool syncing = false;

  Live(this.path, this.bundled, this._parse) : value = bundled;

  void _reset() {
    value = bundled;
    origin = Origin.bundled;
    at = null;
  }

  String get _key => 'ms.api.v1:$path';

  /// Parses [raw] and swaps it in. Throws if the payload is unusable, leaving the old value.
  void _apply(String raw, Origin from, DateTime when) {
    final j = jsonDecode(raw);
    if (j is! Map<String, dynamic>) throw const FormatException('not an object');
    value = _parse(j);
    origin = from;
    at = when;
  }

  bool _restore(SharedPreferences? prefs) {
    final s = prefs?.getString(_key);
    if (s == null) return false;
    try {
      final c = jsonDecode(s) as Map<String, dynamic>;
      _apply(c['body'] as String, Origin.cache, DateTime.parse(c['at'] as String));
      return true;
    } catch (e) {
      debugPrint('cache $path unusable: $e');
      return false;
    }
  }

  Future<void> _store(SharedPreferences? prefs, String raw, DateTime now) async =>
      prefs?.setString(_key, jsonEncode({'at': now.toIso8601String(), 'body': raw}));
}

/// Live data with offline fallback: network → last good cached JSON → bundled static data.
/// In [DataMode.demo] it serves bundled sample data only and never touches the network.
class DataRepo extends ChangeNotifier {
  DataRepo({MsApi? api, SharedPreferences? prefs})
      : _api = api ?? MsApi(),
        _prefs = prefs;

  static const _modeKey = 'ms.dataMode';

  final MsApi _api;
  final SharedPreferences? _prefs;
  Timer? _timer;
  AppLifecycleListener? _lifecycle;
  DataMode _mode = DataMode.demo;
  int _generation = 0; // bumps on every mode switch so stale responses are dropped

  DataMode get mode => _mode;

  /// Saved choice from onboarding/Profil, or null on first run.
  static DataMode? savedMode(SharedPreferences? prefs) => switch (prefs?.getString(_modeKey)) {
        'demo' => DataMode.demo,
        'live' => DataMode.live,
        _ => null,
      };

  final volcano = Live<VolcanoStatus?>('/volcanoes', null, parseSemeru);
  final posko = Live<List<Posko>>('/posko?volcano=semeru', poskoList, parsePosko);
  final prices = Live<PriceBoard>('/prices', const PriceBoard('Candipuro', hetItems), parsePrices);
  final intel = Live<List<FeedItem>>('/intel', feed, parseIntel);
  final alerts = Live<List<AlertItem>>('/alerts', bundledAlerts, parseAlerts);
  final priority = Live<List<Village>>('/villages/priority?level=3&volcano=semeru', villages, parseVillages);

  List<Live<Object?>> get _all => [volcano, posko, prices, intel, alerts, priority];

  /// Switches data source. Live: cached copies first, then a background refresh. Demo: bundled only.
  /// [persist] saves the choice (onboarding / Profil); deep-link overrides pass false.
  Future<void> setMode(DataMode m, {bool persist = true}) async {
    if (persist) await _prefs?.setString(_modeKey, m.name);
    if (m == _mode && (_timer != null || m == DataMode.demo)) return;
    _mode = m;
    _generation++;
    _timer?.cancel();
    _timer = null;
    _lifecycle?.dispose();
    _lifecycle = null;
    for (final e in _all) {
      e._reset();
      e.syncing = false;
    }
    if (m == DataMode.demo) {
      notifyListeners();
      return;
    }
    for (final e in _all) {
      e._restore(_prefs);
    }
    notifyListeners();
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => refresh());
    _lifecycle = AppLifecycleListener(onResume: refresh);
    await refresh();
  }

  Future<void> refresh() async {
    if (_mode != DataMode.live) return;
    await Future.wait([for (final e in _all) _refreshOne(e)]);
  }

  Future<void> _refreshOne(Live<Object?> e) async {
    if (e.syncing) return;
    final gen = _generation;
    e.syncing = true;
    notifyListeners();
    try {
      final raw = await _api.getRaw(e.path);
      if (gen != _generation) return; // mode changed while waiting
      final now = DateTime.now();
      e._apply(raw, Origin.live, now);
      await e._store(_prefs, raw, now);
    } catch (err) {
      debugPrint('GET ${e.path} failed: $err');
      if (gen == _generation && e.origin == Origin.live) e.origin = Origin.cache; // still showing the last good copy
    } finally {
      if (gen == _generation) {
        e.syncing = false;
        notifyListeners();
      }
    }
  }

  /// Hoax/panic check via `POST /signals/check`; null in Demo mode, offline or when the API fails.
  Future<SignalCheck?> checkSignal(String text, Lang lang) async {
    if (_mode != DataMode.live) return null;
    try {
      final j = await _api.post('/signals/check', {'text': text, 'lang': lang == Lang.en ? 'en' : 'id'});
      return parseSignalCheck(j);
    } catch (err) {
      debugPrint('signals/check failed: $err');
      return null;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _lifecycle?.dispose();
    super.dispose();
  }
}

class DataScope extends InheritedNotifier<DataRepo> {
  const DataScope({super.key, required DataRepo repo, required super.child}) : super(notifier: repo);

  static DataRepo of(BuildContext c) => c.dependOnInheritedWidgetOfExactType<DataScope>()!.notifier!;
  static DataRepo read(BuildContext c) => c.getInheritedWidgetOfExactType<DataScope>()!.notifier!;
}

extension RepoX on BuildContext {
  /// Live data repository; subscribing rebuilds the widget when any endpoint updates.
  DataRepo get repo => DataScope.of(this);
  DataRepo get repoRead => DataScope.read(this);
}
