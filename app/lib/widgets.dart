import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'core.dart';
import 'data/repository.dart';
import 'screens/sector.dart';
import 'screens/sos.dart';
import 'theme.dart';

Widget logo([double s = 34]) => Image.asset('assets/img/logo.webp', width: s, height: s);

Widget avatar([double s = 36]) => Container(
      width: s,
      height: s,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: shadow1,
        image: const DecorationImage(image: AssetImage('assets/img/avatar.webp'), fit: BoxFit.cover),
      ),
    );

void push(BuildContext c, Widget w) => Navigator.of(c).push(MaterialPageRoute(builder: (_) => w));

/// Top bar used on tab roots: location, monitoring state, inbox bell, avatar.
class AppHeader extends StatelessWidget {
  const AppHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(R.gutter, 8, R.gutter, 8),
      child: Row(children: [
        logo(32),
        const SizedBox(width: 10),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Icon(Icons.location_on_outlined, size: 16, color: C.wine),
              const SizedBox(width: 3),
              Text('Candipuro, Lumajang', style: outfit(15.5, w: FontWeight.w600)),
            ]),
            const SizedBox(height: 2),
            const ModeBadge(),
          ]),
        ),
        IconButton(
          onPressed: () => push(context, const SectorScreen()),
          icon: Stack(clipBehavior: Clip.none, children: [
            const Icon(Icons.notifications_none_rounded, color: C.wine, size: 26),
            Positioned(
              right: 1,
              top: 1,
              child: Container(
                  width: 9,
                  height: 9,
                  decoration: BoxDecoration(
                      color: C.crimson, shape: BoxShape.circle, border: Border.all(color: C.bg, width: 1.5))),
            ),
          ]),
        ),
        avatar(),
      ]),
    );
  }
}

class _Pulse extends StatefulWidget {
  const _Pulse();
  @override
  State<_Pulse> createState() => _PulseState();
}

class _PulseState extends State<_Pulse> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(reverse: true);
  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
        opacity: Tween(begin: .35, end: 1.0).animate(_c),
        child: Container(width: 7, height: 7, decoration: const BoxDecoration(color: C.crimson, shape: BoxShape.circle)),
      );
}

/// Always-visible data-mode badge for the header: "DEMO" (ember) or "LIVE" (green) plus freshness.
class ModeBadge extends StatelessWidget {
  const ModeBadge({super.key});

  @override
  Widget build(BuildContext context) {
    final live = context.app.isLive;
    final c = live ? C.l1 : C.l3;
    return Row(children: [
      const _Pulse(),
      const SizedBox(width: 6),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
        decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(5)),
        child: Text(live ? 'LIVE' : 'DEMO', style: inter(9.5, w: FontWeight.w800, c: Colors.white, ls: .8)),
      ),
      const SizedBox(width: 6),
      Flexible(
        child: live
            ? Freshness(context.repo.volcano, compact: true)
            : Text(context.t('Data contoh • simulasi', 'Sample data • simulation'),
                maxLines: 1, overflow: TextOverflow.ellipsis, style: inter(10.5, w: FontWeight.w600, c: C.textMuted)),
      ),
    ]);
  }
}

/// Standalone DEMO / LIVE pill (Profil, Peta).
class ModeBadgePill extends StatelessWidget {
  const ModeBadgePill({super.key});
  @override
  Widget build(BuildContext context) {
    final live = context.app.isLive;
    return Pill(live ? 'LIVE' : 'DEMO', icon: Icons.circle, bg: (live ? C.l1 : C.l3).withValues(alpha: .14), fg: live ? C.l1 : C.l3, size: 10);
  }
}

/// Data provenance for one API feed: "Live · 14.05", "Offline · data tersimpan 14.05" or bundled data.
/// Tapping it retries the network.
class Freshness extends StatelessWidget {
  final Live<Object?> feed;
  final bool compact;
  const Freshness(this.feed, {super.key, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final repo = context.repo; // subscribe to updates
    final demo = !context.app.isLive;
    final at = feed.at == null ? '' : context.l(clock(feed.at!));
    final (dot, label) = switch (feed.origin) {
      _ when demo => (C.l3, compact ? 'Demo' : context.t('Demo · data contoh', 'Demo · sample data')),
      Origin.live => (C.l1, compact ? context.t('Diperbarui $at', 'Updated $at') : 'Live · $at'),
      Origin.cache => (C.l2, context.t('Offline · data tersimpan $at', 'Offline · saved data $at')),
      Origin.bundled when feed.syncing => (C.navInactive, context.t('Menyinkronkan…', 'Syncing…')),
      Origin.bundled => (C.navInactive, context.t('Offline · data bawaan', 'Offline · built-in data')),
    };
    final Widget body = compact
        // Single text run so it ellipsizes cleanly in tight headers.
        ? Text.rich(
            TextSpan(children: [
              TextSpan(text: '● ', style: TextStyle(color: dot, fontSize: 8)),
              TextSpan(text: label),
            ]),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: inter(10.5, w: FontWeight.w600, c: C.textMuted))
        : Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: C.surfaceMid, borderRadius: BorderRadius.circular(999)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              if (feed.syncing && feed.origin != Origin.bundled)
                const SizedBox(width: 8, height: 8, child: CircularProgressIndicator(strokeWidth: 1.5, color: C.navInactive))
              else
                Container(width: 7, height: 7, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
              const SizedBox(width: 5),
              Flexible(
                  child: Text(label,
                      maxLines: 1, overflow: TextOverflow.ellipsis, style: inter(11, w: FontWeight.w600, c: C.wine))),
            ]),
          );
    return Semantics(
      button: true,
      label: label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: feed.syncing || demo ? null : repo.refresh,
        child: body,
      ),
    );
  }
}

/// Header for pushed detail screens.
class SubHeader extends StatelessWidget {
  final String title;
  final Widget? trailing;
  const SubHeader(this.title, {super.key, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 6, R.gutter, 6),
      child: Row(children: [
        IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.arrow_back, color: C.wine)),
        logo(28),
        const SizedBox(width: 10),
        Expanded(child: Text(title, style: outfit(20, w: FontWeight.w700), overflow: TextOverflow.ellipsis)),
        trailing ?? avatar(34),
      ]),
    );
  }
}

class MsCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final Color color;
  final Color? border;
  final Color? stripe;
  final VoidCallback? onTap;
  final List<BoxShadow> shadow;
  const MsCard(
      {super.key,
      required this.child,
      this.padding = const EdgeInsets.all(16),
      this.color = C.surface,
      this.border,
      this.stripe,
      this.onTap,
      this.shadow = shadow1});

  @override
  Widget build(BuildContext context) {
    Widget body = Padding(padding: padding, child: child);
    if (stripe != null) {
      body = IntrinsicHeight(
        child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Container(width: 4, color: stripe),
          Expanded(child: body),
        ]),
      );
    }
    return Container(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(R.card),
        border: Border.all(color: border ?? C.outline),
        boxShadow: shadow,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(R.card),
        child: Material(
          color: Colors.transparent,
          child: InkWell(onTap: onTap, child: body),
        ),
      ),
    );
  }
}

class Pill extends StatelessWidget {
  final String text;
  final IconData? icon;
  final Color bg;
  final Color fg;
  final double size;
  const Pill(this.text, {super.key, this.icon, this.bg = C.peach, this.fg = C.wine, this.size = 11.5});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        if (icon != null) ...[Icon(icon, size: size + 3, color: fg), const SizedBox(width: 5)],
        Flexible(child: Text(text, style: inter(size, w: FontWeight.w600, c: fg), overflow: TextOverflow.ellipsis)),
      ]),
    );
  }
}

class SatChip extends StatelessWidget {
  final String text;
  final bool light;
  const SatChip(this.text, {super.key, this.light = false});
  @override
  Widget build(BuildContext context) => Pill(text,
      icon: Icons.satellite_alt_rounded,
      bg: light ? Colors.white.withValues(alpha: .18) : C.sat,
      fg: Colors.white,
      size: 11);
}

class LevelChip extends StatelessWidget {
  final int level;
  final bool solid;
  const LevelChip(this.level, {super.key, this.solid = false});
  @override
  Widget build(BuildContext context) {
    final c = C.level(level);
    return Pill('LEVEL ${levelRoman[level - 1]} • ${context.l(levelName[level - 1]).toUpperCase()}',
        icon: level >= 3 ? Icons.warning_amber_rounded : Icons.visibility_outlined,
        bg: solid ? c : c.withValues(alpha: .14),
        fg: solid ? Colors.white : (level == 2 ? const Color(0xFF8A5A00) : c),
        size: 11);
  }
}

class Btn extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onTap;
  final Color color;
  final Color fg;
  final bool outlined;
  final double height;
  final bool trailingIcon;
  const Btn(this.label,
      {super.key,
      this.icon,
      this.onTap,
      this.color = C.primary,
      this.fg = Colors.white,
      this.outlined = false,
      this.height = 52,
      this.trailingIcon = false});

  @override
  Widget build(BuildContext context) {
    final ic = icon == null ? null : Icon(icon, size: 20, color: outlined ? C.primary : fg);
    final txt = Flexible(
        child: Text(label,
            textAlign: TextAlign.center,
            style: inter(15, w: FontWeight.w600, c: outlined ? C.wine : fg),
            overflow: TextOverflow.ellipsis,
            maxLines: 2));
    return SizedBox(
      height: height,
      width: double.infinity,
      child: Material(
        color: outlined ? Colors.white : color,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(R.control),
          side: outlined ? const BorderSide(color: C.primary, width: 1.5) : BorderSide.none,
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(R.control),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              if (ic != null && !trailingIcon) ...[ic, const SizedBox(width: 10)],
              txt,
              if (ic != null && trailingIcon) ...[const SizedBox(width: 10), ic],
            ]),
          ),
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String text;
  final IconData? icon;
  final Widget? trailing;
  const SectionTitle(this.text, {super.key, this.icon, this.trailing});
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 10, top: 6),
        child: Row(children: [
          if (icon != null) ...[Icon(icon, size: 20, color: C.primary), const SizedBox(width: 8)],
          Expanded(child: Text(text, style: outfit(17.5, w: FontWeight.w600))),
          ?trailing,
        ]),
      );
}

class Eyebrow extends StatelessWidget {
  final String text;
  final Color color;
  const Eyebrow(this.text, {super.key, this.color = C.textMuted});
  @override
  Widget build(BuildContext context) =>
      Text(text.toUpperCase(), style: inter(10.5, w: FontWeight.w700, c: color, ls: .9));
}

/// Circular gauge used for escalation probability and kit readiness.
class Ring extends StatelessWidget {
  final double value; // 0..1
  final Color color;
  final double size;
  final Widget center;
  final double stroke;
  final bool arc;
  const Ring(
      {super.key,
      required this.value,
      required this.color,
      required this.center,
      this.size = 64,
      this.stroke = 6,
      this.arc = false});
  @override
  Widget build(BuildContext context) => SizedBox(
        width: size,
        height: size,
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: value),
          duration: const Duration(milliseconds: 900),
          curve: Curves.easeOutCubic,
          builder: (_, v, child) => CustomPaint(
            painter: _RingPainter(v, color, stroke, arc),
            child: child,
          ),
          child: Center(child: center),
        ),
      );
}

class _RingPainter extends CustomPainter {
  final double v;
  final Color c;
  final double s;
  final bool arc;
  _RingPainter(this.v, this.c, this.s, this.arc);
  @override
  void paint(Canvas canvas, Size size) {
    final r = Rect.fromLTWH(s / 2, s / 2, size.width - s, size.height - s);
    final start = arc ? math.pi * .75 : -math.pi / 2;
    final sweep = arc ? math.pi * 1.5 : math.pi * 2;
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = s
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(r, start, sweep, false, p..color = C.surfaceMid);
    canvas.drawArc(r, start, sweep * v, false, p..color = c);
  }

  @override
  bool shouldRepaint(_RingPainter o) => o.v != v || o.c != c;
}

class Bar extends StatelessWidget {
  final double value;
  final Color color;
  final double height;
  const Bar(this.value, {super.key, this.color = C.primary, this.height = 8});
  @override
  Widget build(BuildContext context) => ClipRRect(
        borderRadius: BorderRadius.circular(99),
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: value),
          duration: const Duration(milliseconds: 700),
          builder: (_, v, _) =>
              LinearProgressIndicator(value: v, minHeight: height, color: color, backgroundColor: C.surfaceMid),
        ),
      );
}

class SosFab extends StatelessWidget {
  const SosFab({super.key});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => push(context, const SosScreen()),
      child: Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          color: C.crimson,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 3),
          boxShadow: const [BoxShadow(color: Color(0x55B51A14), blurRadius: 18, offset: Offset(0, 6))],
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('SOS', style: outfit(17, w: FontWeight.w800, c: Colors.white, h: 1)),
          Text(context.t('DARURAT', 'EMERGENCY'), style: inter(7, w: FontWeight.w700, c: Colors.white)),
        ]),
      ),
    );
  }
}

/// Small key/value stat tile.
class Stat extends StatelessWidget {
  final String label;
  final String value;
  final String? sub;
  final Color valueColor;
  final Color bg;
  const Stat(this.label, this.value, {super.key, this.sub, this.valueColor = C.wine, this.bg = C.surfaceLow});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(R.control)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: inter(11, c: C.textMuted, w: FontWeight.w500)),
          const SizedBox(height: 4),
          Text(value, style: outfit(20, w: FontWeight.w700, c: valueColor)),
          if (sub != null) Text(sub!, style: inter(10.5, c: C.textMuted)),
        ]),
      );
}

void toast(BuildContext c, String msg) =>
    ScaffoldMessenger.of(c)..hideCurrentSnackBar()..showSnackBar(SnackBar(content: Text(msg)));
