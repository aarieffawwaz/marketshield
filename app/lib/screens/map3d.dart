import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../core.dart';
import '../theme.dart';
import '../widgets.dart';

/// Chrome-free 3D Semeru map served by the website (`?sim=1` starts the eruption simulation).
const map3dUrl = 'https://marketshield-inception.vercel.app/embed/peta';

bool get _inAppWebView => !kIsWeb && (defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS);

/// Opens the 3D map: full-screen in-app WebView on Android/iOS, a new browser tab on web.
Future<void> open3dMap(BuildContext context, {bool sim = false}) async {
  final url = sim ? '$map3dUrl?sim=1' : map3dUrl;
  if (_inAppWebView) {
    push(context, Map3dScreen(url: url, sim: sim));
    return;
  }
  final ok = await launchUrl(Uri.parse(url), webOnlyWindowName: '_blank').catchError((_) => false);
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
              trailing: Icon(kIsWeb ? Icons.open_in_new : Icons.chevron_right, color: C.textMuted),
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

/// Full-screen in-app WebView (Android/iOS) with a close button and loading state.
class Map3dScreen extends StatefulWidget {
  final String url;
  final bool sim;
  const Map3dScreen({super.key, required this.url, this.sim = false});
  @override
  State<Map3dScreen> createState() => _Map3dScreenState();
}

class _Map3dScreenState extends State<Map3dScreen> {
  late final WebViewController _web;
  int _progress = 0;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _web = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0E0A09))
      ..setNavigationDelegate(NavigationDelegate(
        onProgress: (p) => mounted ? setState(() => _progress = p) : null,
        onPageStarted: (_) => mounted ? setState(() => _failed = false) : null,
        onPageFinished: (_) => mounted ? setState(() => _progress = 100) : null,
        onWebResourceError: (e) {
          if (e.isForMainFrame ?? true) {
            if (mounted) setState(() => _failed = true);
          }
        },
      ))
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    final loading = _progress < 100 && !_failed;
    return Scaffold(
      backgroundColor: const Color(0xFF0E0A09),
      body: Stack(children: [
        Positioned.fill(child: WebViewWidget(controller: _web)),
        if (loading)
          Positioned.fill(
            child: ColoredBox(
              color: const Color(0xFF0E0A09),
              child: Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white)),
                  const SizedBox(height: 14),
                  Text(widget.sim ? context.t('Menyiapkan simulasi erupsi…', 'Preparing eruption simulation…') : context.t('Memuat peta 3D…', 'Loading 3D map…'),
                      style: inter(13.5, c: Colors.white, w: FontWeight.w500)),
                  const SizedBox(height: 10),
                  SizedBox(width: 160, child: LinearProgressIndicator(value: _progress == 0 ? null : _progress / 100, color: C.l3, backgroundColor: Colors.white24)),
                ]),
              ),
            ),
          ),
        if (_failed)
          Positioned.fill(
            child: ColoredBox(
              color: const Color(0xFF0E0A09),
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
                    });
                    _web.loadRequest(Uri.parse(widget.url));
                  }),
                ]),
              ),
            ),
          ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Material(
              color: Colors.white,
              shape: const CircleBorder(),
              elevation: 3,
              child: IconButton(
                tooltip: context.t('Tutup', 'Close'),
                onPressed: () => Navigator.of(context).maybePop(),
                icon: const Icon(Icons.close, color: C.wine),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}
