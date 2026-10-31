import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:google_fonts/google_fonts.dart';

import 'core.dart';
import 'deeplink.dart';
import 'screens/intel.dart';
import 'screens/map.dart';
import 'screens/onboarding.dart';
import 'screens/shell.dart';
import 'screens/sos.dart';
import 'theme.dart';

final navKey = GlobalKey<NavigatorState>();

const _tabs = {'home': 0, 'map': 1, 'intel': 2, 'posko': 3, 'profile': 4};

/// Jumps straight to a screen, skipping onboarding (used by the website's "Try this" links).
void openScreen(AppState state, String screen) {
  final nav = navKey.currentState;
  if (nav == null) return;
  if (screen == 'sos' || screen == 'evac') state.setLevel(state.level < 3 ? 3 : state.level);
  tabIndex.value = _tabs[screen] ?? 0;
  nav.pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const Shell()), (_) => false);
  final extra = switch (screen) {
    'sos' => const SosScreen() as Widget,
    'evac' => const EvacScreen(),
    'kit' => const KitScreen(),
    _ => null,
  };
  if (extra != null) nav.push(MaterialPageRoute(builder: (_) => extra));
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Fonts ship inside the app (assets/google_fonts), so nothing is fetched at runtime.
  GoogleFonts.config.allowRuntimeFetching = false;
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: C.bg,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  final state = AppState();
  runApp(MarketShieldApp(state: state));
  final first = initialScreen();
  if (first != null) WidgetsBinding.instance.addPostFrameCallback((_) => openScreen(state, first));
  listenScreens((s) => openScreen(state, s));
}

class MarketShieldApp extends StatelessWidget {
  final AppState state;
  const MarketShieldApp({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return AppScope(
      state: state,
      child: MaterialApp(
        navigatorKey: navKey,
        title: 'MarketShield',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        home: const SplashScreen(),
      ),
    );
  }
}
