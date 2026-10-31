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
  T value;
  Origin origin = Origin.bundled;
  DateTime? at; // when the shown data was fetched from the network (live or cached copy)
  bool syncing = false;

  Live(this.path, this.value, this._parse);

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

  Future<void> _fetch(MsApi api, SharedPreferences? prefs) async {
    final raw = await api.getRaw(path);
    final now = DateTime.now();
    _apply(raw, Origin.live, now);
    await prefs?.setString(_key, jsonEncode({'at': now.toIso8601String(), 'body': raw}));
  }
}

/// Live data with offline fallback: network → last good cached JSON → bundled static data.
class DataRepo extends ChangeNotifier {
  DataRepo({MsApi? api}) : _api = api ?? MsApi();

  final MsApi _api;
  SharedPreferences? _prefs;
  Timer? _timer;
  AppLifecycleListener? _lifecycle;

  final volcano = Live<VolcanoStatus?>('/volcanoes', null, parseSemeru);
  final posko = Live<List<Posko>>('/posko?volcano=semeru', poskoList, parsePosko);
  final prices = Live<PriceBoard>('/prices', const PriceBoard('Candipuro', hetItems), parsePrices);
  final intel = Live<List<FeedItem>>('/intel', feed, parseIntel);
  final alerts = Live<List<AlertItem>>('/alerts', bundledAlerts, parseAlerts);
  final priority = Live<List<Village>>('/villages/priority?level=3&volcano=semeru', villages, parseVillages);

  List<Live<Object?>> get _all => [volcano, posko, prices, intel, alerts, priority];

  /// Loads cached copies, then refreshes from the network in the background. Call after `runApp`.
  Future<void> start() async {
    try {
      _prefs = await SharedPreferences.getInstance();
    } catch (e) {
      debugPrint('shared_preferences unavailable: $e');
    }
    var any = false;
    for (final e in _all) {
      any = e._restore(_prefs) || any;
    }
    if (any) notifyListeners();
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => refresh());
    _lifecycle = AppLifecycleListener(onResume: refresh);
    await refresh();
  }

  Future<void> refresh() => Future.wait([for (final e in _all) _refreshOne(e)]);

  Future<void> _refreshOne(Live<Object?> e) async {
    if (e.syncing) return;
    e.syncing = true;
    notifyListeners();
    try {
      await e._fetch(_api, _prefs);
    } catch (err) {
      debugPrint('GET ${e.path} failed: $err');
      if (e.origin == Origin.live) e.origin = Origin.cache; // still showing the last good copy
    } finally {
      e.syncing = false;
      notifyListeners();
    }
  }

  /// Hoax/panic check via `POST /signals/check`; null when offline or the API fails.
  Future<SignalCheck?> checkSignal(String text, Lang lang) async {
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
