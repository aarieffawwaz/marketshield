import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Design tokens from Stitch `volcanic_resilience_system/DESIGN.md`.
class C {
  static const primary = Color(0xFF7B1E26); // Indonesian Maroon
  static const primaryDeep = Color(0xFF5C0412);
  static const wine = Color(0xFF350915); // headings
  static const crimson = Color(0xFFB51A14); // Level IV, SOS, hoax
  static const bg = Color(0xFFFFF8F3);
  static const surface = Colors.white;
  static const surfaceLow = Color(0xFFF9F2ED);
  static const surfaceMid = Color(0xFFF3EDE8);
  static const outline = Color(0xFFEFE5E2);
  static const outlineStrong = Color(0xFFDDC0BF);
  static const peach = Color(0xFFFFDFD0);
  static const pink = Color(0xFFFFDAD9);
  static const sat = Color(0xFF2F5D8A); // satellite provenance
  static const text = Color(0xFF1D1B18);
  static const textMuted = Color(0xFF564241);
  static const navInactive = Color(0xFF7D6D6A);
  static const handle = Color(0xFFD6C5C0);

  static const l1 = Color(0xFF2E7D32);
  static const l2 = Color(0xFFE0A100);
  static const l3 = Color(0xFFEA6A1F);
  static const l4 = Color(0xFFB51A14);

  static Color level(int l) => [l1, l2, l3, l4][l.clamp(1, 4) - 1];
}

class R {
  static const card = 16.0;
  static const control = 12.0;
  static const sheet = 28.0;
}

const shadow1 = [
  BoxShadow(color: Color(0x0A350915), blurRadius: 16, offset: Offset(0, 4), spreadRadius: -2),
  BoxShadow(color: Color(0x05350915), blurRadius: 3, offset: Offset(0, 1)),
];
const shadow2 = [
  BoxShadow(color: Color(0x14350915), blurRadius: 24, offset: Offset(0, 8), spreadRadius: -4),
  BoxShadow(color: Color(0x0A350915), blurRadius: 6, offset: Offset(0, 2), spreadRadius: -1),
];

TextStyle outfit(double size, {FontWeight w = FontWeight.w600, Color c = C.wine, double? h, double ls = 0}) =>
    GoogleFonts.outfit(fontSize: size, fontWeight: w, color: c, height: h, letterSpacing: ls);

TextStyle inter(double size, {FontWeight w = FontWeight.w400, Color c = C.text, double? h, double ls = 0}) =>
    GoogleFonts.inter(
      fontSize: size,
      fontWeight: w,
      color: c,
      height: h,
      letterSpacing: ls,
      fontFeatures: const [FontFeature.tabularFigures()],
    );

ThemeData buildTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: C.primary, primary: C.primary, surface: C.bg),
    scaffoldBackgroundColor: C.bg,
  );
  return base.copyWith(
    textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(bodyColor: C.text, displayColor: C.wine),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: C.wine,
      contentTextStyle: inter(13, c: Colors.white, w: FontWeight.w500),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(R.control)),
    ),
  );
}
