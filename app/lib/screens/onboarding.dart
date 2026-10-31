import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../core.dart';
import '../theme.dart';
import '../widgets.dart';
import 'shell.dart';

/// S01 — Splash & language choice.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    Widget langCard(Lang l, String flag, String title, String tag, String desc) {
      final sel = app.lang == l;
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: MsCard(
          stripe: sel ? C.primary : null,
          border: sel ? C.outlineStrong : null,
          onTap: () => app.setLang(l),
          padding: const EdgeInsets.all(14),
          child: Row(children: [
            Container(
              width: 40,
              height: 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(color: C.surfaceLow, borderRadius: BorderRadius.circular(10)),
              child: Text(flag, style: inter(13, w: FontWeight.w700, c: C.primary)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Text(title, style: inter(15, w: FontWeight.w600, c: C.wine)),
                  const SizedBox(width: 6),
                  Pill(tag, size: 10, bg: sel ? C.peach : C.surfaceMid),
                ]),
                const SizedBox(height: 3),
                Text(desc, style: inter(12.5, c: C.textMuted), maxLines: 2, overflow: TextOverflow.ellipsis),
              ]),
            ),
            Icon(sel ? Icons.radio_button_checked : Icons.radio_button_off,
                color: sel ? C.primary : C.outlineStrong, size: 24),
          ]),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.fromLTRB(20, 28, 20, 20), children: [
          Center(
            child: Container(
              width: 112,
              height: 112,
              decoration: const BoxDecoration(color: C.pink, shape: BoxShape.circle),
              alignment: Alignment.center,
              child: logo(84),
            ),
          ),
          const SizedBox(height: 18),
          Center(child: Text('MarketShield', style: outfit(32, w: FontWeight.w700))),
          const SizedBox(height: 8),
          Text(context.t('Deteksi dini dari satelit. Saring hoaks.\nBertindak tenang.',
              'Early detection from satellites. Filter hoaxes.\nAct calmly.'),
              textAlign: TextAlign.center, style: inter(15, c: C.textMuted, h: 1.45)),
          const SizedBox(height: 14),
          Center(child: SatChip(context.t('Didukung Citra Satelit Google Earth Engine', 'Powered by Google Earth Engine imagery'))),
          const SizedBox(height: 28),
          Row(children: [
            Text('PILIH BAHASA / SELECT LANGUAGE', style: inter(11, w: FontWeight.w700, c: C.wine, ls: .5)),
            const Spacer(),
            const Icon(Icons.translate, size: 14, color: C.primary),
            Text(' Bilingual', style: inter(11, c: C.primary, w: FontWeight.w500)),
          ]),
          const SizedBox(height: 10),
          langCard(Lang.id, 'ID', 'Bahasa Indonesia', 'Utama', 'Bahasa utama untuk notifikasi cepat Semeru & pantauan logistik.'),
          langCard(Lang.en, 'EN', 'English', 'Global', 'For humanitarian, NGO, and international responders in the field.'),
          MsCard(
            color: C.surfaceLow,
            shadow: const [],
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              const Icon(Icons.verified_user_outlined, color: C.primary, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('Verifikasi Fakta Bencana Aktif', 'Disaster Fact-Check Active'),
                      style: inter(12.5, w: FontWeight.w600, c: C.wine)),
                  Text(context.t('Sistem memfilter spekulasi & kepanikan visual.', 'Filters speculation & visual panic.'),
                      style: inter(11.5, c: C.textMuted)),
                ]),
              ),
              const Icon(Icons.check_circle_outline, color: C.outlineStrong, size: 20),
            ]),
          ),
          const SizedBox(height: 22),
          Btn(context.t('Lanjut', 'Continue'),
              icon: Icons.arrow_forward, trailingIcon: true, onTap: () => push(context, const OnboardingScreen())),
          const SizedBox(height: 14),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.storage_rounded, size: 14, color: C.textMuted),
            const SizedBox(width: 6),
            Text(context.t('Data resmi PVMBG & satelit Sentinel/MODIS', 'Official PVMBG data & Sentinel/MODIS satellites'),
                style: inter(11.5, c: C.textMuted)),
          ]),
        ]),
      ),
    );
  }
}

/// S02 — Three-page onboarding.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pc = PageController();
  int _i = 0;

  @override
  void dispose() {
    _pc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      (
        Icons.satellite_alt_rounded,
        context.t('Deteksi Dini dari Satelit', 'Early Detection from Space'),
        context.t(
            'Data Google Earth Engine dipantau setiap 6 jam untuk mendeteksi gas SO₂, anomali panas, perubahan radar, dan curah hujan pemicu lahar sebelum erupsi terlihat mata.',
            'Google Earth Engine data is checked every 6 hours for SO₂, heat anomalies, radar change and lahar-triggering rain before an eruption is visible.'),
        [
          (Icons.radar, context.t('Radar tembus asap & awan tebal', 'Radar sees through ash & cloud'),
              context.t('Sentinel-1 tetap memantau saat langit tertutup abu.', 'Sentinel-1 keeps watching under ash cover.')),
          (Icons.notifications_active_outlined, context.t('Peringatan aksi dini 3–7 hari', 'Early action alerts 3–7 days ahead'),
              context.t('Jendela evakuasi terencana bagi warga lingkar bahaya.', 'A planned evacuation window for at-risk residents.')),
        ],
        'Sentinel-1 • ${context.t('Radar Tembus Awan', 'Cloud-piercing radar')} • 6 ${context.t('jam lalu', 'hrs ago')}',
      ),
      (
        Icons.fact_check_outlined,
        context.t('Saring Hoaks, Tetap Tenang', 'Filter Hoaxes, Stay Calm'),
        context.t(
            'IndoBERT memilah pesan berantai menjadi Sinyal, Hoaks, atau Panik — lalu dicek silang dengan citra satelit terbaru.',
            'IndoBERT sorts chain messages into Signal, Hoax or Panic — then cross-checks them with the latest satellite imagery.'),
        [
          (Icons.content_paste_search, context.t('Tempel pesan WhatsApp', 'Paste a WhatsApp message'),
              context.t('Hasil verifikasi dalam hitungan detik.', 'Verdict in seconds.')),
          (Icons.satellite_alt_outlined, context.t('Cek silang citra satelit', 'Satellite cross-check'),
              context.t('Klaim lahar dibandingkan dengan radar Sentinel-1.', 'Lahar claims compared against Sentinel-1 radar.')),
        ],
        'IndoBERT • ${context.t('Akurasi uji 94,1%', 'Test accuracy 94.1%')}',
      ),
      (
        Icons.shopping_basket_outlined,
        context.t('Belanja Wajar, Bantuan Tepat', 'Fair Prices, Targeted Aid'),
        context.t(
            'Belanja Kit Siaga bertahap sesuai HET, dan bantuan diarahkan ke desa paling terpapar berdasarkan WorldPop × zona bahaya.',
            'Stock your Ready Kit in stages at capped prices, while aid goes to the most exposed villages by WorldPop × hazard zone.'),
        [
          (Icons.price_check, context.t('Pantau Harga HET', 'Track price caps'),
              context.t('Laporkan harga tidak wajar ke Satgas Pangan.', 'Report unfair prices to the Food Task Force.')),
          (Icons.diversity_3, context.t('Prioritas Bantuan', 'Aid Priority'),
              context.t('Posko tahu desa mana yang paling butuh.', 'Aid posts know which villages need it most.')),
        ],
        'WorldPop + ESA WorldCover',
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
                onPressed: () => push(context, const PersonaScreen()),
                child: Text(context.t('Lewati', 'Skip'), style: inter(14, c: C.primary, w: FontWeight.w600))),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pc,
              itemCount: pages.length,
              onPageChanged: (i) => setState(() => _i = i),
              itemBuilder: (_, i) {
                final p = pages[i];
                return ListView(padding: const EdgeInsets.symmetric(horizontal: 20), children: [
                  _Illustration(icon: p.$1, caption: p.$5),
                  const SizedBox(height: 22),
                  Text(p.$2, style: outfit(28, w: FontWeight.w700, h: 1.15)),
                  const SizedBox(height: 10),
                  Text(p.$3, style: inter(15, c: C.textMuted, h: 1.5)),
                  const SizedBox(height: 18),
                  for (final f in p.$4)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: MsCard(
                        padding: const EdgeInsets.all(14),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(color: C.pink, borderRadius: BorderRadius.circular(10)),
                            child: Icon(f.$1, color: C.primary, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(f.$2, style: inter(14, w: FontWeight.w600, c: C.wine)),
                              const SizedBox(height: 2),
                              Text(f.$3, style: inter(13, c: C.textMuted)),
                            ]),
                          ),
                        ]),
                      ),
                    ),
                ]);
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
            child: Column(children: [
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                for (var k = 0; k < pages.length; k++)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: k == _i ? 24 : 7,
                    height: 7,
                    decoration: BoxDecoration(
                        color: k == _i ? C.primary : C.outlineStrong, borderRadius: BorderRadius.circular(9)),
                  ),
              ]),
              const SizedBox(height: 16),
              Btn(_i == pages.length - 1 ? context.t('Mulai', 'Get started') : context.t('Berikutnya', 'Next'),
                  icon: Icons.arrow_forward,
                  trailingIcon: true, onTap: () {
                if (_i == pages.length - 1) {
                  push(context, const PersonaScreen());
                } else {
                  _pc.nextPage(duration: const Duration(milliseconds: 350), curve: Curves.easeOutCubic);
                }
              }),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _Illustration extends StatelessWidget {
  final IconData icon;
  final String caption;
  const _Illustration({required this.icon, required this.caption});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 250,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(R.card),
        gradient: const LinearGradient(
            begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFFFCEFEA), Color(0xFFF6E4DD)]),
      ),
      child: Stack(children: [
        Positioned.fill(child: CustomPaint(painter: _VolcanoArt())),
        Positioned(top: 34, left: 80, child: _sat()),
        Positioned(top: 54, right: 70, child: _sat()),
        Positioned(
          top: 70,
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              width: 54,
              height: 54,
              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: shadow2),
              child: Icon(icon, color: C.primary, size: 28),
            ),
          ),
        ),
        Positioned(bottom: 16, left: 0, right: 0, child: Center(child: SatChip(caption))),
      ]),
    );
  }

  Widget _sat() => Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 14, height: 6, color: C.sat),
        Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: C.wine, borderRadius: BorderRadius.circular(3))),
        Container(width: 14, height: 6, color: C.sat),
      ]);
}

class _VolcanoArt extends CustomPainter {
  @override
  void paint(Canvas canvas, Size s) {
    final cx = s.width / 2;
    final base = s.height - 40;
    final path = Path()
      ..moveTo(cx - 150, base)
      ..lineTo(cx - 22, s.height * .42)
      ..lineTo(cx + 22, s.height * .42)
      ..lineTo(cx + 150, base)
      ..close();
    canvas.drawPath(
        path,
        Paint()
          ..shader = const LinearGradient(
                  begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFFE8C9C2), Color(0x00E8C9C2)])
              .createShader(Rect.fromLTWH(0, s.height * .4, s.width, s.height * .6)));
    final dash = Paint()
      ..color = C.primary.withValues(alpha: .35)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.4;
    final r = Rect.fromCenter(center: Offset(cx, s.height * .44), width: 240, height: 84);
    for (var a = 0.0; a < math.pi * 2; a += .18) {
      canvas.drawArc(r, a, .09, false, dash);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// S03 — Persona / sector setup.
class PersonaScreen extends StatelessWidget {
  const PersonaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 4, 16, 0),
            child: Row(children: [
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back, color: C.wine)),
              Expanded(
                child: Column(children: [
                  Text(context.t('LANGKAH 2 DARI 2', 'STEP 2 OF 2'), style: inter(10.5, c: C.textMuted, ls: .8)),
                  Text(context.t('Personalisasi Risiko', 'Risk Personalisation'),
                      style: inter(13, w: FontWeight.w600, c: C.wine)),
                ]),
              ),
              const Icon(Icons.shield_outlined, color: C.wine),
            ]),
          ),
          const Padding(padding: EdgeInsets.fromLTRB(20, 10, 20, 0), child: Bar(1, height: 5)),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(20, 18, 20, 20), children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Pill(context.t('Kecamatan Candipuro, Lumajang', 'Candipuro District, Lumajang'),
                    icon: Icons.location_on_outlined, bg: C.pink),
              ),
              const SizedBox(height: 14),
              Text(context.t('Siapa Anda?', 'Who are you?'), style: outfit(30, w: FontWeight.w700)),
              const SizedBox(height: 8),
              Text(
                  context.t(
                      'MarketShield menyesuaikan panduan logistik, harga pangan, dan rute evakuasi sesuai peran Anda di Candipuro.',
                      'MarketShield tailors logistics guidance, food prices and evacuation routes to your role in Candipuro.'),
                  style: inter(15, c: C.textMuted, h: 1.5)),
              const SizedBox(height: 18),
              for (final p in Persona.values)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: MsCard(
                    color: app.persona == p ? C.surfaceLow : C.surface,
                    border: app.persona == p ? C.outlineStrong : null,
                    onTap: () => app.setPersona(p),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                            color: app.persona == p ? C.primary : C.surfaceMid, borderRadius: BorderRadius.circular(11)),
                        child: Icon(personaIcon[p], color: app.persona == p ? Colors.white : C.wine),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Flexible(child: Text(context.l(personaLabel[p]!), style: outfit(18, w: FontWeight.w600))),
                            if (app.persona == p) ...[
                              const SizedBox(width: 8),
                              Pill(context.t('Aktif', 'Active'), bg: C.primary, fg: Colors.white, size: 10),
                            ],
                          ]),
                          const SizedBox(height: 3),
                          Text(context.l(personaDesc[p]!), style: inter(13.5, c: C.textMuted, h: 1.4)),
                        ]),
                      ),
                      if (app.persona == p) const Icon(Icons.check_circle, color: C.primary),
                    ]),
                  ),
                ),
              const SizedBox(height: 10),
              Text(context.t('Sumber data', 'Data source'), style: outfit(20, w: FontWeight.w700)),
              const SizedBox(height: 4),
              Text(context.t('Bisa diganti kapan saja di Profil.', 'You can change this any time in Profile.'),
                  style: inter(13, c: C.textMuted)),
              const SizedBox(height: 12),
              const DataModePicker(),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
            child: Btn(context.t('Simpan & Mulai Pemantauan', 'Save & Start Monitoring'),
                icon: Icons.arrow_forward,
                trailingIcon: true,
                onTap: () => Navigator.of(context)
                    .pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const Shell()), (_) => false)),
          ),
        ]),
      ),
    );
  }
}

/// Demo vs Live choice, shared by onboarding and Profil. Saved via the data repository.
class DataModePicker extends StatelessWidget {
  const DataModePicker({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    Widget option(DataMode m, IconData icon, Color c, String title, String sub) {
      final on = app.mode == m;
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: MsCard(
          color: on ? C.surfaceLow : C.surface,
          border: on ? c : null,
          padding: const EdgeInsets.all(14),
          onTap: () => app.setMode(m),
          child: Row(children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: on ? c : C.surfaceMid, borderRadius: BorderRadius.circular(11)),
              child: Icon(icon, color: on ? Colors.white : C.wine, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(title, style: inter(14.5, w: FontWeight.w700, c: C.wine)),
                const SizedBox(height: 2),
                Text(sub, style: inter(12.5, c: C.textMuted, h: 1.35)),
              ]),
            ),
            Icon(on ? Icons.radio_button_checked : Icons.radio_button_off, color: on ? c : C.outlineStrong),
          ]),
        ),
      );
    }

    return Column(children: [
      option(DataMode.demo, Icons.science_outlined, C.l3, context.t('Mode demo', 'Demo mode'),
          context.t('Data contoh, level bisa disimulasikan.', 'Sample data; the alert level can be simulated.')),
      option(DataMode.live, Icons.cloud_sync_outlined, C.l1, context.t('Data live', 'Live data'),
          context.t('Langsung dari server MarketShield; level mengikuti PVMBG. Tetap jalan offline dengan data tersimpan.',
              'Straight from the MarketShield server; level follows PVMBG. Works offline with saved data.')),
    ]);
  }
}
