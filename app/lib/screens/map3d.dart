import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core.dart';
import '../theme.dart';
import '../widgets.dart';
import 'map3d_view.dart';

/// Chrome-free 3D Semeru map served by the website (`?sim=1` starts the eruption simulation).
const map3dUrl = 'https://marketshield-inception.vercel.app/embed/peta';

/// In-app on web (iframe) and Android/iOS (WebView); other desktop targets fall back to the browser.
bool get _inApp => kIsWeb || defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS;

/// Opens the 3D map full-screen inside the app.
Future<void> open3dMap(BuildContext context, {bool sim = false}) async {
  final url = sim ? '$map3dUrl?sim=1' : map3dUrl;
  if (_inApp) {
    push(context, Map3dScreen(url: url, sim: sim));
    return;
  }
  final ok = await launchUrl(Uri.parse(url)).catchError((_) => false);
  if (!ok && context.mounted) toast(context, context.t('Tidak bisa membuka peta 3D', 'Could not open the 3D map'));
}

/// "3D" action sheet: plain 3D view or the eruption simulation.
void show3dOptions(BuildContext context) {
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(R.sheet))),
    builder: (sheet) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(R.gutter, 12, R.gutter, 12),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: C.handle, borderRadius: BorderRadius.circular(9)))),
          const SizedBox(height: 14),
          Text(context.t('Peta 3D Semeru', 'Semeru 3D map'), style: outfit(20, w: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(context.t('Medan 3D dengan zona KRB dan jalur lahar. Butuh koneksi internet.', '3D terrain with KRB zones and lahar paths. Needs an internet connection.'),
              style: inter(13, c: C.textMuted, h: 1.4)),
          const SizedBox(height: 12),
          for (final (sim, icon, title, sub) in [
            (false, Icons.view_in_ar_outlined, context.t('Lihat peta 3D', 'Open 3D map'), context.t('Jelajahi medan Semeru', 'Explore Semeru terrain')),
            (true, Icons.local_fire_department_outlined, context.t('Simulasikan erupsi', 'Simulate eruption'),
                context.t('Animasi awan panas & sebaran abu', 'Pyroclastic flow & ash animation')),
          ])
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(color: sim ? C.pink : C.surfaceMid, borderRadius: BorderRadius.circular(11)),
                child: Icon(icon, color: sim ? C.crimson : C.wine),
              ),
              title: Text(title, style: inter(14.5, w: FontWeight.w600, c: C.wine)),
              subtitle: Text(sub, style: inter(12, c: C.textMuted)),
              trailing: const Icon(Icons.chevron_right, color: C.textMuted),
              onTap: () {
                Navigator.pop(sheet);
                open3dMap(context, sim: sim);
              },
            ),
        ]),
      ),
    ),
  );
}

/// Full-screen in-app 3D map: WebView on Android/iOS, iframe on web. The close bar sits above the page
/// (not over it) so taps on it never get swallowed by the embedded page.
class Map3dScreen extends StatefulWidget {
  final String url;
  final bool sim;
  const Map3dScreen({super.key, required this.url, this.sim = false});
  @override
  State<Map3dScreen> createState() => _Map3dScreenState();
}

class _Map3dScreenState extends State<Map3dScreen> {
  static const _bg = Color(0xFF0E0A09);
  int _attempt = 0;
  int _progress = 0;
  bool _failed = false;

  void _onProgress(int p) => setState(() => _progress = p);
  void _onFailed() => setState(() => _failed = true);

  @override
  Widget build(BuildContext context) {
    final loading = _progress < 100 && !_failed;
    return Scaffold(
      backgroundColor: _bg,
      body: Column(children: [
        SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, R.gutter, 8),
            child: Row(children: [
              Material(
                color: Colors.white,
                shape: const CircleBorder(),
                elevation: 3,
                child: IconButton(
                  key: const ValueKey('map3d-close'),
                  tooltip: context.t('Tutup', 'Close'),
                  onPressed: () => Navigator.of(context).maybePop(),
                  icon: const Icon(Icons.close, color: C.wine),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(widget.sim ? context.t('Simulasi erupsi 3D', '3D eruption simulation') : context.t('Peta 3D Semeru', 'Semeru 3D map'),
                    overflow: TextOverflow.ellipsis, style: outfit(17, w: FontWeight.w700, c: Colors.white)),
              ),
              if (widget.sim) const Pill('SIM', bg: C.l3, fg: Colors.white, size: 10),
            ]),
          ),
        ),
        if (loading)
          LinearProgressIndicator(minHeight: 2, value: _progress <= 10 ? null : _progress / 100, color: C.l3, backgroundColor: Colors.white12),
        Expanded(
          child: Stack(children: [
            if (!_failed)
              Positioned.fill(
                child: Map3dView(key: ValueKey(_attempt), url: widget.url, onProgress: _onProgress, onFailed: _onFailed),
              ),
            if (loading)
              Positioned.fill(
                child: IgnorePointer(
                  child: ColoredBox(
                    color: _bg,
                    child: Center(
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        const SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white)),
                        const SizedBox(height: 14),
                        Text(
                            widget.sim
                                ? context.t('Menyiapkan simulasi erupsi…', 'Preparing eruption simulation…')
                                : context.t('Memuat peta 3D…', 'Loading 3D map…'),
                            style: inter(13.5, c: Colors.white, w: FontWeight.w500)),
                      ]),
                    ),
                  ),
                ),
              ),
            if (_failed)
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Icon(Icons.wifi_off_rounded, color: Colors.white70, size: 36),
                    const SizedBox(height: 12),
                    Text(context.t('Peta 3D butuh koneksi internet.', 'The 3D map needs an internet connection.'),
                        textAlign: TextAlign.center, style: inter(14, c: Colors.white, w: FontWeight.w600)),
                    const SizedBox(height: 16),
                    Btn(context.t('Coba lagi', 'Try again'), icon: Icons.refresh, color: Colors.white, fg: C.wine, onTap: () {
                      setState(() {
                        _failed = false;
                        _progress = 0;
                        _attempt++;
                      });
                    }),
                  ]),
                ),
              ),
          ]),
        ),
      ]),
    );
  }
}
