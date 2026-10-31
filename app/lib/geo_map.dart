import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import 'theme.dart';

/// Real, pannable map of the Semeru area: Esri tiles (no API key) with KRB rings,
/// GFS-direction ash cone, the Besuk Kobokan lahar channel, villages and aid posts.
/// Positions of mapVillages, mapPosts and the route are approximate.

const semeru = LatLng(-8.108, 112.922);
const userPos = LatLng(-8.176, 113.012);
const gorCandipuro = LatLng(-8.19, 113.085);

const laharLine = [
  LatLng(-8.108, 112.922), LatLng(-8.125, 112.938), LatLng(-8.142, 112.955), LatLng(-8.162, 112.975),
  LatLng(-8.182, 112.995), LatLng(-8.203, 113.012), LatLng(-8.226, 113.03),
];

const evacRoute = [
  LatLng(-8.176, 113.012), LatLng(-8.17, 113.03), LatLng(-8.168, 113.048), LatLng(-8.176, 113.066), LatLng(-8.19, 113.085),
];

const mapPosts = [
  ('Balai Desa Sumbermujur', LatLng(-8.162, 113.07), C.l1),
  ('GOR Candipuro', gorCandipuro, C.l1),
  ('SDN Penanggal 02', LatLng(-8.135, 113.045), C.l3),
  ('Posko Pronojiwo', LatLng(-8.245, 112.965), C.crimson),
];

const mapVillages = [
  ('Supiturang', LatLng(-8.203, 112.947), .95),
  ('Sumberwuluh', LatLng(-8.176, 112.997), .85),
  ('Oro-oro Ombo', LatLng(-8.222, 112.905), .72),
  ('Penanggal', LatLng(-8.142, 113.04), .55),
  ('Sumbermujur', LatLng(-8.158, 113.062), .45),
  ('Jugosari', LatLng(-8.222, 113.05), .35),
];

enum GeoMode { hazard, route, posts, risk }

List<LatLng> _cone(LatLng o, double km, double bearing, double spread) {
  final kx = 111.32 * math.cos(o.latitude * math.pi / 180);
  final pts = <LatLng>[o];
  for (var d = -spread; d <= spread; d += spread / 6) {
    final b = (bearing + d) * math.pi / 180;
    final r = km * (1 - d.abs() / (spread * 2.6));
    pts.add(LatLng(o.latitude + r * math.cos(b) / 110.57, o.longitude + r * math.sin(b) / kx));
  }
  pts.add(o);
  return pts;
}

class GeoMap extends StatefulWidget {
  final GeoMode mode;
  final int level;
  final double krbKm;
  final bool showKrb, showAsh, showLahar;
  final bool navigating;
  final MapController? controller;
  final VoidCallback? onVolcano;
  const GeoMap({
    super.key,
    this.mode = GeoMode.hazard,
    this.level = 2,
    this.krbKm = 5,
    this.showKrb = true,
    this.showAsh = true,
    this.showLahar = true,
    this.navigating = false,
    this.controller,
    this.onVolcano,
  });

  @override
  State<GeoMap> createState() => _GeoMapState();
}

class _GeoMapState extends State<GeoMap> {
  bool _satellite = false;

  Widget _pin(String label, Color color, {IconData? icon, bool big = false}) => Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(99), boxShadow: shadow1),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            if (icon != null) ...[Icon(icon, size: 12, color: color), const SizedBox(width: 3)],
            Text(label, style: inter(big ? 11.5 : 10.5, w: FontWeight.w700, c: C.wine)),
          ]),
        ),
        const SizedBox(height: 3),
        Container(
          width: big ? 16 : 12,
          height: big ? 16 : 12,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2.5), boxShadow: shadow1),
        ),
      ]);

  @override
  Widget build(BuildContext context) {
    final m = widget.mode;
    final ashKm = [0.0, 8.0, 16.0, 24.0, 32.0][widget.level];
    final center = switch (m) {
      GeoMode.route => const LatLng(-8.18, 113.045),
      GeoMode.posts => const LatLng(-8.17, 113.03),
      GeoMode.risk => const LatLng(-8.17, 112.98),
      GeoMode.hazard => const LatLng(-8.15, 112.98),
    };
    final zoom = switch (m) {
      GeoMode.route => 12.6,
      GeoMode.posts => 11.8,
      _ => 11.2,
    };
    final krb = <(double, Color)>[(widget.krbKm + 8, C.l2), (widget.krbKm + 3, C.l3), (widget.krbKm, C.crimson)];

    return Stack(children: [
      FlutterMap(
        mapController: widget.controller,
        options: MapOptions(initialCenter: center, initialZoom: zoom, minZoom: 7, maxZoom: 16, interactionOptions: const InteractionOptions(flags: InteractiveFlag.all & ~InteractiveFlag.rotate)),
        children: [
          TileLayer(
            urlTemplate: _satellite
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            userAgentPackageName: 'id.brain.marketshield',
            maxNativeZoom: 17,
          ),
          if (m == GeoMode.risk)
            CircleLayer(circles: [
              for (final (_, p, s) in mapVillages)
                CircleMarker(point: p, radius: 900 + 1600 * s, useRadiusInMeter: true, color: Color.lerp(C.l2, C.crimson, s)!.withValues(alpha: .38), borderColor: Colors.white.withValues(alpha: .6), borderStrokeWidth: 1),
            ]),
          if (widget.showKrb && m != GeoMode.risk)
            CircleLayer(circles: [
              for (final (km, c) in krb)
                CircleMarker(point: semeru, radius: km * 1000, useRadiusInMeter: true, color: c.withValues(alpha: .12), borderColor: c, borderStrokeWidth: 2),
            ]),
          if (widget.showAsh && ashKm > 0 && m == GeoMode.hazard)
            PolygonLayer(polygons: [
              Polygon(points: _cone(semeru, ashKm, 240, 20), color: const Color(0xFF6B5D58).withValues(alpha: .30), borderColor: const Color(0x886B5D58), borderStrokeWidth: 1),
            ]),
          if (widget.showLahar && m != GeoMode.posts)
            PolylineLayer(polylines: [
              Polyline(points: laharLine, color: const Color(0x99A0522D), strokeWidth: 12),
              Polyline(points: laharLine, color: const Color(0xFF7A3B16), strokeWidth: 3, pattern: StrokePattern.dashed(segments: const [8, 6])),
            ]),
          if (m == GeoMode.route)
            PolylineLayer(polylines: [
              Polyline(points: evacRoute, color: Colors.white, strokeWidth: 9),
              Polyline(points: evacRoute, color: widget.navigating ? C.l1 : C.sat, strokeWidth: 5),
            ]),
          MarkerLayer(markers: [
            Marker(
              point: semeru,
              width: 120,
              height: 50,
              alignment: Alignment.topCenter,
              child: GestureDetector(onTap: widget.onVolcano, child: _pin('G. Semeru', C.wine, icon: Icons.landscape, big: true)),
            ),
            if (m == GeoMode.hazard || m == GeoMode.risk)
              for (final (n, p, _) in mapVillages.where((v) => m == GeoMode.risk || !const {'Penanggal', 'Sumbermujur'}.contains(v.$1))) Marker(point: p, width: 110, height: 44, alignment: Alignment.topCenter, child: _pin(n, C.textMuted)),
            if (m != GeoMode.risk)
              for (final (n, p, c) in mapPosts) Marker(point: p, width: 150, height: 44, alignment: Alignment.topCenter, child: _pin(n, c, icon: Icons.home_work_outlined)),
            if (m != GeoMode.posts)
              Marker(
                point: userPos,
                width: 22,
                height: 22,
                child: Container(
                  decoration: BoxDecoration(color: C.sat, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 3), boxShadow: const [BoxShadow(color: Color(0x552F5D8A), blurRadius: 12, spreadRadius: 4)]),
                ),
              ),
          ]),
          RichAttributionWidget(attributions: [TextSourceAttribution(_satellite ? 'Esri, Maxar, Earthstar Geographics' : 'Esri, HERE, Garmin, © OpenStreetMap')], alignment: AttributionAlignment.bottomRight),
        ],
      ),
      Positioned(
        right: 10,
        bottom: 34,
        child: Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(99),
          elevation: 2,
          child: InkWell(
            borderRadius: BorderRadius.circular(99),
            onTap: () => setState(() => _satellite = !_satellite),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(_satellite ? Icons.map_outlined : Icons.satellite_alt_outlined, size: 14, color: C.wine),
                const SizedBox(width: 4),
                Text(_satellite ? 'Peta' : 'Satelit', style: inter(11, w: FontWeight.w700, c: C.wine)),
              ]),
            ),
          ),
        ),
      ),
    ]);
  }
}
