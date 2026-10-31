import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core.dart';
import '../data/api.dart';
import '../data/credits.dart';
import '../theme.dart';
import '../widgets.dart';

/// Profil → "Sumber data & kredit foto": photo attribution (CC BY / CC BY-SA) and data sources.
class CreditsScreen extends StatelessWidget {
  const CreditsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          SubHeader(context.t('Sumber Data & Kredit Foto', 'Data Sources & Photo Credits')),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(R.gutter, 4, R.gutter, 28), children: [
              Text(
                  context.t(
                      'Foto berlisensi CC BY / CC BY-SA dipakai sesuai ketentuan lisensinya; perubahan yang kami lakukan hanya pemotongan dan kompresi. Ketuk tautan untuk membuka sumber asli.',
                      'CC BY / CC BY-SA photos are used under their license terms; our only changes are cropping and compression. Tap a link to open the original source.'),
                  style: inter(13, c: C.textMuted, h: 1.5)),
              const SizedBox(height: 16),
              SectionTitle(context.t('Foto', 'Photos'), icon: Icons.photo_library_outlined),
              for (final p in photoCredits) Padding(padding: const EdgeInsets.only(bottom: 10), child: _PhotoCard(p)),
              const SizedBox(height: 8),
              SectionTitle(context.t('Status resmi & data langsung', 'Official status & live data'), icon: Icons.verified_outlined),
              _SourceCard([
                ...officialSources,
                const DataCredit('MarketShield API v1', 'Posko, harga HET, cek fakta, peringatan & prioritas desa (Firestore).',
                    'Aid posts, price caps, fact checks, alerts & village priority (Firestore).', MsApi.base),
              ]),
              const SizedBox(height: 16),
              SectionTitle(context.t('Data satelit (Google Earth Engine)', 'Satellite data (Google Earth Engine)'),
                  icon: Icons.satellite_alt_outlined),
              const _SourceCard(satelliteSources),
              const SizedBox(height: 16),
              SectionTitle(context.t('Peta dasar', 'Basemaps'), icon: Icons.map_outlined),
              const _SourceCard(mapSources),
              const SizedBox(height: 16),
              MsCard(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: ListTile(
                  leading: const Icon(Icons.code, color: C.wine),
                  title: Text(context.t('Lisensi perangkat lunak', 'Open-source licenses'), style: inter(14, w: FontWeight.w600, c: C.wine)),
                  subtitle: Text('Flutter, flutter_map & packages', style: inter(12, c: C.textMuted)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => showLicensePage(context: context, applicationName: 'MarketShield', applicationVersion: '1.0'),
                ),
              ),
            ]),
          ),
        ]),
      ),
    );
  }
}

Future<void> openLink(BuildContext context, String url) async {
  final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication).catchError((_) => false);
  if (!ok && context.mounted) toast(context, context.t('Tidak bisa membuka tautan: $url', 'Could not open link: $url'));
}

class _Link extends StatelessWidget {
  final String label;
  final String url;
  const _Link(this.label, this.url);

  @override
  Widget build(BuildContext context) => Semantics(
        link: true,
        child: InkWell(
          onTap: () => openLink(context, url),
          borderRadius: BorderRadius.circular(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Flexible(
                child: Text(label,
                    overflow: TextOverflow.ellipsis,
                    style: inter(12, w: FontWeight.w600, c: C.primary)
                        .copyWith(decoration: TextDecoration.underline, decorationColor: C.primary)),
              ),
              const SizedBox(width: 4),
              const Icon(Icons.open_in_new, size: 13, color: C.primary),
            ]),
          ),
        ),
      );
}

class _PhotoCard extends StatelessWidget {
  final PhotoCredit p;
  const _PhotoCard(this.p);

  @override
  Widget build(BuildContext context) {
    final licenseUrl = licenseUrls[p.license];
    return MsCard(
      padding: const EdgeInsets.all(12),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.asset(p.asset, width: 64, height: 64, fit: BoxFit.cover),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(p.title, style: inter(13, w: FontWeight.w600, c: C.wine, h: 1.35)),
            const SizedBox(height: 2),
            Text('${context.t('Oleh', 'By')} ${p.author}', style: inter(12, c: C.textMuted)),
            const SizedBox(height: 6),
            Wrap(spacing: 10, runSpacing: 2, crossAxisAlignment: WrapCrossAlignment.center, children: [
              licenseUrl == null
                  ? Pill(p.license, bg: C.surfaceMid, size: 10.5)
                  : GestureDetector(
                      onTap: () => openLink(context, licenseUrl),
                      child: Pill(p.license, icon: Icons.gavel_outlined, bg: C.surfaceMid, size: 10.5),
                    ),
              _Link('Wikimedia Commons', p.source),
            ]),
          ]),
        ),
      ]),
    );
  }
}

class _SourceCard extends StatelessWidget {
  final List<DataCredit> items;
  const _SourceCard(this.items);

  @override
  Widget build(BuildContext context) {
    return MsCard(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        for (final (i, d) in items.indexed) ...[
          if (i > 0) const Divider(height: 16, color: C.outline),
          Text(d.name, style: inter(13, w: FontWeight.w700, c: C.wine)),
          const SizedBox(height: 2),
          Text(context.t(d.idNote, d.enNote), style: inter(12, c: C.textMuted, h: 1.4)),
          _Link(Uri.parse(d.url).host + Uri.parse(d.url).path.replaceAll(RegExp(r'/$'), ''), d.url),
        ],
      ]),
    );
  }
}
