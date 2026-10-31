import 'package:flutter/material.dart';

import '../core.dart';
import '../theme.dart';
import '../widgets.dart';
import 'onboarding.dart';
import 'shell.dart';

/// S18 — Profile, settings and the judges' Demo Mode (live level/persona/language switcher).
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _notif = true;
  bool _offline = true;

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final lvl = app.level;
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          const AppHeader(),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(16, 4, 16, 28), children: [
              Row(children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(context.t('Profil & Pengaturan', 'Profile & Settings'), style: outfit(24, w: FontWeight.w700)),
                    Text(context.t('Konfigurasi akun warga dan parameter darurat lokal', 'Resident account and local emergency settings'),
                        style: inter(12.5, c: C.textMuted)),
                  ]),
                ),
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.tune, color: C.wine),
                ),
              ]),
              const SizedBox(height: 14),
              MsCard(
                child: Column(children: [
                  Row(children: [
                    avatar(68),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Bapak Hendra Pratama', style: outfit(19, w: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Row(children: [
                          const Icon(Icons.location_on_outlined, size: 14, color: C.wine),
                          Flexible(
                              child: Text(' Candipuro, Lumajang (KRB II)',
                                  style: inter(12.5, c: C.text), overflow: TextOverflow.ellipsis)),
                        ]),
                        const SizedBox(height: 8),
                        Wrap(spacing: 6, runSpacing: 6, children: [
                          Pill(context.l(personaLabel[app.persona]!), bg: C.primary, fg: Colors.white, size: 10.5),
                          Pill(context.t('NIK terverifikasi', 'ID verified'), bg: C.surfaceMid, size: 10.5),
                        ]),
                      ]),
                    ),
                  ]),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(color: C.surfaceLow, borderRadius: BorderRadius.circular(R.control)),
                    child: Row(children: [
                      const Icon(Icons.circle, size: 10, color: C.crimson),
                      const SizedBox(width: 8),
                      Expanded(child: Text(context.t('Data Satelit GEE Tersinkron', 'GEE satellite data synced'), style: inter(12.5, w: FontWeight.w500))),
                      const Icon(Icons.signal_cellular_alt, size: 16, color: C.wine),
                      Text(context.t(' Sinyal Kuat', ' Strong'), style: inter(12, c: C.wine)),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              MsCard(
                border: C.outlineStrong,
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Pill(context.t('SANDBOX JURI', 'JUDGE SANDBOX'), icon: Icons.science_outlined, bg: C.crimson, fg: Colors.white, size: 10.5),
                    const Spacer(),
                    const Icon(Icons.circle, size: 8, color: C.l1),
                    Text(context.t(' Interaktif Aktif', ' Interactive'), style: inter(11.5, c: C.textMuted)),
                  ]),
                  const SizedBox(height: 12),
                  Text(context.t('Mode Simulasi Bencana (Live Switcher)', 'Disaster Simulation Mode (Live Switcher)'), style: outfit(20, w: FontWeight.w700, h: 1.2)),
                  const SizedBox(height: 6),
                  Text(
                      context.t('Uji bagaimana antarmuka MarketShield beradaptasi seketika terhadap perubahan eskalasi bencana dan persona pengguna.',
                          'See how MarketShield adapts instantly to escalation changes and user personas.'),
                      style: inter(13.5, c: C.textMuted, h: 1.45)),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(border: Border.all(color: C.outline), borderRadius: BorderRadius.circular(R.control)),
                    child: Row(children: [
                      Icon(Icons.warning_amber_rounded, color: C.level(lvl)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(context.t('Status Simulasi Aktif', 'Active simulation'), style: inter(11, c: C.textMuted)),
                          Text('Level ${levelRoman[lvl - 1]} • ${context.l(levelName[lvl - 1])}', style: inter(14, w: FontWeight.w700, c: C.wine)),
                        ]),
                      ),
                      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                        Text(context.t('Peran Aktif', 'Active role'), style: inter(11, c: C.textMuted)),
                        Text(context.l(personaLabel[app.persona]!).split(' ').first, style: inter(13, w: FontWeight.w700, c: C.primary)),
                      ]),
                    ]),
                  ),
                  const SizedBox(height: 14),
                  Row(children: [
                    Expanded(child: Text(context.t('Tingkat Bahaya Gunung Semeru', 'Semeru hazard level'), style: inter(13, w: FontWeight.w600, c: C.wine))),
                    Text(context.t('Klik level untuk simulasi', 'Tap a level'), style: inter(11, c: C.textMuted)),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    for (var k = 1; k <= 4; k++)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 3),
                          child: Material(
                            color: k == lvl ? C.primary : C.surfaceLow,
                            borderRadius: BorderRadius.circular(R.control),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(R.control),
                              onTap: () => app.setLevel(k),
                              child: Container(
                                height: 64,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(R.control),
                                  border: Border.all(color: k == lvl ? C.primary : C.outline),
                                ),
                                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                                  Container(
                                      width: 12,
                                      height: 12,
                                      decoration: BoxDecoration(
                                          color: C.level(k), shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2))),
                                  const SizedBox(height: 6),
                                  Text('${levelRoman[k - 1]} ${context.l(levelName[k - 1])}',
                                      style: inter(11, w: FontWeight.w600, c: k == lvl ? Colors.white : C.wine)),
                                ]),
                              ),
                            ),
                          ),
                        ),
                      ),
                  ]),
                  const SizedBox(height: 16),
                  Text(context.t('Ganti Persona Juri', 'Switch persona'), style: inter(13, w: FontWeight.w600, c: C.wine)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<Persona>(
                    initialValue: app.persona,
                    onChanged: (p) => p == null ? null : app.setPersona(p),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(R.control), borderSide: const BorderSide(color: C.outline)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(R.control), borderSide: const BorderSide(color: C.primary, width: 2)),
                    ),
                    items: [
                      for (final p in Persona.values)
                        DropdownMenuItem(value: p, child: Text(context.l(personaLabel[p]!), style: inter(14, c: C.wine))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(context.t('Bahasa', 'Language'), style: inter(13, w: FontWeight.w600, c: C.wine)),
                  const SizedBox(height: 8),
                  SegmentedButton<Lang>(
                    segments: const [
                      ButtonSegment(value: Lang.id, label: Text('Indonesia')),
                      ButtonSegment(value: Lang.en, label: Text('English')),
                    ],
                    selected: {app.lang},
                    showSelectedIcon: false,
                    onSelectionChanged: (s) => app.setLang(s.first),
                    style: SegmentedButton.styleFrom(
                      selectedBackgroundColor: C.primary,
                      selectedForegroundColor: Colors.white,
                      foregroundColor: C.wine,
                      side: const BorderSide(color: C.outline),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(R.control)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Btn(context.t('Lihat Beranda Adaptif', 'View Adaptive Home'), icon: Icons.landscape_outlined, onTap: () => tabIndex.value = 0),
                ]),
              ),
              const SizedBox(height: 14),
              MsCard(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Column(children: [
                  SwitchListTile(
                    value: _notif,
                    onChanged: (v) => setState(() => _notif = v),
                    activeThumbColor: C.primary,
                    secondary: const Icon(Icons.notifications_active_outlined, color: C.wine),
                    title: Text(context.t('Notifikasi Aksi Dini', 'Early-action notifications'), style: inter(14, w: FontWeight.w600, c: C.wine)),
                    subtitle: Text(context.t('Maks. 1 per hari, bergilir per dusun', 'Max 1/day, staggered by hamlet'), style: inter(12, c: C.textMuted)),
                  ),
                  SwitchListTile(
                    value: _offline,
                    onChanged: (v) => setState(() => _offline = v),
                    activeThumbColor: C.primary,
                    secondary: const Icon(Icons.download_for_offline_outlined, color: C.wine),
                    title: Text(context.t('Peta & rute offline', 'Offline maps & routes'), style: inter(14, w: FontWeight.w600, c: C.wine)),
                    subtitle: Text(context.t('Tersimpan 18 MB • Candipuro & Pronojiwo', '18 MB stored • Candipuro & Pronojiwo'), style: inter(12, c: C.textMuted)),
                  ),
                  ListTile(
                    leading: const Icon(Icons.replay, color: C.wine),
                    title: Text(context.t('Ulangi Onboarding', 'Replay onboarding'), style: inter(14, w: FontWeight.w600, c: C.wine)),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const SplashScreen()), (_) => false),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              MsCard(
                color: C.surfaceLow,
                shadow: const [],
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('Sumber Data', 'Data Sources'), style: inter(13.5, w: FontWeight.w700, c: C.wine)),
                  const SizedBox(height: 8),
                  for (final d in [
                    'COPERNICUS/S1_GRD · S5P/OFFL/L3_SO2',
                    'FIRMS (MODIS/VIIRS) · NASA/GPM_L3/IMERG_V07',
                    'NOAA/GFS0P25 · WorldPop · ESA/WorldCover/v200',
                    context.t('Status resmi: PVMBG / MAGMA Indonesia', 'Official status: PVMBG / MAGMA Indonesia'),
                  ])
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Icon(Icons.satellite_alt_outlined, size: 14, color: C.sat),
                        const SizedBox(width: 6),
                        Expanded(child: Text(d, style: inter(11.5, c: C.textMuted))),
                      ]),
                    ),
                  const Divider(height: 20, color: C.outline),
                  Text('MarketShield v1.0 • BRAIN – Ayam Jago • INCEPTION 2026',
                      style: inter(11, c: C.textMuted)),
                  Text(context.t('Sumber satelit: Google Earth Engine.', 'Satellite source: Google Earth Engine.'),
                      style: inter(11, c: C.textMuted)),
                ]),
              ),
            ]),
          ),
        ]),
      ),
    );
  }
}
