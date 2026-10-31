// Lets the website open a specific screen: /mobile-app/?screen=intel on load,
// or window.postMessage('ms:intel') from the hosting page. No-op on Android.
export 'deeplink_stub.dart' if (dart.library.js_interop) 'deeplink_web.dart';
