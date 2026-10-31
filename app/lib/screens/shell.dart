import 'package:flutter/material.dart';

import '../core.dart';
import '../data/repository.dart';
import '../theme.dart';
import '../widgets.dart';
import 'intel.dart';
import 'map.dart';
import 'posko.dart';
import 'profile.dart';
import 'sector.dart';

/// Active bottom tab; screens set it to jump between tabs (e.g. "Cari Posko").
final tabIndex = ValueNotifier<int>(0);

class Shell extends StatefulWidget {
  const Shell({super.key});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int? _lastLevel;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final lvl = context.app.level;
    if (_lastLevel != null && _lastLevel != lvl) {
      final up = lvl > _lastLevel!;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        toast(
            context,
            '${up ? '▲' : '▼'} ${context.t('Status Semeru', 'Semeru status')}: Level ${levelRoman[lvl - 1]} '
            '${context.l(levelName[lvl - 1])} — ${context.t('Beranda disesuaikan', 'Home adapted')}');
      });
    }
    _lastLevel = lvl;
  }

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.landscape_outlined, Icons.landscape, context.t('Beranda', 'Home')),
      (Icons.map_outlined, Icons.map, context.t('Peta', 'Map')),
      (Icons.fact_check_outlined, Icons.fact_check, 'Intel'),
      (Icons.storefront_outlined, Icons.storefront, 'Posko'),
      (Icons.manage_accounts_outlined, Icons.manage_accounts, context.t('Profil', 'Profile')),
    ];
    return ValueListenableBuilder<int>(
      valueListenable: tabIndex,
      builder: (context, i, _) => Scaffold(
        body: IndexedStack(index: i, children: const [
          HomeScreen(),
          MapScreen(),
          IntelScreen(),
          PoskoScreen(),
          ProfileScreen(),
        ]),
        bottomNavigationBar: Container(
          decoration: const BoxDecoration(
            color: C.bg,
            border: Border(top: BorderSide(color: C.outline)),
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: 64,
              child: Row(children: [
                for (var k = 0; k < items.length; k++)
                  Expanded(
                    child: InkWell(
                      onTap: () => tabIndex.value = k,
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 3),
                          decoration: BoxDecoration(
                              color: k == i ? C.pink : Colors.transparent, borderRadius: BorderRadius.circular(99)),
                          child: Icon(k == i ? items[k].$2 : items[k].$1,
                              color: k == i ? C.primary : C.navInactive, size: 23),
                        ),
                        const SizedBox(height: 3),
                        Text(items[k].$3,
                            style: inter(11.5,
                                w: k == i ? FontWeight.w700 : FontWeight.w500, c: k == i ? C.primary : C.navInactive)),
                      ]),
                    ),
                  ),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

/// S04–S06 — Home that adapts to PVMBG level I–IV.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lvl = context.app.level;
    return Scaffold(
      floatingActionButton: lvl >= 3 ? const SosFab() : null,
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          const AppHeader(),
          if (lvl == 4) const _CriticalBanner(),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 350),
              child: ListView(
                key: ValueKey(lvl),
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
                children: switch (lvl) {
                  4 => _awas(context),
                  3 => _siaga(context),
                  _ => _waspada(context, lvl),
                },
              ),
            ),
          ),
        ]),
      ),
    );
  }

  /// Time of the latest official status from the API, or the bundled bulletin time.
  String _pvmbgTime(BuildContext context) {
    final at = context.repo.volcano.value?.updatedAt;
    return at == null ? '09:15 WIB' : context.l(clock(at));
  }

  // ---------------------------------------------------------------- Level I–II
  List<Widget> _waspada(BuildContext context, int lvl) {
    final s = snapshots[lvl]!;
    final app = context.app;
    final kit = app.kitDone.length;
    final normal = lvl == 1;
    return [
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(children: [
          const Icon(Icons.near_me_outlined, size: 18, color: C.wine),
          const SizedBox(width: 6),
          Expanded(
              child: Text('Candipuro, Lumajang • 28 km ${context.t('dari puncak', 'from summit')}',
                  style: inter(13, w: FontWeight.w600, c: C.wine))),
          Pill(context.t('Status Dinamis', 'Live status'), icon: Icons.circle, bg: C.surfaceMid, size: 10.5),
        ]),
      ),
      const SizedBox(height: 6),
      MsCard(
        padding: EdgeInsets.zero,
        onTap: () => push(context, const VolcanoScreen()),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Eyebrow(context.t('Gunung api aktif', 'Active volcano')),
                  const SizedBox(height: 2),
                  Text('Gunung Semeru', style: outfit(22, w: FontWeight.w700)),
                  const SizedBox(height: 6),
                  LevelChip(lvl),
                ]),
              ),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Pill(context.t('28 km Utara', '28 km North'), bg: C.peach, size: 10.5),
                const SizedBox(height: 8),
                Row(children: [
                  const Icon(Icons.verified_outlined, size: 14, color: C.l1),
                  Text(' PVMBG • ${_pvmbgTime(context)}', style: inter(11, c: C.textMuted)),
                ]),
              ]),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _Photo('assets/img/semeru_calm.jpg',
                caption: context.t('Kamera Pantau Kawah Jonggring Saloko', 'Jonggring Saloko crater camera'), height: 150),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: MsCard(
              color: C.surfaceLow,
              shadow: const [],
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  const Icon(Icons.satellite_alt_rounded, size: 18, color: C.wine),
                  const SizedBox(width: 6),
                  Expanded(
                      child: Text(context.t('Prakiraan Satelit MarketShield', 'MarketShield Satellite Forecast'),
                          style: inter(13, w: FontWeight.w700, c: C.wine))),
                  SatChip('Sentinel-5P • ${context.l(s.updated)}'),
                ]),
                const SizedBox(height: 12),
                Row(children: [
                  Ring(
                    value: s.escalationPct / 100,
                    color: normal ? C.l1 : C.l2,
                    size: 58,
                    center: Text('${s.escalationPct}%', style: outfit(14, w: FontWeight.w700)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(context.t('Peluang Naik Status', 'Chance of Escalation'),
                          style: inter(13, w: FontWeight.w600, c: C.wine)),
                      Text(context.t('Estimasi horizon 7 hari', '7-day horizon estimate'), style: inter(11.5, c: C.textMuted)),
                    ]),
                  ),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(10)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(context.t('KESIAPSIAGAAN', 'PREPAREDNESS'), style: inter(9.5, c: C.textMuted, ls: .6)),
                      Text('≈ ${context.l(s.window)}', style: inter(13, w: FontWeight.w700, c: C.primary)),
                      Text(context.t('Jendela Aksi', 'Action Window'), style: inter(11.5, w: FontWeight.w600, c: C.primary)),
                    ]),
                  ),
                ]),
                const SizedBox(height: 10),
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Icon(Icons.warning_amber_rounded, size: 16, color: normal ? C.l1 : C.l2),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                        normal
                            ? context.t('Tidak ada anomali SO₂ maupun termal dalam 14 hari terakhir.',
                                'No SO₂ or thermal anomaly in the last 14 days.')
                            : context.t('Gas SO₂ naik 3 hari berturut-turut di Kawah Jonggring Saloko (${s.so2Du} DU).',
                                'SO₂ rose 3 days in a row at Jonggring Saloko crater (${s.so2Du} DU).'),
                        style: inter(12, c: C.textMuted)),
                  ),
                ]),
              ]),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(children: [
              Text(
                  normal
                      ? context.t(
                          'Kondisi normal. Ini waktu terbaik melengkapi Kit Siaga secara bertahap dengan harga wajar.',
                          'All normal. Best time to build your Ready Kit gradually at fair prices.')
                      : context.t(
                          'Aktivitas vulkanik meningkat. Siapkan perlengkapan sekarang di harga wajar sebelum lonjakan pasar logistik.',
                          'Volcanic activity is rising. Prepare now at fair prices before logistics prices spike.'),
                  style: inter(14, c: C.text, h: 1.45)),
              const SizedBox(height: 12),
              Btn(context.t('Lihat Rekomendasi Belanja (Kit Siaga)', 'See Shopping Plan (Ready Kit)'),
                  icon: Icons.inventory_2_outlined, onTap: () => push(context, const KitScreen())),
            ]),
          ),
        ]),
      ),
      const SizedBox(height: 14),
      MsCard(
        color: C.pink,
        border: const Color(0xFFF5C9C9),
        onTap: () => push(context, const KitScreen()),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.backpack_outlined, color: C.wine, size: 20),
            const SizedBox(width: 8),
            Expanded(
                child: Text('Kit Siaga: $kit/${kitItems.length} ${context.t('siap', 'ready')}',
                    style: inter(15, w: FontWeight.w700, c: C.wine))),
            Text('${(kit / kitItems.length * 100).round()}%', style: inter(13, w: FontWeight.w700, c: C.wine)),
          ]),
          const SizedBox(height: 10),
          Bar(kit / kitItems.length, color: C.primary),
          const SizedBox(height: 10),
          Text.rich(TextSpan(style: inter(13.5, c: C.text), children: [
            TextSpan(text: context.t('Harga wajar Masker N95 ≤ ', 'Fair price N95 masks ≤ ')),
            TextSpan(text: 'Rp150.000/box', style: inter(13.5, w: FontWeight.w700, c: C.wine)),
            TextSpan(text: context.t(' di apotek resmi Candipuro.', ' at licensed Candipuro pharmacies.')),
          ])),
        ]),
      ),
      const SizedBox(height: 18),
      SectionTitle(context.t('Sinyal Satelit GEE', 'GEE Satellite Signals'), icon: Icons.satellite_alt_outlined),
      _SignalGrid(s),
      const SizedBox(height: 14),
      _IntelTeaser(),
    ];
  }

  // ---------------------------------------------------------------- Level III
  List<Widget> _siaga(BuildContext context) {
    final s = snapshots[3]!;
    final p = context.app.persona;
    final first = sectorProtocols[p]!.first;
    return [
      MsCard(
        color: C.surfaceLow,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.landscape, color: C.wine),
            const SizedBox(width: 8),
            Expanded(child: Text('Gunung Semeru', style: outfit(22, w: FontWeight.w700))),
            const LevelChip(3, solid: true),
          ]),
          const SizedBox(height: 10),
          Text(
              context.t(
                  'Radius bahaya 5 km diperluas. Aktivitas awan panas guguran terekam intensif mengarah ke Besuk Kobokan.',
                  'Hazard radius extended to 5 km. Intense pyroclastic flow activity recorded towards Besuk Kobokan.'),
              style: inter(15, c: C.textMuted, h: 1.5)),
          const SizedBox(height: 14),
          MsCard(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Flexible(child: SatChip('Sentinel-1 & MODIS • ${context.l(s.updated)}')),
                const SizedBox(width: 6),
                Pill(context.t('Radar Aktif', 'Radar live'), bg: C.surfaceMid, size: 10.5),
              ]),
              const SizedBox(height: 14),
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Ring(
                  value: s.escalationPct / 100,
                  color: C.crimson,
                  arc: true,
                  size: 96,
                  stroke: 9,
                  center: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text('${s.escalationPct}%', style: outfit(22, w: FontWeight.w700, c: C.crimson)),
                    Text(context.t('Eskalasi', 'Escalation'), style: inter(10, c: C.textMuted)),
                  ]),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Pill('${context.t('Jendela Aksi', 'Action Window')}: ${context.l(s.window)}',
                        icon: Icons.timer_outlined, bg: C.pink, fg: C.crimson, size: 11),
                    const SizedBox(height: 8),
                    Text.rich(TextSpan(style: inter(13, c: C.text, h: 1.45), children: [
                      TextSpan(text: context.t('Anomali termal ', 'Thermal anomaly ')),
                      TextSpan(text: '${s.thermalMw} MW', style: inter(13, w: FontWeight.w700, c: C.crimson, h: 1.45)),
                      TextSpan(
                          text: context.t(' + penurunan backscatter radar ${s.s1Db} dB di lereng tenggara (Sentinel-1).',
                              ' + ${s.s1Db} dB radar backscatter drop on the south-east flank (Sentinel-1).')),
                    ])),
                  ]),
                ),
              ]),
            ]),
          ),
          const SizedBox(height: 14),
          Btn(context.t('Pratinjau Rute Evakuasi & Shelter', 'Preview Evacuation Route & Shelter'),
              icon: Icons.near_me_outlined, onTap: () => push(context, const EvacScreen())),
        ]),
      ),
      const SizedBox(height: 14),
      MsCard(
        stripe: C.l3,
        onTap: () => push(context, const SectorScreen()),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(personaIcon[p], color: C.wine),
            const SizedBox(width: 8),
            Expanded(
                child: Text('${context.t('Peringatan Sektor', 'Sector Alert')} • ${context.l(personaLabel[p]!)}',
                    style: outfit(18, w: FontWeight.w600))),
            Pill(context.t('Profil Terkait', 'Your profile'), bg: C.surfaceMid, size: 10),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: Text(context.t('Estimasi Aset Terpapar:', 'Estimated exposed assets:'), style: inter(13, c: C.textMuted))),
            Text('Rp48.000.000', style: outfit(18, w: FontWeight.w700, c: C.crimson)),
          ]),
          Align(
              alignment: Alignment.centerRight,
              child: Text(context.t('12 ekor sapi + 0,8 ha jagung', '12 cattle + 0.8 ha maize'), style: inter(11.5, c: C.textMuted))),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: C.surfaceLow, borderRadius: BorderRadius.circular(R.control)),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Icon(Icons.shield_outlined, color: C.primary, size: 18),
              const SizedBox(width: 8),
              Expanded(
                  child: Text('${context.l(first.title)} — ${context.l(first.due)}', style: inter(13.5, c: C.text, h: 1.45))),
            ]),
          ),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: Text('${context.t('Buka Protokol Sektor', 'Open Sector Protocol')} →',
                style: inter(13, w: FontWeight.w600, c: C.primary)),
          ),
        ]),
      ),
      const SizedBox(height: 14),
      Row(children: [
        Expanded(
            child: Stat(context.t('Arah Angin (Abu)', 'Wind (Ash)'), context.t('Barat Daya', 'South-West'),
                sub: '240° • 12 knot • GFS', bg: Colors.white)),
        const SizedBox(width: 10),
        Expanded(
            child: Stat(context.t('Hujan 24 Jam', 'Rain 24h'), '${s.rainMm} mm',
                sub: 'GPM IMERG • ${context.t('risiko lahar', 'lahar risk')}', valueColor: C.l3, bg: Colors.white)),
      ]),
      const SizedBox(height: 18),
      SectionTitle(context.t('Sinyal Satelit GEE', 'GEE Satellite Signals'), icon: Icons.satellite_alt_outlined),
      _SignalGrid(s),
      const SizedBox(height: 14),
      _IntelTeaser(),
    ];
  }

  // ---------------------------------------------------------------- Level IV
  List<Widget> _awas(BuildContext context) {
    final s = snapshots[4]!;
    return [
      const SizedBox(height: 8),
      Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: const LinearGradient(
              begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFFA0161B), Color(0xFF7A0F14)]),
          boxShadow: shadow2,
        ),
        padding: const EdgeInsets.all(18),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SatChip('Sentinel-1 & MODIS • ${context.l(s.updated)}', light: true),
          const SizedBox(height: 8),
          Text(context.t('RADAR AKTIF', 'RADAR LIVE'), style: inter(10.5, w: FontWeight.w700, c: const Color(0xFFFFB4A9), ls: 1)),
          const SizedBox(height: 14),
          Text(context.t('INSTRUKSI RESMI BNPB', 'OFFICIAL BNPB INSTRUCTION'),
              style: inter(11, w: FontWeight.w700, c: const Color(0xFFFFDAD5), ls: 1)),
          const SizedBox(height: 4),
          Text(context.t('EVAKUASI\nSEKARANG', 'EVACUATE\nNOW'), style: outfit(40, w: FontWeight.w800, c: Colors.white, h: 1)),
          const SizedBox(height: 10),
          Text(
              context.t(
                  'Awan panas guguran terkonfirmasi meluncur ke Besuk Kobokan. Radius bahaya diperluas hingga 7 km dari puncak. Segera tinggalkan zona merah.',
                  'Pyroclastic flow confirmed towards Besuk Kobokan. Hazard radius extended to 7 km from the summit. Leave the red zone now.'),
              style: inter(15, c: Colors.white, h: 1.5)),
          const SizedBox(height: 14),
          _Photo('assets/img/semeru_erupt.jpg',
              caption: context.t('Kamera Pemantau Curah Kobokan', 'Curah Kobokan monitoring camera'), height: 150),
          const SizedBox(height: 14),
          Btn(context.t('Mulai Panduan Evakuasi', 'Start Evacuation Guide'),
              icon: Icons.arrow_forward,
              trailingIcon: true,
              color: Colors.white,
              fg: C.crimson,
              height: 56,
              onTap: () => push(context, const EvacScreen())),
          const SizedBox(height: 10),
          SizedBox(
            height: 50,
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => tabIndex.value = 3,
              style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0x66FFFFFF)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(R.control))),
              icon: const Icon(Icons.near_me_outlined, color: Colors.white, size: 18),
              label: Text(context.t('Cari Posko Terdekat & Jalur Aman', 'Find Nearest Post & Safe Route'),
                  style: inter(14, w: FontWeight.w600, c: Colors.white)),
            ),
          ),
        ]),
      ),
      const SizedBox(height: 18),
      SectionTitle(context.t('Titik Kumpul & Posko Terdekat', 'Assembly Points & Nearest Posts'),
          icon: Icons.verified_user_outlined,
          trailing: Text(context.t('1 mnt lalu', '1 min ago'), style: inter(11, c: C.textMuted))),
      for (final (name, km, note, cap) in [
        ('GOR Candipuro', 2.6, context.t('Koridor AB • Aman', 'Corridor AB • Safe'), 60),
        ('Balai Desa Penanggal', 1.4, context.t('Jalur desa • Aman', 'Village road • Safe'), 80),
      ])
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: MsCard(
            onTap: () => push(context, const EvacScreen()),
            child: Row(children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(color: C.l1.withValues(alpha: .12), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.home_work_outlined, color: C.l1),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(name, style: outfit(17, w: FontWeight.w600)),
                  Text('$km km • $note • ${context.t('Kapasitas', 'Capacity')} $cap%', style: inter(12.5, c: C.textMuted)),
                ]),
              ),
              Pill(context.t('HIJAU', 'GREEN'), bg: C.l1, fg: Colors.white, size: 10),
            ]),
          ),
        ),
      const SizedBox(height: 6),
      MsCard(
        color: C.peach,
        border: const Color(0xFFF3CDB9),
        shadow: const [],
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Icon(Icons.campaign_outlined, color: C.wine),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
                context.t(
                    'Abaikan pesan berantai. Ikuti hanya instruksi resmi BNPB/PVMBG yang ditampilkan di aplikasi ini.',
                    'Ignore chain messages. Follow only official BNPB/PVMBG instructions shown in this app.'),
                style: inter(13.5, c: C.wine, h: 1.45, w: FontWeight.w500)),
          ),
        ]),
      ),
    ];
  }
}

class _CriticalBanner extends StatelessWidget {
  const _CriticalBanner();
  @override
  Widget build(BuildContext context) => Container(
        color: C.crimson,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
        child: Row(children: [
          const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Expanded(
              child: Text(context.t('STATUS KRITIS: LEVEL IV AWAS • SEMERU', 'CRITICAL: LEVEL IV WARNING • SEMERU'),
                  style: inter(12, w: FontWeight.w700, c: Colors.white, ls: .4), overflow: TextOverflow.ellipsis)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(6)),
            child: Text(context.t('DARURAT', 'EMERGENCY'), style: inter(10, w: FontWeight.w800, c: C.crimson)),
          ),
        ]),
      );
}

class _Photo extends StatelessWidget {
  final String asset;
  final String caption;
  final double height;
  const _Photo(this.asset, {required this.caption, this.height = 160});
  @override
  Widget build(BuildContext context) => ClipRRect(
        borderRadius: BorderRadius.circular(R.control),
        child: SizedBox(
          height: height,
          width: double.infinity,
          child: Stack(fit: StackFit.expand, children: [
            Image.asset(asset, fit: BoxFit.cover),
            Positioned(
              left: 10,
              bottom: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(6)),
                child: Row(children: [
                  const Icon(Icons.videocam_outlined, size: 13, color: Colors.white),
                  const SizedBox(width: 5),
                  Text(caption, style: inter(10.5, c: Colors.white, w: FontWeight.w500)),
                ]),
              ),
            ),
          ]),
        ),
      );
}

class _SignalGrid extends StatelessWidget {
  final SatSnapshot s;
  const _SignalGrid(this.s);
  @override
  Widget build(BuildContext context) {
    final tiles = [
      ('SO₂', '${s.so2Du} DU', 'Sentinel-5P TROPOMI', Icons.cloud_outlined, s.so2Du > 4 ? C.l3 : C.sat),
      (context.t('Termal', 'Thermal'), '${s.thermalMw} MW', 'MODIS/VIIRS FIRMS', Icons.local_fire_department_outlined,
          s.thermalMw > 30 ? C.l3 : C.sat),
      ('Radar', '${s.s1Db} dB', 'Sentinel-1 GRD', Icons.radar, s.s1Db < -3 ? C.l3 : C.sat),
      (context.t('Hujan 24j', 'Rain 24h'), '${s.rainMm} mm', 'GPM IMERG', Icons.water_drop_outlined,
          s.rainMm > 40 ? C.l3 : C.sat),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.75,
      children: [
        for (final t in tiles)
          MsCard(
            padding: const EdgeInsets.all(12),
            onTap: () => push(context, const VolcanoScreen()),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(t.$4, size: 17, color: t.$5),
                const SizedBox(width: 6),
                Text(t.$1, style: inter(12.5, w: FontWeight.w600, c: C.textMuted)),
              ]),
              const Spacer(),
              Text(t.$2, style: outfit(20, w: FontWeight.w700, c: t.$5 == C.sat ? C.wine : t.$5)),
              Text(t.$3, style: inter(10, c: C.sat, w: FontWeight.w600)),
            ]),
          ),
      ],
    );
  }
}

class _IntelTeaser extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final hoaxes = context.repo.intel.value
        .where((f) => f.v == Verdict.hoax && (f.at == null || now.difference(f.at!).inHours < 24))
        .length;
    return MsCard(
        onTap: () => tabIndex.value = 2,
        child: Row(children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(color: C.pink, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.fact_check_outlined, color: C.crimson),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                  hoaxes == 0
                      ? context.t('Belum ada hoaks baru hari ini', 'No new hoaxes today')
                      : context.t('$hoaxes hoaks baru terbantah hari ini',
                          '$hoaxes new hoax${hoaxes == 1 ? '' : 'es'} debunked today'),
                  style: inter(14, w: FontWeight.w600, c: C.wine)),
              Text(context.t('IndoBERT + cek silang citra satelit', 'IndoBERT + satellite cross-check'),
                  style: inter(12, c: C.textMuted)),
            ]),
          ),
          const Icon(Icons.chevron_right, color: C.textMuted),
        ]),
      );
  }
}
