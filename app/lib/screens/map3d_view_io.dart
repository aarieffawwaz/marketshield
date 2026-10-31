import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Android/iOS: in-app WebView. Reports load progress (0–100) and main-frame failures.
class Map3dView extends StatefulWidget {
  final String url;
  final ValueChanged<int> onProgress;
  final VoidCallback onFailed;
  const Map3dView({super.key, required this.url, required this.onProgress, required this.onFailed});

  @override
  State<Map3dView> createState() => _Map3dViewState();
}

class _Map3dViewState extends State<Map3dView> {
  late final WebViewController _web = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    ..setBackgroundColor(const Color(0xFF0E0A09))
    ..setNavigationDelegate(NavigationDelegate(
      onProgress: (p) => mounted ? widget.onProgress(p) : null,
      onPageFinished: (_) => mounted ? widget.onProgress(100) : null,
      onWebResourceError: (e) {
        if ((e.isForMainFrame ?? true) && mounted) widget.onFailed();
      },
    ))
    ..loadRequest(Uri.parse(widget.url));

  @override
  Widget build(BuildContext context) => WebViewWidget(controller: _web);
}
