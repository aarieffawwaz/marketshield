"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, BellRing, ChevronRight, Database, Download, Filter, Globe2, Monitor, Radar, Scale, ShieldCheck, Smartphone, Sparkles, Store, Timer } from "lucide-react";
import { Reveal } from "./reveal";
import { Phone } from "@/components/ui/phone";
import { APK, LEVELS, VILLAGES, priority, type Level } from "@/lib/data";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

function Kicker({ n, children, dark }: { n: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={cn("label flex items-center gap-3", dark ? "text-bone/50" : "text-maroon/70")}>
      <span className={dark ? "text-ember" : "text-crimson"}>{n}</span>
      <span className={cn("h-px w-8", dark ? "bg-white/20" : "bg-maroon/25")} />
      {children}
    </p>
  );
}

export function Problem() {
  const { t } = useT();
  const items = [
    { icon: Timer, h: t("Peringatan terasa terlambat", "Warnings feel late"), p: t("Status resmi naik ketika warga sudah tidak punya waktu menyiapkan apa pun dengan tenang dan murah.", "Official levels rise when families no longer have time to prepare calmly and cheaply.") },
    { icon: BellRing, h: t("Hoaks lebih cepat dari fakta", "Hoaxes outrun facts"), p: t("Pesan berantai soal lahar dan zona aman menyebar di grup WhatsApp sebelum klarifikasi resmi keluar.", "Chain messages about lahar and safe zones spread through WhatsApp before official clarifications land.") },
    { icon: Store, h: t("Harga darurat melonjak", "Emergency prices spike"), p: t("Masker, air bersih dan oksigen naik jauh di atas HET justru saat paling dibutuhkan.", "Masks, clean water and oxygen climb far above the price cap exactly when they're needed most.") },
    { icon: Scale, h: t("Bantuan salah alamat", "Aid lands in the wrong place"), p: t("Bantuan menumpuk di posko yang ramai di media sosial, sementara desa terpapar lain kekurangan.", "Aid piles up at posts that trend online while other exposed villages go short.") },
  ];
  return (
    <section className="tex-dots tex-glow relative bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Kicker n="01">{t("Masalah", "The problem")}</Kicker>
          <h2 className="mt-6 max-w-4xl font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">
            {t("Saat gunung batuk, yang runtuh lebih dulu sering kali pasar dan kepercayaan.", "When a volcano stirs, markets and trust often break first.")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.h} delay={i * 0.08}>
              <div className="card h-full p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peach text-maroon">
                  <it.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-[18px] font-semibold tracking-tight text-wine">{it.h}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{it.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pillars() {
  const { t } = useT();
  const pillars = [
    {
      tag: "SENSE",
      icon: Radar,
      img: "/img/semeru_cctv.webp",
      h: t("Deteksi dini dari satelit", "Early detection from orbit"),
      p: t("Radar Sentinel-1, titik panas FIRMS, suhu MODIS, gas SO₂ Sentinel-5P, hujan GPM dan angin GFS diolah di Earth Engine menjadi satu peluang eskalasi 7 hari beserta jendela aksinya.", "Sentinel-1 radar, FIRMS hotspots, MODIS heat, Sentinel-5P SO₂, GPM rain and GFS wind are processed in Earth Engine into one 7-day escalation probability and its action window."),
      model: "XGBoost + SHAP",
    },
    {
      tag: "FILTER",
      icon: Filter,
      img: "/img/factcheck_sat.webp",
      h: t("Saring hoaks dengan bukti", "Filter hoaxes with evidence"),
      p: t("IndoBERT memisahkan laporan lapangan dari hoaks dan pesan panik. Klaim soal lokasi lahar atau abu dicocokkan dengan lapisan radar dan angin.", "IndoBERT separates field reports from hoaxes and panic posts. Claims about lahar or ash locations are checked against the radar and wind layers."),
      model: "IndoBERT",
    },
    {
      tag: "ACT",
      icon: ShieldCheck,
      img: "/img/map_route.webp",
      h: t("Bertindak tenang sesuai level", "Act calmly for each level"),
      p: t("Aplikasi berubah bentuk mengikuti level PVMBG: belanja kit di harga wajar saat Waspada, siapkan usaha saat Siaga, ikuti rute bebas lahar saat Awas.", "The app changes shape with the PVMBG level: buy your kit at fair prices on Advisory, prepare your business on Watch, follow a lahar-free route on Warning."),
      model: t("Rute A* bebas lahar", "Lahar-free A* routing"),
    },
    {
      tag: "FAIR",
      icon: Scale,
      img: "/img/posko_scene.webp",
      h: t("Harga dan bantuan yang adil", "Fair prices, fair aid"),
      p: t("Harga pasar dibandingkan dengan HET untuk menandai penimbunan. Indeks Prioritas Bantuan per desa memakai populasi WorldPop di dalam zona bahaya.", "Market prices are compared against the price cap to flag gouging. A per-village Aid Priority Index uses WorldPop population inside hazard zones."),
      model: t("Indeks Prioritas Bantuan", "Aid Priority Index"),
    },
  ];
  return (
    <section id="cara-kerja" className="bg-cream pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Kicker n="02">{t("Cara kerja", "How it works")}</Kicker>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">
            {t("Empat lapis, satu jendela aksi.", "Four layers, one action window.")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.tag} delay={(i % 2) * 0.08}>
              <article className="card group h-full overflow-hidden">
                <div className="relative h-52 overflow-hidden bg-sand-2">
                  <Image src={p.img} alt="" fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum/70 via-plum/10 to-transparent" />
                  <span className="label absolute left-5 top-5 rounded-full bg-night/70 px-3 py-1 !text-[10px] text-bone backdrop-blur">{p.tag}</span>
                  <span className="label absolute bottom-5 right-5 rounded-full bg-white/90 px-3 py-1 !text-[10px] text-sat">{p.model}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <p.icon className="h-5 w-5 text-maroon" />
                    <h3 className="font-display text-[20px] font-semibold tracking-tight text-wine">{p.h}</h3>
                  </div>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{p.p}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const LEVEL_SHOT: Record<Level, string> = {
  1: "/screens/14_kit.webp",
  2: "/screens/04_home2a.webp",
  3: "/screens/05_home3a.webp",
  4: "/screens/06_home4a.webp",
};

export function Levels() {
  const { t, tx } = useT();
  const [lv, setLv] = useState<Level>(3);
  const L = LEVELS[lv];
  const promoted: Record<Level, string[]> = {
    1: [t("Edukasi & rencana keluarga", "Education & family plan"), t("Checklist Kit Siaga", "Go-kit checklist")],
    2: [t("Nudge belanja bertahap per kohort", "Staggered shopping nudges"), t("Pantau harga HET", "Price cap watch"), t("Persiapan sektor", "Sector prep")],
    3: [t("Peta bahaya & rute evakuasi", "Hazard map & routes"), t("Filter hoaks diperketat", "Stricter hoax filter"), t("Shelter & protokol sektor", "Shelters & sector protocols")],
    4: [t("Panduan evakuasi langkah demi langkah", "Step-by-step evacuation"), t("SOS tahan 3 detik", "Hold-3-seconds SOS"), t("Mode offline", "Offline mode")],
  };
  return (
    <section id="level" className="noise relative overflow-hidden bg-night py-24 text-bone sm:py-32">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Reveal>
            <Kicker n="03" dark>{t("Adaptif per level", "Adaptive by level")}</Kicker>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              {t("Satu aplikasi yang berubah bentuk mengikuti status gunung.", "One app that changes shape with the volcano.")}
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-bone/65">
              {t("Beranda, tombol utama dan fitur yang ditonjolkan menyesuaikan level resmi PVMBG. Warga tidak perlu mencari, aplikasi menunjukkan langkah berikutnya.", "Home, the main button and promoted features follow the official PVMBG level. People don't need to search; the app shows the next step.")}
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-4 gap-2" role="tablist">
            {([1, 2, 3, 4] as Level[]).map((l) => (
              <button
                key={l}
                role="tab"
                aria-selected={lv === l}
                onClick={() => setLv(l)}
                className={cn("relative rounded-xl px-3 py-3 text-left ring-1 transition", lv === l ? "ring-white/30" : "ring-white/10 hover:bg-white/5")}
              >
                {lv === l && <motion.span layoutId="level-card" className="absolute inset-0 -z-0 rounded-xl bg-white/10" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative block h-1 rounded-full transition-all duration-300" style={{ background: LEVELS[l].color, width: lv === l ? "100%" : 32 }} />
                <span className="relative mt-2.5 block font-display text-[15px] font-semibold">Level {LEVELS[l].roman}</span>
                <span className="relative block text-[12px] text-bone/55">{tx(LEVELS[l].name)}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={lv} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="mt-6 rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10">
              <p className="label" style={{ color: L.color }}>{t("Pesan utama", "Headline")}</p>
              <p className="mt-2 font-display text-[22px] font-semibold tracking-tight">{tx(L.hero)}</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <p className="label text-bone/45">{t("Tombol utama", "Primary action")}</p>
                  <p className="mt-1.5 text-[14px]">{tx(L.cta)}</p>
                </div>
                <div>
                  <p className="label text-bone/45">{t("Peluang eskalasi", "Escalation odds")}</p>
                  <p className="mt-1.5 text-[14px] tabular">{Math.round(L.prob * 100)}% · {tx(L.eaw)}</p>
                </div>
                <div>
                  <p className="label text-bone/45">{t("Ditonjolkan", "Promoted")}</p>
                  <ul className="mt-1.5 space-y-1 text-[13px] text-bone/80">
                    {promoted[lv].map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center">
          <Phone className="w-[290px] sm:w-[320px]">
            <AnimatePresence mode="wait">
              <motion.div key={lv} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                <Image src={LEVEL_SHOT[lv]} alt={`MarketShield Level ${L.roman}`} fill sizes="320px" className="object-contain object-top" />
              </motion.div>
            </AnimatePresence>
          </Phone>
        </div>
      </div>
    </section>
  );
}

/* ---------- Satellite & AI pipeline ---------- */

const DATASETS = ["Sentinel-1", "Sentinel-2", "Sentinel-5P", "FIRMS", "MODIS", "GPM IMERG", "GFS", "WorldPop"];

// Deterministic pseudo-random intensities for the feature-matrix thumbnail
const cell = (r: number, c: number) => {
  const x = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
  const n = x - Math.floor(x);
  const burst = Math.exp(-((c - 14 - (r % 5) * 4) ** 2) / 10) * (r % 3 === 0 ? 1 : 0.4);
  return Math.min(1, n * 0.45 + burst);
};

/** ROC curve whose area equals `auc`: y = 1 − (1 − x)^k with k = auc / (1 − auc) */
const roc = (auc: number, w: number, h: number) => {
  const k = auc / (1 - auc);
  return Array.from({ length: 41 }, (_, i) => {
    const x = i / 40;
    return `${i ? "L" : "M"}${(x * w).toFixed(1)} ${(h - (1 - Math.pow(1 - x, k)) * h).toFixed(1)}`;
  }).join(" ");
};

function PipeVisual({ i }: { i: number }) {
  const { t } = useT();
  if (i === 0)
    return (
      <div className="flex flex-wrap content-start gap-1">
        {DATASETS.map((d, k) => (
          <motion.span key={d} initial={{ opacity: 0, y: 4 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.04 * k }} className="rounded-md bg-surface px-1.5 py-[3px] font-mono text-[10px] text-ink ring-1 ring-line">{d}</motion.span>
        ))}
      </div>
    );
  if (i === 1)
    return (
      <div className="flex h-full flex-col">
        <div className="grid flex-1 gap-[2px]" style={{ gridTemplateColumns: "repeat(36, minmax(0, 1fr))" }} aria-hidden>
          {Array.from({ length: 10 * 36 }, (_, k) => {
            const v = cell(Math.floor(k / 36), k % 36);
            return <span key={k} className="rounded-[1px]" style={{ background: `color-mix(in srgb, #ea6a1f ${Math.round(v * 85 + 6)}%, var(--t-surface))` }} />;
          })}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9.5px] text-muted"><span>{t("gunung ↓", "volcano ↓")}</span><span>{t("minggu →", "week →")}</span></div>
      </div>
    );
  if (i === 2)
    return (
      <div className="flex h-full items-center gap-3">
        <svg viewBox="0 0 80 64" className="h-full max-h-[76px] w-auto shrink-0" aria-hidden>
          <rect x="0.5" y="0.5" width="79" height="63" rx="4" fill="var(--t-surface)" stroke="var(--t-line)" />
          <path d="M4 60 L76 4" stroke="var(--t-line-strong)" strokeDasharray="2 2" />
          <g transform="translate(4 4)">
            <path d={roc(0.78, 72, 56)} fill="none" stroke="#b19d99" strokeWidth="1.5" />
            <motion.path d={roc(0.9, 72, 56)} fill="none" stroke="#7b1e26" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
          </g>
        </svg>
        <div className="min-w-0 flex-1 space-y-1.5 text-[10.5px]">
          {[["XGBoost", 0.9, "bg-maroon"], ["Baseline", 0.78, "bg-[#b19d99]"]].map(([k, v, c]) => (
            <div key={k as string}>
              <div className="flex justify-between"><span className="text-muted">{k}</span><span className="font-mono font-semibold tabular text-ink">{(v as number).toFixed(2).replace(".", ",")}</span></div>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-surface"><motion.div className={cn("h-full rounded-full", c as string)} initial={{ width: 0 }} whileInView={{ width: `${(v as number) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9 }} /></div>
            </div>
          ))}
        </div>
      </div>
    );
  if (i === 3)
    return (
      <div className="flex h-full flex-col justify-center gap-2 text-[10.5px]">
        {[[t("Set uji", "Test set"), 98.4], [t("Pesan pendek ala WhatsApp", "Short WhatsApp-style probes"), 90]].map(([k, v]) => (
          <div key={k as string}>
            <div className="flex justify-between gap-2"><span className="truncate text-muted">{k}</span><span className="font-mono font-semibold tabular text-ink">{String(v).replace(".", ",")}%</span></div>
            <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-surface"><motion.div className="h-full rounded-full bg-gradient-to-r from-ember to-maroon" initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 0.9 }} /></div>
          </div>
        ))}
        <div className="flex flex-wrap gap-1">
          {[t("sinyal", "signal"), t("hoaks", "hoax"), t("panik", "panic")].map((c) => <span key={c} className="rounded bg-surface px-1.5 py-[1px] text-[9.5px] text-muted ring-1 ring-line">{c}</span>)}
        </div>
      </div>
    );
  return (
    <div className="flex h-full items-end justify-center gap-2.5" aria-hidden>
      <div className="flex h-full w-[34%] max-w-[48px] flex-col rounded-[9px] border-2 border-[#2a1a1c] bg-surface p-[3px] dark:border-[#d6c8c3]/60">
        <span className="mx-auto mb-1 h-1 w-1 rounded-full bg-[#2a1a1c] dark:bg-[#d6c8c3]/60" />
        <span className="h-2 rounded-sm bg-[#e0a100]" />
        <span className="mt-1 h-1 w-3/4 rounded-sm bg-line-strong" />
        <span className="mt-0.5 h-1 w-1/2 rounded-sm bg-line" />
        <span className="mt-auto h-2 rounded-sm bg-maroon" />
      </div>
      <div className="flex h-[78%] flex-1 flex-col overflow-hidden rounded-md border border-line-strong bg-surface">
        <span className="flex gap-0.5 border-b border-line px-1 py-[3px]"><span className="h-1 w-1 rounded-full bg-crimson" /><span className="h-1 w-1 rounded-full bg-amber" /><span className="h-1 w-1 rounded-full bg-leaf" /></span>
        <span className="flex flex-1 gap-1 p-1">
          <span className="w-1/4 rounded-sm bg-sand-2" />
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="flex-1 rounded-sm bg-[radial-gradient(circle_at_40%_45%,#ea6a1f_0,#ea6a1f55_18%,transparent_40%),var(--t-sand-2)]" />
            <span className="h-1.5 rounded-sm bg-line" />
          </span>
        </span>
      </div>
    </div>
  );
}

export function Pipeline() {
  const { t } = useT();
  const steps = [
    { icon: Globe2, tag: t("Data", "Data"), h: "Google Earth Engine", p: t("Delapan dataset satelit publik, satu katalog untuk semua gunung.", "Eight public satellite datasets, one catalog for every volcano."), k: "8", kl: t("dataset terbuka", "open datasets") },
    { icon: Database, tag: t("Fitur", "Features"), h: t("Pipeline fitur", "Feature pipeline"), p: t("earthengine-api mengagregasi sinyal per gunung dan per desa.", "earthengine-api aggregates signals per volcano and village."), k: "25 × 407", kl: t("gunung × minggu · target refresh 6 jam", "volcanoes × weeks · 6 h refresh target") },
    { icon: Sparkles, tag: t("Model", "Model"), h: t("Mesin risiko", "Risk engine"), p: t("XGBoost memprediksi kenaikan level 7 hari, SHAP menjelaskan faktornya.", "XGBoost predicts 7-day level rises; SHAP explains why."), k: "0,90", kl: t("ROC-AUC uji 2024–2026 · baseline 0,78", "ROC-AUC on 2024–2026 · baseline 0.78") },
    { icon: Filter, tag: "NLP", h: "IndoBERT", p: t("Pesan dilabeli sinyal, hoaks atau panik, lalu dicek silang ke satelit.", "Messages labelled signal, hoax or panic, then cross-checked by satellite."), k: "98,4%", kl: t("akurasi uji · 90% pada pesan pendek", "test accuracy · 90% on short probes") },
    { icon: Smartphone, tag: t("Produk", "Product"), h: t("Aplikasi & console", "App & console"), p: t("Flutter untuk warga, web console untuk BPBD, posko dan donatur.", "Flutter for residents, a web console for BPBD, aid posts and donors."), k: APK.size, kl: t("APK Android · plus web console", "Android APK · plus web console") },
  ];
  const top = VILLAGES.map((v) => ({ v, s: priority(v, 3) })).sort((a, b) => b.s - a.s).slice(0, 4);
  const max = top[0].s;
  return (
    <section id="satelit" className="tex-topo-b bg-sand py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Kicker n="06">{t("Satelit & AI", "Satellites & AI")}</Kicker>
          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2 className="font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">
              {t("Tanpa sensor di lapangan. Semua dari data terbuka.", "No field hardware. All open data.")}
            </h2>
            <p className="max-w-lg text-[16px] leading-relaxed text-muted">
              {t("Satu katalog Earth Engine mencakup seluruh 127 gunung api aktif Indonesia sejak hari pertama, tanpa alat yang perlu dipasang atau dirawat.", "One Earth Engine catalog covers all 127 active Indonesian volcanoes from day one, with no hardware to install or maintain.")}
            </p>
          </div>
        </Reveal>
        <div className="relative mt-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <Reveal key={s.h} delay={i * 0.07} className={cn("h-full", i === 4 && "sm:col-span-2 lg:col-span-1")}>
                <div className="card group relative flex h-full flex-col p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(53,9,21,0.35)] sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-maroon py-1 pl-1 pr-2.5 text-white ring-4 ring-surface">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 font-mono text-[10px] font-semibold">0{i + 1}</span>
                      <span className="text-[10.5px] font-medium tracking-wide">{s.tag}</span>
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-peach/60 text-maroon transition group-hover:bg-maroon group-hover:text-white"><s.icon className="h-4 w-4" /></span>
                  </div>
                  <h3 className="mt-4 font-display text-[16.5px] font-semibold leading-tight text-wine">{s.h}</h3>
                  <p className="mt-1.5 text-[12.5px] mb-4 leading-relaxed text-muted lg:min-h-[3.75rem]">{s.p}</p>
                  <div className="mt-auto h-[92px] rounded-xl bg-sand-2/70 p-2.5 ring-1 ring-inset ring-line">
                    <PipeVisual i={i} />
                  </div>
                  <div className="mt-4 border-t border-dashed border-line pt-3 lg:min-h-[4.6rem]">
                    <p className="font-display text-[24px] font-semibold leading-none tracking-tight text-wine tabular">{s.k}</p>
                    <p className="mt-1 text-[11px] leading-snug text-muted">{s.kl}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <span className="absolute -right-[13px] top-[1.65rem] z-20 hidden h-[22px] w-[22px] items-center justify-center rounded-full bg-surface text-maroon shadow-sm ring-1 ring-line lg:flex" aria-hidden><ChevronRight className="h-3.5 w-3.5" /></span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.1}>
          <div className="noise relative mt-6 overflow-hidden rounded-3xl bg-plum p-6 text-bone sm:p-8">
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-ember/20 blur-3xl" aria-hidden />
            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
              <div>
                <p className="label text-ember">{t("Indeks Prioritas Bantuan", "Aid Priority Index")}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-serif text-[18px] italic sm:text-[22px]" role="math" aria-label="Priority equals the sum over zones of exposed population times hazard weight, times vulnerability, divided by aid received plus one">
                  <span className="not-italic font-display font-semibold text-bone">P<sub className="text-[0.55em] font-normal text-bone/60">desa</sub></span>
                  <span className="not-italic text-bone/50">=</span>
                  <span className="inline-flex flex-col items-center">
                    <span className="flex items-center gap-1.5 px-1 pb-1">
                      <span className="not-italic text-[1.3em] leading-none text-ember">Σ</span>
                      <span>(pop<sub className="text-[0.55em] not-italic text-bone/60">z</sub> · w<sub className="text-[0.55em] not-italic text-bone/60">z</sub>)</span>
                      <span className="not-italic text-bone/50">×</span>
                      <span>V</span>
                    </span>
                    <span className="h-px w-full bg-bone/40" />
                    <span className="pt-1">A + 1</span>
                  </span>
                </div>
                <dl className="mt-6 grid gap-x-6 gap-y-2.5 text-[12.5px] sm:grid-cols-2">
                  {[
                    [<>pop<sub>z</sub></>, t("Populasi WorldPop di zona KRB, abu atau lahar", "WorldPop population in KRB, ash or lahar zones")],
                    [<>w<sub>z</sub></>, t("Bobot bahaya zona sesuai level saat ini", "Zone hazard weight for the current level")],
                    ["V", t("Kerentanan: tutupan lahan & jarak ke posko", "Vulnerability: land cover & distance to aid post")],
                    ["A", t("Kiriman bantuan yang sudah diterima", "Aid deliveries already received")],
                  ].map(([k, v], j) => (
                    <div key={j} className="flex gap-3">
                      <dt className="w-10 shrink-0 font-serif italic text-ember">{k}</dt>
                      <dd className="text-bone/65">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-bone/80">{t("Peringkat desa · Semeru", "Village ranking · Semeru")}</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-bone/60">{t("data contoh", "sample data")}</span>
                </div>
                <ol className="mt-3 space-y-2.5">
                  {top.map(({ v, s }, k) => (
                    <li key={v.desa} className="flex items-center gap-3">
                      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10.5px] font-semibold", k === 0 ? "bg-ember text-night" : "bg-white/10 text-bone/70")}>{k + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2 text-[12.5px]"><span className="truncate font-medium text-bone">{v.desa}</span><span className="font-mono text-[11px] tabular text-bone/55">{Math.round((s / max) * 100)}</span></div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-r from-ember to-[#f5c84a]" initial={{ width: 0 }} whileInView={{ width: `${(s / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: k * 0.08 }} /></div>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link href="/app?tab=aid" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full btn-shine shine-bone bg-bone px-5 py-2.5 text-[13.5px] font-medium text-night">
                  {t("Lihat peringkat desa", "See village ranking")} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Surfaces() {
  const { t } = useT();
  const cards = [
    { href: "/app", icon: Monitor, h: t("Web console", "Web console"), who: t("BPBD, posko, donatur, distributor", "BPBD, aid posts, donors, distributors"), p: t("Peta bahaya berlapis, indikator satelit, peringkat desa prioritas, pantau harga dan antrean cek hoaks.", "Layered hazard map, satellite indicators, priority village ranking, price watch and a hoax check queue."), img: "/img/map_hazard.webp" },
    { href: "/mobile", icon: Smartphone, h: t("Aplikasi warga", "Resident app"), who: t("Warga KRB, petani, pariwisata, logistik", "Residents, farmers, tourism, logistics"), p: t("Beranda adaptif, peta & evakuasi, SOS, cek pesan, Kit Siaga, posko terdekat dan peringatan sektor.", "Adaptive home, map & evacuation, SOS, message check, go-kit, nearest posts and sector alerts."), img: "/img/semeru_calm.webp" },
    { href: "/download", icon: Download, h: t("Unduh APK", "Download APK"), who: `${APK.minAndroid} · ${APK.size}`, p: t("Pasang langsung di ponsel Android. Ukuran kecil, cocok untuk sinyal lemah di daerah lereng.", "Install straight onto Android. Small enough for weak signal on the slopes."), img: "/img/mahameru.webp" },
  ];
  return (
    <section id="produk" className="tex-dots tex-glow bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Kicker n="07">{t("Produk", "Product")}</Kicker>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">
            {t("Satu data, tiga pintu masuk.", "One dataset, three ways in.")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.href} delay={i * 0.08}>
              <Link href={c.href} className="card group block h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-44 overflow-hidden">
                  <Image src={c.img} alt="" fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
                  <c.icon className="absolute bottom-4 left-5 h-6 w-6 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-[20px] font-semibold text-wine">{c.h}</h3>
                    <ArrowUpRight className="h-5 w-5 text-maroon transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="label mt-1 text-maroon/60">{c.who}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">{c.p}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export { SiteFooter as Footer } from "@/components/site/footer";
