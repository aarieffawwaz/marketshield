
import 'package:flutter/material.dart';

import '../core.dart';
import '../geo_map.dart';
import '../theme.dart';
import '../widgets.dart';
import 'map.dart';

/// S15 — Shelters & aid posts with stock / urgent-need chips.
class PoskoScreen extends StatefulWidget {
  const PoskoScreen({super.key});
  @override
  State<PoskoScreen> createState() => _PoskoScreenState();
}

class _PoskoScreenState extends State<PoskoScreen> {
  int _seg = 1; // 0 shelter, 1 aid post
  final Set<int> _filters = {};
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final list = poskoList.where((p) {
      final isShelter = p.type.id.startsWith('Shelter');
      if (_seg == 0 && !isShelter) return false;
      if (_seg == 1 && isShelter) return false;
      if (_filters.contains(0) && (p.km ?? double.infinity) > 3) return false;
      if (_filters.contains(1) && !p.open24) return false;
      if (_q.isNotEmpty && !p.name.toLowerCase().contains(_q.toLowerCase())) return false;
      return true;
    }).toList();
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          const AppHeader(),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(16, 4, 16, 24), children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(R.control + 2)),
                child: Row(children: [
                  for (final (i, label) in [
                    (0, context.t('Shelter Pengungsian', 'Evacuation Shelters')),
                    (1, context.t('Posko Bantuan', 'Aid Posts')),
                  ])
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _seg = i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: 42,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                              color: _seg == i ? C.primary : Colors.transparent, borderRadius: BorderRadius.circular(R.control)),
                          child: Text(label, style: inter(13.5, w: FontWeight.w600, c: _seg == i ? Colors.white : C.wine)),
                        ),
                      ),
                    ),
                ]),
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(R.card),
                child: SizedBox(
                  height: 170,
                  child: Stack(fit: StackFit.expand, children: [
                    const GeoMap(mode: GeoMode.posts, showAsh: false, showLahar: false),
                    Positioned(
                        left: 10,
                        top: 10,
                        child: Pill('3 ${context.t('Posko Terverifikasi Aktif', 'Verified Active Posts')}',
                            icon: Icons.circle, bg: Colors.white, fg: C.wine, size: 10.5)),
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        color: Colors.black.withValues(alpha: .45),
                        child: Row(children: [
                          const Icon(Icons.satellite_alt_rounded, size: 14, color: Colors.white),
                          const SizedBox(width: 6),
                          Expanded(
                              child: Text(context.t('Peta Satelit Radar Semeru', 'Semeru radar satellite map'),
                                  style: inter(11.5, c: Colors.white, w: FontWeight.w500))),
                          GestureDetector(
                            onTap: () => push(context, const EvacScreen()),
                            child: const Pill('⤢ Rute', bg: Colors.white, fg: C.wine, size: 10.5),
                          ),
                        ]),
                      ),
                    ),
                  ]),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                onChanged: (v) => setState(() => _q = v),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search, color: C.wine),
                  suffixIcon: const Icon(Icons.tune, color: C.wine),
                  hintText: context.t('Cari nama posko, balai desa, atau komoditas', 'Search post, village hall or item'),
                  hintStyle: inter(13.5, c: C.navInactive),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(R.control), borderSide: const BorderSide(color: C.outline)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(R.control), borderSide: const BorderSide(color: C.primary, width: 2)),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 38,
                child: ListView(scrollDirection: Axis.horizontal, children: [
                  for (final (i, ic, label) in [
                    (0, Icons.near_me, context.t('Terdekat (< 3 km)', 'Nearest (< 3 km)')),
                    (1, Icons.schedule, context.t('Buka 24 Jam', 'Open 24h')),
                    (2, Icons.volunteer_activism_outlined, context.t('Butuh Relawan', 'Needs volunteers')),
                  ])
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: _filters.contains(i),
                        onSelected: (v) => setState(() => v ? _filters.add(i) : _filters.remove(i)),
                        showCheckmark: false,
                        avatar: Icon(ic, size: 15, color: _filters.contains(i) ? Colors.white : C.wine),
                        label: Text(label),
                        labelStyle: inter(12, w: FontWeight.w600, c: _filters.contains(i) ? Colors.white : C.wine),
                        selectedColor: C.primary,
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: C.outline),
                        shape: const StadiumBorder(),
                      ),
                    ),
                ]),
              ),
              const SizedBox(height: 12),
              if (list.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(context.t('Tidak ada posko yang cocok dengan filter.', 'No posts match these filters.'),
                      textAlign: TextAlign.center, style: inter(13.5, c: C.textMuted)),
                ),
              for (final p in list) Padding(padding: const EdgeInsets.only(bottom: 12), child: _PoskoCard(p)),
              MsCard(
                color: C.wine,
                border: C.wine,
                onTap: () => push(context, const AidPriorityScreen()),
                child: Row(children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: .15), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.hub_outlined, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(context.t('Kirim Bantuan ke Mana?', 'Where Should Aid Go?'), style: outfit(17, w: FontWeight.w600, c: Colors.white)),
                      Text(context.t('Indeks Prioritas Bantuan • WorldPop × zona bahaya', 'Aid Priority Index • WorldPop × hazard zone'),
                          style: inter(12, c: const Color(0xFFFFDAD5))),
                    ]),
                  ),
                  const Icon(Icons.arrow_forward, color: Colors.white),
                ]),
              ),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _PoskoCard extends StatelessWidget {
  final Posko p;
  const _PoskoCard(this.p);
  @override
  Widget build(BuildContext context) {
    return MsCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          if (p.open24) ...[
            Pill(context.t('BUKA 24 JAM', 'OPEN 24H'), bg: C.l1.withValues(alpha: .12), fg: C.l1, size: 10),
            const SizedBox(width: 8),
          ],
          const Icon(Icons.near_me_outlined, size: 14, color: C.textMuted),
          Text(' ${p.km} km ${context.t('dari Anda', 'away')}', style: inter(11.5, c: C.textMuted)),
          const Spacer(),
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(10)),
            child: Icon(p.type.id.startsWith('Shelter') ? Icons.night_shelter_outlined : Icons.warehouse_outlined, color: C.wine, size: 20),
          ),
        ]),
        const SizedBox(height: 4),
        Text(p.name, style: outfit(19, w: FontWeight.w600)),
        Text(context.l(p.type), style: inter(12, c: C.textMuted)),
        const SizedBox(height: 10),
        Row(children: [
          const Icon(Icons.groups_outlined, size: 16, color: C.wine),
          const SizedBox(width: 6),
          Text('${context.t('Kapasitas', 'Capacity')} ${p.capacityPct}%', style: inter(12.5, w: FontWeight.w600, c: C.wine)),
          const SizedBox(width: 10),
          Expanded(child: Bar(p.capacityPct / 100, color: p.capacityPct >= 80 ? C.l3 : C.l1, height: 6)),
        ]),
        const SizedBox(height: 12),
        Text('${context.t('Tersedia', 'Available')}:', style: inter(12, w: FontWeight.w600, c: C.textMuted)),
        const SizedBox(height: 6),
        Wrap(spacing: 6, runSpacing: 6, children: [
          for (final a in p.available) Pill(context.l(a), icon: Icons.check, bg: C.l1.withValues(alpha: .1), fg: C.l1, size: 10.5),
        ]),
        const SizedBox(height: 10),
        Text('${context.t('Mendesak', 'Urgent')}:', style: inter(12, w: FontWeight.w600, c: C.crimson)),
        const SizedBox(height: 6),
        Wrap(spacing: 6, runSpacing: 6, children: [
          for (final n in p.needed) Pill(context.l(n), icon: Icons.priority_high, bg: C.pink, fg: C.crimson, size: 10.5),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          const Icon(Icons.history, size: 14, color: C.textMuted),
          const SizedBox(width: 4),
          Text(context.t('Diperbarui relawan 30 mnt lalu', 'Updated by volunteers 30 min ago'), style: inter(11.5, c: C.textMuted)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: Btn(context.t('Rute Navigasi', 'Navigate'), icon: Icons.directions, height: 46, onTap: () => push(context, const EvacScreen()))),
          const SizedBox(width: 10),
          Expanded(
              child: Btn(context.t('Hubungi', 'Call'),
                  icon: Icons.call_outlined,
                  outlined: true,
                  height: 46,
                  onTap: () => toast(context, '${context.t('Menghubungi koordinator', 'Calling coordinator of')} ${p.name}…'))),
        ]),
      ]),
    );
  }
}

/// S16 — Aid Priority Index per village (WorldPop exposure × hazard × unmet need).
class AidPriorityScreen extends StatefulWidget {
  const AidPriorityScreen({super.key});
  @override
  State<AidPriorityScreen> createState() => _AidPriorityScreenState();
}

class _AidPriorityScreenState extends State<AidPriorityScreen> {
  final Set<String> _allocated = {};

  @override
  Widget build(BuildContext context) {
    final total = villages.fold(0, (a, v) => a + v.pop);
    final crit = villages.where((v) => v.krb == 'III').length;
    final gap = villages.fold(0, (a, v) => a + v.unmetPct) ~/ villages.length;
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          SubHeader(context.t('Logistik Bencana', 'Disaster Logistics'),
              trailing: Pill(context.t('Sinkron 12m lalu', 'Synced 12m ago'), icon: Icons.sync, bg: C.surfaceMid, size: 10)),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(16, 4, 16, 28), children: [
              const Wrap(spacing: 6, runSpacing: 6, children: [
                SatChip('WorldPop & GEE • H-0'),
                Pill('Sentinel-1 / MODIS', icon: Icons.radar, bg: C.pink, fg: C.crimson, size: 10.5),
              ]),
              const SizedBox(height: 12),
              Text(context.t('Kirim Bantuan ke Mana?', 'Where Should Aid Go?'), style: outfit(26, w: FontWeight.w700)),
              const SizedBox(height: 6),
              Text(
                  context.t('Kalkulasi populasi terpapar (WorldPop) × zona bahaya satelit Sentinel/MODIS, dibagi bantuan yang sudah diterima.',
                      'Exposed population (WorldPop) × Sentinel/MODIS hazard zones, divided by aid already received.'),
                  style: inter(14, c: C.textMuted, h: 1.5)),
              const SizedBox(height: 14),
              Row(children: [
                Expanded(child: Stat(context.t('Total Populasi', 'Population'), _fmt(total), sub: context.t('Jiwa di KRB II–III', 'People in KRB II–III'), bg: Colors.white)),
                const SizedBox(width: 8),
                Expanded(child: Stat(context.t('Wilayah Kritis', 'Critical areas'), '$crit ${context.t('Desa', 'Villages')}', sub: context.t('Prioritas Salur', 'Priority'), valueColor: C.crimson, bg: Colors.white)),
                const SizedBox(width: 8),
                Expanded(child: Stat(context.t('Kesenjangan', 'Unmet need'), '$gap%', sub: context.t('Belum tersuplai', 'Not yet supplied'), valueColor: C.l3, bg: Colors.white)),
              ]),
              const SizedBox(height: 14),
              MsCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.stacked_line_chart, color: C.wine),
                    const SizedBox(width: 8),
                    Expanded(child: Text(context.t('Matriks Sebaran Risiko & Kepadatan', 'Risk × Density Matrix'), style: outfit(16.5, w: FontWeight.w600))),
                    Pill('Candipuro', bg: C.surfaceMid, size: 10),
                  ]),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(R.control),
                    child: SizedBox(
                      height: 170,
                      child: Stack(fit: StackFit.expand, children: [
                        const GeoMap(mode: GeoMode.risk, showAsh: false),
                        Positioned(
                          left: 10,
                          bottom: 10,
                          child: Pill(context.t('Zona Aliran Lahar Besuk Kobokan', 'Besuk Kobokan lahar zone'), bg: Colors.black54, fg: Colors.white, size: 10),
                        ),
                        Positioned(right: 10, bottom: 10, child: Pill(context.t('Resolusi 100 m', '100 m grid'), bg: Colors.black54, fg: Colors.white, size: 10)),
                      ]),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(children: [
                    Text(context.t('Rendah', 'Low'), style: inter(10.5, c: C.textMuted)),
                    const Spacer(),
                    Text(context.t('Ekstrem (KRB III)', 'Extreme (KRB III)'), style: inter(10.5, w: FontWeight.w700, c: C.crimson)),
                  ]),
                  const SizedBox(height: 4),
                  Container(
                    height: 8,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(9),
                      gradient: const LinearGradient(colors: [C.l2, C.l3, C.crimson]),
                    ),
                  ),
                ]),
              ),
              const SizedBox(height: 16),
              SectionTitle(context.t('Ranking Desa', 'Village Ranking'), icon: Icons.format_list_numbered),
              for (var i = 0; i < villages.length; i++) _villageCard(context, i, villages[i]),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(R.card),
                child: Stack(children: [
                  Image.asset('assets/img/posko_scene.jpg', height: 140, width: double.infinity, fit: BoxFit.cover),
                  Positioned(
                    left: 12,
                    bottom: 10,
                    child: Text(context.t('Kondisi lapangan Posko Penanggal', 'Field conditions at Penanggal post'),
                        style: inter(12.5, w: FontWeight.w600, c: Colors.white)),
                  ),
                ]),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _villageCard(BuildContext context, int i, Village v) {
    final done = _allocated.contains(v.name);
    final c = v.api > .8 ? C.crimson : (v.api > .6 ? C.l3 : C.l2);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: MsCard(
        stripe: c,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Pill('#${i + 1} ${context.t('PRIORITAS', 'PRIORITY')}', bg: c, fg: Colors.white, size: 10),
            const SizedBox(width: 8),
            Pill('KRB ${v.krb}', bg: C.surfaceMid, size: 10),
            const Spacer(),
            Text('API ${v.api.toStringAsFixed(2)}', style: outfit(16, w: FontWeight.w700, c: c)),
          ]),
          const SizedBox(height: 8),
          Text('Desa ${v.name}', style: outfit(18, w: FontWeight.w600)),
          Text('Kec. ${v.kec} • ${_fmt(v.pop)} ${context.t('jiwa terpapar', 'people exposed')}', style: inter(12.5, c: C.textMuted)),
          const SizedBox(height: 10),
          Row(children: [
            Text(context.t('Kebutuhan belum terpenuhi', 'Unmet need'), style: inter(12, c: C.textMuted)),
            const Spacer(),
            Text('${done ? (v.unmetPct * .4).round() : v.unmetPct}%', style: inter(12, w: FontWeight.w700, c: c)),
          ]),
          const SizedBox(height: 4),
          Bar((done ? v.unmetPct * .4 : v.unmetPct) / 100, color: c, height: 6),
          const SizedBox(height: 12),
          Btn(done ? context.t('Bantuan Dialokasikan', 'Aid Allocated') : context.t('Alokasikan Bantuan', 'Allocate Aid'),
              icon: done ? null : Icons.local_shipping_outlined,
              height: 44,
              color: done ? C.l1 : C.primary, onTap: () {
            setState(() => done ? _allocated.remove(v.name) : _allocated.add(v.name));
            if (!done) toast(context, context.t('Truk logistik #L-07 dijadwalkan ke Desa ${v.name}', 'Logistics truck #L-07 dispatched to ${v.name}'));
          }),
        ]),
      ),
    );
  }

  static String _fmt(int n) => n >= 1000 ? '${n ~/ 1000}.${(n % 1000).toString().padLeft(3, '0')}' : '$n';
}

