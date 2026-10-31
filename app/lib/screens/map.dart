import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' show LatLng;

import '../core.dart';
import '../geo_map.dart';
import '../theme.dart';
import '../widgets.dart';
import 'map3d.dart';
import 'shell.dart';
import 'sos.dart';

/// S07 — Hazard map built from GEE layers (KRB, ash cone, lahar path).
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});
  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  int _layer = 0; // 0 all, 1 KRB, 2 ash, 3 lahar
  final _mc = MapController();

  void _zoom(double d) => _mc.move(_mc.camera.center, (_mc.camera.zoom + d).clamp(7, 16));

  @override
  Widget build(BuildContext context) {
    final lvl = context.app.level;
    final s = snapshots[lvl]!;
    final layers = [
      (Icons.layers_outlined, context.t('Semua Lapisan', 'All Layers')),
      (Icons.circle, context.t('Zona KRB', 'KRB Zones')),
      (Icons.air, context.t('Sebaran Abu', 'Ash Spread')),
      (Icons.water, context.t('Aliran Lahar', 'Lahar Flow')),
    ];
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          const AppHeader(),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: R.gutter),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: C.surfaceLow, borderRadius: BorderRadius.circular(R.control)),
            child: Row(children: [
              const Icon(Icons.track_changes, size: 16, color: C.primary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                    '${context.t('Jawa Timur', 'East Java')}: G. Semeru (${context.l(levelName[lvl - 1])} ${levelRoman[lvl - 1]}) • G. Bromo (Normal I)',
                    style: inter(12, w: FontWeight.w600, c: C.wine),
                    overflow: TextOverflow.ellipsis),
              ),
              const ModeBadgePill(),
            ]),
          ),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 12, R.gutter, 24), children: [
              SizedBox(
                height: 44,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: layers.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => ChoiceChip(
                    selected: _layer == i,
                    onSelected: (_) => setState(() => _layer = i),
                    showCheckmark: false,
                    avatar: Icon(layers[i].$1, size: 16, color: _layer == i ? Colors.white : C.wine),
                    label: Text(layers[i].$2),
                    labelStyle: inter(12.5, w: FontWeight.w600, c: _layer == i ? Colors.white : C.wine),
                    selectedColor: C.primary,
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: C.outline),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(R.control)),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(R.card),
                child: Container(
                  height: 400,
                  decoration: BoxDecoration(border: Border.all(color: C.outline), borderRadius: BorderRadius.circular(R.card)),
                  child: Stack(children: [
                    Positioned.fill(
                      child: GeoMap(
                        controller: _mc,
                        level: lvl,
                        krbKm: s.krbRadiusKm,
                        showKrb: _layer == 0 || _layer == 1,
                        showAsh: _layer == 0 || _layer == 2,
                        showLahar: _layer == 0 || _layer == 3,
                        onVolcano: () => push(context, const VolcanoScreen()),
                        actions: [MapPill(Icons.view_in_ar_outlined, '3D', onTap: () => show3dOptions(context))],
                      ),
                    ),
                    // Wind pill stops short of the control column on the right.
                    Positioned(
                      left: mapInset,
                      top: mapInset,
                      right: mapInset + 48 + 8,
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(99), boxShadow: shadow1),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            const Icon(Icons.air, size: 15, color: C.primary),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text('${context.t('Angin GFS', 'GFS wind')}: ${context.t('Barat Daya', 'SW')} (240°) • 12 knot',
                                  overflow: TextOverflow.ellipsis, style: inter(11, w: FontWeight.w600, c: C.wine)),
                            ),
                          ]),
                        ),
                      ),
                    ),
                    Positioned(
                      right: mapInset,
                      top: mapInset,
                      child: Container(
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: shadow1),
                        child: Column(children: [
                          IconButton(onPressed: () => _mc.move(const LatLng(-8.15, 112.98), 11.2), icon: const Icon(Icons.explore_outlined, color: C.wine)),
                          IconButton(onPressed: () => _zoom(1), icon: const Icon(Icons.add, color: C.wine)),
                          IconButton(onPressed: () => _zoom(-1), icon: const Icon(Icons.remove, color: C.wine)),
                          IconButton(
                              onPressed: () {
                                _mc.move(userPos, 13);
                                toast(context, context.t('Lokasi Anda: Sumberwuluh, Candipuro', 'Your location: Sumberwuluh, Candipuro'));
                              },
                              icon: const Icon(Icons.my_location, color: C.wine)),
                        ]),
                      ),
                    ),
                    const Positioned(left: mapInset, bottom: attributionHeight + 8, child: SatChip('Sentinel-1 • NOAA-20 VIIRS • GPM')),
                  ]),
                ),
              ),
              const SizedBox(height: 12),
              MsCard(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  _legend(C.crimson, 'KRB III', context.t('Kritis', 'Critical')),
                  _legend(C.l3, 'KRB II', context.t('Waspada', 'Alert')),
                  _legend(C.l2, 'KRB I', context.t('Potensi', 'Potential')),
                  _legend(C.l1, 'Posko', context.t('Aktif', 'Active')),
                ]),
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: _thumb('assets/img/semeru_cctv.jpg', 'CCTV Pos Sawur', () {})),
                const SizedBox(width: 10),
                Expanded(child: _thumb('assets/img/sar_lahar.jpg', 'Radar Sentinel-1', () => push(context, const VolcanoScreen()))),
              ]),
              const SizedBox(height: 14),
              MsCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('Sumber Lapisan (Google Earth Engine)', 'Layer Sources (Google Earth Engine)'),
                      style: inter(13.5, w: FontWeight.w700, c: C.wine)),
                  const SizedBox(height: 8),
                  for (final (k, v) in [
                    ('KRB', context.t('Poligon KRB PVMBG + radius dinamis ${s.krbRadiusKm.toInt()} km', 'PVMBG KRB polygons + dynamic ${s.krbRadiusKm.toInt()} km radius')),
                    (context.t('Abu', 'Ash'), 'NOAA/GFS0P25 wind + Sentinel-5P aerosol'),
                    ('Lahar', 'COPERNICUS/S1_GRD + NASA/GPM_L3/IMERG_V07 + SRTM'),
                  ])
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        SizedBox(width: 48, child: Text(k, style: inter(12, w: FontWeight.w700, c: C.sat))),
                        Expanded(child: Text(v, style: inter(12, c: C.textMuted))),
                      ]),
                    ),
                ]),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _legend(Color c, String a, String b) => Row(children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: c, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(a, style: inter(11.5, w: FontWeight.w700, c: C.wine)),
          Text(b, style: inter(10, c: C.textMuted)),
        ]),
      ]);

  Widget _thumb(String img, String label, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(R.card),
          child: SizedBox(
            height: 110,
            child: Stack(fit: StackFit.expand, children: [
              Image.asset(img, fit: BoxFit.cover),
              const DecoratedBox(
                decoration: BoxDecoration(
                    gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black54])),
              ),
              Positioned(left: 10, bottom: 8, child: Text(label, style: inter(12, w: FontWeight.w600, c: Colors.white))),
            ]),
          ),
        ),
      );
}

/// S08 — Volcano detail: official status + satellite forecast with SHAP factors.
class VolcanoScreen extends StatelessWidget {
  const VolcanoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lvl = context.app.level;
    final s = snapshots[lvl]!;
    final radius = s.krbRadiusKm.toInt();
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          SubHeader(context.t('Detail Gunung Api', 'Volcano Detail')),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 28), children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(R.card),
                child: SizedBox(
                  height: 210,
                  child: Stack(fit: StackFit.expand, children: [
                    Image.asset('assets/img/mahameru.jpg', fit: BoxFit.cover),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                          gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Color(0xCC350915)])),
                    ),
                    Positioned(
                        left: 12,
                        top: 12,
                        child: Pill('3.676 mdpl', icon: Icons.terrain, bg: Colors.white.withValues(alpha: .9))),
                    Positioned(
                        right: 12,
                        top: 12,
                        child: Pill(context.t('Jawa Timur, ID', 'East Java, ID'), bg: C.primary, fg: Colors.white)),
                    Positioned(
                      left: 16,
                      bottom: 14,
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(context.t('Kawah Jonggring Saloko', 'Jonggring Saloko crater'),
                            style: inter(12.5, c: Colors.white, w: FontWeight.w500)),
                        Text('Puncak Mahameru', style: outfit(26, w: FontWeight.w700, c: Colors.white)),
                      ]),
                    ),
                  ]),
                ),
              ),
              const SizedBox(height: 14),
              MsCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.warning_amber_rounded, color: C.wine),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(context.t('Status Aktivitas Vulkanik', 'Volcanic Activity Status'),
                            style: outfit(17, w: FontWeight.w600))),
                    Text('No. 421/PVMBG/2026', style: inter(11, c: C.textMuted)),
                  ]),
                  const SizedBox(height: 14),
                  Row(children: [
                    for (var k = 1; k <= 4; k++)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: Column(children: [
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              height: 7,
                              decoration: BoxDecoration(
                                  color: k == lvl ? C.level(k) : C.surfaceMid, borderRadius: BorderRadius.circular(9)),
                            ),
                            const SizedBox(height: 6),
                            Text('${levelRoman[k - 1]} ${context.l(levelName[k - 1])}',
                                style: inter(11,
                                    w: k == lvl ? FontWeight.w700 : FontWeight.w400,
                                    c: k == lvl ? C.wine : C.outlineStrong)),
                          ]),
                        ),
                      ),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    const Icon(Icons.verified_outlined, size: 15, color: C.l1),
                    const SizedBox(width: 6),
                    Expanded(child: Text('PVMBG Badan Geologi', style: inter(12, c: C.textMuted))),
                    Text(context.t('Diperbarui 10m lalu', 'Updated 10m ago'), style: inter(12, c: C.textMuted)),
                  ]),
                ]),
              ),
              const SizedBox(height: 12),
              MsCard(
                color: C.peach,
                border: const Color(0xFFF3CDB9),
                shadow: const [],
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Icon(Icons.shield_outlined, color: C.wine),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(context.t('Rekomendasi Utama PVMBG', 'PVMBG Main Recommendation'),
                          style: inter(14.5, w: FontWeight.w700, c: C.wine)),
                      const SizedBox(height: 6),
                      Text.rich(TextSpan(style: inter(14, c: C.text, h: 1.5), children: [
                        TextSpan(text: context.t('Tidak beraktivitas dalam radius ', 'No activity within ')),
                        TextSpan(text: '$radius km', style: inter(14, w: FontWeight.w700, c: C.wine, h: 1.5)),
                        TextSpan(text: context.t(' dari kawah puncak serta ', ' of the summit crater and ')),
                        TextSpan(text: '500 m', style: inter(14, w: FontWeight.w700, c: C.wine, h: 1.5)),
                        TextSpan(
                            text: context.t(' dari sempadan sungai Besuk Kobokan untuk antisipasi awan panas guguran.',
                                ' from the Besuk Kobokan riverbanks to anticipate pyroclastic flows.')),
                      ])),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 12),
              MsCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.insights, color: C.wine),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(context.t('Prakiraan Satelit MarketShield', 'MarketShield Satellite Forecast'),
                            style: outfit(17, w: FontWeight.w600))),
                    Pill(context.t('AI Multi-Satelit', 'Multi-satellite AI'), bg: C.pink, size: 10.5),
                  ]),
                  const SizedBox(height: 4),
                  Text(context.t('Model Prediktif — Bukan Pengganti Rilis Resmi PVMBG', 'Predictive model — not a substitute for official PVMBG releases'),
                      style: inter(11.5, c: C.textMuted)),
                  const SizedBox(height: 14),
                  Row(children: [
                    Text(context.t('Peluang naik status (7 hari)', 'Escalation chance (7 days)'), style: inter(13, c: C.text)),
                    const Spacer(),
                    Text('${s.escalationPct}%', style: outfit(20, w: FontWeight.w700, c: C.level(lvl))),
                  ]),
                  const SizedBox(height: 6),
                  Bar(s.escalationPct / 100, color: C.level(lvl)),
                  const SizedBox(height: 14),
                  Text(context.t('Faktor utama (SHAP)', 'Top factors (SHAP)'), style: inter(12.5, w: FontWeight.w700, c: C.wine)),
                  const SizedBox(height: 8),
                  for (final (k, v) in [
                    ('SO₂ Sentinel-5P', .08 + level01(lvl) * .16),
                    (context.t('Anomali termal', 'Thermal anomaly'), .06 + level01(lvl) * .14),
                    (context.t('Backscatter radar', 'Radar backscatter'), .04 + level01(lvl) * .10),
                    (context.t('Hujan GPM 72 jam', 'GPM rain 72h'), .02 + level01(lvl) * .05),
                  ])
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(children: [
                        SizedBox(width: 130, child: Text(k, style: inter(12, c: C.textMuted))),
                        Expanded(child: Bar(v / .25, color: C.sat, height: 6)),
                        const SizedBox(width: 8),
                        SizedBox(width: 42, child: Text('+${v.toStringAsFixed(2)}', style: inter(11.5, w: FontWeight.w600, c: C.sat))),
                      ]),
                    ),
                ]),
              ),
              const SizedBox(height: 12),
              SectionTitle(context.t('Sinyal Google Earth Engine', 'Google Earth Engine Signals'), icon: Icons.satellite_alt_outlined),
              for (final (name, id, val, series) in [
                ('SO₂ (TROPOMI)', 'COPERNICUS/S5P/OFFL/L3_SO2', '${s.so2Du} DU', _series(lvl, 0)),
                (context.t('Titik panas (FRP)', 'Hotspots (FRP)'), 'FIRMS · MODIS/VIIRS', '${s.thermalMw} MW', _series(lvl, 1)),
                (context.t('Perubahan radar', 'Radar change'), 'COPERNICUS/S1_GRD', '${s.s1Db} dB', _series(lvl, 2)),
                (context.t('Curah hujan', 'Rainfall'), 'NASA/GPM_L3/IMERG_V07', '${s.rainMm} mm', _series(lvl, 3)),
              ])
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: MsCard(
                    padding: const EdgeInsets.all(14),
                    child: Row(children: [
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(name, style: inter(13.5, w: FontWeight.w600, c: C.wine)),
                          Text(id, style: inter(10.5, c: C.sat, w: FontWeight.w500)),
                        ]),
                      ),
                      SizedBox(width: 70, height: 28, child: CustomPaint(painter: _Spark(series, C.level(lvl)))),
                      const SizedBox(width: 10),
                      SizedBox(
                          width: 64,
                          child: Text(val, textAlign: TextAlign.right, style: outfit(15, w: FontWeight.w700))),
                    ]),
                  ),
                ),
            ]),
          ),
        ]),
      ),
    );
  }

  static double level01(int l) => (l - 1) / 3;

  static List<double> _series(int lvl, int seed) {
    final r = math.Random(seed * 7 + 3);
    return List.generate(7, (i) => .2 + r.nextDouble() * .15 + (i / 6) * level01(lvl) * .6);
  }
}

class _Spark extends CustomPainter {
  final List<double> v;
  final Color c;
  _Spark(this.v, this.c);
  @override
  void paint(Canvas canvas, Size s) {
    final p = Path();
    for (var i = 0; i < v.length; i++) {
      final o = Offset(s.width * i / (v.length - 1), s.height * (1 - v[i].clamp(0, 1)));
      i == 0 ? p.moveTo(o.dx, o.dy) : p.lineTo(o.dx, o.dy);
    }
    canvas.drawPath(
        p,
        Paint()
          ..color = c
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2
          ..strokeCap = StrokeCap.round);
  }

  @override
  bool shouldRepaint(_Spark o) => o.c != c;
}

/// S09 — Evacuation guide with smart route avoiding the lahar corridor.
class EvacScreen extends StatefulWidget {
  const EvacScreen({super.key});
  @override
  State<EvacScreen> createState() => _EvacScreenState();
}

class _EvacScreenState extends State<EvacScreen> {
  bool _nav = false;
  final Set<int> _done = {};

  @override
  Widget build(BuildContext context) {
    final lvl = context.app.level;
    final s = snapshots[lvl]!;
    final steps = [
      context.t('Bawa Kit Siaga, dokumen, dan obat rutin.', 'Take the Ready Kit, documents and regular medicine.'),
      context.t('Lansia, anak, dan ibu hamil berangkat lebih dulu.', 'Elderly, children and pregnant women leave first.'),
      context.t('Hindari jembatan Gladak Perak & aliran Besuk Kobokan.', 'Avoid Gladak Perak bridge & the Besuk Kobokan channel.'),
      context.t('Pakai masker N95 dan kacamata pelindung abu.', 'Wear an N95 mask and ash goggles.'),
      context.t('Check-in di GOR Candipuro agar keluarga tercatat.', 'Check in at GOR Candipuro so your family is registered.'),
    ];
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          SubHeader(context.t('Panduan Evakuasi', 'Evacuation Guide')),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 28), children: [
              MsCard(
                color: C.pink,
                border: const Color(0xFFF5C9C9),
                shadow: const [],
                child: Row(children: [
                  Icon(Icons.warning_rounded, color: C.level(lvl), size: 34),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(context.t('PERINGATAN BAHAYA ERUPSI', 'ERUPTION HAZARD WARNING'),
                          style: inter(10.5, w: FontWeight.w700, c: C.textMuted, ls: .8)),
                      Text('STATUS: LEVEL ${levelRoman[lvl - 1]} ${context.l(levelName[lvl - 1]).toUpperCase()}',
                          style: outfit(20, w: FontWeight.w700, c: C.crimson)),
                      Text(
                          '${context.t('Radius awan panas', 'Pyroclastic radius')} ${s.krbRadiusKm.toInt()} km • ${context.t('Sektor Tenggara', 'South-East sector')}',
                          style: inter(12.5, c: C.textMuted)),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(R.control)),
                child: Row(children: [
                  const Icon(Icons.alt_route, color: C.wine, size: 18),
                  const SizedBox(width: 8),
                  Text(context.t('Macet 85 mnt', 'Jammed 85 min'),
                      style: inter(12.5, c: C.textMuted).copyWith(decoration: TextDecoration.lineThrough)),
                  const SizedBox(width: 8),
                  Expanded(
                      child: Text('${context.t('Rute Pintar', 'Smart Route')}: 32 ${context.t('mnt', 'min')}',
                          style: inter(13.5, w: FontWeight.w700, c: C.wine))),
                  Pill(context.t('-62% WAKTU', '-62% TIME'), bg: C.crimson, fg: Colors.white, size: 10.5),
                ]),
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(R.card),
                child: SizedBox(
                  height: 300,
                  child: LayoutBuilder(builder: (context, c) {
                    return Stack(children: [
                      Positioned.fill(
                          child: GeoMap(mode: GeoMode.route, krbKm: s.krbRadiusKm, navigating: _nav, showAsh: false, bottomInset: 34)),
                      Positioned(
                          left: mapInset,
                          top: mapInset,
                          child: Pill('${s.krbRadiusKm.toInt()} KM ${context.t('ZONA KRITIS', 'CRITICAL ZONE')}',
                              icon: Icons.circle, bg: Colors.white, fg: C.crimson, size: 10.5)),
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: Container(
                          height: 34,
                          color: Colors.white.withValues(alpha: .92),
                          padding: const EdgeInsets.symmetric(horizontal: mapInset),
                          child: Row(children: [
                            const Icon(Icons.satellite_alt_rounded, size: 14, color: C.sat),
                            const SizedBox(width: 6),
                            Expanded(
                                child: Text(context.t('Rute dinamis: Radar Sentinel-1 + Hujan GPM', 'Dynamic route: Sentinel-1 radar + GPM rain'),
                                    style: inter(11, c: C.textMuted))),
                            Text('Real-time', style: inter(11, w: FontWeight.w700, c: C.crimson)),
                          ]),
                        ),
                      ),
                    ]);
                  }),
                ),
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(
                  child: Btn(_nav ? context.t('NAVIGASI AKTIF', 'NAVIGATING') : context.t('MULAI NAVIGASI', 'START NAVIGATION'),
                      icon: _nav ? Icons.navigation : Icons.turn_right,
                      color: _nav ? C.l1 : C.wine,
                      height: 58, onTap: () {
                    setState(() => _nav = !_nav);
                    if (_nav) toast(context, context.t('Belok kanan di Jl. Raya Candipuro, 1,2 km', 'Turn right onto Jl. Raya Candipuro, 1.2 km'));
                  }),
                ),
                const SizedBox(width: 10),
                SizedBox(
                  width: 58,
                  height: 58,
                  child: Material(
                    color: C.crimson,
                    borderRadius: BorderRadius.circular(R.control),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(R.control),
                      onTap: () => push(context, const SosScreen()),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.emergency, color: Colors.white, size: 20),
                        Text('SOS', style: inter(11, w: FontWeight.w800, c: Colors.white)),
                      ]),
                    ),
                  ),
                ),
              ]),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: _tile(Icons.schedule, '18 ${context.t('MNT', 'MIN')}', context.t('Via Motor/Mobil', 'By motorbike/car'))),
                const SizedBox(width: 8),
                Expanded(child: _tile(Icons.air, '12 KM/J', context.t('Barat (GFS)', 'West (GFS)'))),
                const SizedBox(width: 8),
                Expanded(child: _tile(Icons.masks, 'N95', context.t('Aerosol Pekat', 'Dense aerosol'), hot: true)),
              ]),
              const SizedBox(height: 12),
              MsCard(
                onTap: () => tabIndex.value = 3,
                child: Row(children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.home_work_outlined, color: C.wine),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Eyebrow(context.t('Titik kumpul akhir', 'Final assembly point')),
                      Text('GOR Candipuro', style: outfit(19, w: FontWeight.w600)),
                      const SizedBox(height: 6),
                      Wrap(spacing: 6, children: [
                        Pill('60% ${context.t('Terisi', 'Full')}', icon: Icons.groups_outlined, bg: C.pink, size: 10),
                        Pill(context.t('Medis Siap', 'Medics ready'), icon: Icons.medical_services_outlined, bg: C.surfaceMid, size: 10),
                      ]),
                    ]),
                  ),
                  const Icon(Icons.chevron_right, color: C.textMuted),
                ]),
              ),
              const SizedBox(height: 16),
              SectionTitle(context.t('Langkah Evakuasi', 'Evacuation Steps'), icon: Icons.checklist),
              for (var i = 0; i < steps.length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: MsCard(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    onTap: () => setState(() => _done.contains(i) ? _done.remove(i) : _done.add(i)),
                    child: Row(children: [
                      Container(
                        width: 28,
                        height: 28,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                            color: _done.contains(i) ? C.l1 : C.surfaceMid, shape: BoxShape.circle),
                        child: _done.contains(i)
                            ? const Icon(Icons.check, size: 16, color: Colors.white)
                            : Text('${i + 1}', style: inter(12, w: FontWeight.w700, c: C.wine)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Text(steps[i],
                              style: inter(13.5, c: _done.contains(i) ? C.textMuted : C.text).copyWith(
                                  decoration: _done.contains(i) ? TextDecoration.lineThrough : null))),
                    ]),
                  ),
                ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _tile(IconData i, String v, String sub, {bool hot = false}) => Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: hot ? C.pink : Colors.white,
          borderRadius: BorderRadius.circular(R.card),
          border: Border.all(color: hot ? const Color(0xFFF5C9C9) : C.outline),
        ),
        child: Column(children: [
          Icon(i, color: hot ? C.crimson : C.wine),
          const SizedBox(height: 6),
          Text(v, style: outfit(18, w: FontWeight.w700, c: hot ? C.crimson : C.wine)),
          Text(sub, textAlign: TextAlign.center, style: inter(10.5, c: hot ? C.crimson : C.textMuted)),
        ]),
      );
}

