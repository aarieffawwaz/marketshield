// Illustrative eruption scenario for Semeru. Shapes and timings are a teaching model
// built on the Besuk Kobokan channel and GFS-style wind, not an official forecast.

import type { Bi } from "@/lib/data";

export type Scenario = "small" | "large" | "lahar";
export type VillageStatus = "safe" | "ash" | "evac" | "hit";

export const SEMERU: [number, number] = [112.922, -8.108];
export let CRATER: [number, number] = SEMERU;

// Main channel from the crater toward the southeast (approximate), extended downstream
export const CHANNEL: [number, number][] = [
  [112.922, -8.108], [112.938, -8.125], [112.955, -8.142], [112.975, -8.162], [112.995, -8.182],
  [113.012, -8.203], [113.03, -8.226], [113.045, -8.248], [113.058, -8.272],
];

export const SIM_VILLAGES = [
  { name: "Supiturang", c: [112.947, -8.203] as [number, number], pop: 4120 },
  { name: "Oro-oro Ombo", c: [112.905, -8.222] as [number, number], pop: 2950 },
  { name: "Sumberwuluh", c: [112.997, -8.176] as [number, number], pop: 6380 },
  { name: "Penanggal", c: [113.04, -8.142] as [number, number], pop: 3410 },
  { name: "Sumbermujur", c: [113.062, -8.158] as [number, number], pop: 2680 },
  { name: "Jugosari", c: [113.05, -8.222] as [number, number], pop: 2210 },
  { name: "Curah Kobokan", c: [113.022, -8.212] as [number, number], pop: 1850 },
  { name: "Tamanayu", c: [112.876, -8.24] as [number, number], pop: 1640 },
  { name: "Ampelgading", c: [112.86, -8.13] as [number, number], pop: 3200 },
  { name: "Dampit", c: [112.75, -8.21] as [number, number], pop: 5400 },
];

let KX = 111.32 * Math.cos((CRATER[1] * Math.PI) / 180);
const KY = 110.57;
const toKm = ([lon, lat]: [number, number]): [number, number] => [(lon - CRATER[0]) * KX, (lat - CRATER[1]) * KY];
const toLL = ([x, y]: [number, number]): [number, number] => [CRATER[0] + x / KX, CRATER[1] + y / KY];
let CH_KM = CHANNEL.map(toKm);
let HAS_VILLAGES = true;

/** Point the model at another volcano. Outside Semeru there is no village data,
 *  and the main flow path is a straight line downslope (illustrative). */
export function setOrigin(origin: [number, number]) {
  CRATER = origin;
  KX = 111.32 * Math.cos((origin[1] * Math.PI) / 180);
  const semeru = origin[0] === SEMERU[0] && origin[1] === SEMERU[1];
  HAS_VILLAGES = semeru;
  CH_KM = semeru ? CHANNEL.map(toKm) : Array.from({ length: 10 }, (_, i) => [i * 2 * Math.sin((150 * Math.PI) / 180), i * 2 * Math.cos((150 * Math.PI) / 180)] as [number, number]);
}
export const hasVillages = () => HAS_VILLAGES;

/** The channel cut at `km` from the crater */
function channelTo(km: number): [number, number][] {
  const out: [number, number][] = [CH_KM[0]];
  let acc = 0;
  for (let i = 1; i < CH_KM.length; i++) {
    const [ax, ay] = CH_KM[i - 1];
    const [bx, by] = CH_KM[i];
    const seg = Math.hypot(bx - ax, by - ay);
    if (acc + seg >= km) {
      const f = (km - acc) / seg;
      out.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
      return out;
    }
    acc += seg;
    out.push(CH_KM[i]);
  }
  return out;
}

/** Polygon around a km-space polyline, widening downstream */
function buffer(line: [number, number][], w0: number, w1: number): [number, number][] {
  if (line.length < 2) return [];
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  line.forEach((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const w = w0 + (w1 - w0) * (i / (line.length - 1));
    left.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
    right.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
  });
  const ring = [...left, ...right.reverse()];
  ring.push(ring[0]);
  return ring.map(toLL);
}

function plume(lenKm: number, bearing: number, spread: number): [number, number][] {
  if (lenKm <= 0.05) return [];
  const pts: [number, number][] = [[0, 0]];
  for (let d = -spread; d <= spread; d += spread / 6) {
    const b = ((bearing + d) * Math.PI) / 180;
    const r = lenKm * (1 - Math.abs(d) / (spread * 2.6));
    pts.push([r * Math.sin(b), r * Math.cos(b)]);
  }
  pts.push([0, 0]);
  return pts.map(toLL);
}

/** Distance (km) from a km-space point to a km-space polyline */
function distToLine(p: [number, number], line: [number, number][]) {
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i];
    const [bx, by] = line[i + 1];
    const L = (bx - ax) ** 2 + (by - ay) ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * (bx - ax) + (p[1] - ay) * (by - ay)) / L));
    best = Math.min(best, Math.hypot(p[0] - (ax + t * (bx - ax)), p[1] - (ay + t * (by - ay))));
  }
  return best;
}

function circle(rKm: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    out.push(toLL([Math.cos(a) * rKm, Math.sin(a) * rKm]));
  }
  return out;
}

function circleAt(cx: number, cy: number, r: number, n = 18): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push(toLL([cx + Math.cos(a) * r, cy + Math.sin(a) * r]));
  }
  return out;
}

// Deterministic pseudo-random so the plume keeps its shape between frames
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** A bent-over, cauliflower-shaped ash column made of overlapping puffs plus an umbrella cloud */
function billow(heightKm: number, wind: number, t: number): GeoJSON.Feature[] {
  if (heightKm < 0.1) return [];
  const H = heightKm * 1000;
  const wb = (wind * Math.PI) / 180;
  const out: GeoJSON.Feature[] = [];
  const N = 80;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const h = H * Math.pow(f, 0.85);
    const drift = Math.pow(f, 1.8) * heightKm * 0.9; // bends downwind with height
    const wob = Math.sin(t * 1.3 + i) * 0.08;
    const jx = (rnd(i) - 0.5) * (0.3 + f * 1.2);
    const jy = (rnd(i + 99) - 0.5) * (0.3 + f * 1.2);
    const cx = Math.sin(wb) * drift + jx + wob;
    const cy = Math.cos(wb) * drift + jy;
    const r = 0.18 + Math.pow(f, 0.8) * (0.42 + heightKm * 0.08) * (0.7 + rnd(i + 7) * 0.6);
    const thick = 220 + r * 950;
    out.push({ type: "Feature", properties: { base: Math.max(0, h - thick), top: h + thick, shade: Math.min(6, f * 6 + rnd(i + 3) * 1.5) }, geometry: { type: "Polygon", coordinates: [circleAt(cx, cy, r)] } } as GeoJSON.Feature);
  }
  // umbrella cloud spreading downwind at the top
  for (let k = 0; k < 7; k++) {
    const d = heightKm * (0.45 + k * 0.22);
    const side = (rnd(k + 50) - 0.5) * heightKm * 0.6;
    const cx = Math.sin(wb) * d + Math.cos(wb) * side;
    const cy = Math.cos(wb) * d - Math.sin(wb) * side;
    const r = heightKm * (0.16 + rnd(k + 60) * 0.12);
    out.push({ type: "Feature", properties: { base: H * (0.78 + rnd(k + 5) * 0.08), top: H * (0.95 + rnd(k) * 0.08), shade: 6 }, geometry: { type: "Polygon", coordinates: [circleAt(cx, cy, r, 22)] } } as GeoJSON.Feature);
  }
  return out;
}

function inside(pt: [number, number], ring: [number, number][]) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);

export const PARAMS: Record<Scenario, { pdcKm: number; ashKm: number; colKm: number; lahar: boolean; label: Bi }> = {
  small: { pdcKm: 6, ashKm: 22, colKm: 3, lahar: false, label: { id: "Erupsi kecil", en: "Small eruption" } },
  large: { pdcKm: 12, ashKm: 45, colKm: 7, lahar: false, label: { id: "Erupsi besar + awan panas", en: "Large eruption + pyroclastic flow" } },
  lahar: { pdcKm: 9, ashKm: 30, colKm: 5, lahar: true, label: { id: "Erupsi + lahar hujan", en: "Eruption + rain lahar" } },
};

export type SimFrame = {
  column: GeoJSON.FeatureCollection;
  pdc: GeoJSON.FeatureCollection;
  ash: GeoJSON.FeatureCollection;
  lahar: GeoJSON.FeatureCollection;
  villages: GeoJSON.FeatureCollection;
  level: 1 | 2 | 3 | 4;
  stats: { evacuated: number; exposed: number; hit: number; ashed: number; n95: number; window: number };
};

/** Scenario state at hour `t` (t = 0 is the eruption) */
export function simulate(t: number, sc: Scenario, wind: number, early: boolean): SimFrame {
  const P = PARAMS[sc];
  const colP = ease(t / 1.2) * (t > 30 ? Math.max(0.25, 1 - (t - 30) / 60) : 1);
  const column: GeoJSON.Feature[] = t >= 0 ? billow(P.colKm * colP, wind, t) : [];
  if (t >= 0 && t < 48) {
    // incandescent vent
    column.push({ type: "Feature", properties: { base: 0, top: 380, shade: -1 }, geometry: { type: "Polygon", coordinates: [circle(0.45)] } } as GeoJSON.Feature);
  }

  const pdcKm = t >= 0 ? P.pdcKm * ease(t / 1.5) : 0;
  const pdcLine = channelTo(pdcKm);
  const pdcRing = pdcKm > 0.2 ? buffer(pdcLine, 0.35, 0.9) : [];

  const ashKm = t >= 0 ? P.ashKm * ease(t / 14) : 0;
  const ashRing = plume(ashKm, wind, 16 + 10 * ease(t / 24));

  const laharKm = P.lahar && t > 20 ? 4 + 13 * ease((t - 20) / 14) : 0;
  const laharRing = laharKm > 0 ? buffer(channelTo(Math.min(19, laharKm + 3)).slice(1), 0.25, 0.45) : [];

  // Early warning: KRB evacuation runs from T−24 h to T−4 h. Without it: starts at T0, ends T+6 h.
  const evacP = early ? clamp01((t + 24) / 20) : clamp01(t / 6);
  let evacuated = 0;
  let exposed = 0;
  let hit = 0;
  let ashed = 0;
  const villages = (HAS_VILLAGES ? SIM_VILLAGES : []).map((v) => {
    const km = toKm(v.c);
    const dCrater = Math.hypot(km[0], km[1]);
    const dFlow = distToLine(km, channelTo(P.pdcKm + (P.lahar ? 8 : 0)));
    const atRisk = dCrater < 13 || dFlow < 2.2;
    if (atRisk) exposed += v.pop;
    const reached = Math.max(pdcKm, laharKm) >= dCrater * 0.85;
    const flowHere = reached && dFlow < 1.8;
    const out = atRisk ? Math.round(v.pop * evacP) : 0;
    evacuated += out;
    let status: VillageStatus = "safe";
    if (ashRing.length && inside(v.c, ashRing)) status = "ash";
    if (atRisk && evacP >= 0.98) status = "evac";
    if (flowHere && evacP < 0.98) status = "hit";
    if (status === "hit") hit += v.pop - out;
    if (status === "ash") ashed += v.pop;
    return { type: "Feature", properties: { name: v.name, status, pop: v.pop }, geometry: { type: "Point", coordinates: v.c } } as GeoJSON.Feature;
  });

  const level: 1 | 2 | 3 | 4 = t < -60 ? 1 : t < -30 ? 2 : t < -6 ? 3 : 4;
  // N95 price: panic spike without staggered nudges, anchored near the cap with them
  const surge = clamp01((t + 6) / 18);
  const n95 = Math.round((early ? 12000 + 1800 * surge : 12000 + 26000 * surge) / 500) * 500;

  const fc = (features: GeoJSON.Feature[]) => ({ type: "FeatureCollection", features }) as GeoJSON.FeatureCollection;
  const poly = (ring: [number, number][]) => (ring.length > 3 ? [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } } as GeoJSON.Feature] : []);
  return {
    column: fc(column),
    pdc: fc(poly(pdcRing)),
    ash: fc(poly(ashRing)),
    lahar: fc(poly(laharRing)),
    villages: fc(villages),
    level,
    stats: { evacuated, exposed, hit: Math.max(0, hit), ashed, n95, window: early ? 72 : 0.5 },
  };
}

export const EVENTS: { t: number; early?: boolean; text: Bi }[] = [
  { t: -66, text: { id: "Sentinel-5P: SO₂ naik 3 hari berturut-turut", en: "Sentinel-5P: SO₂ up 3 days in a row" } },
  { t: -60, early: true, text: { id: "Peluang eskalasi 42% · nudge Kit Siaga per kohort dimulai", en: "42% escalation odds · staggered go-kit nudges start" } },
  { t: -48, text: { id: "FIRMS: 7 titik panas di kawah · suhu +8 °C", en: "FIRMS: 7 crater hotspots · surface +8 °C" } },
  { t: -30, text: { id: "PVMBG menaikkan status ke Level III Siaga", en: "PVMBG raises status to Level III Watch" } },
  { t: -24, early: true, text: { id: "Siaran rute evakuasi ke desa KRB · posko disiapkan", en: "Evacuation routes broadcast to KRB villages · posts prepared" } },
  { t: -6, text: { id: "Level IV Awas · radius 13 km sepanjang Besuk Kobokan", en: "Level IV Warning · 13 km along Besuk Kobokan" } },
  { t: 0, text: { id: "ERUPSI · kolom abu membumbung", en: "ERUPTION · ash column rising" } },
  { t: 0.5, text: { id: "Awan panas guguran mengalir di Besuk Kobokan", en: "Pyroclastic flow runs down Besuk Kobokan" } },
  { t: 1, early: true, text: { id: "Hoaks “lahar masuk kota” dibantah dalam 4 menit", en: "“Lahar in town” hoax debunked in 4 minutes" } },
  { t: 3, text: { id: "Hujan abu di arah angin · N95 wajib", en: "Ashfall downwind · N95 required" } },
  { t: 8, early: true, text: { id: "Prioritas bantuan: desa terpapar abu terbanyak dikirimi masker", en: "Aid priority: most ash-exposed villages get masks first" } },
  { t: 22, text: { id: "GPM IMERG: hujan 42 mm di lereng · risiko lahar", en: "GPM IMERG: 42 mm rain on the slopes · lahar risk" } },
  { t: 26, text: { id: "Radar Sentinel-1 mendeteksi endapan baru di alur sungai", en: "Sentinel-1 radar detects new deposits in the channel" } },
];

/* ---------- Regional view: long-range ash, city AQI, prices, airports ---------- */

export type City = { name: string; c: [number, number]; region: string; airport?: string; baseAqi: number };

export const CITIES: City[] = [
  { name: "Lumajang", c: [113.224, -8.133], region: "Jawa Timur", baseAqi: 48 },
  { name: "Malang", c: [112.632, -7.983], region: "Jawa Timur", airport: "MLG", baseAqi: 55 },
  { name: "Probolinggo", c: [113.216, -7.754], region: "Jawa Timur", baseAqi: 58 },
  { name: "Jember", c: [113.701, -8.172], region: "Jawa Timur", baseAqi: 52 },
  { name: "Blitar", c: [112.168, -8.098], region: "Jawa Timur", baseAqi: 50 },
  { name: "Surabaya", c: [112.751, -7.257], region: "Jawa Timur", airport: "SUB", baseAqi: 78 },
  { name: "Banyuwangi", c: [114.369, -8.219], region: "Jawa Timur", airport: "BWX", baseAqi: 45 },
  { name: "Yogyakarta", c: [110.364, -7.797], region: "DI Yogyakarta", airport: "YIA", baseAqi: 62 },
  { name: "Denpasar", c: [115.216, -8.65], region: "Bali", airport: "DPS", baseAqi: 54 },
  { name: "Mataram", c: [116.116, -8.583], region: "NTB", airport: "LOP", baseAqi: 47 },
  { name: "Christmas Island", c: [105.69, -10.49], region: "Australia", baseAqi: 20 },
  { name: "Broome", c: [122.236, -17.962], region: "Australia", airport: "BME", baseAqi: 22 },
];

const REGION_KM: Record<Scenario, number> = { small: 140, large: 520, lahar: 260 };

/** Long-range plume as three concentration bands (0 = thick core, 2 = thin edge) */
export function regionalPlume(t: number, sc: Scenario, wind: number): GeoJSON.FeatureCollection {
  const L = t >= 0 ? REGION_KM[sc] * ease(t / 40) : 0;
  const bands = [
    { band: 2, len: L, spread: 30 },
    { band: 1, len: L * 0.7, spread: 20 },
    { band: 0, len: L * 0.4, spread: 12 },
  ];
  return {
    type: "FeatureCollection",
    features: bands
      .map((b) => ({ ...b, ring: plume(b.len, wind, b.spread) }))
      .filter((b) => b.ring.length > 3)
      .map((b) => ({ type: "Feature", properties: { band: b.band }, geometry: { type: "Polygon", coordinates: [b.ring] } }) as GeoJSON.Feature),
  };
}

export function rings(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [5, 10, 15, 25].map((km) => ({ type: "Feature", properties: { km }, geometry: { type: "LineString", coordinates: circle(km) } }) as GeoJSON.Feature),
  };
}

export function ringLabelPoint(km: number): [number, number] {
  return toLL([km * Math.cos(2.35), km * Math.sin(2.35)]);
}

// US EPA PM2.5 → AQI breakpoints
function aqiFromPm(pm: number) {
  const bp = [
    [0, 9, 0, 50], [9.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 125.4, 151, 200], [125.5, 225.4, 201, 300], [225.5, 500, 301, 500],
  ];
  for (const [cl, ch, il, ih] of bp) if (pm <= ch) return Math.round(((ih - il) / (ch - cl)) * (pm - cl) + il);
  return 500;
}

export const aqiBand = (a: number): { label: Bi; color: string } =>
  a <= 50 ? { label: { id: "Baik", en: "Good" }, color: "#2e7d32" }
  : a <= 100 ? { label: { id: "Sedang", en: "Moderate" }, color: "#c9a000" }
  : a <= 150 ? { label: { id: "Tidak sehat (sensitif)", en: "Unhealthy (sensitive)" }, color: "#ea6a1f" }
  : a <= 200 ? { label: { id: "Tidak sehat", en: "Unhealthy" }, color: "#d1301f" }
  : a <= 300 ? { label: { id: "Sangat tidak sehat", en: "Very unhealthy" }, color: "#7b1e60" }
  : { label: { id: "Berbahaya", en: "Hazardous" }, color: "#5c0412" };

export type CityImpact = { city: City; km: number; arrival: number | null; ash: number; aqi: number; n95: number; water: number; airport: "open" | "watch" | "closed" | null };

/** Per-city exposure at hour t: ash concentration index, AQI, prices and airport status */
export function cityImpacts(t: number, sc: Scenario, wind: number, early: boolean): CityImpact[] {
  const Lmax = REGION_KM[sc];
  const speed = Lmax / 40; // km per hour while the plume front grows
  return CITIES.map((city) => {
    const [x, y] = toKm(city.c);
    const km = Math.hypot(x, y);
    const bearing = ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
    const off = Math.abs(((bearing - wind + 540) % 360) - 180);
    const angular = off < 34 ? Math.cos((off / 34) * (Math.PI / 2)) : 0;
    const reach = km <= Lmax ? angular : 0;
    const arrival = reach > 0 ? Math.max(0.5, km / speed) : null;
    const since = arrival != null && t >= arrival ? t - arrival : -1;
    const ash = since >= 0 ? reach * Math.exp(-km / (Lmax * 0.45)) * Math.min(1, since / 6 + 0.3) * (t > 48 ? Math.max(0.3, 1 - (t - 48) / 48) : 1) : 0;
    // local ash near the crater regardless of wind (fallout)
    const near = t >= 0 && km < 30 ? 0.35 * Math.exp(-km / 12) : 0;
    const conc = Math.min(1, ash + near);
    const pm = (city.baseAqi / 50) * 9 + conc * 420;
    const aqi = Math.max(city.baseAqi, aqiFromPm(pm));
    const demand = conc > 0.02 || (t > -24 && km < 60) ? Math.min(1, conc * 2.4 + (km < 60 ? 0.35 : 0) * Math.min(1, (t + 24) / 30)) : 0;
    const n95 = Math.round((12000 * (1 + (early ? 0.15 : 2.1) * demand)) / 500) * 500;
    const water = Math.round((20000 * (1 + (early ? 0.05 : 0.6) * demand)) / 500) * 500;
    const airport = city.airport ? (conc > 0.18 ? "closed" : conc > 0.05 ? "watch" : "open") : null;
    return { city, km: Math.round(km), arrival: arrival != null ? Math.round(arrival) : null, ash: conc, aqi, n95, water, airport };
  });
}

/** Current column height (km) and flow length (km) for the particle renderer */
export function plumeState(t: number, sc: Scenario) {
  const P = PARAMS[sc];
  const colP = ease(t / 1.2) * (t > 30 ? Math.max(0.25, 1 - (t - 30) / 60) : 1);
  return { colKm: t >= 0 ? P.colKm * colP : 0, pdcKm: t >= 0 ? P.pdcKm * ease(t / 1.5) : 0 };
}

export const channelLngLat = () => CH_KM.map(toLL);
