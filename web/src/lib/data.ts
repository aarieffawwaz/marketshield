// Shared content for the landing page, web console and mobile page.
// Values follow the shape of the GEE pipeline outputs described in the PRD.

export type Level = 1 | 2 | 3 | 4;
export type Bi = { id: string; en: string };

export const LEVELS: Record<Level, { roman: string; name: Bi; color: string; soft: string; hero: Bi; cta: Bi; prob: number; eaw: Bi }> = {
  1: {
    roman: "I",
    name: { id: "Normal", en: "Normal" },
    color: "#2E7D32",
    soft: "#E6F2E7",
    hero: { id: "Aman. Siapkan rencana keluarga.", en: "Safe. Prepare your family plan." },
    cta: { id: "Lengkapi Kit Siaga", en: "Complete your go-kit" },
    prob: 0.08,
    eaw: { id: "Tidak ada jendela aktif", en: "No active window" },
  },
  2: {
    roman: "II",
    name: { id: "Waspada", en: "Advisory" },
    color: "#E0A100",
    soft: "#FBF1D6",
    hero: { id: "Aktivitas meningkat. Siapkan perlengkapan di harga wajar.", en: "Activity rising. Stock up at fair prices." },
    cta: { id: "Lihat Rekomendasi Belanja", en: "See shopping list" },
    prob: 0.42,
    eaw: { id: "± 5 hari jendela aksi", en: "≈ 5-day action window" },
  },
  3: {
    roman: "III",
    name: { id: "Siaga", en: "Watch" },
    color: "#EA6A1F",
    soft: "#FCE7DA",
    hero: { id: "Siaga. Kenali rute evakuasimu.", en: "Watch. Know your evacuation route." },
    cta: { id: "Pratinjau Rute Evakuasi", en: "Preview evacuation route" },
    prob: 0.71,
    eaw: { id: "± 36 jam jendela aksi", en: "≈ 36-hour action window" },
  },
  4: {
    roman: "IV",
    name: { id: "Awas", en: "Warning" },
    color: "#B51A14",
    soft: "#F8DEDC",
    hero: { id: "EVAKUASI SEKARANG.", en: "EVACUATE NOW." },
    cta: { id: "Mulai Panduan Evakuasi", en: "Start evacuation guide" },
    prob: 0.93,
    eaw: { id: "Jendela aksi tertutup", en: "Window closed" },
  },
};

export const VOLCANO = {
  name: "Semeru",
  crater: "Jonggring Saloko",
  elevation: "3.676 mdpl",
  region: { id: "Lumajang, Jawa Timur", en: "Lumajang, East Java" },
  user: { id: "Candipuro, Lumajang", en: "Candipuro, Lumajang" },
  distanceKm: 13.4,
  bearing: { id: "Tenggara", en: "Southeast" },
};

export type Indicator = { key: string; label: Bi; dataset: string; value: string; trend: "up" | "down" | "flat"; acquired: Bi; weight: number };

// Satellite indicator tiles, scaled per level
export function indicators(level: Level): Indicator[] {
  const k = [0, 0.35, 0.6, 1, 1.35][level];
  const f = (n: number, d = 1) => (n * k).toFixed(d).replace(".", ",");
  return [
    { key: "s1", label: { id: "Radar Sentinel-1", en: "Sentinel-1 radar" }, dataset: "COPERNICUS/S1_GRD", value: `−${f(3.1)} dB • ${Math.round(12 * k)} km²`, trend: level > 1 ? "up" : "flat", acquired: { id: "2 hari lalu", en: "2 days ago" }, weight: 0.24 },
    { key: "firms", label: { id: "Titik Panas", en: "Hotspots" }, dataset: "FIRMS", value: `${Math.round(7 * k)} titik • ${Math.round(34 * k)} MW`, trend: level > 1 ? "up" : "flat", acquired: { id: "6 jam lalu", en: "6 h ago" }, weight: 0.18 },
    { key: "lst", label: { id: "Suhu Permukaan", en: "Surface temp." }, dataset: "MODIS/061/MOD11A1", value: `+${f(8.4)} °C`, trend: level > 1 ? "up" : "flat", acquired: { id: "1 hari lalu", en: "1 day ago" }, weight: 0.14 },
    { key: "so2", label: { id: "Gas SO₂", en: "SO₂ gas" }, dataset: "COPERNICUS/S5P/NRTI/L3_SO2", value: `${f(2.8)} DU`, trend: level > 1 ? "up" : "flat", acquired: { id: "1 hari lalu", en: "1 day ago" }, weight: 0.22 },
    { key: "aer", label: { id: "Aerosol / Abu", en: "Aerosol / ash" }, dataset: "COPERNICUS/S5P/NRTI/L3_AER_AI", value: f(1.9), trend: level > 2 ? "up" : "flat", acquired: { id: "1 hari lalu", en: "1 day ago" }, weight: 0.08 },
    { key: "ndvi", label: { id: "Vegetasi (NDVI)", en: "Vegetation (NDVI)" }, dataset: "COPERNICUS/S2_SR_HARMONIZED", value: `−${Math.round(18 * k)}%`, trend: level > 2 ? "down" : "flat", acquired: { id: "4 hari lalu", en: "4 days ago" }, weight: 0.06 },
    { key: "rain", label: { id: "Curah Hujan 24 j", en: "24 h rainfall" }, dataset: "NASA/GPM_L3/IMERG_V07", value: `${Math.round(42 * k)} mm`, trend: level > 2 ? "up" : "flat", acquired: { id: "3 jam lalu", en: "3 h ago" }, weight: 0.08 },
  ];
}

// 16-day escalation probability history ending today
export function riskSeries(level: Level) {
  const target = LEVELS[level].prob;
  const days = ["16/10", "17/10", "18/10", "19/10", "20/10", "21/10", "22/10", "23/10", "24/10", "25/10", "26/10", "27/10", "28/10", "29/10", "30/10", "31/10"];
  return days.map((d, i) => {
    const t = i / (days.length - 1);
    const base = 0.06 + (target - 0.06) * Math.pow(t, 1.8);
    const wobble = Math.sin(i * 1.7) * 0.025;
    const p = Math.max(0.02, Math.min(0.98, base + wobble));
    return { day: d, p: Math.round(p * 100), threshold: 60 };
  });
}

export const DRIVERS: Bi[] = [
  { id: "SO₂ naik 3 hari berturut-turut", en: "SO₂ up 3 days in a row" },
  { id: "Perubahan radar di alur Besuk Kobokan", en: "Radar change in the Besuk Kobokan channel" },
  { id: "Anomali suhu kawah +8 °C", en: "Crater temperature anomaly +8 °C" },
];

export type Village = { desa: string; kec: string; exposed: number; layer: string; vuln: number; aid: number; needs: Bi };

export const VILLAGES: Village[] = [
  { desa: "Supiturang", kec: "Pronojiwo", exposed: 4120, layer: "S1 lahar + KRB III", vuln: 0.82, aid: 1, needs: { id: "Masker N95, air bersih, terpal", en: "N95 masks, clean water, tarps" } },
  { desa: "Sumberwuluh", kec: "Candipuro", exposed: 6380, layer: "Lahar hujan (IMERG)", vuln: 0.74, aid: 3, needs: { id: "Selimut, obat tetes mata, makanan bayi", en: "Blankets, eye drops, baby food" } },
  { desa: "Oro-oro Ombo", kec: "Pronojiwo", exposed: 2950, layer: "KRB II + abu (GFS)", vuln: 0.79, aid: 1, needs: { id: "Masker, senter, air 19 L", en: "Masks, torches, 19 L water" } },
  { desa: "Penanggal", kec: "Candipuro", exposed: 3410, layer: "Abu (S5P AER_AI)", vuln: 0.61, aid: 2, needs: { id: "Masker bedah, kacamata pelindung", en: "Surgical masks, goggles" } },
  { desa: "Sumbermujur", kec: "Candipuro", exposed: 2680, layer: "Abu (GFS)", vuln: 0.58, aid: 2, needs: { id: "Pakan ternak, terpal", en: "Livestock feed, tarps" } },
  { desa: "Jugosari", kec: "Candipuro", exposed: 2210, layer: "KRB I", vuln: 0.52, aid: 4, needs: { id: "Air bersih", en: "Clean water" } },
  { desa: "Tamanayu", kec: "Pronojiwo", exposed: 1640, layer: "Abu (GFS)", vuln: 0.55, aid: 5, needs: { id: "Masker anak", en: "Children's masks" } },
  { desa: "Sidomulyo", kec: "Pronojiwo", exposed: 1980, layer: "KRB I", vuln: 0.47, aid: 6, needs: { id: "Selimut", en: "Blankets" } },
];

export function priority(v: Village, level: Level) {
  const hazard = [0, 0.4, 0.7, 1, 1.2][level];
  return (v.exposed * hazard * v.vuln) / (v.aid + 1);
}

export type Item = { name: Bi; unit: Bi; het: number; market: number; stock: number };

export const ITEMS: Item[] = [
  { name: { id: "Masker N95", en: "N95 mask" }, unit: { id: "per pcs", en: "each" }, het: 12000, market: 27500, stock: 4 },
  { name: { id: "Masker bedah (50)", en: "Surgical masks (50)" }, unit: { id: "per kotak", en: "per box" }, het: 35000, market: 41000, stock: 11 },
  { name: { id: "Kacamata pelindung", en: "Safety goggles" }, unit: { id: "per pcs", en: "each" }, het: 25000, market: 26000, stock: 9 },
  { name: { id: "Oksigen portabel", en: "Portable oxygen" }, unit: { id: "per kaleng", en: "per can" }, het: 55000, market: 98000, stock: 2 },
  { name: { id: "Air galon 19 L", en: "19 L water" }, unit: { id: "per galon", en: "per jug" }, het: 20000, market: 21000, stock: 16 },
  { name: { id: "Obat tetes mata", en: "Eye drops" }, unit: { id: "per botol", en: "per bottle" }, het: 15000, market: 19500, stock: 7 },
  { name: { id: "Senter LED", en: "LED torch" }, unit: { id: "per pcs", en: "each" }, het: 30000, market: 30000, stock: 12 },
  { name: { id: "Tas siaga", en: "Go-bag" }, unit: { id: "per pcs", en: "each" }, het: 150000, market: 165000, stock: 5 },
];

export const deviation = (i: Item) => (i.market - i.het) / i.het;

export function priceHistory(i: Item) {
  return Array.from({ length: 30 }, (_, d) => {
    const t = d / 29;
    const surge = t > 0.6 ? Math.pow((t - 0.6) / 0.4, 1.5) : 0;
    const p = i.het * (0.97 + Math.sin(d * 0.9) * 0.02) + (i.market - i.het) * surge;
    return { d: d + 1, price: Math.round(p / 100) * 100, het: i.het };
  });
}

export type Verdict = "HOAX" | "PANIC" | "VERIFIED" | "OFFICIAL";

export const VERDICTS: Record<Verdict, { label: Bi; color: string; soft: string }> = {
  HOAX: { label: { id: "HOAKS", en: "HOAX" }, color: "#B51A14", soft: "#F8DEDC" },
  PANIC: { label: { id: "PANIK / TIDAK AKURAT", en: "PANIC / INACCURATE" }, color: "#C2610F", soft: "#FCE7DA" },
  VERIFIED: { label: { id: "TERVERIFIKASI", en: "VERIFIED" }, color: "#2E7D32", soft: "#E6F2E7" },
  OFFICIAL: { label: { id: "RESMI", en: "OFFICIAL" }, color: "#2F5D8A", soft: "#E1EAF3" },
};

export type Intel = { verdict: Verdict; time: Bi; head: Bi; ctx: Bi; conf: number; sources: string[] };

export const FEED: Intel[] = [
  {
    verdict: "OFFICIAL",
    time: { id: "08.20 WIB", en: "08:20 WIB" },
    head: { id: "PVMBG: status Semeru tetap Level III (Siaga)", en: "PVMBG: Semeru stays at Level III (Watch)" },
    ctx: { id: "Radius 5 km dari kawah dan 13 km sepanjang Besuk Kobokan tetap dilarang.", en: "5 km from the crater and 13 km along Besuk Kobokan remain off-limits." },
    conf: 1,
    sources: ["PVMBG", "MAGMA Indonesia"],
  },
  {
    verdict: "HOAX",
    time: { id: "07.55 WIB", en: "07:55 WIB" },
    head: { id: "\"Lahar sudah masuk Pronojiwo, segera tinggalkan rumah!\"", en: "\"Lahar has reached Pronojiwo, leave your homes now!\"" },
    ctx: { id: "Radar Sentinel-1 tidak mendeteksi aliran baru ke Pronojiwo dalam 48 jam terakhir.", en: "Sentinel-1 radar shows no new flow toward Pronojiwo in the last 48 h." },
    conf: 0.94,
    sources: ["IndoBERT", "Sentinel-1", "BPBD Lumajang"],
  },
  {
    verdict: "VERIFIED",
    time: { id: "07.30 WIB", en: "07:30 WIB" },
    head: { id: "Hujan abu tipis di Candipuro dan Penanggal", en: "Light ashfall in Candipuro and Penanggal" },
    ctx: { id: "Cocok dengan arah angin GFS (240°) dan indeks aerosol S5P.", en: "Matches GFS wind (240°) and the S5P aerosol index." },
    conf: 0.88,
    sources: ["14 laporan warga", "GFS", "Sentinel-5P"],
  },
  {
    verdict: "PANIC",
    time: { id: "06.10 WIB", en: "06:10 WIB" },
    head: { id: "\"Masker habis di semua apotek Lumajang\"", en: "\"Masks sold out in every Lumajang pharmacy\"" },
    ctx: { id: "Masih ada stok terverifikasi di 4 outlet. Harga N95 di atas HET, sudah dilaporkan.", en: "Verified stock at 4 outlets. N95 is above HET and has been reported." },
    conf: 0.81,
    sources: ["IndoBERT", "Pantau HET"],
  },
];

export type Posko = { name: string; kind: Bi; status: "open" | "full" | "closed"; capacity: number; filled: number; has: Bi; needs: Bi; updated: Bi; km: number };

export const POSKO: Posko[] = [
  { name: "Balai Desa Sumbermujur", kind: { id: "Posko & shelter", en: "Aid post & shelter" }, status: "open", capacity: 420, filled: 268, has: { id: "Makanan, air, P3K", en: "Food, water, first aid" }, needs: { id: "Masker N95, selimut", en: "N95 masks, blankets" }, updated: { id: "12 mnt lalu", en: "12 min ago" }, km: 3.1 },
  { name: "Lapangan Candipuro", kind: { id: "Shelter terbuka", en: "Open shelter" }, status: "open", capacity: 900, filled: 512, has: { id: "Tenda, dapur umum", en: "Tents, field kitchen" }, needs: { id: "Air bersih, terpal", en: "Clean water, tarps" }, updated: { id: "25 mnt lalu", en: "25 min ago" }, km: 4.6 },
  { name: "SDN Penanggal 02", kind: { id: "Shelter", en: "Shelter" }, status: "full", capacity: 260, filled: 260, has: { id: "Tikar, makanan", en: "Mats, food" }, needs: { id: "Obat tetes mata, makanan bayi", en: "Eye drops, baby food" }, updated: { id: "40 mnt lalu", en: "40 min ago" }, km: 6.2 },
  { name: "Puskesmas Pasirian", kind: { id: "Pos medis", en: "Medical post" }, status: "open", capacity: 80, filled: 31, has: { id: "Oksigen, nebulizer", en: "Oxygen, nebulizers" }, needs: { id: "Masker anak", en: "Children's masks" }, updated: { id: "1 jam lalu", en: "1 h ago" }, km: 11.8 },
  { name: "Posko Pronojiwo", kind: { id: "Posko", en: "Aid post" }, status: "closed", capacity: 300, filled: 0, has: { id: "-", en: "-" }, needs: { id: "Dipindah ke Sumbermujur", en: "Moved to Sumbermujur" }, updated: { id: "3 jam lalu", en: "3 h ago" }, km: 9.4 },
];

export type Alert = { kind: "level" | "sat" | "hoax" | "price" | "sector" | "posko"; time: Bi; text: Bi };

export const ALERTS: Alert[] = [
  { kind: "sat", time: { id: "08.42", en: "08:42" }, text: { id: "SO₂ melonjak 3× dari baseline 90 hari (Sentinel-5P)", en: "SO₂ jumped 3× above the 90-day baseline (Sentinel-5P)" } },
  { kind: "level", time: { id: "08.20", en: "08:20" }, text: { id: "PVMBG mempertahankan Semeru di Level III (Siaga)", en: "PVMBG keeps Semeru at Level III (Watch)" } },
  { kind: "hoax", time: { id: "07.58", en: "07:58" }, text: { id: "Hoaks lahar Pronojiwo dibantah, menyebar di 37 grup WA", en: "Pronojiwo lahar hoax debunked, spreading in 37 WA groups" } },
  { kind: "price", time: { id: "07.40", en: "07:40" }, text: { id: "N95 +129% di atas HET di 3 outlet Pasirian", en: "N95 129% above HET at 3 Pasirian outlets" } },
  { kind: "sector", time: { id: "07.15", en: "07:15" }, text: { id: "Koridor Lumajang–Malang: abu tipis, kurangi kecepatan", en: "Lumajang–Malang corridor: light ash, slow down" } },
  { kind: "posko", time: { id: "06.50", en: "06:50" }, text: { id: "SDN Penanggal 02 penuh, arahkan ke Sumbermujur", en: "SDN Penanggal 02 is full, route to Sumbermujur" } },
];

export const DATASETS = [
  { id: "COPERNICUS/S1_GRD", what: { id: "Radar: perubahan kawah & alur lahar", en: "Radar: crater & lahar channel change" } },
  { id: "COPERNICUS/S5P/NRTI/L3_SO2", what: { id: "Kolom gas SO₂", en: "SO₂ column" } },
  { id: "FIRMS", what: { id: "Titik panas 48 jam", en: "48 h hotspots" } },
  { id: "MODIS/061/MOD11A1", what: { id: "Anomali suhu permukaan", en: "Surface temperature anomaly" } },
  { id: "NASA/GPM_L3/IMERG_V07", what: { id: "Hujan → risiko lahar hujan", en: "Rain → rain-lahar risk" } },
  { id: "NOAA/GFS0P25", what: { id: "Angin → arah sebaran abu", en: "Wind → ash drift" } },
  { id: "WorldPop/GP/100m/pop", what: { id: "Populasi terpapar", en: "Exposed population" } },
  { id: "COPERNICUS/S2_SR_HARMONIZED", what: { id: "Perubahan vegetasi lereng", en: "Slope vegetation change" } },
];

export const REPO = "aarieffawwaz/marketshield";

/** Fallback values; the download page refreshes them from the latest GitHub Release. */
export const APK = {
  version: "1.0.0",
  file: `https://github.com/${REPO}/releases/latest/download/marketshield-arm64.apk`,
  fileLegacy: `https://github.com/${REPO}/releases/latest/download/marketshield-armv7.apk`,
  sha: {
    arm64: "fcc028915bcc661055188f1ac80bf9bdd78d8915c8274ea86120444ea74f2155",
    armv7: "884800d3bbc6d4f8875ed5aaa6101171af210b2f6461d4272df630b5b2b94b10",
  },
  size: "20,8 MB",
  sizeLegacy: "18,3 MB",
  minAndroid: "Android 7.0+",
};

export const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");
