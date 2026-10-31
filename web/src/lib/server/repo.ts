import { Timestamp, type CollectionReference, type DocumentData, type Firestore, type Query } from "firebase-admin/firestore";
import { ALERTS, FEED, ITEMS, POSKO, VILLAGES, deviation, type Alert, type Bi, type Item, type Posko, type Verdict, type Village } from "@/lib/data";
import { VOLCANOES } from "@/lib/geo";
import { db } from "./firebase";

/** Data access for the public API. Reads Firestore when configured, otherwise the bundled seed data. */

export type Source = "firestore" | "static";
export type Result<T> = { source: Source; data: T };

export const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate().toISOString() : typeof v === "string" ? v : null);

async function read<T>(name: string, fallback: () => T[], map: (id: string, d: DocumentData) => T, q?: (c: CollectionReference) => Query): Promise<Result<T[]>> {
  const store = db();
  if (!store) return { source: "static", data: fallback() };
  try {
    const col = store.collection(name);
    const snap = await (q ? q(col) : col).get();
    return { source: "firestore", data: snap.docs.map((d) => map(d.id, d.data())) };
  } catch (e) {
    console.error(`firestore read ${name} failed, serving static data`, e);
    return { source: "static", data: fallback() };
  }
}

export type VolcanoRow = { id: string; name: string; lat: number; lon: number; level: number | null; monitored: boolean; updatedAt: string | null };
export const getVolcanoes = () =>
  read<VolcanoRow>(
    "volcanoes",
    () => VOLCANOES.map((v) => ({ id: slug(v.name), name: v.name, lat: v.lat, lon: v.lon, level: v.name === "Semeru" ? 3 : null, monitored: true, updatedAt: null })),
    (id, d) => ({ id, name: d.name, lat: d.lat, lon: d.lon, level: d.level ?? null, monitored: d.monitored ?? true, updatedAt: iso(d.updatedAt) }),
    (c) => c.orderBy("name"),
  );

export type VillageRow = Village & { id: string; volcanoId: string };
export const getVillages = (volcanoId = "semeru") =>
  read<VillageRow>(
    "villages",
    () => VILLAGES.map((v) => ({ ...v, id: slug(v.desa), volcanoId: "semeru" })).filter((v) => v.volcanoId === volcanoId),
    (id, d) => ({ id, volcanoId: d.volcanoId, desa: d.name, kec: d.district, exposed: d.exposed, layer: d.layer, vuln: d.vulnerability, aid: d.aidReceived, needs: d.needs }),
    (c) => c.where("volcanoId", "==", volcanoId),
  );

export type PriceRow = Item & { id: string; region: string; updatedAt: string | null };
export const getPrices = () =>
  read<PriceRow>(
    "prices",
    () => ITEMS.map((i) => ({ ...i, id: slug(i.name.en), region: "Kab. Lumajang", updatedAt: null })),
    (id, d) => ({ id, name: d.name, unit: d.unit, het: d.het, market: d.marketAvg, stock: d.verifiedOutlets, region: d.region, updatedAt: iso(d.updatedAt) }),
  );

export type PoskoRow = Posko & { id: string; volcanoId: string; updatedAt: string | null };
export const getPosko = (volcanoId = "semeru") =>
  read<PoskoRow>(
    "posko",
    () => POSKO.map((p) => ({ ...p, id: slug(p.name), volcanoId: "semeru", updatedAt: null })),
    (id, d) => ({ id, volcanoId: d.volcanoId, name: d.name, kind: d.kind, status: d.status, capacity: d.capacity, filled: d.filled, has: d.has, needs: d.needs, updated: d.updatedLabel ?? { id: "", en: "" }, km: d.km ?? 0, updatedAt: iso(d.updatedAt) }),
    (c) => c.where("volcanoId", "==", volcanoId),
  );

export type AlertRow = Alert & { id: string; createdAt: string | null };
export const getAlerts = (limit = 20) =>
  read<AlertRow>(
    "alerts",
    () => ALERTS.map((a, i) => ({ ...a, id: String(i), createdAt: null })),
    (id, d) => ({ id, kind: d.kind, time: d.timeLabel, text: d.text, createdAt: iso(d.createdAt) }),
    (c) => c.orderBy("createdAt", "desc").limit(limit),
  );

export type IntelRow = { id: string; verdict: Verdict; head: Bi; ctx: Bi; confidence: number; sources: string[]; time: Bi; createdAt: string | null };
export const getIntel = (limit = 20) =>
  read<IntelRow>(
    "intel",
    () => FEED.map((f, i) => ({ id: String(i), verdict: f.verdict, head: f.head, ctx: f.ctx, confidence: f.conf, sources: f.sources, time: f.time, createdAt: null })),
    (id, d) => ({ id, verdict: d.verdict, head: d.head, ctx: d.ctx, confidence: d.confidence, sources: d.sources ?? [], time: d.timeLabel, createdAt: iso(d.createdAt) }),
    (c) => c.orderBy("createdAt", "desc").limit(limit),
  );

/** Stores the outcome of a hoax check. The message text itself is never stored (UU PDP: data minimisation). */
export async function logSignal(s: { label: string; confidence: number; triggers: string[]; lang: "id" | "en"; length: number; model: string }) {
  const store: Firestore | null = db();
  if (!store) return;
  try {
    await store.collection("signals").add({ ...s, source: "api", createdAt: Timestamp.now() });
  } catch (e) {
    console.error("firestore write signals failed", e);
  }
}

export const priceView = (i: PriceRow) => ({ id: i.id, item: i.name.en, unit: i.unit.en, het: i.het, market_avg: i.market, deviation: Number(deviation(i).toFixed(3)), verified_outlets: i.stock, flagged: deviation(i) > 0.3, updated_at: i.updatedAt });

export type ForecastRow = { p: number; windowDays: number | null; drivers: string[]; model: string | null; updatedAt: string | null } | null;
/** Model forecast merged into volcanoes/{id} by the risk-engine notebook */
export async function getForecast(volcanoId: string): Promise<ForecastRow> {
  const store = db();
  if (!store) return null;
  try {
    const d = (await store.collection("volcanoes").doc(volcanoId).get()).data();
    const f = d?.forecast;
    const p = Number(f?.p_escalation_7d);
    if (!f || !Number.isFinite(p)) return null;
    return { p, windowDays: Number(f.window_days) || null, drivers: Array.isArray(f.shap_top3) ? f.shap_top3.map(String) : [], model: f.model ?? null, updatedAt: iso(d?.forecastUpdatedAt ?? d?.status_updated_at) };
  } catch {
    return null;
  }
}
