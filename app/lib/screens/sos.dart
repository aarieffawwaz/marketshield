import 'package:flutter/material.dart';

import '../core.dart';
import '../theme.dart';
import '../widgets.dart';

/// S10 — SOS: hold 3 s to send a location beacon to BPBD, Basarnas and the nearest post.
class SosScreen extends StatefulWidget {
  const SosScreen({super.key});
  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _hold = AnimationController(vsync: this, duration: const Duration(seconds: 3))
    ..addStatusListener((s) {
      if (s == AnimationStatus.completed) setState(() => _sent = true);
    });
  bool _sent = false;

  @override
  void dispose() {
    _hold.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const bg = Color(0xFF7A0F14);
    const card = Color(0x26FFFFFF);
    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 8, R.gutter, 28), children: [
          Row(children: [
            IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close, color: Colors.white)),
            const Spacer(),
            Pill(context.t('MODUS DARURAT AKTIF', 'EMERGENCY MODE ON'), bg: C.crimson, fg: Colors.white, size: 10.5),
            const Spacer(),
            const SizedBox(width: 48),
          ]),
          const SizedBox(height: 8),
          Text(context.t('PANGGILAN DARURAT & BEACON EVAKUASI', 'EMERGENCY CALL & EVACUATION BEACON'),
              textAlign: TextAlign.center, style: outfit(22, w: FontWeight.w700, c: Colors.white, h: 1.2)),
          const SizedBox(height: 8),
          Text(
              context.t('Lokasi & data keluarga dikirim otomatis ke BPBD Lumajang, Basarnas, dan Posko Candipuro.',
                  'Location & family data are sent automatically to BPBD Lumajang, Basarnas and Posko Candipuro.'),
              textAlign: TextAlign.center,
              style: inter(13.5, c: const Color(0xFFFFDAD5), h: 1.45)),
          const SizedBox(height: 26),
          Center(
            child: GestureDetector(
              onLongPressStart: (_) {
                if (!_sent) _hold.forward();
              },
              onLongPressEnd: (_) {
                if (!_sent) _hold.reverse();
              },
              onTap: () {
                if (!_sent) toast(context, context.t('Tekan & tahan 3 detik', 'Press & hold for 3 seconds'));
              },
              child: AnimatedBuilder(
                animation: _hold,
                builder: (_, _) => SizedBox(
                  width: 250,
                  height: 250,
                  child: Stack(alignment: Alignment.center, children: [
                    Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                          shape: BoxShape.circle, border: Border.all(color: Colors.white.withValues(alpha: .15), width: 14)),
                    ),
                    SizedBox(
                      width: 236,
                      height: 236,
                      child: CircularProgressIndicator(
                        value: _sent ? 1 : _hold.value,
                        strokeWidth: 8,
                        color: Colors.white,
                        backgroundColor: Colors.transparent,
                      ),
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 190 - _hold.value * 10,
                      height: 190 - _hold.value * 10,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _sent ? C.l1 : C.crimson,
                        boxShadow: [
                          BoxShadow(
                              color: (_sent ? C.l1 : C.crimson).withValues(alpha: .6), blurRadius: 30, spreadRadius: 4)
                        ],
                      ),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        if (_sent) ...[
                          const Icon(Icons.check_circle, color: Colors.white, size: 44),
                          const SizedBox(height: 6),
                          Text(context.t('SINYAL\nTERKIRIM', 'BEACON\nSENT'),
                              textAlign: TextAlign.center, style: outfit(20, w: FontWeight.w700, c: Colors.white, h: 1.1)),
                        ] else ...[
                          Text('SOS', style: outfit(30, w: FontWeight.w800, c: Colors.white)),
                          const SizedBox(height: 6),
                          Text(context.t('TAHAN 3 DETIK', 'HOLD 3 SECONDS'), style: outfit(18, w: FontWeight.w700, c: Colors.white)),
                          Text(context.t('Tekan & Tahan', 'Press & Hold'), style: inter(12, c: const Color(0xFFFFDAD5))),
                        ],
                      ]),
                    ),
                  ]),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.my_location, color: Colors.white70, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                  _sent
                      ? context.t('Diterima BPBD Lumajang 09:42 WIB. Tim SAR menuju lokasi (ETA 14 mnt). Tetap di tempat aman.',
                          'Received by BPBD Lumajang 09:42 WIB. SAR team en route (ETA 14 min). Stay somewhere safe.')
                      : context.t('Sinyal darurat dikirimkan ke BPBD Lumajang, Basarnas, dan Posko Candipuro.',
                          'The beacon goes to BPBD Lumajang, Basarnas and Posko Candipuro.'),
                  style: inter(14, c: Colors.white, h: 1.45)),
            ),
          ]),
          const SizedBox(height: 18),
          _box(
            card,
            Row(children: [
              const Icon(Icons.location_on_outlined, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('LOKASI TERKUNCI', 'LOCATION LOCKED'), style: inter(10.5, c: Colors.white70, ls: .8)),
                  const SizedBox(height: 2),
                  Text('Candipuro, RT 04 / RW 02, Lumajang', style: inter(14.5, w: FontWeight.w600, c: Colors.white)),
                  const SizedBox(height: 6),
                  Text('-8.2144, 113.0421 • ${context.t('Akurasi GPS', 'GPS accuracy')}: 4 m',
                      style: inter(12, c: Colors.white70)),
                ]),
              ),
              const Pill('GPS FIX', bg: Color(0x33FFFFFF), fg: Colors.white, size: 10),
            ]),
          ),
          const SizedBox(height: 10),
          _box(
            card,
            Row(children: [
              const Icon(Icons.family_restroom, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('DATA KORBAN TERDAFTAR', 'REGISTERED PEOPLE'), style: inter(10.5, c: Colors.white70, ls: .8)),
                  const SizedBox(height: 2),
                  Text(context.t('4 jiwa (termasuk 1 lansia berisiko & 1 anak)', '4 people (incl. 1 at-risk elder & 1 child)'),
                      style: inter(14.5, w: FontWeight.w600, c: Colors.white)),
                ]),
              ),
            ]),
          ),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: _call(context, Icons.call, '112', 'BPBD Lumajang', context.t('Panggilan Darurat', 'Emergency call'))),
            const SizedBox(width: 10),
            Expanded(child: _call(context, Icons.emergency, 'POSKO', 'Posko Candipuro', context.t('Satuan Lapangan', 'Field unit'))),
          ]),
        ]),
      ),
    );
  }

  Widget _box(Color c, Widget child) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(R.card)),
        child: child,
      );

  Widget _call(BuildContext context, IconData i, String tag, String title, String sub) => Material(
        color: const Color(0x26FFFFFF),
        borderRadius: BorderRadius.circular(R.card),
        child: InkWell(
          borderRadius: BorderRadius.circular(R.card),
          onTap: () => toast(context, '${context.t('Menghubungi', 'Calling')} $title…'),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                  child: Icon(i, color: C.crimson, size: 18),
                ),
                const Spacer(),
                Text(tag, style: inter(11, w: FontWeight.w700, c: Colors.white70)),
              ]),
              const SizedBox(height: 12),
              Text(title, style: inter(14.5, w: FontWeight.w600, c: Colors.white)),
              Text(sub, style: inter(11.5, c: Colors.white70)),
            ]),
          ),
        ),
      );
}
