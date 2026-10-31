import 'package:flutter/material.dart';

/// App state, bilingual helpers and local mock data shaped like the
/// Google Earth Engine pipeline outputs described in the PRD (v1.1).

enum Lang { id, en }

enum Persona { warga, petani, pariwisata, logistik, apotek }

/// Bilingual string pair.
class L {
  final String id;
  final String en;
  const L(this.id, this.en);
}

/// Demo = bundled sample data, no network, level can be simulated.
/// Live = MarketShield API (cache → bundled fallback), level follows PVMBG.
enum DataMode { demo, live }

class AppState extends ChangeNotifier {
  Lang lang = Lang.id;
  int level = 2; // PVMBG status I–IV: simulated in Demo, from the PVMBG feed in Live
  int _demoLevel = 2;
  int? _liveLevel;
  DataMode mode = DataMode.live;
  Persona persona = Persona.petani;
  final Set<int> kitDone = {0, 1, 2, 4, 5};
  final Set<int> protocolDone = {};

  bool get isLive => mode == DataMode.live;

  void setLang(Lang v) {
    lang = v;
    notifyListeners();
  }

  /// Simulated level (Demo Mode, deep links). In Live mode the next PVMBG update wins again.
  void setLevel(int v) {
    level = v;
    if (!isLive) _demoLevel = v;
    notifyListeners();
  }

  /// Official level from the live API; only shown while in Live mode.
  void applyLiveLevel(int v) {
    if (v < 1 || v > 4) return;
    _liveLevel = v;
    if (!isLive || v == level) return;
    level = v;
    notifyListeners();
  }

  void setMode(DataMode m) {
    if (m == mode) return;
    mode = m;
    level = m == DataMode.live ? (_liveLevel ?? level) : _demoLevel;
    notifyListeners();
  }

  void setPersona(Persona v) {
    persona = v;
    notifyListeners();
  }

  void toggleKit(int i) {
    kitDone.contains(i) ? kitDone.remove(i) : kitDone.add(i);
    notifyListeners();
  }

  void toggleProtocol(int i) {
    protocolDone.contains(i) ? protocolDone.remove(i) : protocolDone.add(i);
    notifyListeners();
  }
}

class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child}) : super(notifier: state);

  static AppState of(BuildContext c) => c.dependOnInheritedWidgetOfExactType<AppScope>()!.notifier!;
  static AppState read(BuildContext c) => c.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
}

extension Tr on BuildContext {
  AppState get app => AppScope.of(this);
  AppState get appRead => AppScope.read(this);
  bool get isId => app.lang == Lang.id;
  String t(String id, String en) => isId ? id : en;
  String l(L v) => isId ? v.id : v.en;
}

String rp(int v) {
  final s = v.toString();
  final b = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) b.write('.');
    b.write(s[i]);
  }
  return 'Rp$b';
}

const levelRoman = ['I', 'II', 'III', 'IV'];
const levelName = [L('Normal', 'Normal'), L('Waspada', 'Advisory'), L('Siaga', 'Watch'), L('Awas', 'Warning')];

const personaLabel = {
  Persona.warga: L('Warga', 'Resident'),
  Persona.petani: L('Petani / Peternak', 'Farmer / Livestock'),
  Persona.pariwisata: L('Pariwisata & UMKM', 'Tourism & SMEs'),
  Persona.logistik: L('Logistik & Relawan', 'Logistics & Volunteers'),
  Persona.apotek: L('Apotek & Distributor', 'Pharmacy & Distributor'),
};

const personaDesc = {
  Persona.warga: L('Keluarga, lansia, anak-anak, kebutuhan harian', 'Families, elderly, children, daily needs'),
  Persona.petani: L('Proteksi pakan ternak, sumber air, evakuasi ternak', 'Protect fodder, water sources, evacuate livestock'),
  Persona.pariwisata: L('Keamanan wisatawan, stok darurat toko', 'Visitor safety, emergency shop stock'),
  Persona.logistik: L('Distribusi sembako, armada evakuasi, shelter', 'Staple distribution, evacuation fleet, shelters'),
  Persona.apotek: L('Monitoring HET obat, masker N95, tabung O₂', 'Monitor price caps for medicine, N95, O₂ tanks'),
};

const personaIcon = {
  Persona.warga: Icons.family_restroom,
  Persona.petani: Icons.agriculture,
  Persona.pariwisata: Icons.storefront,
  Persona.logistik: Icons.local_shipping_outlined,
  Persona.apotek: Icons.medical_services_outlined,
};

/// Fused GEE signal snapshot per PVMBG level (mock of the XGBoost risk engine output).
class SatSnapshot {
  final int escalationPct;
  final L window;
  final double so2Du; // Sentinel-5P TROPOMI SO2 column
  final int thermalMw; // MODIS/VIIRS FRP
  final double s1Db; // Sentinel-1 GRD backscatter change vs 12-day baseline
  final int rainMm; // GPM IMERG 24h
  final double krbRadiusKm;
  final L updated;
  const SatSnapshot(this.escalationPct, this.window, this.so2Du, this.thermalMw, this.s1Db, this.rainMm,
      this.krbRadiusKm, this.updated);
}

const snapshots = {
  1: SatSnapshot(12, L('> 14 hari', '> 14 days'), 0.4, 3, -0.4, 6, 3, L('6 jam lalu', '6 hrs ago')),
  2: SatSnapshot(38, L('5 hari', '5 days'), 1.8, 14, -1.2, 18, 3, L('6 jam lalu', '6 hrs ago')),
  3: SatSnapshot(71, L('24–48 jam', '24–48 hrs'), 4.6, 34, -3.1, 42, 5, L('2 jam lalu', '2 hrs ago')),
  4: SatSnapshot(93, L('Sekarang', 'Now'), 9.2, 81, -5.4, 67, 7, L('15 mnt lalu', '15 min ago')),
};

class KitItem {
  final L name;
  final String qty;
  final int price;
  final IconData icon;
  const KitItem(this.name, this.qty, this.price, this.icon);
}

const kitItems = [
  KitItem(L('Masker N95', 'N95 masks'), '4 × 5 pcs', 30000, Icons.masks_outlined),
  KitItem(L('Air minum 3 hari', '3-day drinking water'), '12 L', 36000, Icons.water_drop_outlined),
  KitItem(L('Kacamata pelindung abu', 'Ash goggles'), '4 pcs', 60000, Icons.visibility_outlined),
  KitItem(L('Obat tetes mata', 'Eye drops'), '2 btl', 36000, Icons.medication_outlined),
  KitItem(L('Senter + baterai', 'Torch + batteries'), '2 set', 50000, Icons.flashlight_on_outlined),
  KitItem(L('Dokumen penting (map kedap air)', 'Key documents (waterproof)'), '1 map', 15000, Icons.folder_outlined),
  KitItem(L('Obat rutin lansia (7 hari)', 'Elderly meds (7 days)'), '1 paket', 55000, Icons.elderly),
  KitItem(L('Pakaian ganti & selimut', 'Spare clothes & blanket'), '4 set', 30000, Icons.checkroom_outlined),
];

class HetItem {
  final L name;
  final L unit;
  final int het;
  final int avg;
  final int stores;
  final IconData icon;
  final bool flagged;
  const HetItem(this.name, this.unit, this.het, this.avg, this.stores, this.icon, {this.flagged = false});
  String get id => slugId(name.en);
  double get diffPct => het == 0 ? 0 : (avg - het) / het * 100;
}

/// Price-cap board for one region (bundled default: Candipuro).
class PriceBoard {
  final String region;
  final List<HetItem> items;
  const PriceBoard(this.region, this.items);
  HetItem get featured => items.firstWhere((h) => h.id == 'n95-mask', orElse: () => items.first);
  List<HetItem> get others {
    final f = featured;
    return [for (final h in items) if (!identical(h, f)) h];
  }
}

const hetItems = [
  HetItem(L('Masker N95', 'N95 mask'), L('per box / 20 pcs', 'per box / 20 pcs'), 150000, 148500, 14, Icons.masks_outlined),
  HetItem(L('Air mineral galon', 'Water gallon'), L('19 L', '19 L'), 22000, 21500, 22, Icons.water_drop_outlined),
  HetItem(L('Beras medium', 'Medium rice'), L('5 kg', '5 kg'), 68500, 71200, 18, Icons.rice_bowl_outlined),
  HetItem(L('Obat tetes mata', 'Eye drops'), L('15 ml', '15 ml'), 18000, 17500, 9, Icons.medication_outlined),
  HetItem(L('Minyak goreng', 'Cooking oil'), L('1 L', '1 L'), 15700, 15900, 20, Icons.oil_barrel_outlined),
  HetItem(L('Paracetamol', 'Paracetamol'), L('strip 10 tab', 'strip of 10'), 7000, 6500, 11, Icons.medical_services_outlined),
];

enum Verdict { hoax, panic, verified, official, check }

class FeedItem {
  final Verdict v;
  final int pct;
  final L title;
  final L body;
  final L time;
  final DateTime? at; // set for live items; [time] is then derived from it
  const FeedItem(this.v, this.pct, this.title, this.body, this.time, {this.at});
  L get when => at == null ? time : ago(at!);
}

const feed = [
  FeedItem(
    Verdict.hoax,
    96,
    L('Klaim lahar Semeru meluap ke Pronojiwo dan memutus jembatan hari ini.',
        'Claim: Semeru lahar overflowed into Pronojiwo and cut the bridge today.'),
    L('Beredar rekaman video lama (2021). Citra radar Sentinel-1 terbaru tidak menunjukkan perubahan di jalur Gladak Perak.',
        'Old 2021 footage recirculated. Latest Sentinel-1 radar shows no change along the Gladak Perak route.'),
    L('24 mnt lalu', '24 min ago'),
  ),
  FeedItem(
    Verdict.official,
    91,
    L('PVMBG: radius bahaya sektor tenggara diperluas menjadi 5 km.', 'PVMBG: south-east hazard radius extended to 5 km.'),
    L('Rilis resmi Badan Geologi, sejalan dengan anomali termal MODIS/VIIRS.',
        'Official Geological Agency release, consistent with MODIS/VIIRS thermal anomaly.'),
    L('1 jam lalu', '1 hr ago'),
  ),
  FeedItem(
    Verdict.hoax,
    89,
    L('"Stok masker habis, harga N95 tembus Rp400 ribu per box."', '"Masks sold out, N95 now Rp400k per box."'),
    L('Data HET Disperindag: rata-rata Rp148.500 di 14 apotek resmi radius 5 km.',
        'Trade Office cap data: avg Rp148,500 across 14 licensed pharmacies within 5 km.'),
    L('3 jam lalu', '3 hrs ago'),
  ),
];

class Posko {
  final String name;
  final L type;
  final double? km; // null when the distance is unknown
  final int capacityPct;
  final List<L> available;
  final List<L> needed;
  final bool open24;
  final String status; // open | full | closed
  final DateTime? updatedAt;
  const Posko(this.name, this.type, this.km, this.capacityPct, this.available, this.needed, this.open24,
      {this.status = 'open', this.updatedAt});
  String get id => slugId(name);
  bool get isShelter {
    final t = type.en.toLowerCase();
    return t.contains('shelter') && !t.startsWith('aid');
  }
}

const poskoList = [
  Posko('Posko Balai Desa Penanggal', L('Posko Bantuan', 'Aid Post'), 1.4, 80,
      [L('Air Bersih', 'Clean water'), L('Beras', 'Rice'), L('Selimut', 'Blankets'), L('Masker Bedah', 'Surgical masks')],
      [L('Masker N95', 'N95 masks'), L('Obat Mata / Tetes Mata', 'Eye drops'), L('Pampers Lansia', 'Adult diapers')], true),
  Posko('GOR Candipuro', L('Shelter Pengungsian', 'Evacuation Shelter'), 2.6, 60,
      [L('Dapur Umum', 'Public kitchen'), L('Tikar', 'Mats'), L('Air Bersih', 'Clean water')],
      [L('Susu Balita', 'Infant formula'), L('Selimut', 'Blankets')], true),
  Posko('Posko Kecamatan Pasirian', L('Posko Bantuan', 'Aid Post'), 6.8, 45,
      [L('Sembako', 'Staples'), L('Obat Umum', 'General meds')],
      [L('Terpal', 'Tarpaulins'), L('Genset', 'Generator')], false),
];

class Village {
  final String name;
  final String kec;
  final int pop; // WorldPop 100 m sum inside hazard polygon
  final String krb; // '' when unknown
  final double api; // Aid Priority Index = exposure × hazard × unmet need
  final int unmetPct;
  final List<L> needs;
  const Village(this.name, this.kec, this.pop, this.krb, this.api, this.unmetPct, {this.needs = const []});
  String get id => slugId(name);
}

const villages = [
  Village('Sumberwuluh', 'Candipuro', 2140, 'III', 0.94, 78),
  Village('Supiturang', 'Pronojiwo', 1810, 'III', 0.88, 71),
  Village('Penanggal', 'Candipuro', 1320, 'III', 0.81, 66),
  Village('Sumbermujur', 'Candipuro', 960, 'II', 0.67, 52),
  Village('Jugosari', 'Candipuro', 600, 'II', 0.55, 38),
];

class Protocol {
  final L title;
  final L body;
  final L due;
  const Protocol(this.title, this.body, this.due);
}

const sectorProtocols = {
  Persona.petani: [
    Protocol(L('Tutup rapat penampungan pakan silase & tandon air minum', 'Seal silage fodder storage & drinking-water tanks'),
        L('Lindungi stok pakan hijau dari kontaminasi abu sulfur.', 'Protect green fodder from sulphur ash contamination.'),
        L('Dalam 48 jam', 'Within 48 h')),
    Protocol(L('Siapkan tali tambang & rute evakuasi hewan ternak', 'Prepare ropes & livestock evacuation route'),
        L('Rute aman mengarah ke shelter komunal Lapangan Desa Pasirian.', 'Safe route leads to the communal shelter at Pasirian field.'),
        L('Dalam 72 jam', 'Within 72 h')),
    Protocol(L('Panen dini jagung siap panen (0,8 ha)', 'Early-harvest ready maize (0.8 ha)'),
        L('Abu > 1 cm diperkirakan merusak 60% tanaman berdaun lebar.', 'Ash > 1 cm expected to damage 60% of broad-leaf crops.'),
        L('Kondisional', 'Conditional')),
  ],
  Persona.pariwisata: [
    Protocol(L('Tutup jalur pendakian & informasikan wisatawan', 'Close hiking trails & inform visitors'),
        L('Gunakan template pesan bilingual dari MarketShield.', 'Use the bilingual message template from MarketShield.'),
        L('Segera', 'Now')),
    Protocol(L('Stok darurat toko: air, masker, senter', 'Shop emergency stock: water, masks, torches'),
        L('Belanja sesuai HET di distributor resmi.', 'Buy at price-cap from licensed distributors.'), L('Dalam 48 jam', 'Within 48 h')),
  ],
  Persona.logistik: [
    Protocol(L('Pindahkan armada dari jalur lahar Besuk Kobokan', 'Move fleet off the Besuk Kobokan lahar path'),
        L('Gunakan koridor AB yang ditandai aman.', 'Use corridor AB marked safe.'), L('Dalam 24 jam', 'Within 24 h')),
    Protocol(L('Prioritaskan distribusi ke 3 desa KRB III', 'Prioritise distribution to 3 KRB III villages'),
        L('Urutan dari Indeks Prioritas Bantuan (WorldPop × bahaya).', 'Order from Aid Priority Index (WorldPop × hazard).'),
        L('Hari ini', 'Today')),
  ],
  Persona.apotek: [
    Protocol(L('Laporkan stok N95, tetes mata, tabung O₂', 'Report N95, eye drops, O₂ tank stock'),
        L('Stok dipakai untuk peta ketersediaan warga.', 'Stock feeds the resident availability map.'), L('Harian', 'Daily')),
    Protocol(L('Patuhi HET — jangan naikkan harga', 'Respect price caps — do not raise prices'),
        L('Laporan warga diteruskan ke Satgas Pangan.', 'Resident reports go to the Food Task Force.'), L('Berlaku', 'Ongoing')),
  ],
  Persona.warga: [
    Protocol(L('Lengkapi Kit Siaga keluarga', 'Complete the family Ready Kit'),
        L('Belanja bertahap sesuai jadwal dusun — tanpa panic buying.', 'Shop in stages per hamlet schedule — no panic buying.'),
        L('Dalam 72 jam', 'Within 72 h')),
    Protocol(L('Kenali titik kumpul GOR Candipuro', 'Know the GOR Candipuro assembly point'),
        L('Lansia & anak berangkat pertama saat Level III.', 'Elderly & children leave first at Level III.'), L('Hari ini', 'Today')),
  ],
};

/// Inbox alert (bundled fallback for `GET /alerts`).
class AlertItem {
  final String kind; // level | sat | hoax | price | sector | posko
  final L text;
  final L meta; // "source • time" line for bundled items
  final DateTime? at;
  const AlertItem(this.kind, this.text, this.meta, {this.at});
}

const bundledAlerts = [
  AlertItem('sat', L('SO₂ naik 3 hari berturut-turut', 'SO₂ up 3 days in a row'), L('Sentinel-5P • 6 jam lalu', 'Sentinel-5P • 6 hrs ago')),
  AlertItem('hoax', L('Hoaks jembatan Gladak Perak terbantah', 'Gladak Perak bridge hoax debunked'), L('IndoBERT • 24 mnt lalu', 'IndoBERT • 24 min ago')),
];

/// Known distances for live posko IDs (same seed as web/src/lib/data.ts); the API does not send them.
const poskoKmById = {
  'balai-desa-sumbermujur': 3.1,
  'lapangan-candipuro': 4.6,
  'sdn-penanggal-02': 6.2,
  'puskesmas-pasirian': 11.8,
  'posko-pronojiwo': 9.4,
};

// ------------------------------------------------------------------ live-data helpers

const _accents = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ù': 'u',
  'ú': 'u', 'û': 'u', 'ü': 'u', 'ý': 'y', 'ÿ': 'y', '₂': '2',
};

/// Slug id used to match API rows to bundled data: lowercase, accents stripped, non-alphanumerics → "-".
String slugId(String s) {
  final b = StringBuffer();
  for (final ch in s.toLowerCase().split('')) {
    b.write(_accents[ch] ?? ch);
  }
  return b.toString().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-+|-+$'), '');
}

/// Indonesian wording for English-only API strings (posko kind/has/needs, price item/unit, village needs).
/// Bundled app text wins; the extra terms mirror the bilingual seed in web/src/lib/data.ts.
final Map<String, L> idGlossary = () {
  final m = <String, L>{};
  void add(L v) => m.putIfAbsent(slugId(v.en), () => v);
  for (final p in poskoList) {
    add(p.type);
    p.available.forEach(add);
    p.needed.forEach(add);
  }
  for (final h in hetItems) {
    add(h.name);
    add(h.unit);
  }
  for (final k in kitItems) {
    add(k.name);
  }
  const extra = [
    L('Posko & shelter', 'Aid post & shelter'), L('Shelter terbuka', 'Open shelter'), L('Shelter', 'Shelter'),
    L('Pos medis', 'Medical post'), L('Makanan', 'Food'), L('Air', 'Water'), L('P3K', 'First aid'),
    L('Tenda', 'Tents'), L('Dapur umum', 'Field kitchen'), L('Terpal', 'Tarps'), L('Oksigen', 'Oxygen'),
    L('Nebulizer', 'Nebulizers'), L('Masker anak', "Children's masks"), L('Makanan bayi', 'Baby food'),
    L('Dipindah ke Sumbermujur', 'Moved to Sumbermujur'), L('Masker', 'Masks'), L('Senter', 'Torches'),
    L('Air galon 19 L', '19 L water'), L('Kacamata pelindung', 'Goggles'), L('Pakan ternak', 'Livestock feed'),
    L('Tas siaga', 'Go-bag'), L('Senter LED', 'LED torch'), L('Oksigen portabel', 'Portable oxygen'),
    L('Kacamata pelindung', 'Safety goggles'), L('Masker bedah (50)', 'Surgical masks (50)'),
    L('per galon', 'per jug'), L('per botol', 'per bottle'), L('per pcs', 'each'), L('per kaleng', 'per can'),
    L('per kotak', 'per box'),
  ];
  extra.forEach(add);
  return m;
}();

/// Bilingual pair for an English API string: bundled Indonesian when the slug matches, else the API text.
L bi(String en) {
  final hit = idGlossary[slugId(en)];
  return L(hit?.id ?? en, en);
}

/// Splits an API list string ("Food, water, first aid") into bilingual chips; "-" means none.
List<L> biList(String? csv) {
  final s = (csv ?? '').trim();
  if (s.isEmpty || s == '-') return const [];
  return [for (final t in s.split(',')) if (t.trim().isNotEmpty) bi(t.trim())];
}

/// Relative time ("12 mnt lalu" / "12 min ago").
L ago(DateTime at, [DateTime? now]) {
  final d = (now ?? DateTime.now()).difference(at);
  if (d.inMinutes < 1) return const L('baru saja', 'just now');
  if (d.inMinutes < 60) return L('${d.inMinutes} mnt lalu', '${d.inMinutes} min ago');
  if (d.inHours < 24) return L('${d.inHours} jam lalu', '${d.inHours} hr${d.inHours == 1 ? '' : 's'} ago');
  return L('${d.inDays} hari lalu', '${d.inDays} day${d.inDays == 1 ? '' : 's'} ago');
}

/// Clock time in the local zone: "14.05" (id) / "14:05" (en); prefixed with the date when not today.
L clock(DateTime at) {
  final t = at.toLocal();
  final now = DateTime.now();
  String two(int n) => n.toString().padLeft(2, '0');
  final day = t.year == now.year && t.month == now.month && t.day == now.day ? '' : '${t.day}/${t.month} ';
  return L('$day${two(t.hour)}.${two(t.minute)}', '$day${two(t.hour)}:${two(t.minute)}');
}
