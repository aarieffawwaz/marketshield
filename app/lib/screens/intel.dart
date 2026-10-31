import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core.dart';
import '../data/repository.dart';
import '../theme.dart';
import '../widgets.dart';

/// S11 + S13 — Intel tab: fact-check and price-cap (HET) monitor.
class IntelScreen extends StatefulWidget {
  const IntelScreen({super.key});
  @override
  State<IntelScreen> createState() => _IntelScreenState();
}

/// Selected Intel sub-tab (0 fact check, 1 price caps); deep links can preselect it.
final intelTab = ValueNotifier<int>(0);

class _IntelScreenState extends State<IntelScreen> {
  int get _tab => intelTab.value;

  @override
  void initState() {
    super.initState();
    intelTab.addListener(_sync);
  }

  @override
  void dispose() {
    intelTab.removeListener(_sync);
    super.dispose();
  }

  void _sync() => setState(() {});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          const AppHeader(),
          Container(
            margin: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 8),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(R.control + 2)),
            child: Row(children: [
              for (final (i, ic, label) in [
                (0, Icons.verified_outlined, context.t('Cek Fakta', 'Fact Check')),
                (1, Icons.price_change_outlined, context.t('Harga HET', 'Price Caps')),
              ])
                Expanded(
                  child: GestureDetector(
                    onTap: () => intelTab.value = i,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      height: 44,
                      decoration: BoxDecoration(
                          color: _tab == i ? C.primary : Colors.transparent, borderRadius: BorderRadius.circular(R.control)),
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(ic, size: 18, color: _tab == i ? Colors.white : C.wine),
                        const SizedBox(width: 6),
                        Text(label, style: inter(14, w: FontWeight.w600, c: _tab == i ? Colors.white : C.wine)),
                      ]),
                    ),
                  ),
                ),
            ]),
          ),
          Expanded(child: _tab == 0 ? const _FactCheckTab() : const _HetTab()),
        ]),
      ),
    );
  }
}

// ------------------------------------------------------------------ fact check

const sampleHoax =
    'INFO DARURAT LUMAJANG: Jembatan Gladak Perak ambruk lagi kena lahar dingin Semeru sore ini, Pronojiwo terisolir total cepat sebarkan ke grup RT!';

class FactResult {
  final Verdict v;
  final int pct;
  final List<String> flagged;
  final String? fact; // nearest official fact (API), replaces the canned conclusion
  final String? satellite; // satellite cross-check note (API)
  final bool live; // false = offline on-device rules
  const FactResult(this.v, this.pct, this.flagged, {this.fact, this.satellite, this.live = false});
}

/// Mock of the IndoBERT multi-task classifier (SIGNAL / HOAX / PANIC) output.
FactResult classify(String text) {
  final t = text.toLowerCase();
  const hoaxWords = ['ambruk', 'ambrol', 'terisolir', 'meluap', 'putus', 'tembus', 'habis', 'sebarkan', 'viral', 'katanya'];
  const officialWords = ['pvmbg', 'badan geologi', 'bnpb', 'bpbd', 'resmi', 'magma'];
  final flagged = [for (final w in hoaxWords) if (t.contains(w)) w];
  final official = officialWords.where(t.contains).length;
  if (flagged.length >= 2) return FactResult(Verdict.hoax, (87 + flagged.length * 3).clamp(87, 97), flagged);
  if (official > 0 && flagged.isEmpty) return FactResult(Verdict.official, 88 + official * 2, const []);
  return FactResult(Verdict.check, 61, flagged);
}

class _FactCheckTab extends StatefulWidget {
  const _FactCheckTab();
  @override
  State<_FactCheckTab> createState() => _FactCheckTabState();
}

class _FactCheckTabState extends State<_FactCheckTab> {
  final _ctl = TextEditingController();
  bool _busy = false;
  int _filter = 0;

  @override
  void dispose() {
    _ctl.dispose();
    super.dispose();
  }

  Future<void> _check() async {
    final text = _ctl.text.trim().isEmpty ? sampleHoax : _ctl.text.trim();
    setState(() => _busy = true);
    // Server classifier first (POST /signals/check); on-device rules when offline.
    final (remote, _) = await (
      context.repoRead.checkSignal(text, context.appRead.lang),
      Future<void>.delayed(const Duration(milliseconds: 600)),
    ).wait;
    if (!mounted) return;
    setState(() => _busy = false);
    final result = remote == null
        ? classify(text)
        : FactResult(remote.verdict, remote.pct, remote.triggers,
            fact: remote.fact, satellite: remote.satellite, live: true);
    push(context, FactResultScreen(text: text, result: result));
  }

  @override
  Widget build(BuildContext context) {
    final intel = context.repo.intel;
    final all = intel.value;
    final items = all
        .where((f) =>
            _filter == 0 ||
            (_filter == 1 ? (f.v == Verdict.hoax || f.v == Verdict.panic) : f.v == Verdict.official))
        .toList();
    return ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 24), children: [
      MsCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.sensors, size: 16, color: C.crimson),
            const SizedBox(width: 6),
            Eyebrow(context.t('Sensor informasi cepat', 'Rapid info sensor'), color: C.crimson),
          ]),
          const SizedBox(height: 8),
          Text(context.t('Dapat pesan berantai atau video mencurigakan? Cek sekarang.', 'Got a chain message or suspicious video? Check it now.'),
              style: outfit(20, w: FontWeight.w600, h: 1.25)),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
                color: C.surfaceLow, borderRadius: BorderRadius.circular(R.control), border: Border.all(color: C.outline)),
            child: Column(children: [
              TextField(
                controller: _ctl,
                minLines: 3,
                maxLines: 6,
                style: inter(14),
                decoration: InputDecoration(
                  hintText: context.t('Tempel pesan WhatsApp, tautan video, atau rumor di sini…', 'Paste a WhatsApp message, video link or rumour here…'),
                  hintStyle: inter(14, c: C.navInactive),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final clip = await Clipboard.getData('text/plain');
                      final txt = (clip?.text ?? '').trim();
                      _ctl.text = txt.isEmpty ? sampleHoax : txt;
                    },
                    style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: C.outline),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                    icon: const Icon(Icons.content_paste, size: 16, color: C.wine),
                    label: Text(context.t('Tempel', 'Paste'), style: inter(12.5, w: FontWeight.w600, c: C.wine)),
                  ),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 12),
          _busy
              ? Container(
                  height: 52,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: C.primary, borderRadius: BorderRadius.circular(R.control)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                    const SizedBox(width: 12),
                    Text(context.t('IndoBERT menganalisis…', 'IndoBERT analysing…'), style: inter(15, w: FontWeight.w600, c: Colors.white)),
                  ]),
                )
              : Btn(context.t('Cek Pesan', 'Check Message'), icon: Icons.manage_search, onTap: _check),
          const SizedBox(height: 10),
          Row(children: [
            const Icon(Icons.satellite_alt_outlined, size: 14, color: C.sat),
            const SizedBox(width: 6),
            Expanded(
                child: Text(context.t('Didukung IndoBERT Disaster Model + Cek Silang Citra Satelit', 'Powered by IndoBERT Disaster Model + satellite cross-check'),
                    style: inter(11.5, c: C.textMuted))),
          ]),
        ]),
      ),
      const SizedBox(height: 14),
      SizedBox(
        height: 38,
        child: ListView(scrollDirection: Axis.horizontal, children: [
          for (final (i, label, dot) in [
            (0, '${context.t('Semua', 'All')}  ${all.length}', null),
            (1, context.t('Hoaks Terbantah', 'Debunked'), C.crimson),
            (2, context.t('Resmi PVMBG', 'Official PVMBG'), C.l1),
          ])
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                selected: _filter == i,
                onSelected: (_) => setState(() => _filter = i),
                showCheckmark: false,
                avatar: dot == null ? null : CircleAvatar(radius: 4, backgroundColor: dot),
                label: Text(label),
                labelStyle: inter(12.5, w: FontWeight.w600, c: _filter == i ? Colors.white : C.wine),
                selectedColor: C.primary,
                backgroundColor: Colors.white,
                side: const BorderSide(color: C.outline),
                shape: const StadiumBorder(),
              ),
            ),
        ]),
      ),
      const SizedBox(height: 10),
      Row(children: [
        Expanded(child: Text(context.t('Umpan verifikasi', 'Verification feed'), style: inter(11.5, c: C.textMuted))),
        Freshness(intel),
      ]),
      const SizedBox(height: 10),
      for (final f in items) Padding(padding: const EdgeInsets.only(bottom: 12), child: _FeedCard(f)),
    ]);
  }
}

class _FeedCard extends StatelessWidget {
  final FeedItem f;
  const _FeedCard(this.f);
  @override
  Widget build(BuildContext context) {
    final hoax = f.v == Verdict.hoax;
    final (c, label, icon) = switch (f.v) {
      Verdict.hoax => (C.crimson, context.t('HOAKS TERBANTAH', 'DEBUNKED'), Icons.cancel),
      Verdict.panic => (C.l3, context.t('PEMICU PANIK', 'PANIC BAIT'), Icons.campaign_outlined),
      Verdict.verified => (C.l1, context.t('TERVERIFIKASI', 'VERIFIED'), Icons.check_circle),
      Verdict.check => (C.l2, context.t('PERLU VERIFIKASI', 'UNVERIFIED'), Icons.help_outline),
      Verdict.official => (C.l1, context.t('RESMI', 'OFFICIAL'), Icons.verified),
    };
    final tappable = hoax || f.v == Verdict.panic;
    return MsCard(
      stripe: c,
      onTap: tappable ? () => _open(context) : null,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Pill('$label • ${f.pct}%', icon: icon, bg: c.withValues(alpha: .12), fg: c, size: 10.5),
          const Spacer(),
          Text(context.l(f.when), style: inter(11, c: C.textMuted)),
        ]),
        const SizedBox(height: 10),
        Text(context.l(f.title), style: outfit(17.5, w: FontWeight.w600, h: 1.3)),
        const SizedBox(height: 6),
        Text(context.l(f.body), style: inter(13.5, c: C.textMuted, h: 1.45)),
        if (hoax) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: C.surfaceLow, borderRadius: BorderRadius.circular(10)),
            child: Row(children: [
              ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: const AssetPhoto('assets/img/factcheck_sat.webp', width: 44, height: 34)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('Analisis SAR Sentinel-1 Copernicus', 'Copernicus Sentinel-1 SAR analysis'),
                      style: inter(11.5, w: FontWeight.w700, c: C.wine)),
                  Text(context.t('Resolusi 10 m • Pass Lumajang 05:42 WIB', '10 m resolution • Lumajang pass 05:42 WIB'),
                      style: inter(10.5, c: C.textMuted)),
                ]),
              ),
            ]),
          ),
        ],
      ]),
    );
  }

  void _open(BuildContext context) {
    final text = context.l(f.title).replaceAll(RegExp(r'^["“]+|["”]+$'), '');
    push(
        context,
        FactResultScreen(
            text: text,
            result: FactResult(f.v, f.pct, classify(text).flagged, fact: context.l(f.body), live: f.at != null)));
  }
}

/// S12 — Fact-check verdict with satellite cross-check.
class FactResultScreen extends StatelessWidget {
  final String text;
  final FactResult result;
  const FactResultScreen({super.key, required this.text, required this.result});

  @override
  Widget build(BuildContext context) {
    final r = result;
    final (color, label, canned) = switch (r.v) {
      Verdict.hoax => (
          C.crimson,
          context.t('KEMUNGKINAN BESAR HOAKS', 'MOST LIKELY A HOAX'),
          context.t(
              'Pesan ini berisi disinformasi yang menggunakan rekaman kejadian lama untuk memicu kepanikan warga di jalur evakuasi Curah Kobokan. Citra radar terbaru tidak menunjukkan kerusakan jembatan.',
              'This message reuses old footage to spark panic along the Curah Kobokan evacuation route. The latest radar imagery shows no bridge damage.')
        ),
      Verdict.panic => (
          C.l3,
          context.t('PEMICU PANIK', 'PANIC BAIT'),
          context.t('Pesan ini membesar-besarkan kelangkaan untuk memicu panic buying. Cek stok dan harga resmi di Pantau HET sebelum membeli.',
              'This message exaggerates shortages to trigger panic buying. Check verified stock and capped prices before you buy.')
        ),
      Verdict.verified => (
          C.l1,
          context.t('TERVERIFIKASI', 'VERIFIED'),
          context.t('Laporan ini cocok dengan lapisan satelit dan laporan warga lain. Tetap ikuti instruksi resmi.',
              'This report matches satellite layers and other resident reports. Keep following official instructions.')
        ),
      Verdict.official => (
          C.l1,
          context.t('SINYAL / INFO RESMI', 'SIGNAL / OFFICIAL INFO'),
          context.t('Isi pesan konsisten dengan rilis PVMBG/BNPB dan data satelit terbaru. Aman dibagikan.',
              'Content matches PVMBG/BNPB releases and the latest satellite data. Safe to share.')
        ),
      Verdict.check => (
          C.l2,
          context.t('PERLU VERIFIKASI', 'NEEDS VERIFICATION'),
          context.t('Belum ada sumber resmi maupun bukti satelit yang cukup. Jangan sebarkan dulu.',
              'No official source or satellite evidence yet. Do not forward it for now.')
        ),
    };
    final conclusion = r.fact ?? canned;
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          SubHeader(context.t('Verifikasi Berita', 'News Verification')),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 28), children: [
              Row(children: [
                InkWell(
                  onTap: () => Navigator.of(context).maybePop(),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.arrow_back, size: 15, color: C.primary),
                      const SizedBox(width: 4),
                      Text(context.t('Cek Pesan', 'Check message'), style: inter(13, w: FontWeight.w600, c: C.primary)),
                    ]),
                  ),
                ),
                const Spacer(),
                Pill('${context.t('Laporan', 'Report')} #MS-88219', icon: Icons.check_circle_outline, bg: C.surfaceMid, size: 10.5),
              ]),
              const SizedBox(height: 12),
              Row(children: [
                const Icon(Icons.forward_to_inbox, size: 16, color: C.wine),
                const SizedBox(width: 6),
                Expanded(child: Text(context.t('Pesan Teruskan yang Dianalisis', 'Forwarded message analysed'), style: inter(12.5, w: FontWeight.w600, c: C.wine))),
                Text('16:42 WIB', style: inter(11.5, c: C.textMuted)),
              ]),
              const SizedBox(height: 8),
              MsCard(
                color: C.surfaceLow,
                shadow: const [],
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.reply_all, size: 14, color: C.textMuted),
                    const SizedBox(width: 6),
                    Text(context.t('Diteruskan berkali-kali', 'Forwarded many times'), style: inter(11.5, c: C.textMuted).copyWith(fontStyle: FontStyle.italic)),
                  ]),
                  const SizedBox(height: 8),
                  _highlighted(text, r.flagged),
                ]),
              ),
              const SizedBox(height: 14),
              MsCard(
                color: color.withValues(alpha: .06),
                border: color.withValues(alpha: .3),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(
                        child: Align(
                            alignment: Alignment.centerLeft,
                            child: Pill(label, icon: Icons.warning_amber_rounded, bg: color, fg: Colors.white, size: 11))),
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: r.pct.toDouble()),
                      duration: const Duration(milliseconds: 900),
                      builder: (_, v, _) => Text('${v.round()}%', style: outfit(26, w: FontWeight.w700, c: color)),
                    ),
                  ]),
                  const SizedBox(height: 8),
                  Text(
                      r.live
                          ? context.t('Tingkat kepastian IndoBERT Multi-Task', 'IndoBERT multi-task confidence')
                          : context.t('Tingkat kepastian • analisis offline di perangkat', 'Confidence • offline on-device analysis'),
                      style: inter(12, c: C.textMuted)),
                  const SizedBox(height: 6),
                  Bar(r.pct / 100, color: color),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(R.control)),
                    child: Text.rich(TextSpan(style: inter(14, c: C.text, h: 1.5), children: [
                      TextSpan(text: '${context.t('Kesimpulan Analisis', 'Conclusion')}: ', style: inter(14, w: FontWeight.w700, c: color, h: 1.5)),
                      TextSpan(text: conclusion),
                    ])),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              MsCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Icon(Icons.satellite_alt_rounded, color: C.sat),
                    const SizedBox(width: 8),
                    Expanded(child: Text(context.t('Cek Silang Citra Satelit', 'Satellite Cross-check'), style: outfit(18, w: FontWeight.w600))),
                  ]),
                  const SizedBox(height: 8),
                  // Chip on its own line so it never collides with the title on narrow screens.
                  const Align(alignment: Alignment.centerLeft, child: SatChip('Sentinel-1 SAR')),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(R.control),
                    child: Stack(children: [
                      // Archive photo of the 2021 eruption (not a live satellite image).
                      const AssetPhoto('assets/img/bridge.webp', height: 160, width: double.infinity),
                      Positioned(
                        left: 8,
                        top: 8,
                        child: Pill(context.t('Arsip 2021: permukiman tertimbun abu', 'Archive 2021: homes buried in ash'),
                            icon: Icons.photo_library_outlined, bg: Colors.black54, fg: Colors.white, size: 10.5),
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          color: Colors.black45,
                          child: Text('Foto: Antara TV • CC BY 3.0', style: inter(9, c: Colors.white)),
                        ),
                      ),
                    ]),
                  ),
                  if (r.satellite != null) ...[
                    const SizedBox(height: 12),
                    Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Icon(Icons.radar, size: 16, color: C.sat),
                      const SizedBox(width: 6),
                      Expanded(child: Text(r.satellite!, style: inter(13, c: C.text, h: 1.45))),
                    ]),
                  ],
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: Stat(context.t('Perubahan backscatter', 'Backscatter change'), '−0,2 dB', sub: context.t('di bawah ambang −3 dB', 'below −3 dB threshold'))),
                    const SizedBox(width: 10),
                    Expanded(child: Stat(context.t('Hujan 24 jam', 'Rain 24h'), '6 mm', sub: 'GPM IMERG')),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    const Icon(Icons.circle, size: 9, color: C.l1),
                    const SizedBox(width: 6),
                    Expanded(child: Text('Besuk Kobokan & Gladak Perak', style: inter(12.5, w: FontWeight.w600, c: C.wine))),
                    Text(context.t('Pass terakhir 05:42 WIB', 'Last pass 05:42 WIB'), style: inter(11.5, c: C.textMuted)),
                  ]),
                ]),
              ),
              const SizedBox(height: 16),
              Btn(context.t('Bagikan Klarifikasi ke Grup', 'Share Clarification to Group'),
                  icon: Icons.share_outlined, onTap: () => toast(context, context.t('Kartu klarifikasi disalin untuk WhatsApp', 'Clarification card copied for WhatsApp'))),
              const SizedBox(height: 10),
              Btn(context.t('Laporkan ke Aduan Konten Komdigi', 'Report to Komdigi'),
                  icon: Icons.flag_outlined, outlined: true, onTap: () => toast(context, context.t('Laporan terkirim', 'Report sent'))),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _highlighted(String text, List<String> flagged) {
    if (flagged.isEmpty) return Text('"$text"', style: inter(16, c: C.text, h: 1.55));
    final spans = <TextSpan>[];
    final lower = text.toLowerCase();
    var i = 0;
    while (i < text.length) {
      int? hitAt;
      String? hit;
      for (final w in flagged) {
        final j = lower.indexOf(w, i);
        if (j >= 0 && (hitAt == null || j < hitAt)) {
          hitAt = j;
          hit = w;
        }
      }
      if (hitAt == null) {
        spans.add(TextSpan(text: text.substring(i)));
        break;
      }
      spans.add(TextSpan(text: text.substring(i, hitAt)));
      spans.add(TextSpan(
          text: text.substring(hitAt, hitAt + hit!.length),
          style: const TextStyle(
              color: C.crimson, fontWeight: FontWeight.w700, decoration: TextDecoration.underline, decorationColor: C.crimson)));
      i = hitAt + hit.length;
    }
    return Text.rich(TextSpan(style: inter(16, c: C.text, h: 1.55), children: [const TextSpan(text: '"'), ...spans, const TextSpan(text: '"')]));
  }
}

// ------------------------------------------------------------------ HET

class _HetTab extends StatelessWidget {
  const _HetTab();

  @override
  Widget build(BuildContext context) {
    final prices = context.repo.prices;
    final board = prices.value;
    final n95 = board.featured;
    final d = n95.diffPct;
    final (pillText, pillColor, pillIcon) = d <= 0
        ? (context.t('HARGA STABIL (DI BAWAH HET)', 'STABLE (BELOW CAP)'), C.l1, Icons.check_circle_outline)
        : d <= 10
            ? (context.t('HARGA NAIK (SEDIKIT DI ATAS HET)', 'RISING (JUST ABOVE CAP)'), C.l2, Icons.trending_up)
            : (context.t('DI ATAS HET • LAPORKAN', 'ABOVE CAP • REPORT IT'), C.crimson, Icons.warning_amber_rounded);
    return ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 24), children: [
      MsCard(
        color: C.surfaceLow,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Pill(context.t('SISTEM ANTI-PENIMBUNAN & SPEKULASI', 'ANTI-HOARDING & SPECULATION'), icon: Icons.shield_outlined, bg: C.pink, fg: C.crimson, size: 10.5),
          const SizedBox(height: 8),
          Freshness(prices),
          const SizedBox(height: 10),
          Text(context.t('PANTAU HARGA KEBUTUHAN DARURAT', 'TRACK EMERGENCY SUPPLY PRICES'), style: outfit(22, w: FontWeight.w700, c: C.crimson, h: 1.15)),
          const SizedBox(height: 8),
          Text(
              context.t('Harga Eceran Tertinggi (HET) diawasi bersama Disperindag & Satgas Pangan Lumajang guna melindungi penyintas bencana dari spekulasi pedagang nakal.',
                  'Price caps (HET) are monitored with the Lumajang Trade Office & Food Task Force to protect survivors from speculative pricing.'),
              style: inter(13.5, c: C.textMuted, h: 1.5)),
        ]),
      ),
      const SizedBox(height: 14),
      MsCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(color: C.pink, borderRadius: BorderRadius.circular(12)),
              child: Icon(n95.icon, color: C.crimson),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${context.t('PERLINDUNGAN ISPA', 'RESPIRATORY PROTECTION')} • ${context.t('Prioritas 1', 'Priority 1')}', style: inter(10.5, c: C.textMuted, ls: .4)),
                Text('${context.l(n95.name)} (${context.l(n95.unit)})', style: outfit(19, w: FontWeight.w600)),
              ]),
            ),
          ]),
          const SizedBox(height: 10),
          Pill(pillText, icon: pillIcon, bg: pillColor.withValues(alpha: .12), fg: pillColor, size: 11),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Stat(context.t('HET Pemerintah', 'Govt. price cap'), rp(n95.het), sub: context.t('Batas tarif legal', 'Legal ceiling'))),
            const SizedBox(width: 10),
            Expanded(
                child: Stat(context.t('Rata-rata ${board.region}', '${board.region} average'), rp(n95.avg),
                    sub: d <= 0
                        ? '${context.t('Hemat', 'Save')} ${rp(n95.het - n95.avg)} (${d.toStringAsFixed(0)}%)'
                        : '+${rp(n95.avg - n95.het)} (+${d.toStringAsFixed(0)}%) ${context.t('di atas HET', 'above cap')}',
                    valueColor: pillColor)),
          ]),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(border: Border.all(color: C.outline), borderRadius: BorderRadius.circular(R.control)),
            child: Row(children: [
              const Icon(Icons.local_pharmacy_outlined, color: C.primary),
              const SizedBox(width: 10),
              Expanded(
                child: Text.rich(TextSpan(style: inter(13.5, c: C.text), children: [
                  TextSpan(text: context.t('Tersedia di ', 'Available at ')),
                  TextSpan(text: '${n95.stores} ${context.t('Apotek Resmi', 'licensed pharmacies')}', style: inter(13.5, w: FontWeight.w700, c: C.wine)),
                  TextSpan(text: context.t(' terverifikasi di radius 5 km.', ' within 5 km.')),
                ])),
              ),
            ]),
          ),
        ]),
      ),
      const SizedBox(height: 12),
      Btn(context.t('Laporkan Jika Menemukan Harga Tidak Wajar', 'Report an Unfair Price'),
          icon: Icons.report_outlined, color: C.surfaceMid, fg: C.crimson, onTap: () => _report(context)),
      const SizedBox(height: 18),
      SectionTitle(context.t('Kebutuhan Darurat Lainnya', 'Other Emergency Supplies'), icon: Icons.inventory_2_outlined),
      for (final h in board.others)
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: MsCard(
            padding: const EdgeInsets.all(14),
            child: Row(children: [
              Icon(h.icon, color: C.wine),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.l(h.name), style: inter(14.5, w: FontWeight.w600, c: C.wine)),
                  Text('${context.l(h.unit)} • HET ${rp(h.het)} • ${h.stores} ${context.t('toko', 'stores')}', style: inter(11.5, c: C.textMuted)),
                ]),
              ),
              const SizedBox(width: 8),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text(rp(h.avg), style: outfit(16, w: FontWeight.w700)),
                _status(context, h),
              ]),
            ]),
          ),
        ),
    ]);
  }

  Widget _status(BuildContext context, HetItem h) {
    final d = h.diffPct;
    final (label, c) = d <= 0
        ? (context.t('Stabil', 'Stable'), C.l1)
        : d <= 10
            ? (context.t('Naik', 'Rising'), C.l2)
            : (context.t('Di atas HET', 'Above cap'), C.crimson);
    return Text('${d > 0 ? '+' : ''}${d.toStringAsFixed(1)}% • $label', style: inter(11, w: FontWeight.w700, c: c));
  }

  void _report(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(R.sheet))),
      builder: (sheet) => Padding(
        padding: EdgeInsets.fromLTRB(R.gutter, 12, R.gutter, 20 + MediaQuery.of(sheet).viewInsets.bottom),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: C.handle, borderRadius: BorderRadius.circular(9)))),
          const SizedBox(height: 16),
          Text(context.t('Laporkan Harga Tidak Wajar', 'Report an Unfair Price'), style: outfit(20, w: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(context.t('Laporan diteruskan ke Satgas Pangan Lumajang. Identitas Anda dirahasiakan.', 'Reports go to the Lumajang Food Task Force. Your identity stays private.'),
              style: inter(13, c: C.textMuted)),
          const SizedBox(height: 16),
          for (final (hint, ic) in [
            (context.t('Barang (mis. Masker N95)', 'Item (e.g. N95 mask)'), Icons.inventory_2_outlined),
            (context.t('Harga yang ditemui (Rp)', 'Price seen (Rp)'), Icons.payments_outlined),
            (context.t('Nama toko / lokasi', 'Store name / location'), Icons.storefront_outlined),
          ])
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: TextField(
                decoration: InputDecoration(
                  prefixIcon: Icon(ic, color: C.wine),
                  hintText: hint,
                  filled: true,
                  fillColor: C.surfaceLow,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(R.control), borderSide: const BorderSide(color: C.outline)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(R.control), borderSide: const BorderSide(color: C.outline)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(R.control), borderSide: const BorderSide(color: C.primary, width: 2)),
                ),
              ),
            ),
          const SizedBox(height: 6),
          Btn(context.t('Kirim Laporan', 'Send Report'), icon: Icons.send, onTap: () {
            Navigator.pop(sheet);
            toast(context, context.t('Terima kasih — laporan #HP-2291 diterima Satgas Pangan', 'Thanks — report #HP-2291 received by the Food Task Force'));
          }),
        ]),
      ),
    );
  }
}

// ------------------------------------------------------------------ Kit

/// S14 — Family Ready Kit with staggered "Early Action" shopping nudge.
class KitScreen extends StatelessWidget {
  const KitScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final done = app.kitDone.length;
    final remaining = [for (var i = 0; i < kitItems.length; i++) if (!app.kitDone.contains(i)) kitItems[i].price].fold(0, (a, b) => a + b);
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          SubHeader(context.t('Kit Siaga', 'Ready Kit'),
              trailing: Pill('Level ${levelRoman[app.level - 1]} ${context.l(levelName[app.level - 1])}', bg: C.pink, size: 10.5)),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 28), children: [
              MsCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Pill('${context.t('ID Keluarga', 'Family ID')}: KK-3508-0912', icon: Icons.badge_outlined, bg: C.surfaceMid, size: 10.5),
                        const SizedBox(height: 10),
                        Text(context.t('Kit Siaga Bapak Hendra', "Mr. Hendra's Ready Kit"), style: outfit(20, w: FontWeight.w700, c: C.crimson)),
                        const SizedBox(height: 4),
                        Text.rich(TextSpan(style: inter(13, c: C.textMuted), children: [
                          TextSpan(text: context.t('Tanggungan: 4 jiwa • ', 'Household: 4 people • ')),
                          TextSpan(text: context.t('1 lansia berisiko', '1 at-risk elder'), style: inter(13, w: FontWeight.w600, c: C.crimson)),
                        ])),
                      ]),
                    ),
                    Ring(
                      value: done / kitItems.length,
                      color: C.crimson,
                      size: 72,
                      stroke: 7,
                      center: Column(mainAxisSize: MainAxisSize.min, children: [
                        Text('$done/${kitItems.length}', style: outfit(18, w: FontWeight.w700)),
                        Text(context.t('Siap', 'Ready'), style: inter(10, c: C.textMuted)),
                      ]),
                    ),
                  ]),
                  const SizedBox(height: 14),
                  Row(children: [
                    Expanded(child: Stat(context.t('Sisa belanja kit (estimasi HET)', 'Remaining kit cost (at cap)'), rp(remaining))),
                    const SizedBox(width: 10),
                    Expanded(child: Stat(context.t('Batas HET resmi', 'Official cap'), context.t('Terkunci', 'Locked'), sub: 'Disperindag', valueColor: C.l1)),
                  ]),
                ]),
              ),
              const SizedBox(height: 12),
              MsCard(
                color: C.peach,
                border: const Color(0xFFF3CDB9),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.sensors, color: C.crimson),
                    const SizedBox(width: 8),
                    Expanded(child: Text(context.t('Kenapa melengkapi sekarang?', 'Why complete it now?'), style: inter(15, w: FontWeight.w700, c: C.wine))),
                  ]),
                  const SizedBox(height: 6),
                  const Pill('EARLY ACTION', bg: C.crimson, fg: Colors.white, size: 10),
                  const SizedBox(height: 10),
                  Text(
                      context.t(
                          'Satelit mendeteksi kenaikan SO₂ & anomali panas Semeru. Membeli sekarang menjamin harga HET wajar tanpa antrean panic buying. Notifikasi pembelian dijadwalkan bergilir per dusun.',
                          'Satellites detect rising SO₂ & heat at Semeru. Buying now locks fair capped prices with no panic-buying queues. Purchase nudges are staggered by hamlet.'),
                      style: inter(14, c: C.text, h: 1.5)),
                  const SizedBox(height: 10),
                  Row(children: [
                    const Icon(Icons.event_available, size: 16, color: C.wine),
                    const SizedBox(width: 6),
                    Expanded(
                        child: Text(context.t('Jadwal Dusun Krajan: Hari ini s/d 18.00 WIB', 'Krajan hamlet slot: today until 18:00 WIB'),
                            style: inter(12.5, w: FontWeight.w700, c: C.wine))),
                  ]),
                ]),
              ),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: _img('assets/img/kit_bag.webp', context.t('Tas Siaga Kedap Air', 'Waterproof go-bag'))),
                const SizedBox(width: 10),
                Expanded(child: _img('assets/img/kit_med.webp', context.t('Paket Khusus Lansia', 'Elderly pack'))),
              ]),
              const SizedBox(height: 16),
              SectionTitle(context.t('Daftar Kebutuhan Kit', 'Kit Checklist'),
                  trailing: Text(context.t('Ketuk untuk ubah status', 'Tap to toggle'), style: inter(11, c: C.textMuted))),
              for (var i = 0; i < kitItems.length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: MsCard(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    onTap: () => app.toggleKit(i),
                    child: Row(children: [
                      Icon(kitItems[i].icon, color: app.kitDone.contains(i) ? C.textMuted : C.wine),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(context.l(kitItems[i].name),
                              style: inter(14, w: FontWeight.w600, c: app.kitDone.contains(i) ? C.textMuted : C.wine)
                                  .copyWith(decoration: app.kitDone.contains(i) ? TextDecoration.lineThrough : null)),
                          Text('${kitItems[i].qty} • ≤ ${rp(kitItems[i].price)}', style: inter(11.5, c: C.textMuted)),
                        ]),
                      ),
                      Icon(app.kitDone.contains(i) ? Icons.check_box : Icons.check_box_outline_blank,
                          color: app.kitDone.contains(i) ? C.l1 : C.outlineStrong),
                    ]),
                  ),
                ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _img(String a, String label) => ClipRRect(
        borderRadius: BorderRadius.circular(R.card),
        child: SizedBox(
          height: 110,
          child: Stack(fit: StackFit.expand, children: [
            AssetPhoto(a),
            const DecoratedBox(
                decoration: BoxDecoration(
                    gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black54]))),
            Positioned(left: 10, bottom: 8, child: Text(label, style: inter(12, w: FontWeight.w600, c: Colors.white))),
          ]),
        ),
      );
}
