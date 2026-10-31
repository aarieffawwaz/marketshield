import 'dart:async';
import 'dart:js_interop';
import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';
import 'package:web/web.dart' as web;

int _views = 0;

/// Web: the page in an <iframe> platform view, so the 3D map opens inside the app instead of a new tab.
/// The iframe receives pointer events directly (drag, pinch, wheel).
class Map3dView extends StatefulWidget {
  final String url;
  final ValueChanged<int> onProgress;
  final VoidCallback onFailed;
  const Map3dView({super.key, required this.url, required this.onProgress, required this.onFailed});

  @override
  State<Map3dView> createState() => _Map3dViewState();
}

class _Map3dViewState extends State<Map3dView> {
  late final String _viewType = 'ms-map3d-${_views++}';
  final bool _online = web.window.navigator.onLine;
  Timer? _slow;

  @override
  void initState() {
    super.initState();
    if (!_online) {
      WidgetsBinding.instance.addPostFrameCallback((_) => mounted ? widget.onFailed() : null);
      return;
    }
    ui_web.platformViewRegistry.registerViewFactory(_viewType, (int _) {
      final frame = web.HTMLIFrameElement()
        ..src = widget.url
        ..allow = 'fullscreen; accelerometer; gyroscope'
        ..allowFullscreen = true
        ..title = 'MarketShield 3D map';
      frame.style
        ..border = 'none'
        ..width = '100%'
        ..height = '100%'
        ..display = 'block'
        ..backgroundColor = '#0E0A09';
      frame.addEventListener('load', ((web.Event _) => mounted ? widget.onProgress(100) : null).toJS);
      return frame;
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => mounted ? widget.onProgress(10) : null);
    // Iframes don't report network errors; stop the spinner after a while so the page is never stuck.
    _slow = Timer(const Duration(seconds: 20), () => mounted ? widget.onProgress(100) : null);
  }

  @override
  void dispose() {
    _slow?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      _online ? HtmlElementView(viewType: _viewType) : const SizedBox.expand();
}
