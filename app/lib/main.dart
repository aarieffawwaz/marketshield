import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core.dart';
import 'data/repository.dart';
import 'deeplink.dart';
import 'screens/credits.dart';
import 'screens/intel.dart';
import 'screens/map.dart';
import 'screens/onboarding.dart';
import 'screens/posko.dart';
import 'screens/sector.dart';
import 'screens/shell.dart';
import 'screens/sos.dart';
import 'theme.dart';

final navKey = GlobalKey<NavigatorState>();

const _tabs = {
  'home': 0, 'map': 1, 'volcano': 1, 'intel': 2, 'het': 2, 'result': 2, 'posko': 3, 'aid': 3, 'profile': 4, 'credits': 4,
};

/// Jumps straight to a screen, skipping onboarding (used by the website's "Try this" links).
void openScreen(AppState state, String screen) {
  final nav = navKey.currentState;
  if (nav == null) return;
  if (screen == 'onboarding' || screen == 'persona') {
    nav.push(MaterialPageRoute(builder: (_) => screen == 'persona' ? const PersonaScreen() : const OnboardingScreen()));
    return;
  }
  if (screen == 'sos' || screen == 'evac') state.setLevel(state.level < 3 ? 3 : state.level);
  tabIndex.value = _tabs[screen] ?? 0;
  intelTab.value = screen == 'het' ? 1 : 0;
  nav.pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const Shell()), (_) => false);
  final extra = switch (screen) {
    'sos' => const SosScreen() as Widget,
    'evac' => const EvacScreen(),
    'kit' => const KitScreen(),
    'credits' => const CreditsScreen(),
    'volcano' => const VolcanoScreen(),
    'aid' => const AidPriorityScreen(),
    'sector' => const SectorScreen(),
    'result' => FactResultScreen(text: sampleHoax, result: classify(sampleHoax)),
    _ => null,
  };
  if (extra != null) nav.push(MaterialPageRoute(builder: (_) => extra));
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Fonts ship inside the app (assets/google_fonts), so nothing is fetched at runtime.
  GoogleFonts.config.allowRuntimeFetching = false;
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: C.bg,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  // Local storage only (no network); bounded so a slow platform channel can't hold the first frame.
  SharedPreferences? prefs;
  try {
    prefs = await SharedPreferences.getInstance().timeout(const Duration(milliseconds: 800));
  } catch (e) {
    debugPrint('shared_preferences unavailable: $e');
  }
  final state = AppState();
  final repo = DataRepo(prefs: prefs);

  // Launch options: ?mode=demo|live (not saved), ?level=1..4 (Demo), ?lang=en.
  final urlMode = switch (initialParam('mode')) { 'demo' => DataMode.demo, 'live' => DataMode.live, _ => null };
  state.mode = urlMode ?? DataRepo.savedMode(prefs) ?? DataMode.live;
  if (initialParam('lang') == 'en') state.lang = Lang.en;
  final urlLevel = int.tryParse(initialParam('level') ?? '');
  if (urlLevel != null && urlLevel >= 1 && urlLevel <= 4) state.setLevel(urlLevel);

  // Live mode: the home level follows the official PVMBG status.
  repo.addListener(() {
    final lvl = repo.volcano.value?.level;
    if (lvl != null) state.applyLiveLevel(lvl);
  });
  // Keep the repository on the mode chosen in onboarding / Profil.
  var mode = state.mode;
  state.addListener(() {
    if (state.mode == mode) return;
    mode = state.mode;
    repo.setMode(mode);
  });
  runApp(MarketShieldApp(state: state, repo: repo));
  // Bundled data paints first; cached and live data swap in when ready.
  repo.setMode(state.mode, persist: false);
  final first = initialScreen();
  if (first != null) WidgetsBinding.instance.addPostFrameCallback((_) => openScreen(state, first));
  listenScreens((s) => openScreen(state, s));
}

class MarketShieldApp extends StatelessWidget {
  final AppState state;
  final DataRepo repo;
  const MarketShieldApp({super.key, required this.state, required this.repo});

  @override
  Widget build(BuildContext context) {
    return AppScope(
      state: state,
      child: DataScope(
        repo: repo,
        child: MaterialApp(
          navigatorKey: navKey,
          title: 'MarketShield',
          debugShowCheckedModeBanner: false,
          theme: buildTheme(),
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
