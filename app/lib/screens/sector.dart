import 'package:flutter/material.dart';

import '../core.dart';
import '../data/repository.dart';
import '../theme.dart';
import '../widgets.dart';

/// S17 — Sector alerts (asset exposure from ESA WorldCover × hazard) + notification inbox.
class SectorScreen extends StatefulWidget {
  const SectorScreen({super.key});
  @override
  State<SectorScreen> createState() => _SectorScreenState();
}

const _assets = {
  Persona.petani: (48000000, [L('12 Ekor Sapi Perah', '12 dairy cows'), L('0,8 Ha Jagung Siap Panen', '0.8 ha harvest-ready maize')]),
  Persona.pariwisata: (36500000, [L('Homestay 4 kamar', '4-room homestay'), L('Stok toko Rp6,5 jt', 'Shop stock Rp6.5m')]),
  Persona.logistik: (120000000, [L('3 truk engkel', '3 light trucks'), L('Gudang 200 m²', '200 m² warehouse')]),
  Persona.apotek: (22000000, [L('Stok obat Rp15 jt', 'Medicine stock Rp15m'), L('6 tabung O₂', '6 O₂ tanks')]),
  Persona.warga: (18000000, [L('Rumah & perabot', 'House & furniture'), L('1 sepeda motor', '1 motorbike')]),
};

(IconData, Color, String, String) _alertRow(BuildContext context, AlertItem a) {
  final (icon, color, source) = switch (a.kind) {
    'sat' => (Icons.satellite_alt_rounded, C.sat, const L('Satelit GEE', 'GEE satellite')),
    'hoax' => (Icons.cancel_outlined, C.crimson, const L('IndoBERT', 'IndoBERT')),
    'price' => (Icons.price_change_outlined, C.l3, const L('Pantau HET', 'Price Watch')),
    'posko' => (Icons.night_shelter_outlined, C.primary, const L('Posko', 'Aid posts')),
    'sector' => (Icons.business_center_outlined, C.l3, const L('Sektor', 'Sector')),
    _ => (Icons.info_outline, C.wine, const L('MarketShield', 'MarketShield')),
  };
  final meta = a.at == null ? context.l(a.meta) : '${context.l(source)} • ${context.l(ago(a.at!))}';
  return (icon, color, context.l(a.text), meta);
}

class _SectorScreenState extends State<SectorScreen> {
  late Persona _p = context.appRead.persona;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lvl = app.level;
    final (value, chips) = _assets[_p]!;
    final factor = [.25, .6, 1.0, 1.35][lvl - 1];
    final protocols = sectorProtocols[_p]!;
    final base = Persona.values.indexOf(_p) * 10;
    final inbox = [
      (Icons.warning_amber_rounded, C.level(lvl), context.t('Status Semeru: Level ${levelRoman[lvl - 1]} ${context.l(levelName[lvl - 1])}', 'Semeru status: Level ${levelRoman[lvl - 1]} ${context.l(levelName[lvl - 1])}'),
          context.t('PVMBG • 09:15 WIB', 'PVMBG • 09:15 WIB')),
      // Live alerts from GET /alerts (bundled fallback); the level line above already covers "level".
      for (final a in context.repo.alerts.value.where((a) => a.kind != 'level').take(4)) _alertRow(context, a),
    ];
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          SubHeader(context.t('Peringatan Sektor', 'Sector Alerts')),
          SizedBox(
            height: 44,
            child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: R.gutter), children: [
              for (final p in Persona.values)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    selected: _p == p,
                    onSelected: (_) => setState(() => _p = p),
                    showCheckmark: false,
                    avatar: Icon(personaIcon[p], size: 16, color: _p == p ? Colors.white : C.wine),
                    label: Text(context.l(personaLabel[p]!)),
                    labelStyle: inter(12.5, w: FontWeight.w600, c: _p == p ? Colors.white : C.wine),
                    selectedColor: C.primary,
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: C.outline),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(R.control)),
                  ),
                ),
            ]),
          ),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 10, R.gutter, 28), children: [
              MsCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Pill(context.t('Analisis Paparan Aset Sektoral', 'Sector Asset Exposure'), icon: Icons.warning_amber_rounded, bg: C.crimson, fg: Colors.white, size: 10.5),
                    const Spacer(),
                    Icon(Icons.circle, size: 8, color: C.level(lvl)),
                    Text(' ${context.l(levelName[lvl - 1])} ${levelRoman[lvl - 1]}', style: inter(11.5, w: FontWeight.w600, c: C.wine)),
                  ]),
                  const SizedBox(height: 14),
                  Eyebrow(context.t('Estimasi aset terpapar di Candipuro', 'Estimated exposed assets in Candipuro')),
                  const SizedBox(height: 4),
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: value * factor),
                    duration: const Duration(milliseconds: 700),
                    builder: (_, v, _) => Text(rp((v / 1000).round() * 1000), style: outfit(28, w: FontWeight.w700, c: C.crimson)),
                  ),
                  const SizedBox(height: 10),
                  Wrap(spacing: 8, runSpacing: 8, children: [
                    for (final ch in chips) Pill(context.l(ch), bg: C.surfaceLow, size: 11.5),
                  ]),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: C.surfaceLow, borderRadius: BorderRadius.circular(R.control)),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Icon(Icons.calculate_outlined, size: 18, color: C.wine),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text.rich(TextSpan(style: inter(13, c: C.text, h: 1.45), children: [
                          TextSpan(text: '${context.t('Kalkulasi Risiko', 'Risk formula')}: ', style: inter(13, w: FontWeight.w700, c: C.wine, h: 1.45)),
                          TextSpan(text: context.t('Σ P(bahaya satelit) × Nilai Aset × Kerentanan Wilayah', 'Σ P(satellite hazard) × Asset Value × Local Vulnerability')),
                        ])),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 10),
                  const SatChip('ESA WorldCover & Sentinel-2 • 12 jam'),
                ]),
              ),
              const SizedBox(height: 16),
              SectionTitle(context.t('Protokol Penyelamatan Sektor', 'Sector Protection Protocol'), icon: Icons.checklist_rtl),
              for (var i = 0; i < protocols.length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: MsCard(
                    onTap: () => app.toggleProtocol(base + i),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Icon(app.protocolDone.contains(base + i) ? Icons.check_box : Icons.check_box_outline_blank,
                          color: app.protocolDone.contains(base + i) ? C.l1 : C.outlineStrong),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(context.l(protocols[i].title),
                              style: inter(14, w: FontWeight.w600, c: C.wine).copyWith(
                                  decoration: app.protocolDone.contains(base + i) ? TextDecoration.lineThrough : null)),
                          const SizedBox(height: 4),
                          Text(context.l(protocols[i].body), style: inter(13, c: C.textMuted, h: 1.4)),
                          const SizedBox(height: 8),
                          Pill(context.l(protocols[i].due), icon: Icons.schedule, bg: C.peach, fg: C.l3, size: 10.5),
                        ]),
                      ),
                    ]),
                  ),
                ),
              const SizedBox(height: 10),
              SectionTitle('Inbox', icon: Icons.inbox_outlined),
              for (final (ic, c, title, sub) in inbox)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: MsCard(
                    padding: const EdgeInsets.all(12),
                    child: Row(children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(color: c.withValues(alpha: .12), borderRadius: BorderRadius.circular(10)),
                        child: Icon(ic, color: c, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(title, style: inter(13.5, w: FontWeight.w600, c: C.wine)),
                          Text(sub, style: inter(11.5, c: C.textMuted)),
                        ]),
                      ),
                    ]),
                  ),
                ),
            ]),
          ),
        ]),
      ),
    );
  }
}
