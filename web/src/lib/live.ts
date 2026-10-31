"use client";

import { useEffect, useState } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import { addDoc, collection, doc, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where, type DocumentData, type QueryConstraint } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";
import { ALERTS, FEED, ITEMS, POSKO, VILLAGES, type Alert, type Bi, type Intel, type Item, type Level, type Posko, type Verdict, type Village } from "./data";
import { useApp } from "./store";

/** Current data mode; operators are always live */
export const useDataMode = () => useApp((s) => (s.session?.uid ? "live" : (s.session?.mode ?? "demo")));

/** Realtime Firestore reads for the console, with the bundled data as the offline/initial state. */

export const firebaseApp = () => (getApps().length ? getApp() : initializeApp(firebaseConfig));
export const firestore = () => getFirestore(firebaseApp());

export type Live<T> = { data: T[]; live: boolean; updatedAt: Date | null };

const clock = (d: Date): Bi => {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { id: `${hh}.${mm}`, en: `${hh}:${mm}` };
};
const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : typeof v === "string" ? new Date(v) : null);
const bi = (v: unknown, fb: Bi = { id: "", en: "" }): Bi => (v && typeof v === "object" && "id" in v ? (v as Bi) : typeof v === "string" ? { id: v, en: v } : fb);

function useCollection<T>(name: string, initial: T[], map: (id: string, d: DocumentData) => T | null, constraints: QueryConstraint[] = [], key = ""): Live<T> {
  const [state, setState] = useState<Live<T>>({ data: initial, live: false, updatedAt: null });
  const mode = useDataMode();
  useEffect(() => {
    if (mode === "demo") return;
    let unsub = () => {};
    try {
      unsub = onSnapshot(
        query(collection(firestore(), name), ...constraints),
        (snap) => setState({ data: snap.docs.map((d) => map(d.id, d.data())).filter((x): x is T => x !== null), live: !snap.metadata.fromCache, updatedAt: new Date() }),
        (err) => console.warn(`[live] ${name}:`, err.code),
      );
    } catch (e) {
      console.warn(`[live] ${name} unavailable`, e);
    }
    return () => unsub();
    // constraints are rebuilt each render; `key` captures their identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key, mode]);
  return mode === "demo" ? { data: initial, live: false, updatedAt: null } : state;
}

export type LiveVillage = Village & { id: string };
export const useVillages = (volcano = "semeru") =>
  useCollection<LiveVillage>(
    "villages",
    VILLAGES.map((v) => ({ ...v, id: v.desa })),
    (id, d) => ({ id, desa: d.name, kec: d.district, exposed: d.exposed ?? 0, layer: d.layer ?? "", vuln: d.vulnerability ?? 0.5, aid: d.aidReceived ?? 0, needs: bi(d.needs) }),
    [where("volcanoId", "==", volcano)],
    volcano,
  );

export type LivePosko = Posko & { id: string };
export const usePosko = (volcano = "semeru") =>
  useCollection<LivePosko>(
    "posko",
    POSKO.map((p) => ({ ...p, id: p.name })),
    (id, d) => {
      const at = toDate(d.updatedAt);
      return { id, name: d.name, kind: bi(d.kind), status: d.status, capacity: d.capacity ?? 0, filled: d.filled ?? 0, has: bi(d.has), needs: bi(d.needs), km: d.km ?? 0, updated: at ? clock(at) : bi(d.updatedLabel) };
    },
    [where("volcanoId", "==", volcano)],
    volcano,
  );

export type LiveItem = Item & { id: string };
export const usePrices = () =>
  useCollection<LiveItem>("prices", ITEMS.map((i) => ({ ...i, id: i.name.en })), (id, d) => ({ id, name: bi(d.name), unit: bi(d.unit), het: d.het, market: d.marketAvg, stock: d.verifiedOutlets ?? 0 }));

const VERDICT_ALIAS: Record<string, Verdict> = { HOAX: "HOAX", HOAKS: "HOAX", PANIC: "PANIC", PANIK: "PANIC", VERIFIED: "VERIFIED", TERVERIFIKASI: "VERIFIED", FAKTA: "VERIFIED", OFFICIAL: "OFFICIAL", RESMI: "OFFICIAL" };

export type LiveIntel = Intel & { id: string };
export const useIntel = (n = 20) =>
  useCollection<LiveIntel>(
    "intel",
    FEED.map((f, i) => ({ ...f, id: String(i) })),
    (id, d) => {
      const verdict = VERDICT_ALIAS[String(d.verdict).toUpperCase()];
      if (!verdict) return null;
      const at = toDate(d.createdAt);
      return { id, verdict, head: bi(d.head), ctx: bi(d.ctx), conf: Number(d.confidence) || 0, sources: d.sources ?? [], time: at ? clock(at) : bi(d.timeLabel) };
    },
    [orderBy("createdAt", "desc"), limit(n)],
    String(n),
  );

export type LiveAlert = Alert & { id: string };
export const useAlerts = (n = 20) =>
  useCollection<LiveAlert>(
    "alerts",
    ALERTS.map((a, i) => ({ ...a, id: String(i) })),
    (id, d) => {
      const at = toDate(d.createdAt);
      return { id, kind: d.kind, text: bi(d.text), time: at ? clock(at) : bi(d.timeLabel) };
    },
    [orderBy("createdAt", "desc"), limit(n)],
    String(n),
  );

export type Forecast = { p: number; windowDays: number | null; drivers: string[] } | null;
/** Model forecast written by the ML notebook to volcanoes/{id}.forecast */
export function useForecast(volcano = "semeru"): Forecast {
  const [f, setF] = useState<Forecast>(null);
  const mode = useDataMode();
  useEffect(() => {
    if (mode === "demo") return;
    try {
      return onSnapshot(doc(firestore(), "volcanoes", volcano), (s) => {
        const fc = s.data()?.forecast;
        const p = Number(fc?.p_escalation_7d);
        setF(fc && Number.isFinite(p) ? { p, windowDays: Number(fc.window_days) || null, drivers: Array.isArray(fc.shap_top3) ? fc.shap_top3.map(String) : [] } : null);
      }, () => setF(null));
    } catch {
      return undefined;
    }
  }, [volcano, mode]);
  return mode === "demo" ? null : f;
}

/** Official PVMBG level stored on volcanoes/{id}.level (live mode only) */
export function useOfficialLevel(volcano = "semeru"): Level | null {
  const [lv, setLv] = useState<Level | null>(null);
  const mode = useDataMode();
  useEffect(() => {
    if (mode === "demo") return;
    try {
      return onSnapshot(doc(firestore(), "volcanoes", volcano), (s) => {
        const n = Number(s.data()?.level);
        setLv(n >= 1 && n <= 4 ? (n as Level) : null);
      });
    } catch {
      return undefined;
    }
  }, [volcano, mode]);
  return mode === "demo" ? null : lv;
}

/* ---------- writes (signed-in operators; enforced by Firestore rules) ---------- */

export const setPoskoStatus = (id: string, status: Posko["status"]) =>
  updateDoc(doc(firestore(), "posko", id), { status, updatedAt: serverTimestamp(), updatedLabel: { id: "baru saja", en: "just now" } });

export const broadcastAlert = (text: string, volcanoId = "semeru") =>
  addDoc(collection(firestore(), "alerts"), { volcanoId, kind: "level", text: { id: text, en: text }, createdAt: serverTimestamp() });
