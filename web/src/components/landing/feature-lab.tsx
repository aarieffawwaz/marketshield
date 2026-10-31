"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, Building2, CheckCircle2, CircleDollarSign, Filter, HandHeart, HeartPulse, MapPin, Mountain, Radar, RadioTower, Satellite, Scale, ShieldAlert, Siren, Truck, Users, WifiOff } from "lucide-react";
import { Reveal } from "./reveal";
import { FluidTabs, HoldButton } from "@/components/ui/interactions";
import { classify } from "@/lib/classify";
import { ITEMS, LEVELS, VERDICTS, VILLAGES, priority, rupiah, type Level } from "@/lib/data";
import { useT } from "@/lib/store";
import { Stagger, staggerItem } from "@/components/ui/rolling";
import { cn } from "@/lib/utils";

/* ---------- Mini widgets, one per feature ---------- */

/* Small building blocks shared by the demos */
function Box({ title, aside, children, className }: { title?: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-surface p-3.5 ring-1 ring-line sm:p-4", className)}>
      {(title || aside) && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          {title && <p className="label !text-[9.5px] text-muted">{title}</p>}
          {aside && <span className="text-[10.5px] text-muted">{aside}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function Chips<T extends string | number>({ options, value, onChange }: { options: { value: T; label: React.ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={String(o.value)} onClick={() => onChange(o.value)} className={cn("rounded-full px-2.5 py-1 text-[11.5px] ring-1 transition", value === o.value ? "bg-maroon text-white ring-maroon" : "bg-surface text-muted ring-line hover:text-ink")}>{o.label}</button>
      ))}
    </div>
  );
}

function ForecastDemo() {
  const { t, tx } = useT();
  const [lv, setLv] = useState<Level>(2);
  const L = LEVELS[lv];
  const r = 64;
  const c = Math.PI * r;
  const pct = Math.round(L.prob * 100);
  // Illustrative SHAP-style split of the probability across the three satellite signals
  const drivers = [
    { k: t("SO₂ · Sentinel-5P", "SO₂ · Sentinel-5P"), v: ["0,4 DU", "1,6 DU", "2,8 DU", "4,1 DU"][lv - 1], w: 0.46, c: "#b51a14" },
    { k: t("Titik panas · FIRMS", "Hotspots · FIRMS"), v: [t("0 titik", "0 pts"), t("3 titik", "3 pts"), t("7 titik", "7 pts"), t("12 titik", "12 pts")][lv - 1], w: 0.32, c: "#ea6a1f" },
    { k: t("Radar · Sentinel-1", "Radar · Sentinel-1"), v: ["−0,2 dB", "−1,4 dB", "−3,1 dB", "−4,6 dB"][lv - 1], w: 0.22, c: "#2f5d8a" },
  ];
  const days = Array.from({ length: 7 }, (_, d) => L.prob * Math.pow((d + 1) / 7, 0.75));
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid flex-1 gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <Box className="flex flex-col items-center justify-center text-center">
          <div className="relative">
            <svg width="184" height="106" viewBox="0 0 160 92" aria-hidden>
              <path d="M16 84a64 64 0 0 1 128 0" fill="none" stroke="var(--t-line)" strokeWidth="12" strokeLinecap="round" />
              <motion.path d="M16 84a64 64 0 0 1 128 0" fill="none" stroke={L.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - L.prob) }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
            </svg>
            <motion.p key={lv} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-x-0 bottom-0 font-display text-[34px] font-semibold leading-none tabular" style={{ color: L.color }}>{pct}%</motion.p>
          </div>
          <p className="mt-2 text-[12px] text-muted">{t("peluang naik level dalam 7 hari", "chance of a level rise in 7 days")}</p>
          <p className="mt-2.5 rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: L.soft, color: L.color }}>{tx(L.eaw)}</p>
        </Box>
        <Box title={t("Faktor utama (SHAP)", "Top drivers (SHAP)")} aside={t("contoh", "example")} className="flex flex-col">
          <ul className="flex flex-1 flex-col justify-around gap-2.5">
            {drivers.map((d) => (
              <li key={d.k}>
                <div className="flex items-baseline justify-between text-[12px]"><span className="text-ink">{d.k}</span><span className="font-mono tabular text-muted">{d.v}</span></div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-2"><motion.div className="h-full rounded-full" style={{ background: d.c }} animate={{ width: `${Math.max(4, d.w * L.prob * 200)}%` }} transition={{ type: "spring", stiffness: 140, damping: 20 }} /></div>
                  <span className="w-12 text-right font-mono text-[11px] font-semibold tabular" style={{ color: d.c }}>+{Math.round(d.w * pct)} pp</span>
                </div>
              </li>
            ))}
          </ul>
        </Box>
      </div>
      <Box title={t("Peluang kumulatif · 7 hari", "Cumulative chance · 7 days")} aside={t("Level resmi tetap dari PVMBG", "Official level stays with PVMBG")}>
        <div className="flex h-20 items-end gap-1.5">
          {days.map((p, d) => (
            <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              {d === 6 && <span className="font-mono text-[10px] font-semibold leading-none tabular" style={{ color: L.color }}>{pct}%</span>}
              <motion.div className="w-full rounded-t-md" style={{ background: L.color, opacity: 0.35 + (0.65 * (d + 1)) / 7 }} animate={{ height: `${Math.max(6, (p / 0.6) * 70)}%` }} transition={{ type: "spring", stiffness: 140, damping: 20 }} />
              <span className="text-[9.5px] leading-none text-muted">{t("H", "D")}+{d + 1}</span>
            </div>
          ))}
        </div>
      </Box>
      <div className="px-1">
        <input type="range" min={1} max={4} value={lv} onChange={(e) => setLv(Number(e.target.value) as Level)} className="w-full accent-maroon" aria-label={t("Tingkat aktivitas satelit", "Satellite activity level")} />
        <div className="flex justify-between text-[11px] text-muted"><span>{t("SO₂ rendah", "Low SO₂")}</span><span className="hidden sm:inline">{t("Geser: aktivitas satelit", "Drag: satellite activity")}</span><span>{t("SO₂ + panas + radar naik", "SO₂ + heat + radar up")}</span></div>
      </div>
    </div>
  );
}

function HoaxDemo() {
  const { t, tx, lang } = useT();
  const samples = [
    "Katanya lahar sudah masuk Pronojiwo, segera tinggalkan rumah! Sebarkan!!!",
    "Masker habis di semua apotek Lumajang, tolong!!!",
    "Hujan abu tipis di Candipuro pagi ini",
  ];
  const [text, setText] = useState(samples[0]);
  const r = classify(text, lang);
  const V = r.verdict === "UNVERIFIED" ? { label: { id: "BELUM TERVERIFIKASI", en: "UNVERIFIED" }, color: "#6b5856", soft: "var(--t-sand-2)" } : VERDICTS[r.verdict];
  const steps = [
    { k: "IndoBERT", d: t("label & kata pemicu", "label & triggers"), ok: true },
    { k: "Sentinel-1", d: r.sat ? t("klaim lokasi dicek", "location claim checked") : t("tidak ada klaim lokasi", "no location claim"), ok: !!r.sat },
    { k: t("Sumber resmi", "Official source"), d: "PVMBG · BPBD", ok: r.verdict !== "UNVERIFIED" },
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <Chips options={samples.map((s, i) => ({ value: s, label: `${t("Contoh", "Sample")} ${i + 1}` }))} value={text} onChange={setText} />
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-2xl ring-1 ring-line">
          <div className="flex items-center gap-2 bg-[#075e54] px-3 py-2 text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">RT</span>
            <div className="leading-tight"><p className="text-[12px] font-semibold">Grup RT 05 Sumberwuluh</p><p className="text-[10px] text-white/70">{t("128 anggota", "128 members")}</p></div>
          </div>
          <div className="flex-1 bg-[#efe7dd] p-3 dark:bg-[#1f1a17]">
            <div className="rounded-2xl rounded-tl-sm bg-[#dcf8c6] p-3 text-[13px] text-[#1d1b18] shadow-sm">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full resize-none bg-transparent outline-none" aria-label={t("Pesan", "Message")} />
              <p className="text-right text-[10px] text-[#667]">08.12 ✓✓</p>
            </div>
            <p className="mt-2 text-center text-[10.5px] text-[#6b5856] dark:text-[#b19d99]">{t("Ketik atau tempel pesan apa saja", "Type or paste any message")}</p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={r.verdict + r.conf} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col rounded-2xl bg-surface p-4 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wide" style={{ background: V.soft, color: V.color }}>{tx(V.label)}</span>
              <span className="font-display text-[20px] font-semibold tabular" style={{ color: V.color }}>{Math.round(r.conf * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-2"><motion.div className="h-full rounded-full" style={{ background: V.color }} initial={{ width: 0 }} animate={{ width: `${r.conf * 100}%` }} /></div>
            {r.triggers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {r.triggers.slice(0, 4).map((w) => <span key={w} className="rounded bg-[#fbf1d6] px-1.5 py-0.5 font-mono text-[10.5px] text-[#8a6100] dark:bg-[#3a2c0c] dark:text-[#f5c84a]">{w}</span>)}
              </div>
            )}
            {r.sat && <p className="mt-3 flex gap-1.5 text-[12px] text-sat"><Satellite className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {r.sat}</p>}
            <p className="mt-2 flex gap-1.5 text-[12px] text-ink"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" /> {r.fact}</p>
            <ul className="mt-auto space-y-1.5 border-t border-line pt-3">
              {steps.map((s) => (
                <li key={s.k} className="flex items-center gap-2 text-[11.5px]">
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.ok ? "bg-leaf" : "bg-line-strong")} />
                  <span className="font-medium text-ink">{s.k}</span><span className="text-muted">· {s.d}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PriceDemo() {
  const { t, tx } = useT();
  const [i, setI] = useState(0);
  const item = ITEMS[i];
  const [market, setMarket] = useState(item.market);
  const dev = (market - item.het) / item.het;
  const flag = dev > 0.3;
  // Illustrative 30-day series: hovers near the cap, then climbs toward today's shop price
  const series = Array.from({ length: 30 }, (_, d) => {
    const wob = Math.sin(d * 1.7 + i) * 0.03 + Math.cos(d * 0.9) * 0.02;
    const ramp = d < 18 ? 0 : Math.pow((d - 18) / 11, 1.6);
    return item.het * (1 + wob) + (market - item.het) * ramp;
  });
  series[29] = market;
  const lo = Math.min(item.het * 0.9, ...series);
  const hi = Math.max(item.het * 1.35, ...series) * 1.05;
  const W = 300, H = 92;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const path = series.map((v, d) => `${d ? "L" : "M"}${((d / 29) * W).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const outlets = flag ? 3 : dev > 0.1 ? 1 : 0;
  const tone = flag ? "#b51a14" : dev > 0.1 ? "#c2610f" : "#2e7d32";
  return (
    <div className="flex h-full flex-col gap-3">
      <Chips options={ITEMS.slice(0, 5).map((it, k) => ({ value: k, label: tx(it.name) }))} value={i} onChange={(k) => { setI(k); setMarket(ITEMS[k].market); }} />
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-[#e6f2e7] p-3 dark:bg-[#16301a]"><p className="text-[11px] text-leaf">HET</p><p className="font-display text-[17px] font-semibold tabular text-leaf">{rupiah(item.het)}</p><p className="text-[10px] text-leaf/80">{tx(item.unit)}</p></div>
        <div className={cn("rounded-xl p-3 transition-colors", flag ? "bg-[#f8dedc] dark:bg-[#3b1a1d]" : "bg-sand-2")}><p className={cn("text-[11px]", flag ? "text-crimson" : "text-muted")}>{t("Harga di toko", "Shop price")}</p><p className={cn("font-display text-[17px] font-semibold tabular", flag ? "text-crimson" : "text-ink")}>{rupiah(market)}</p><p className="text-[10px] text-muted">{t("hari ini", "today")}</p></div>
        <div className="rounded-xl bg-surface p-3 ring-1 ring-line"><p className="text-[11px] text-muted">{t("Selisih", "Deviation")}</p><p className="font-display text-[17px] font-semibold tabular" style={{ color: tone }}>{dev >= 0 ? "+" : ""}{Math.round(dev * 100)}%</p><p className="text-[10px] text-muted">{t("ambang +30%", "threshold +30%")}</p></div>
      </div>
      <Box title={t("Harga 30 hari · Pasirian", "30-day price · Pasirian")} aside={t("contoh", "example")} className="flex flex-1 flex-col">
        <svg viewBox={`0 0 ${W} ${H + 4}`} preserveAspectRatio="none" className="h-full min-h-[84px] w-full flex-1" aria-hidden>
          <line x1="0" x2={W} y1={y(item.het * 1.3)} y2={y(item.het * 1.3)} stroke="#b51a14" strokeOpacity=".35" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2={W} y1={y(item.het)} y2={y(item.het)} stroke="#2e7d32" strokeOpacity=".6" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
          <path d={`${path} L${W} ${H + 4} L0 ${H + 4}Z`} fill={tone} fillOpacity=".08" />
          <motion.path d={path} fill="none" stroke={tone} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" animate={{ d: path }} />
        </svg>
        <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-[10.5px] text-muted">
          <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-dashed border-leaf" />HET</span>
          <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-dashed border-crimson/50" />HET +30%</span>
          <span>{t("30 hari lalu → hari ini", "30 days ago → today")}</span>
        </div>
      </Box>
      <input type="range" min={Math.round(item.het * 0.9)} max={item.het * 3} step={500} value={market} onChange={(e) => setMarket(Number(e.target.value))} className="w-full accent-maroon" aria-label={t("Harga di toko", "Shop price")} />
      <div className="flex items-center gap-2">
        <motion.p key={String(flag) + String(dev > 0.1)} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("flex-1 rounded-xl px-3 py-2 text-center text-[12.5px] font-semibold", flag ? "bg-[#b51a14] text-white" : dev > 0.1 ? "bg-[#fce7da] text-[#c2610f] dark:bg-[#3a200f] dark:text-[#f0a46a]" : "bg-[#e6f2e7] text-[#2e7d32] dark:bg-[#16301a] dark:text-[#79d07d]")}>
          {flag ? t(`+${Math.round(dev * 100)}% · ditandai & bisa dilaporkan`, `+${Math.round(dev * 100)}% · flagged & reportable`) : dev > 0.1 ? t(`+${Math.round(dev * 100)}% · dipantau`, `+${Math.round(dev * 100)}% · watched`) : t("Harga wajar", "Fair price")}
        </motion.p>
        <span className="shrink-0 rounded-xl bg-surface px-3 py-2 text-center text-[11px] leading-tight text-muted ring-1 ring-line"><b className="font-display text-[14px] text-ink tabular">{outlets}/4</b><br />{t("outlet di atas ambang", "outlets over")}</span>
      </div>
    </div>
  );
}

function AidDemo() {
  const { t } = useT();
  const [extra, setExtra] = useState<Record<string, number>>({});
  const rows = VILLAGES.slice(0, 5).map((v) => ({ ...v, aid: v.aid + (extra[v.desa] ?? 0) })).map((v) => ({ v, s: priority(v, 3) })).sort((a, b) => b.s - a.s);
  const max = Math.max(...rows.map((r) => r.s));
  const sent = Object.values(extra).reduce((a, b) => a + b, 0);
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {[[t("Desa dipantau", "Villages"), "5"], [t("Warga terpapar", "Exposed"), VILLAGES.slice(0, 5).reduce((a, v) => a + v.exposed, 0).toLocaleString("id-ID")], [t("Kiriman baru", "New drops"), String(sent)]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-surface px-3 py-2.5 ring-1 ring-line"><p className="text-[10.5px] text-muted">{k}</p><p className="font-display text-[18px] font-semibold tabular text-wine">{v}</p></div>
        ))}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-1.5 rounded-2xl bg-surface p-2 ring-1 ring-line">
        {rows.map(({ v, s }, k) => (
          <motion.div layout key={v.desa} transition={{ type: "spring", stiffness: 380, damping: 30 }} className={cn("flex items-center gap-3 rounded-xl px-3 py-2", k === 0 && "bg-peach/40")}>
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold", k === 0 ? "bg-maroon text-white" : "bg-sand-2 text-muted")}>{k + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline justify-between gap-2 text-[13px] font-semibold text-wine"><span className="truncate">{v.desa}</span><span className="shrink-0 font-mono text-[11px] font-normal tabular text-muted">{Math.round((s / max) * 100)}</span></p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand-2"><motion.div className="h-full rounded-full bg-maroon" animate={{ width: `${(s / max) * 100}%` }} /></div>
              <p className="mt-0.5 truncate text-[10.5px] text-muted">{v.exposed.toLocaleString("id-ID")} {t("terpapar", "exposed")} · {v.layer} · {v.aid} {t("kiriman", "drops")}</p>
            </div>
            {k === 0 && <button onClick={() => setExtra((e) => ({ ...e, [v.desa]: (e[v.desa] ?? 0) + 2 }))} className="btn-shine shine-maroon inline-flex shrink-0 items-center gap-1 rounded-lg bg-maroon px-2.5 py-1.5 text-[11.5px] font-medium text-white"><Truck className="h-3.5 w-3.5" /> {t("Kirim", "Send")}</button>}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 text-[11.5px] text-muted">
        <span>{t("Kirim ke #1, lalu lihat peringkat bergeser.", "Send to #1 and watch the ranking move.")}</span>
        {sent > 0 && <button onClick={() => setExtra({})} className="shrink-0 font-medium text-maroon">{t("Ulangi", "Reset")}</button>}
      </div>
    </div>
  );
}

function SosDemo() {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  const who = [
    { k: t("Keluarga", "Family"), d: t("2 kontak darurat", "2 emergency contacts"), via: "WhatsApp + SMS", icon: Users },
    { k: "Posko Balai Desa Sumbermujur", d: t("268/420 terisi · 4,2 km", "268/420 filled · 4.2 km"), via: t("Aplikasi posko", "Post app"), icon: Building2 },
    { k: "BPBD Lumajang", d: t("Pusdalops · antrean evakuasi", "Ops centre · evacuation queue"), via: "Console", icon: ShieldAlert },
  ];
  return (
    <div className="grid h-full gap-3 sm:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface p-4 text-center ring-1 ring-line">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e6f2e7] text-leaf dark:bg-[#16301a]"><CheckCircle2 className="h-9 w-9" /></span>
              <p className="font-display text-[17px] font-semibold text-leaf">{t("SOS terkirim", "SOS sent")}</p>
              <p className="text-[11.5px] text-muted">08.14 · {t("3 penerima", "3 recipients")}</p>
              <button onClick={() => setSent(false)} className="text-[12px] font-medium text-maroon">{t("Ulangi", "Reset")}</button>
            </motion.div>
          ) : (
            <motion.div key="hold" exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-3">
              <span className="relative flex h-24 w-24 items-center justify-center">
                <span className="pulse-ring absolute inset-0 rounded-full bg-crimson/30" />
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-crimson text-white shadow-lg shadow-crimson/40"><Siren className="h-8 w-8" /></span>
              </span>
              <HoldButton onConfirm={() => window.setTimeout(() => setSent(true), 300)} duration={1500} className="w-52 !bg-crimson" icon={<Siren className="h-4 w-4" />} label={t("Tahan 3 detik untuk SOS", "Hold for SOS")} holdLabel={t("Terus tahan…", "Keep holding…")} doneLabel={t("Terkirim", "Sent")} />
              <p className="max-w-[15rem] text-[11px] text-muted">{t("Harus ditahan, supaya tidak terkirim tanpa sengaja.", "It must be held, so it never fires by accident.")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11.5px] text-ink ring-1 ring-line"><MapPin className="h-3.5 w-3.5 text-sat" /> −8,172 · 113,012 · Sumberwuluh</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11.5px] text-ink ring-1 ring-line"><Users className="h-3.5 w-3.5 text-maroon" /> {t("4 orang · 1 lansia", "4 people · 1 elderly")}</span>
        </div>
        <Box title={t("Yang menerima", "Who gets notified")} className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col justify-around divide-y divide-line">
            {who.map((w, i) => (
              <li key={w.k} className="flex items-center gap-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sand-2 text-maroon"><w.icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[12.5px] font-semibold text-wine">{w.k}</p>
                  <p className="truncate text-[11px] text-muted">{w.d} · {w.via}</p>
                </div>
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.span key="s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 * i }} className="shrink-0 rounded-full bg-[#e6f2e7] px-2 py-0.5 text-[10.5px] font-semibold text-[#2e7d32] dark:bg-[#16301a] dark:text-[#79d07d]">{t("Terkirim", "Sent")}</motion.span>
                  ) : (
                    <motion.span key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shrink-0 rounded-full bg-sand-2 px-2 py-0.5 text-[10.5px] text-muted">{t("Siaga", "Ready")}</motion.span>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </Box>
        <p className="flex items-center gap-1.5 text-[11px] text-muted"><WifiOff className="h-3.5 w-3.5 shrink-0" /> {t("Tanpa data: SMS cadangan disiapkan. Tetap hubungi 112.", "No data: an SMS fallback is prepared. Always call 112.")}</p>
      </div>
    </div>
  );
}

function NudgeDemo() {
  const { t } = useT();
  const [on, setOn] = useState(true);
  const days = [t("H-5", "D-5"), t("H-4", "D-4"), t("H-3", "D-3"), t("H-2", "D-2"), t("H-1", "D-1")];
  const cohorts = ["A", "B", "C", "D", "E"];
  const tint = ["#7b1e26", "#9a3a2a", "#b85a2c", "#d17a35", "#e0a100"];
  const spike = [5, 6, 8, 18, 92];
  const staggered = [26, 25, 24, 22, 21];
  const vals = on ? staggered : spike;
  const compare = [
    { k: t("Puncak belanja harian", "Peak daily demand"), a: "92%", b: "26%" },
    { k: t("Rak kosong", "Empty shelves"), a: t("H-1", "D-1"), b: t("tidak ada", "none") },
    { k: t("Harga N95", "N95 price"), a: "+129%", b: "≤ +10%" },
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <FluidTabs label={t("Skenario", "Scenario")} value={on ? "on" : "off"} onChange={(v) => setOn(v === "on")} className="w-fit max-w-full flex-wrap rounded-full bg-sand-2 p-1" itemClassName="rounded-full px-3 py-1.5 text-[12px] font-medium" options={[{ value: "off", label: t("Semua sekaligus", "Everyone at once") }, { value: "on", label: t("Bertahap per kohort", "Staggered cohorts") }]} />
      <Box title={t("Pembeli per hari · % warga", "Buyers per day · % of residents")} aside={t("simulasi", "simulation")} className="flex flex-1 flex-col">
        <div className="flex min-h-[150px] flex-1 items-end gap-3 border-b border-line">
          {vals.map((v, k) => (
            <div key={k} className="flex h-full flex-1 flex-col items-center justify-end">
              <motion.span className="mb-1 font-mono text-[11px] font-semibold tabular" style={{ color: v > 60 ? "#b51a14" : "var(--t-ink-2)" }} animate={{ opacity: 1 }}>{v}%</motion.span>
              <motion.div className="w-full rounded-t-lg" style={{ background: v > 60 ? "#b51a14" : on ? tint[k] : "#7b1e26" }} initial={{ height: 0 }} animate={{ height: `${v * 0.85}%` }} transition={{ type: "spring", stiffness: 160, damping: 20 }} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-3">
          {days.map((d, k) => (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10.5px] text-muted">{d}</span>
              <span className={cn("rounded px-1.5 py-[1px] text-[9.5px] font-semibold transition", on ? "text-white" : "bg-sand-2 text-muted")} style={on ? { background: tint[k] } : undefined}>{on ? <><span className="hidden sm:inline">{t("Kohort", "Cohort")} </span>{cohorts[k]}</> : t("semua", "all")}</span>
            </div>
          ))}
        </div>
      </Box>
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        <div className="grid grid-cols-[1.3fr_1fr_1fr] bg-sand-2/60 px-3 py-1.5 text-[10.5px] text-muted"><span /><span className={cn(!on && "font-semibold text-crimson")}>{t("Sekaligus", "At once")}</span><span className={cn(on && "font-semibold text-leaf")}>{t("Bertahap", "Staggered")}</span></div>
        {compare.map((c) => (
          <div key={c.k} className="grid grid-cols-[1.3fr_1fr_1fr] border-t border-line px-3 py-1.5 text-[12px]">
            <span className="text-muted">{c.k}</span>
            <span className={cn("font-mono tabular", on ? "text-muted/70" : "font-semibold text-crimson")}>{c.a}</span>
            <span className={cn("font-mono tabular", on ? "font-semibold text-leaf" : "text-muted/70")}>{c.b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Section ---------- */

export function FeatureLab() {
  const { t } = useT();
  const feats = [
    { key: "forecast", stat: t("± 5 hari", "≈ 5 days"), statL: t("waktu bersiap sebelum level naik", "to prepare before the level rises"), icon: Radar, name: t("Prakiraan satelit", "Satellite forecast"), demo: <ForecastDemo />, what: t("Tujuh lapisan satelit digabung menjadi satu angka: peluang gunung naik level dalam 7 hari, plus berapa lama waktu bersiap.", "Seven satellite layers merged into one number: the chance the volcano rises a level within 7 days, plus how long you have to prepare."), impact: t("Keluarga punya hitungan hari, bukan jam, untuk bersiap dengan tenang.", "Families get days, not hours, to prepare calmly."), example: t("SO₂ naik 3 hari berturut-turut di Semeru → peluang 42% → jendela ± 5 hari → pengingat Kit Siaga dikirim.", "SO₂ rises 3 days running at Semeru → 42% chance → ≈5-day window → go-kit reminder goes out.") },
    { key: "hoax", stat: t("4 menit", "4 min"), statL: t("dari pesan menyebar sampai dibantah", "from viral message to debunk"), icon: Filter, name: t("Cek hoaks", "Hoax check"), demo: <HoaxDemo />, what: t("Tempel pesan WhatsApp. IndoBERT memberi label, kata pemicunya disorot, lalu klaim lokasi dicek ke radar satelit.", "Paste a WhatsApp message. IndoBERT labels it, highlights trigger words, then checks location claims against satellite radar."), impact: t("Kepanikan karena pesan berantai bisa diredam dalam hitungan detik.", "Panic from chain messages can be calmed in seconds."), example: t("“Lahar sudah masuk Pronojiwo” → HOAKS 97% → Sentinel-1 tidak mendeteksi aliran baru.", "“Lahar reached Pronojiwo” → HOAX 97% → Sentinel-1 sees no new flow.") },
    { key: "price", stat: "+129%", statL: t("penyimpangan langsung ditandai", "deviation flagged instantly"), icon: CircleDollarSign, name: t("Pantau HET", "Price cap watch"), demo: <PriceDemo />, what: t("Harga barang darurat di toko dibandingkan dengan HET. Lebih dari 30% di atas HET di 3 outlet langsung ditandai.", "Shop prices of emergency goods are compared with the price cap. 30%+ above at 3 outlets gets flagged."), impact: t("Warga tahu harga wajar, penimbunan cepat terlihat dan bisa dilaporkan.", "Residents know the fair price; hoarding shows up fast and can be reported."), example: t("Masker N95 Rp27.500 vs HET Rp12.000 → +129% → ditandai di 3 outlet Pasirian.", "N95 at Rp27,500 vs cap Rp12,000 → +129% → flagged at 3 Pasirian outlets.") },
    { key: "aid", stat: "#1", statL: t("Supiturang, desa paling terpapar", "Supiturang, most exposed village"), icon: HandHeart, name: t("Prioritas bantuan", "Aid priority"), demo: <AidDemo />, what: t("Desa diurutkan dari populasi terpapar di zona bahaya, kerentanan, dan bantuan yang sudah diterima.", "Villages ranked by exposed population in hazard zones, vulnerability and aid already received."), impact: t("Bantuan mengikuti data, bukan desa yang paling viral.", "Aid follows data, not whichever village trends."), example: t("Supiturang: 4.120 warga terpapar, baru 1 kiriman → prioritas #1 untuk donatur.", "Supiturang: 4,120 exposed, 1 delivery so far → priority #1 for donors.") },
    { key: "nudge", stat: t("5 kohort", "5 cohorts"), statL: t("belanja tersebar, harga tetap wajar", "buying spread, prices stay fair"), icon: BellRing, name: t("Nudge bertahap", "Staggered nudges"), demo: <NudgeDemo />, what: t("Pengingat belanja dikirim bergiliran per kelompok warga, maksimal sekali sehari, dengan patokan HET.", "Shopping reminders go out to resident groups in turn, at most once a day, with the price cap."), impact: t("Permintaan tersebar sehingga stok sempat diisi dan harga tidak meledak.", "Demand spreads out so shops can restock and prices don't explode."), example: t("5 kohort × 1 hari = belanja terbagi rata selama jendela aksi.", "5 cohorts × 1 day = buying split evenly across the action window.") },
    { key: "sos", stat: t("3 detik", "3 sec"), statL: t("tahan untuk kirim lokasi & keluarga", "hold to send location & household"), icon: Siren, name: "SOS", demo: <SosDemo />, what: t("Tahan tombol 3 detik untuk mengirim lokasi dan jumlah anggota keluarga ke BPBD dan kontak darurat.", "Hold for 3 seconds to send your location and household size to BPBD and emergency contacts."), impact: t("Tim SAR tahu siapa yang butuh dijemput dan di mana, tanpa telepon yang sibuk.", "Rescue teams know who needs pickup and where, without busy phone lines."), example: t("Sumberwuluh, 4 orang termasuk 1 lansia → masuk antrean evakuasi BPBD.", "Sumberwuluh, 4 people including 1 elderly → enters the BPBD evacuation queue.") },
  ];
  const [k, setK] = useState("forecast");
  const f = feats.find((x) => x.key === k)!;
  return (
    <section id="fitur-lab" className="tex-topo bg-sand py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="label flex items-center gap-3 text-maroon/70"><span className="text-crimson">✦</span><span className="h-px w-8 bg-maroon/25" />{t("Coba fiturnya", "Try the features")}</p>
          <h2 className="mt-5 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">{t("Jangan cuma dibaca. Mainkan.", "Don't just read about it. Play with it.")}</h2>
        </Reveal>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {feats.map((x) => (
            <button key={x.key} onClick={() => setK(x.key)} className={cn("relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-medium transition", k === x.key ? "text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink")}>
              {k === x.key && <motion.span layoutId="lab-pill" className="absolute inset-0 rounded-full bg-maroon" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <x.icon className="relative h-4 w-4" /> <span className="relative">{x.name}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
            <div className="glass-card flex flex-col p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-maroon text-white"><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-[24px] font-semibold tracking-tight text-wine">{f.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.what}</p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-line">
                <div className="flex items-center gap-4 bg-gradient-to-r from-[#e6f2e7] to-transparent p-4 dark:from-[#16301a]">
                  <span className="font-display text-[30px] font-semibold leading-none tracking-tight text-leaf">{f.stat}</span>
                  <div className="min-w-0 border-l border-leaf/25 pl-4">
                    <p className="label !text-[9.5px] text-leaf">{t("Dampak", "Impact")}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink">{f.impact}</p>
                    <p className="text-[11.5px] text-muted">{f.statL}</p>
                  </div>
                </div>
                <div className="border-t border-line bg-surface p-4">
                  <p className="label !text-[9.5px] text-maroon">{t("Contoh di lapangan", "Real-world example")}</p>
                  <ol className="mt-3 flex flex-wrap items-center gap-y-2">
                    {f.example.split("→").map((step, i, arr) => (
                      <li key={i} className="flex items-center">
                        <span className="flex items-center gap-2 rounded-lg bg-peach/50 px-2.5 py-1.5 text-[12.5px] text-ink">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-maroon font-mono text-[9px] font-bold text-white">{i + 1}</span>
                          {step.trim()}
                        </span>
                        {i < arr.length - 1 && <span className="mx-1.5 text-[13px] text-maroon/50" aria-hidden>→</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            <div className="relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl bg-cream p-4 ring-1 ring-line sm:p-5">
              <div className="grid-bg-light pointer-events-none absolute inset-0 opacity-50" />
              <div className="relative mb-3 flex items-center justify-between gap-3">
                <p className="label flex items-center gap-2 !text-[9.5px] text-muted"><span className="relative flex h-1.5 w-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-leaf/60" /><span className="relative h-1.5 w-1.5 rounded-full bg-leaf" /></span>{t("Coba langsung", "Try it")}</p>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted ring-1 ring-line">{t("Data contoh", "Sample data")}</span>
              </div>
              <div className="relative flex-1">{f.demo}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- Data sources & potential partners ---------- */

type Brand = { name: string; icon?: string; Lucide?: typeof Radar; sub: string };

function BrandMark({ b }: { b: Brand }) {
  return (
    <span className="group flex shrink-0 items-center gap-3 px-2">
      {b.icon ? (
        <span aria-hidden className="h-8 w-8 bg-wine/45 transition group-hover:bg-wine" style={{ maskImage: `url(/brands/${b.icon}.svg)`, WebkitMaskImage: `url(/brands/${b.icon}.svg)`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }} />
      ) : b.Lucide ? (
        <b.Lucide className="h-8 w-8 text-wine/45 transition group-hover:text-wine" strokeWidth={1.6} />
      ) : null}
      <span className="leading-tight">
        <span className="block whitespace-nowrap font-display text-[16px] font-semibold tracking-tight text-wine/60 transition group-hover:text-wine">{b.name}</span>
        <span className="block whitespace-nowrap text-[11px] text-muted">{b.sub}</span>
      </span>
    </span>
  );
}

export function PartnerStrip() {
  const { t } = useT();
  const data: Brand[] = [
    { name: "Google Earth Engine", icon: "googleearthengine", sub: t("Katalog & komputasi satelit", "Satellite catalog & compute") },
    { name: "Copernicus Sentinel", Lucide: Satellite, sub: "ESA · S1 / S2 / S5P" },
    { name: "NASA", icon: "nasa", sub: "FIRMS · MODIS · GPM" },
    { name: "NOAA GFS", Lucide: BellRing, sub: t("Angin & arah abu", "Wind & ash drift") },
    { name: "WorldPop", Lucide: HandHeart, sub: t("Populasi 100 m", "100 m population") },
    { name: "MAGMA Indonesia", Lucide: Radar, sub: t("Status level PVMBG", "PVMBG levels") },
    { name: "OpenStreetMap", icon: "openstreetmap", sub: t("Jalan & fasilitas", "Roads & facilities") },
  ];
  const stack: Brand[] = [
    { name: "Flutter", icon: "flutter", sub: "Android" },
    { name: "Firebase", icon: "firebase", sub: t("Data & login", "Data & auth") },
    { name: "MapLibre", icon: "maplibre", sub: t("Peta 3D", "3D maps") },
    { name: "Hugging Face", icon: "huggingface", sub: "IndoBERT" },
    { name: "Google Cloud", icon: "googlecloud", sub: "Earth Engine API" },
    { name: "Vercel", icon: "vercel", sub: "Web" },
  ];
  const targets = [
    { n: "BNPB", logo: "bnpb", i: ShieldAlert, c: "#e0732a", d: t("Badan Nasional Penanggulangan Bencana", "National disaster agency"), r: t("Data & kanal nasional", "National data & channels") },
    { n: "BPBD", logo: "bnpb", i: Building2, c: "#7b1e26", d: t("Badan Penanggulangan Bencana Daerah", "District disaster agencies"), r: t("Pengguna utama console", "Primary console users") },
    { n: "PVMBG", logo: "pvmbg", i: Mountain, c: "#b51a14", d: t("Pusat Vulkanologi & Mitigasi Bencana Geologi", "Volcanology centre"), r: t("Status level resmi", "Official levels") },
    { n: "Kemendag", logo: "kemendag", i: Scale, c: "#2f5d8a", d: t("Pengawasan harga & HET", "Price oversight"), r: t("Penindakan penimbunan", "Hoarding enforcement") },
    { n: "BMKG", logo: "bmkg" as string | undefined, i: HeartPulse, c: "#1f6fb2", d: t("Badan Meteorologi, Klimatologi, dan Geofisika", "Meteorology, climatology & geophysics agency"), r: t("Angin & kualitas udara", "Wind & air quality") },
    { n: "Komdigi", logo: "komdigi", i: RadioTower, c: "#2e7d32", d: t("Literasi digital & anti-hoaks", "Digital literacy & anti-hoax"), r: t("Klarifikasi hoaks", "Hoax clarification") },
  ];
  return (
    <section className="tex-dots border-b border-line bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-[12.5px] text-muted">{t("Dibangun di atas data terbuka dari", "Built on open data from")}</p>
        <div className="relative mt-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee flex w-max items-center gap-12">
            {[...data, ...data].map((b, i) => <BrandMark key={i} b={b} />)}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <span className="text-[12px] text-muted">{t("Teknologi", "Built with")}</span>
          {stack.map((b) => <BrandMark key={b.name} b={b} />)}
        </div>
        <div className="mt-10 rounded-3xl border border-dashed border-line-strong p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="label text-maroon/70">{t("Calon mitra yang kami tuju", "Potential partners we're approaching")}</p>
            <p className="text-[11.5px] text-muted">{t("Belum ada kerja sama resmi. Ingin bermitra?", "No formal partnerships yet. Interested?")} <a href="/kemitraan" className="font-medium text-maroon underline underline-offset-4">{t("Hubungi kami", "Get in touch")}</a></p>
          </div>
          <p className="mt-1 text-[10.5px] text-muted/80">{t("Logo adalah milik masing-masing instansi dan ditampilkan sebagai calon mitra, bukan bukti kerja sama.", "Logos belong to their respective agencies and are shown as potential partners, not as proof of partnership.")}</p>
          <Stagger className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {targets.map((x) => (
              <motion.div variants={staggerItem} key={x.n} className="group flex flex-col rounded-2xl bg-surface p-4 ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-maroon/30">
                {x.logo ? (
                  <span className="flex h-14 items-center rounded-xl bg-white px-3 ring-1 ring-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/partners/${x.logo}.png`} alt={`Logo ${x.n}`} className="max-h-10 w-auto max-w-full object-contain" loading="lazy" />
                  </span>
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${x.c}, ${x.c}cc)` }}>
                    <x.i className="h-6 w-6" strokeWidth={2} />
                  </span>
                )}
                <p className="mt-3 font-display text-[19px] font-bold tracking-tight text-wine">{x.n}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{x.d}</p>
                <p className="mt-auto pt-3 text-[11px] font-medium" style={{ color: x.c }}>{x.r}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
