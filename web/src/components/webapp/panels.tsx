"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Box, CheckCircle2, ChevronDown, Flag, Map as MapIcon, Megaphone, Minus, PackageCheck, Radio, Satellite, Search, Truck, Users } from "lucide-react";
import { ALERTS, DRIVERS, FEED, ITEMS, LEVELS, POSKO, VILLAGES, VERDICTS, deviation, indicators, priceHistory, priority, riskSeries, rupiah, type Alert, type Level, type Verdict } from "@/lib/data";
import { useApp, useT, type Role } from "@/lib/store";
import { classify, type Check } from "@/lib/classify";
import { Rolling, Stagger, staggerItem } from "@/components/ui/rolling";
import { cn } from "@/lib/utils";
import { Badge, Bar, Card, SatTag } from "./ui";
import { HazardMap, LAYERS, type LayerKey } from "./hazard-map";
import { ChromaticText, FluidTabs, HoldButton, RulerPicker, StatusPicker, UndoToast } from "@/components/ui/interactions";

const RealMap = dynamic(() => import("@/components/map/real-map").then((m) => m.RealMap), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-night" /> });
const Terrain3D = dynamic(() => import("./terrain3d").then((m) => m.Terrain3D), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-sand" /> });

const fmt = (n: number) => n.toLocaleString("id-ID");

/* ---------- Overview ---------- */

export function Overview({ go, role }: { go: (tab: string) => void; role: Role }) {
  const { t, tx } = useT();
  const level = useApp((s) => s.level);
  const L = LEVELS[level];
  const series = useMemo(() => riskSeries(level), [level]);
  const inds = indicators(level);
  const exposed = VILLAGES.reduce((s, v) => s + v.exposed, 0);
  const kpis = [
    { k: t("Peluang eskalasi 7 hari", "7-day escalation odds"), v: `${Math.round(L.prob * 100)}%`, s: tx(L.eaw), c: L.color },
    { k: t("Penduduk terpapar", "Exposed population"), v: fmt(Math.round(exposed * [0, 0.35, 0.7, 1, 1.15][level])), s: "WorldPop × KRB", c: "#7b1e26" },
    { k: t("Posko buka", "Open aid posts"), v: `${POSKO.filter((p) => p.status === "open").length}/${POSKO.length}`, s: t("1 penuh, 1 dipindah", "1 full, 1 moved"), c: "#2e7d32" },
    { k: t("Hoaks dibantah 24 jam", "Hoaxes debunked 24 h"), v: String([2, 5, 14, 23][level - 1]), s: t("dari 61 pesan dicek", "of 61 messages checked"), c: "#b51a14" },
  ];

  return (
    <div className="space-y-5">
      <NextActions go={go} role={role} />
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div variants={staggerItem} key={k.k} className="card p-5">
            <p className="text-[12px] text-muted">{k.k}</p>
            <p className="mt-2 font-display text-[28px] font-semibold tracking-tight" style={{ color: k.c }}><Rolling key={k.v} value={k.v} delay={i * 0.08} /></p>
            <p className="mt-1 text-[12px] text-muted">{k.s}</p>
          </motion.div>
        ))}
      </Stagger>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title={t("Prakiraan satelit MarketShield", "MarketShield satellite forecast")}
          sub={t("Peluang kenaikan level dalam 7 hari, 16 hari terakhir", "Probability of a level rise within 7 days, last 16 days")}
          action={<SatTag><Satellite className="h-3 w-3" /> XGBoost</SatTag>}
        >
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="risk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={L.color} stopOpacity={0.35} />
                    <stop offset="1" stopColor={L.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#efe5e2" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b5856" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b5856" }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, t("Peluang", "Probability")]} contentStyle={{ borderRadius: 12, border: "1px solid #efe5e2", fontSize: 12 }} />
                <ReferenceLine y={60} stroke="#b51a14" strokeDasharray="4 4" label={{ value: t("ambang Siaga", "Watch threshold"), fontSize: 10, fill: "#b51a14", position: "insideTopLeft" }} />
                <Area type="monotone" dataKey="p" stroke={L.color} strokeWidth={2.2} fill="url(#risk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 border-t border-line pt-4">
            <p className="label text-muted">{t("Faktor utama (SHAP)", "Top drivers (SHAP)")}</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {DRIVERS.map((d, i) => (
                <div key={i} className="rounded-xl bg-sand p-3">
                  <Bar value={[0.82, 0.64, 0.47][i] * (level / 4 + 0.2)} color={L.color} />
                  <p className="mt-2 text-[12.5px] leading-snug text-ink">{tx(d)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title={t("Peringatan terbaru", "Latest alerts")} action={<button onClick={() => go("alerts")} className="text-[12px] font-medium text-maroon">{t("Semua", "All")}</button>}>
          <AlertList items={ALERTS.slice(0, 5)} />
        </Card>
      </div>

      <Card title={t("Indikator satelit", "Satellite indicators")} sub={t("Setiap nilai menyebut dataset dan waktu akuisisi", "Every value names its dataset and acquisition time")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {inds.map((ind) => (
            <div key={ind.key} className="rounded-xl border border-line bg-sand/60 p-3.5">
              <p className="text-[12px] font-medium text-muted">{tx(ind.label)}</p>
              <p className="mt-2 flex items-center gap-1 font-display text-[17px] font-semibold tabular text-wine">
                {ind.value}
                {ind.trend === "up" ? <ArrowUpRight className="h-4 w-4 text-crimson" /> : ind.trend === "down" ? <ArrowDownRight className="h-4 w-4 text-ember" /> : <Minus className="h-4 w-4 text-muted" />}
              </p>
              <p className="mt-2 truncate font-mono text-[9.5px] text-sat" title={ind.dataset}>{ind.dataset}</p>
              <p className="text-[10.5px] text-muted">{tx(ind.acquired)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Recommended next actions ---------- */

function NextActions({ go, role }: { go: (tab: string) => void; role: Role }) {
  const { t } = useT();
  const level = useApp((s) => s.level);
  const [done, setDone] = useState<string[]>([]);
  const all = [
    { id: "hoax", roles: ["bpbd", "posko"], tab: "signal", icon: Radio, c: "#b51a14", h: t("3 pesan perlu ditinjau", "3 messages need review"), p: t("Hoaks lahar Pronojiwo menyebar di 37 grup WA", "Pronojiwo lahar hoax spreading in 37 WA groups"), cta: t("Tinjau", "Review") },
    { id: "aid", roles: ["bpbd", "donor"], tab: "aid", icon: Truck, c: "#7b1e26", h: t("Supiturang prioritas #1", "Supiturang is priority #1"), p: t("4.120 warga terpapar, baru 1 kiriman", "4,120 people exposed, only 1 delivery"), cta: t("Kirim bantuan", "Send aid") },
    { id: "posko", roles: ["bpbd", "posko", "donor"], tab: "posko", icon: Users, c: "#c2610f", h: t("SDN Penanggal 02 penuh", "SDN Penanggal 02 is full"), p: t("Arahkan pengungsi ke Balai Desa Sumbermujur", "Route evacuees to Sumbermujur village hall"), cta: t("Perbarui posko", "Update posts") },
    { id: "price", roles: ["bpbd", "donor"], tab: "prices", icon: Flag, c: "#c2610f", h: t("N95 +129% di atas HET", "N95 129% above cap"), p: t("3 outlet di Pasirian ditandai", "3 Pasirian outlets flagged"), cta: t("Lihat harga", "View prices") },
    { id: "broadcast", roles: ["bpbd", "posko"], tab: "alerts", icon: Megaphone, c: "#2f5d8a", h: level >= 3 ? t("Siarkan rute evakuasi", "Broadcast evacuation route") : t("Kirim pengingat Kit Siaga", "Send go-kit reminder"), p: t("Wilayah Candipuro & Pronojiwo", "Candipuro & Pronojiwo area"), cta: t("Siarkan", "Broadcast") },
  ];
  const items = all.filter((a) => a.roles.includes(role) && !done.includes(a.id));
  if (!items.length) return null;
  return (
    <Card data-tour="actions" title={t("Tindakan disarankan", "Suggested actions")} sub={t("Diurutkan dari dampak terbesar untuk shift ini", "Ordered by impact for this shift")} action={<span className="rounded-full bg-peach px-2.5 py-1 text-[11.5px] font-semibold text-maroon">{items.length}</span>}>
      <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {items.map((a) => (
            <motion.li layout key={a.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 32 }} className="group flex items-center gap-3 rounded-2xl border border-line bg-sand/50 p-3 transition hover:border-maroon/30 hover:bg-surface">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${a.c}18`, color: a.c }}><a.icon className="h-[18px] w-[18px]" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-wine">{a.h}</p>
                <p className="truncate text-[12px] text-muted">{a.p}</p>
              </div>
              <button
                onClick={() => {
                  setDone((d) => [...d, a.id]);
                  go(a.tab);
                }}
                className="btn-shine shine-maroon inline-flex shrink-0 items-center gap-1 rounded-lg bg-maroon px-2.5 py-1.5 text-[12px] font-medium text-white"
              >
                {a.cta} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

/* ---------- Map ---------- */

export function MapPanel() {
  const { t, tx, lang } = useT();
  const level = useApp((s) => s.level);
  const [layers, setLayers] = useState<Set<LayerKey>>(new Set(["krb", "ash", "lahar", "hot", "route", "posko"]));
  const [sel, setSel] = useState<string>("Supiturang");
  const [view, setView] = useState<"sat" | "3d" | "2d">("sat");
  const [horizon, setHorizon] = useState(0);
  const v = VILLAGES.find((x) => x.desa === sel);
  const toggle = (k: LayerKey) =>
    setLayers((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const onSelect = useCallback((name: string) => setSel(name), []);
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line p-3">
          <FluidTabs
            data-tour="map-views"
            label={t("Tampilan peta", "Map view")}
            value={view}
            onChange={setView}
            className="mr-2 rounded-full bg-sand p-0.5"
            itemClassName="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
            pillClassName="bg-plum"
            options={[
              { value: "sat", label: <><Satellite className="h-3.5 w-3.5" /> {t("Satelit 3D", "Satellite 3D")}</> },
              { value: "3d", label: <><Box className="h-3.5 w-3.5" /> {t("Model", "Model")}</> },
              { value: "2d", label: <><MapIcon className="h-3.5 w-3.5" /> 2D</> },
            ]}
          />
          {view !== "sat" && LAYERS.map((l) => (
            <button
              key={l.key}
              onClick={() => toggle(l.key)}
              aria-pressed={layers.has(l.key)}
              className={cn("rounded-lg px-2.5 py-1.5 text-[12px] font-medium ring-1 transition active:scale-95", layers.has(l.key) ? "bg-maroon text-white ring-maroon" : "bg-surface text-muted ring-line hover:text-ink")}
            >
              {lang === "en" ? l.en : l.id}
            </button>
          ))}
        </div>
        <div className={cn("relative w-full", view === "sat" ? "h-[640px]" : "aspect-[800/540]")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.25 }} className="absolute inset-0">
              {view === "sat" ? <RealMap start="semeru" className="h-full w-full" /> : view === "3d" ? <Terrain3D level={level} layers={layers} horizon={horizon} selected={sel} onSelect={onSelect} /> : <HazardMap level={level} layers={layers} selected={sel} onSelect={onSelect} horizon={horizon} />}
            </motion.div>
          </AnimatePresence>
          {view !== "sat" && <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-white/90 px-3 py-2 text-[12px] shadow-sm backdrop-blur">
            <span className="font-medium text-wine">{t("Angin", "Wind")}:</span> {t("ke Barat Daya 240° · 12 knot", "to the southwest 240° · 12 kt")} <SatTag>GFS</SatTag>
          </div>}
          {view === "3d" && <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-muted backdrop-blur">{t("Seret untuk memutar · gulir untuk zoom · ketuk pin desa", "Drag to orbit · scroll to zoom · tap a village pin")}</p>}
        </div>
        {view !== "sat" && <div className="border-t border-line p-4">
          <RulerPicker label={t("Prakiraan sebaran abu", "Ash drift forecast")} value={horizon} onChange={setHorizon} min={0} max={72} step={6} format={(h) => (h === 0 ? t("Sekarang", "Now") : `+${h} ${t("jam", "h")}`)} />
        </div>}
      </Card>
      <div className="space-y-5">
        <AnimatePresence mode="wait">
          {v && (
            <motion.div key={v.desa} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              <Card title={v.desa} sub={`Kec. ${v.kec}`}>
                <dl className="space-y-3 text-[13px]">
                  <div className="flex justify-between"><dt className="text-muted">{t("Penduduk terpapar", "Exposed people")}</dt><dd className="font-semibold tabular">{fmt(v.exposed)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">{t("Lapisan pemicu", "Driving layer")}</dt><dd className="text-right font-medium text-sat">{v.layer}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">{t("Kerentanan", "Vulnerability")}</dt><dd className="font-semibold tabular">{v.vuln.toFixed(2)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">{t("Bantuan diterima", "Aid received")}</dt><dd className="font-semibold tabular">{v.aid} {t("kiriman", "drops")}</dd></div>
                </dl>
                <p className="mt-4 rounded-xl bg-peach/60 p-3 text-[12.5px] text-wine"><span className="font-semibold">{t("Butuh", "Needs")}:</span> {tx(v.needs)}</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <Card title={t("Kesegaran data", "Data freshness")}>
          <ul className="space-y-2.5">
            {LAYERS.map((l) => (
              <li key={l.key} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className={layers.has(l.key) ? "text-ink" : "text-muted/60"}>{lang === "en" ? l.en : l.id}</span>
                <span className="text-right font-mono text-[10.5px] text-sat">{l.src} · {tx(l.fresh)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Aid priority ---------- */

export function AidPanel() {
  const { t, tx } = useT();
  const level = useApp((s) => s.level);
  const [extra, setExtra] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [pending, setPending] = useState<{ desa: string; key: number } | null>(null);
  const seq = useRef(0);
  const rows = VILLAGES.map((v) => ({ ...v, aid: v.aid + (extra[v.desa] ?? 0) }))
    .map((v) => ({ v, score: priority(v, level) }))
    .sort((a, b) => b.score - a.score);
  const max = rows[0]?.score || 1;
  const hazard = [0, 0.4, 0.7, 1, 1.2][level];
  const tier = (s: number) => (s / max > 0.6 ? { l: t("Tinggi", "High"), c: "#b51a14", s: "#f8dedc" } : s / max > 0.3 ? { l: t("Sedang", "Medium"), c: "#c2610f", s: "#fce7da" } : { l: t("Rendah", "Low"), c: "#2e7d32", s: "#e6f2e7" });
  const log = (desa: string) => {
    setExtra((e) => ({ ...e, [desa]: (e[desa] ?? 0) + 1 }));
    seq.current += 1;
    setPending({ desa, key: seq.current });
  };
  const undo = () => {
    if (!pending) return;
    setExtra((e) => ({ ...e, [pending.desa]: Math.max(0, (e[pending.desa] ?? 0) - 1) }));
    setPending(null);
  };
  const done = useCallback(() => setPending(null), []);
  return (
    <div className="space-y-5">
      <Card
        title={t("Kirim ke mana? Peringkat prioritas bantuan per desa", "Where should aid go? Village priority ranking")}
        sub={t("Diurutkan dari paparan tertinggi, bukan dari yang paling ramai di media sosial", "Sorted by exposure, not by what trends on social media")}
        action={<SatTag>WorldPop × KRB × S1 × IMERG</SatTag>}
      >
        <ul className="-mx-5">
          {rows.map(({ v, score }, i) => {
            const tr = tier(score);
            const isOpen = open === v.desa;
            return (
              <motion.li layout key={v.desa} transition={{ type: "spring", stiffness: 400, damping: 36 }} className="border-b border-line/70 last:border-0">
                <div className="grid grid-cols-[28px_1fr_auto] items-center gap-3 px-5 py-3 md:grid-cols-[28px_1.1fr_170px_80px_1.3fr_auto]">
                  <span className="font-mono text-[13px] text-muted">{i + 1}</span>
                  <button onClick={() => setOpen(isOpen ? null : v.desa)} className="flex items-center gap-1.5 text-left" aria-expanded={isOpen}>
                    <span>
                      <span className="block font-semibold text-wine">{v.desa}</span>
                      <span className="block text-[11.5px] text-muted">{v.kec} · {v.aid} {t("kiriman", "drops")}</span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted transition", isOpen && "rotate-180")} />
                  </button>
                  <div className="hidden items-center gap-2 md:flex"><Bar value={score / max} color={tr.c} /><Badge color={tr.c} soft={tr.s}>{tr.l}</Badge></div>
                  <span className="hidden text-[13px] tabular md:block">{fmt(v.exposed)}</span>
                  <span className="hidden text-[12.5px] md:block">{tx(v.needs)}</span>
                  <button onClick={() => log(v.desa)} className="inline-flex items-center gap-1.5 rounded-lg btn-shine shine-maroon bg-maroon px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-maroon-deep active:scale-95">
                    <Truck className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("Catat kiriman", "Log delivery")}</span>
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="mx-5 mb-4 grid gap-3 rounded-xl bg-sand p-4 text-[12.5px] sm:grid-cols-4">
                        {[
                          { k: t("Penduduk terpapar", "Exposed"), v: fmt(v.exposed), s: "WorldPop 100 m" },
                          { k: t("Bobot bahaya", "Hazard weight"), v: hazard.toFixed(1), s: v.layer },
                          { k: t("Kerentanan", "Vulnerability"), v: v.vuln.toFixed(2), s: "WorldCover + jarak posko" },
                          { k: t("Skor prioritas", "Priority score"), v: fmt(Math.round(score)), s: `÷ (${v.aid} + 1)` },
                        ].map((x) => (
                          <div key={x.k}>
                            <p className="text-muted">{x.k}</p>
                            <p className="font-display text-[16px] font-semibold tabular text-wine">{x.v}</p>
                            <p className="font-mono text-[10px] text-sat">{x.s}</p>
                          </div>
                        ))}
                        <p className="text-muted sm:col-span-4 md:hidden"><span className="font-semibold text-wine">{t("Butuh", "Needs")}:</span> {tx(v.needs)}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </Card>
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
        <AnimatePresence>
          {pending && <UndoToast key={pending.key} message={t(`Kiriman ke ${pending.desa} dicatat`, `Delivery to ${pending.desa} logged`)} undoLabel={t("Batalkan", "Undo")} onUndo={undo} onDone={done} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Prices ---------- */

export function PricePanel({ toast }: { toast: (m: string) => void }) {
  const { t, tx } = useT();
  const [sel, setSel] = useState(0);
  const item = ITEMS[sel];
  const hist = useMemo(() => priceHistory(item), [item]);
  const devBadge = (d: number) => (d > 0.3 ? { c: "#b51a14", s: "#f8dedc", l: t("Penimbunan?", "Gouging?") } : d > 0.1 ? { c: "#c2610f", s: "#fce7da", l: t("Naik", "Rising") } : { c: "#2e7d32", s: "#e6f2e7", l: t("Wajar", "Fair") });
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <Card title={t("Pantau harga kebutuhan darurat", "Emergency price watch")} sub={t("Deviasi = (harga pasar − HET) ÷ HET", "Deviation = (market − cap) ÷ cap")}>
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11.5px] text-muted">
                <th className="px-5 py-2 font-medium">{t("Barang", "Item")}</th>
                <th className="py-2 font-medium">HET</th>
                <th className="py-2 font-medium">{t("Pasar", "Market")}</th>
                <th className="py-2 font-medium">{t("Deviasi", "Deviation")}</th>
                <th className="px-5 py-2 font-medium">{t("Stok", "Stock")}</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((it, i) => {
                const d = deviation(it);
                const b = devBadge(d);
                return (
                  <tr key={it.name.id} onClick={() => setSel(i)} className={cn("cursor-pointer border-b border-line/70 last:border-0 hover:bg-sand", sel === i && "bg-peach/40")}>
                    <td className="px-5 py-3"><p className="font-medium text-wine">{tx(it.name)}</p><p className="text-[11.5px] text-muted">{tx(it.unit)}</p></td>
                    <td className="py-3 tabular">{rupiah(it.het)}</td>
                    <td className="py-3 tabular font-medium">{rupiah(it.market)}</td>
                    <td className="py-3"><span className="mr-2 tabular font-semibold" style={{ color: b.c }}>+{Math.round(d * 100)}%</span><Badge color={b.c} soft={b.s}>{b.l}</Badge></td>
                    <td className="px-5 py-3 text-[12.5px] text-muted">{it.stock} outlet</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card
        title={tx(item.name)}
        sub={t("Harga 30 hari terakhir terhadap HET", "Last 30 days against the price cap")}
        action={
          <button onClick={() => toast(t("Laporan dikirim ke Satgas Pangan & Disperindag.", "Report sent to the food task force & trade office."))} className="inline-flex items-center gap-1.5 rounded-lg btn-shine shine-crimson bg-crimson px-3 py-1.5 text-[12px] font-medium text-white">
            <Flag className="h-3.5 w-3.5" /> {t("Laporkan", "Report")}
          </button>
        }
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hist} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid stroke="#efe5e2" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#6b5856" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#6b5856" }} tickLine={false} axisLine={false} width={64} tickFormatter={(v) => `${Math.round(v / 1000)}rb`} />
              <Tooltip formatter={(v) => rupiah(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid #efe5e2", fontSize: 12 }} />
              <ReferenceLine y={item.het} stroke="#2e7d32" strokeDasharray="5 4" label={{ value: "HET", fill: "#2e7d32", fontSize: 11, position: "insideTopLeft" }} />
              <Line type="monotone" dataKey="price" stroke="#7b1e26" strokeWidth={2.2} dot={false} name={t("Harga pasar", "Market price")} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-[12.5px] text-muted">
          {t("Anomali ditandai saat harga melewati HET lebih dari 30% di 3 outlet atau lebih dalam 24 jam.", "Flagged when prices exceed the cap by 30%+ at 3 or more outlets within 24 h.")}
        </p>
      </Card>
    </div>
  );
}

/* ---------- Signal filter ---------- */

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-crimson/15 px-0.5 text-crimson">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function SignalPanel() {
  const { t, tx, lang } = useT();
  const [text, setText] = useState("Katanya lahar sudah masuk Pronojiwo, segera tinggalkan rumah! Sebarkan ke grup lain!!!");
  const [res, setRes] = useState<{ text: string; r: Check } | null>(null);
  const [thinking, setThinking] = useState(false);
  const run = () => {
    setThinking(true);
    setRes(null);
    window.setTimeout(() => {
      setRes({ text, r: classify(text, lang) });
      setThinking(false);
    }, 1300);
  };
  const [filter, setFilter] = useState<"all" | Verdict>("all");
  const feed = FEED.filter((f) => filter === "all" || f.verdict === filter);
  const V = (v: Check["verdict"]) => (v === "UNVERIFIED" ? { label: { id: "BELUM TERVERIFIKASI", en: "UNVERIFIED" }, color: "#6b5856", soft: "#f3ede8" } : VERDICTS[v]);
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <Card title={t("Cek pesan", "Check a message")} sub={t("Tempel pesan WhatsApp atau unggahan media sosial", "Paste a WhatsApp message or social post")} action={<SatTag>IndoBERT + S1</SatTag>}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-line bg-sand/50 p-3 text-[13.5px] outline-none focus:border-maroon" />
        <button onClick={run} disabled={!text.trim() || thinking} className="mt-3 inline-flex items-center gap-2 rounded-xl btn-shine shine-maroon bg-maroon px-4 py-2.5 text-[13px] font-medium text-white transition active:scale-95 disabled:opacity-40">
          <Search className="h-4 w-4" /> {t("Periksa", "Check")}
        </button>
        <AnimatePresence>
          {thinking && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 space-y-2 rounded-xl border border-line p-4 text-[13px]">
              <ChromaticText>{t("Membaca pesan dengan IndoBERT…", "Reading the message with IndoBERT…")}</ChromaticText>
              <p className="text-[12px] text-muted">{t("Mencocokkan lokasi dengan radar Sentinel-1 dan angin GFS", "Matching locations against Sentinel-1 radar and GFS wind")}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {res && (
          <motion.div initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.35 }} className="mt-5 rounded-xl border border-line p-4">
            <div className="flex items-center justify-between">
              <Badge color={V(res.r.verdict).color} soft={V(res.r.verdict).soft}>{tx(V(res.r.verdict).label)}</Badge>
              <span className="text-[12px] tabular text-muted">{t("Keyakinan", "Confidence")} {Math.round(res.r.conf * 100)}%</span>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed"><Highlight text={res.text} words={res.r.triggers} /></p>
            {res.r.sat && (
              <p className="mt-3 flex gap-2 rounded-lg bg-[#e1eaf3] p-3 text-[12.5px] text-sat"><Satellite className="mt-0.5 h-4 w-4 shrink-0" /> {res.r.sat}</p>
            )}
            <p className="mt-3 flex gap-2 text-[12.5px] text-ink"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" /> {res.r.fact}</p>
          </motion.div>
        )}
      </Card>
      <Card title={t("Arus informasi", "Intel stream")}>
        <FluidTabs
          label={t("Filter", "Filter")}
          value={filter}
          onChange={setFilter}
          className="mb-4 flex-wrap gap-1"
          itemClassName="rounded-full px-3 py-1 text-[12px]"
          pillClassName="bg-plum"
          options={(["all", "HOAX", "OFFICIAL", "VERIFIED", "PANIC"] as const).map((f) => ({ value: f, label: f === "all" ? t("Semua", "All") : tx(VERDICTS[f].label) }))}
        />
        <ul className="space-y-3">
          {feed.map((f) => (
            <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={f.head.id} className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between">
                <Badge color={VERDICTS[f.verdict].color} soft={VERDICTS[f.verdict].soft}>{tx(VERDICTS[f.verdict].label)}</Badge>
                <span className="text-[11.5px] text-muted">{tx(f.time)}</span>
              </div>
              <p className="mt-2 text-[13.5px] font-semibold text-wine">{tx(f.head)}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{tx(f.ctx)}</p>
              <p className="mt-2 font-mono text-[10.5px] text-sat">{f.sources.join(" · ")}</p>
            </motion.li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- Posko ---------- */

export function PoskoPanel({ toast }: { toast: (m: string) => void }) {
  const { t, tx } = useT();
  const [posts, setPosts] = useState(POSKO);
  const opts = [
    { value: "open" as const, label: t("Buka", "Open"), color: "#2e7d32", soft: "#e6f2e7" },
    { value: "full" as const, label: t("Penuh", "Full"), color: "#c2610f", soft: "#fce7da" },
    { value: "closed" as const, label: t("Tutup", "Closed"), color: "#6b5856", soft: "#f3ede8" },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((p, i) => {
        const fill = p.capacity ? p.filled / p.capacity : 0;
        return (
          <Card
            key={p.name}
            title={p.name}
            sub={`${tx(p.kind)} · ${p.km.toString().replace(".", ",")} km`}
            action={
              <StatusPicker
                value={p.status}
                options={opts}
                onChange={(st) => {
                  setPosts((ps) => ps.map((x, j) => (j === i ? { ...x, status: st, updated: { id: "baru saja", en: "just now" } } : x)));
                  toast(t(`Status ${p.name} diperbarui untuk semua pengguna.`, `${p.name} status updated for all users.`));
                }}
              />
            }
          >
            <div className="flex items-center justify-between text-[12px] text-muted">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {t("Kapasitas", "Capacity")}</span>
              <span className="tabular">{p.filled}/{p.capacity}</span>
            </div>
            <Bar value={fill} color={fill >= 1 ? "#ea6a1f" : "#2e7d32"} className="mt-2" />
            <p className="mt-4 text-[12.5px]"><span className="font-semibold text-leaf">{t("Tersedia", "Available")}:</span> {tx(p.has)}</p>
            <p className="mt-1.5 text-[12.5px]"><span className="font-semibold text-crimson">{t("Butuh", "Needs")}:</span> {tx(p.needs)}</p>
            <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-[11.5px] text-muted"><PackageCheck className="h-3.5 w-3.5" /> {t("Diperbarui", "Updated")} {tx(p.updated)}</p>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Alerts ---------- */

const ALERT_ICON: Record<Alert["kind"], { icon: typeof Radio; c: string }> = {
  level: { icon: AlertTriangle, c: "#ea6a1f" },
  sat: { icon: Satellite, c: "#2f5d8a" },
  hoax: { icon: Radio, c: "#b51a14" },
  price: { icon: Flag, c: "#c2610f" },
  sector: { icon: Truck, c: "#7b1e26" },
  posko: { icon: PackageCheck, c: "#2e7d32" },
};

export function AlertList({ items, animate }: { items: Alert[]; animate?: boolean }) {
  const { tx } = useT();
  return (
    <ul className="space-y-1">
      {items.map((a) => {
        const I = ALERT_ICON[a.kind];
        return (
          <motion.li layout={animate} initial={animate ? { opacity: 0, x: -12, backgroundColor: "#ffdfd0" } : false} animate={{ opacity: 1, x: 0, backgroundColor: "rgba(255,255,255,0)" }} transition={{ duration: 0.6 }} key={a.text.id + a.time.id} className="flex gap-3 rounded-xl p-2.5 hover:bg-sand">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${I.c}18`, color: I.c }}>
              <I.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] leading-snug text-ink">{tx(a.text)}</p>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted">{tx(a.time)} WIB</p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function AlertsPanel() {
  const { t, tx } = useT();
  const level = useApp((s) => s.level);
  const [items, setItems] = useState<Alert[]>(ALERTS);
  const [msg, setMsg] = useState("");
  const [area, setArea] = useState("Candipuro, Pronojiwo");
  const send = () => {
    if (!msg.trim()) return;
    const now = new Date();
    const hh = `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;
    setItems((x) => [{ kind: "level", time: { id: hh, en: hh.replace(".", ":") }, text: { id: `${area}: ${msg}`, en: `${area}: ${msg}` } }, ...x]);
    setMsg("");
  };
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card title={t("Kotak peringatan", "Alert inbox")}>
        <AlertList items={items} animate />
      </Card>
      <Card title={t("Siarkan peringatan", "Broadcast an alert")} sub={t(`Dikirim dengan label Level ${LEVELS[level].roman}`, `Sent tagged Level ${LEVELS[level].roman}`)}>
        <label className="text-[12px] font-medium text-muted">{t("Wilayah", "Area")}</label>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-surface p-2.5 text-[13px]">
          <option>Candipuro, Pronojiwo</option>
          <option>Pasirian, Tempursari</option>
          <option>{t("Seluruh Kab. Lumajang", "All of Lumajang")}</option>
        </select>
        <label className="mt-4 block text-[12px] font-medium text-muted">{t("Pesan", "Message")}</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder={t("Contoh: Jalur Curah Kobokan ditutup, gunakan koridor AB.", "e.g. The Curah Kobokan road is closed, use corridor AB.")} className="mt-1 w-full resize-none rounded-xl border border-line p-3 text-[13px] outline-none focus:border-maroon" />
        <HoldButton
          onConfirm={send}
          disabled={!msg.trim()}
          className="mt-3 w-full"
          icon={<Megaphone className="h-4 w-4" />}
          label={t("Tahan untuk menyiarkan", "Hold to broadcast")}
          holdLabel={t("Terus tahan…", "Keep holding…")}
          doneLabel={t("Siaran terkirim", "Broadcast sent")}
        />
        <p className="mt-3 text-[11.5px] text-muted">{tx({ id: "Siaran dijadwalkan bertahap per kohort agar tidak memicu panic buying.", en: "Broadcasts are staggered by cohort to avoid panic buying." })}</p>
      </Card>
    </div>
  );
}

export type { Level };
