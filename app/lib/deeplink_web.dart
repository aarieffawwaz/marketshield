import 'dart:js_interop';

import 'package:web/web.dart' as web;

String? initialScreen() => Uri.base.queryParameters['screen'];

void listenScreens(void Function(String screen) onScreen) {
  web.window.addEventListener(
    'message',
    ((web.MessageEvent e) {
      final data = e.data;
      if (data != null && data.isA<JSString>()) {
        final s = (data as JSString).toDart;
        if (s.startsWith('ms:')) onScreen(s.substring(3));
      }
    }).toJS,
  );
}
