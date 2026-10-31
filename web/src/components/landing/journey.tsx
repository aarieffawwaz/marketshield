"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Check, Satellite, Siren, Truck } from "lucide-react";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EvacMap } from "./evac-map";

/* Mini interface mockups shown inside each journey card */

function MiniIndicators() {
  const rows = [
    ["SO₂ · Sentinel-5P", "2,8 DU", "+3×", "#b51a14"],
    ["Titik panas · FIRMS", "7 titik", "+5", "#ea6a1f"],
    ["Radar · Sentinel-1", "−3,1 dB", "12 km²", "#2f5d8a"],
  ];
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-wine"><Satellite className="h-3.5 w-3.5 text-sat" /> Semeru · 6 jam terakhir</p>
      {rows.map(([k, v, d, c]) => (
        <div key={k} className="flex items-center justify-between border-t border-line py-1.5 text-[11.5px]">
          <span className="text-muted">{k}</span>
          <span className="flex items-center gap-2 font-mono tabular text-ink">{v}<span className="rounded px-1 text-[10px] font-semibold text-white" style={{ background: c }}>{d}</span></span>
        </div>
      ))}
    </div>
  );
}

function MiniGauge() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--t-line)" strokeWidth="7" /><motion.circle cx="32" cy="32" r="26" fill="none" stroke="#e0a100" strokeWidth="7" strokeLinecap="round" strokeDasharray={163} initial={{ strokeDashoffset: 163 }} whileInView={{ strokeDashoffset: 163 * 0.58 }} viewport={{ once: true }} transition={{ duration: 1.2 }} /></svg>
      <div>
        <p className="font-display text-[22px] font-semibold text-[#c48a00]">42%</p>
        <p className="text-[11px] text-muted">peluang naik level · 7 hari</p>
        <p className="mt-1 inline-block rounded-full bg-[#fbf1d6] px-2 py-0.5 text-[10.5px] font-semibold text-[#8a6100]">± 5 hari jendela aksi</p>
      </div>
    </div>
  );
}

function MiniNotifications() {
  const [open, setOpen] = useState(false);
  const items = [
    ["Kohort A", "Senin 08.00", "Lengkapi Kit Siaga: N95 Rp12.000 (HET)"],
    ["Kohort B", "Selasa 08.00", "Air galon Rp20.000 di 4 outlet terverifikasi"],
    ["Kohort C", "Rabu 08.00", "Stok aman. Tidak perlu membeli berlebihan"],
  ];
  // collapsed vs fanned-out offsets; the hover target is the whole stack so it never moves under the cursor
  const pos = open ? [[-34, -76], [0, 0], [34, 76]] : [[-34, -26], [0, 2], [34, 30]];
  return (
    <div className="relative grid h-[230px] place-items-center [grid-template-areas:'stack']" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {items.map(([k, d, m], i) => (
        <motion.div
          key={k}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          animate={{ x: pos[i][0], y: pos[i][1], skewY: -8 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, opacity: { delay: 0.12 * i, duration: 0.5 } }}
          className={cn("pointer-events-none flex h-24 w-[19rem] select-none flex-col justify-between rounded-xl border-2 border-line bg-sand px-4 py-3 shadow-sm [grid-area:stack]", i < 2 && !open && "grayscale", i === 2 && "bg-surface")}
          style={{ zIndex: i }}
        >
          <p className="flex items-center gap-2 text-[12.5px] font-semibold text-maroon"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[10px] text-white">M</span>MarketShield · {k}</p>
          <p className="text-[12px] text-ink">{m}</p>
          <p className="text-[10.5px] text-muted">{d}</p>
        </motion.div>
      ))}
    </div>
  );
}

function MiniPrices() {
  const rows = [
    ["Masker N95", "Rp12.000", "Rp27.500", true],
    ["Air galon 19 L", "Rp20.000", "Rp21.000", false],
    ["Oksigen portabel", "Rp55.000", "Rp98.000", true],
  ] as const;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface text-[11.5px]">
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-sand px-3 py-1.5 text-[10.5px] text-muted"><span>Barang</span><span>HET</span><span>Pasar</span></div>
      {rows.map(([n, h, m, f]) => (
        <div key={n} className={cn("grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-line px-3 py-1.5", f && "bg-[#f8dedc]/60 dark:bg-[#3b1a1d]")}>
          <span className="text-ink">{n}</span><span className="font-mono text-muted">{h}</span>
          <span className={cn("font-mono font-semibold", f ? "text-crimson" : "text-leaf")}>{m}{f && " ⚑"}</span>
        </div>
      ))}
    </div>
  );
}

function MiniHoax() {
  return (
    <div className="space-y-2">
      <div className="rounded-2xl rounded-tl-sm bg-[#dcf8c6] p-2.5 text-[11.5px] text-[#1d1b18]">“Lahar sudah masuk Pronojiwo, segera tinggalkan rumah! Sebarkan!”</div>
      <div className="rounded-xl border border-line bg-surface p-2.5">
        <p className="flex items-center justify-between"><span className="rounded bg-[#f8dedc] px-1.5 text-[10px] font-bold text-[#b51a14]">HOAKS</span><span className="font-mono text-[10.5px] text-muted">97%</span></p>
        <p className="mt-1 text-[11px] text-sat">Radar Sentinel-1: tidak ada aliran baru ke Pronojiwo (48 jam).</p>
      </div>
    </div>
  );
}

function MiniEvac() {
  const { t } = useT();
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between px-3 pt-3 text-[11.5px]">
        <span className="font-semibold text-wine">{t("Rute evakuasi aman", "Safe evacuation route")}</span>
        <span className="rounded-full bg-[#e6f2e7] px-2 py-0.5 text-[10px] font-semibold text-[#2e7d32]">{t("Bebas lahar", "Lahar-free")}</span>
      </div>
      <EvacMap className="mt-2.5 h-[220px] border-y border-line sm:h-[240px]" />
      <div className="grid grid-cols-3 text-center text-[11px]">
        <div className="py-2"><p className="font-display text-[15px] font-semibold text-wine">18 mnt</p><p className="text-muted">ETA · 4,2 km</p></div>
        <div className="border-x border-line py-2"><p className="font-display text-[15px] font-semibold text-wine">268/420</p><p className="text-muted">{t("terisi shelter", "shelter filled")}</p></div>
        <div className="flex items-center justify-center px-1 py-2"><span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-crimson px-2 py-1 text-[10.5px] font-semibold text-white sm:px-2.5 sm:text-[11px]"><Siren className="hidden h-3 w-3 min-[400px]:block sm:block" /> {t("Tahan SOS", "Hold SOS")}</span></div>
      </div>
    </div>
  );
}

function MiniAid() {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 text-[11.5px]">
      <p className="mb-2 flex items-center gap-1.5 font-semibold text-wine"><Truck className="h-3.5 w-3.5" /> Kirim ke mana?</p>
      {[["Supiturang", "Rp —", 1], ["Sumberwuluh", "", 0.78], ["Oro-oro Ombo", "", 0.71]].map(([n, , w], i) => (
        <div key={n as string} className="flex items-center gap-2 py-1">
          <span className="w-3 font-mono text-muted">{i + 1}</span>
          <span className="w-24 truncate text-ink">{n}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-2"><motion.span className="block h-full rounded-full bg-maroon" initial={{ width: 0 }} whileInView={{ width: `${(w as number) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} /></span>
        </div>
      ))}
      <p className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[10.5px]"><span className="text-muted line-through">Posko paling viral</span><span className="font-semibold text-leaf">Desa paling terpapar</span></p>
    </div>
  );
}

export function Journey() {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const steps = [
    { phase: t("Deteksi", "Detect"), time: t("T − 5 hari", "T − 5 days"), h: t("Satelit melihat lebih dulu", "Satellites see it first"), p: t("Earth Engine membaca SO₂, panas dan radar di kawah setiap 6 jam, untuk semua gunung sekaligus.", "Earth Engine reads SO₂, heat and radar at every crater every 6 hours."), checks: [t("8 dataset publik", "8 public datasets"), t("Tanpa sensor di lapangan", "No field sensors"), t("Waktu akuisisi selalu tampil", "Acquisition time always shown")], ui: <MiniIndicators /> },
    { phase: t("Prakiraan", "Forecast"), time: t("T − 5 hari", "T − 5 days"), h: t("Risiko jadi satu angka", "Risk becomes one number"), p: t("XGBoost mengubah semua sinyal menjadi peluang naik level dalam 7 hari, plus jendela aksi.", "XGBoost turns the signals into a 7-day escalation probability and an action window."), checks: [t("Faktor utama dijelaskan (SHAP)", "Top drivers explained (SHAP)"), t("Level resmi tetap dari PVMBG", "Official level stays with PVMBG")], ui: <MiniGauge /> },
    { phase: t("Bersiap", "Prepare"), time: t("T − 4 hari", "T − 4 days"), h: t("Belanja lebih awal, bergiliran", "Shop early, in turns"), p: t("Warga diingatkan per kelompok untuk melengkapi Kit Siaga dengan patokan HET.", "Residents are nudged in groups to complete their go-kit against the price cap."), checks: [t("Maksimal 1 pengingat per hari", "At most 1 nudge a day"), t("Stok outlet terverifikasi", "Verified outlet stock")], ui: <MiniNotifications /> },
    { phase: t("Pasar", "Market"), time: t("T − 2 hari", "T − 2 days"), h: t("Harga diawasi", "Prices are watched"), p: t("Harga di atas HET lebih dari 30% di tiga outlet langsung ditandai dan bisa dilaporkan.", "Prices 30%+ above the cap at three outlets are flagged and reportable."), checks: [t("Deviasi per outlet", "Per-outlet deviation"), t("Laporan ke Satgas", "Reports to the task force")], ui: <MiniPrices /> },
    { phase: t("Informasi", "Information"), time: t("T − 1 hari", "T − 1 day"), h: t("Hoaks dibantah dengan bukti", "Hoaxes debunked with evidence"), p: t("Pesan berantai dicek IndoBERT, klaim lokasi dicocokkan dengan radar satelit.", "Chain messages are checked by IndoBERT; location claims are matched to satellite radar."), checks: [t("Tidak pernah terverifikasi dari model saja", "Never verified by the model alone")], ui: <MiniHoax /> },
    { phase: t("Erupsi", "Eruption"), time: "T 0", h: t("Evakuasi tenang, SOS siap", "Calm evacuation, SOS ready"), p: t("Rute bebas lahar ke shelter yang masih muat. SOS tahan 3 detik mengirim lokasi dan anggota keluarga.", "Lahar-free routes to shelters with room. A 3-second SOS sends location and household size."), checks: [t("Panduan offline", "Offline guidance"), t("Status posko real-time", "Live shelter status")], ui: <MiniEvac /> },
    { phase: t("Pemulihan", "Recovery"), time: t("T + 1 hari", "T + 1 day"), h: t("Bantuan ke yang paling terpapar", "Aid to the most exposed"), p: t("Indeks Prioritas Bantuan mengurutkan desa dari data populasi dan bahaya, bukan dari yang paling viral.", "The Aid Priority Index ranks villages by population and hazard, not virality."), checks: [t("Peringkat bergeser tiap kiriman", "Ranking shifts with every delivery"), t("Terbuka untuk donatur", "Open to donors")], ui: <MiniAid /> },
  ];
  return (
    <section id="cara-kerja" className="tex-topo tex-glow bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="label text-maroon/70">{t("Cara kerja", "How it works")}</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">
            {t("Satu erupsi, dari orbit sampai posko.", "One eruption, from orbit to aid post.")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] text-muted">{t("Apa yang dilakukan MarketShield di setiap tahap, dalam hitungan hari sebelum dan sesudah gunung meletus.", "What MarketShield does at each stage, in the days before and after an eruption.")}</p>
        </div>
        <div ref={ref} className="relative mt-12">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-line-strong md:left-1/2" aria-hidden />
          <motion.div className="absolute left-4 top-0 w-px origin-top bg-gradient-to-b from-ember via-crimson to-maroon md:left-1/2" style={{ scaleY: progress, height: "100%" }} aria-hidden />
          <ol className="space-y-10 md:space-y-14">
            {steps.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <li key={i} className="relative grid items-center md:grid-cols-2 md:gap-20">
                  <span className="absolute left-4 top-10 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-cream ring-2 ring-maroon/70 md:left-1/2 md:top-1/2 md:-translate-y-1/2" aria-hidden><span className="h-1.5 w-1.5 rounded-full bg-maroon" /></span>
                  {/* the opposite side: big step number, time and phase */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8 }}
                    className={cn("hidden select-none md:block", right ? "md:col-start-1 md:row-start-1 md:text-right" : "md:col-start-2")}
                    aria-hidden
                  >
                    <p className="font-display text-[120px] font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_color-mix(in_srgb,var(--color-maroon)_28%,transparent)]">{String(i + 1).padStart(2, "0")}</p>
                    <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.2em] text-maroon/70">{s.time}</p>
                    <p className="mt-1 font-display text-[22px] font-medium text-wine/60">{s.phase}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: right ? 40 : -40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                    className={cn("glass-card group ml-10 p-6 md:ml-0 md:p-8", right ? "md:col-start-2 md:row-start-1" : "md:col-start-1 md:row-start-1")}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ember/5 to-maroon/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="relative inline-block rounded-full bg-ember/10 px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.08em] text-[#c55a26] md:hidden">{s.time}</span>
                    <h3 className="relative mt-3 font-display text-[22px] font-medium leading-tight tracking-[-0.02em] text-wine md:mt-0 md:text-[25px]">{s.h}</h3>
                    <p className="relative mt-3 text-[15px] font-light leading-relaxed text-muted">{s.p}</p>
                    <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-muted">
                      {s.checks.map((c) => (
                        <span key={c} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-[#de7356]" strokeWidth={3} /> {c}</span>
                      ))}
                    </div>
                    <div className="relative -mx-2 mt-6 px-2 pt-1">{s.ui}</div>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
