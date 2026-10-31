"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, Building2, CheckCircle2, CircleDollarSign, Filter, HandHeart, HeartPulse, Mountain, Radar, RadioTower, Satellite, Scale, ShieldAlert, Siren, Truck } from "lucide-react";
import { Reveal } from "./reveal";
import { FluidTabs, HoldButton } from "@/components/ui/interactions";
import { classify } from "@/lib/classify";
import { ITEMS, LEVELS, VERDICTS, VILLAGES, priority, rupiah, type Level } from "@/lib/data";
import { useT } from "@/lib/store";
import { Stagger, staggerItem } from "@/components/ui/rolling";
import { cn } from "@/lib/utils";

/* ---------- Mini widgets, one per feature ---------- */

function ForecastDemo() {
  const { t, tx } = useT();
  const [lv, setLv] = useState<Level>(2);
  const L = LEVELS[lv];
  const r = 64;
  const c = Math.PI * r;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <svg width="180" height="104" viewBox="0 0 160 92" aria-hidden>
        <path d="M16 84a64 64 0 0 1 128 0" fill="none" stroke="var(--t-line)" strokeWidth="12" strokeLinecap="round" />
        <motion.path d="M16 84a64 64 0 0 1 128 0" fill="none" stroke={L.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - L.prob) }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
      </svg>
      <div className="-mt-16 text-center">
        <motion.p key={lv} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-[34px] font-semibold tabular" style={{ color: L.color }}>{Math.round(L.prob * 100)}%</motion.p>
        <p className="text-[12px] text-muted">{t("peluang naik level dalam 7 hari", "chance of a level rise in 7 days")}</p>
      </div>
      <p className="rounded-full px-3 py-1 text-[12.5px] font-medium" style={{ background: L.soft, color: L.color }}>{tx(L.eaw)}</p>
      <div className="w-full max-w-xs">
        <input type="range" min={1} max={4} value={lv} onChange={(e) => setLv(Number(e.target.value) as Level)} className="w-full accent-maroon" aria-label={t("Tingkat aktivitas satelit", "Satellite activity level")} />
        <div className="flex justify-between text-[11px] text-muted"><span>{t("SO₂ rendah", "Low SO₂")}</span><span>{t("SO₂ + panas + radar naik", "SO₂ + heat + radar up")}</span></div>
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
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {samples.map((s, i) => (
          <button key={i} onClick={() => setText(s)} className={cn("rounded-full px-2.5 py-1 text-[11.5px] ring-1 transition", text === s ? "bg-maroon text-white ring-maroon" : "text-muted ring-line hover:text-ink")}>{t("Contoh", "Sample")} {i + 1}</button>
        ))}
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-[#dcf8c6] p-3 text-[13.5px] text-[#1d1b18] shadow-sm">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full resize-none bg-transparent outline-none" aria-label={t("Pesan", "Message")} />
        <p className="text-right text-[10px] text-[#667]">08.12 ✓✓</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={r.verdict + r.conf} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wide" style={{ background: V.soft, color: V.color }}>{tx(V.label)}</span>
            <span className="text-[11.5px] tabular text-muted">{Math.round(r.conf * 100)}%</span>
          </div>
          {r.sat && <p className="mt-2 flex gap-1.5 text-[12px] text-sat"><Satellite className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {r.sat}</p>}
          <p className="mt-1.5 flex gap-1.5 text-[12px] text-ink"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" /> {r.fact}</p>
        </motion.div>
      </AnimatePresence>
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
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex flex-wrap gap-1.5">
        {ITEMS.slice(0, 5).map((it, k) => (
          <button key={k} onClick={() => { setI(k); setMarket(it.market); }} className={cn("rounded-full px-2.5 py-1 text-[11.5px] ring-1 transition", i === k ? "bg-maroon text-white ring-maroon" : "text-muted ring-line hover:text-ink")}>{tx(it.name)}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#e6f2e7] p-3"><p className="text-[11px] text-[#2e7d32]">HET</p><p className="font-display text-[18px] font-semibold tabular text-[#2e7d32]">{rupiah(item.het)}</p></div>
        <div className={cn("rounded-xl p-3 transition-colors", flag ? "bg-[#f8dedc]" : "bg-sand-2")}><p className={cn("text-[11px]", flag ? "text-[#b51a14]" : "text-muted")}>{t("Harga di toko", "Shop price")}</p><p className={cn("font-display text-[18px] font-semibold tabular", flag ? "text-[#b51a14]" : "text-ink")}>{rupiah(market)}</p></div>
      </div>
      <input type="range" min={Math.round(item.het * 0.9)} max={item.het * 3} step={500} value={market} onChange={(e) => setMarket(Number(e.target.value))} className="w-full accent-maroon" aria-label={t("Harga di toko", "Shop price")} />
      <motion.p key={String(flag)} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("rounded-xl px-3 py-2 text-center text-[13px] font-semibold", flag ? "bg-[#b51a14] text-white" : dev > 0.1 ? "bg-[#fce7da] text-[#c2610f]" : "bg-[#e6f2e7] text-[#2e7d32]")}>
        {flag ? t(`+${Math.round(dev * 100)}% · ditandai & bisa dilaporkan`, `+${Math.round(dev * 100)}% · flagged & reportable`) : dev > 0.1 ? t(`+${Math.round(dev * 100)}% · dipantau`, `+${Math.round(dev * 100)}% · watched`) : t("Harga wajar", "Fair price")}
      </motion.p>
    </div>
  );
}

function AidDemo() {
  const { t } = useT();
  const [extra, setExtra] = useState<Record<string, number>>({});
  const rows = VILLAGES.slice(0, 5).map((v) => ({ ...v, aid: v.aid + (extra[v.desa] ?? 0) })).map((v) => ({ v, s: priority(v, 3) })).sort((a, b) => b.s - a.s);
  const max = Math.max(...rows.map((r) => r.s));
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {rows.map(({ v, s }, k) => (
        <motion.div layout key={v.desa} transition={{ type: "spring", stiffness: 380, damping: 30 }} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2 ring-1 ring-line">
          <span className="w-4 font-mono text-[12px] text-muted">{k + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-wine">{v.desa} <span className="font-normal text-muted">· {v.aid} {t("kiriman", "drops")}</span></p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand-2"><motion.div className="h-full rounded-full bg-maroon" animate={{ width: `${(s / max) * 100}%` }} /></div>
          </div>
          {k === 0 && <button onClick={() => setExtra((e) => ({ ...e, [v.desa]: (e[v.desa] ?? 0) + 2 }))} className="btn-shine shine-maroon inline-flex items-center gap-1 rounded-lg bg-maroon px-2.5 py-1.5 text-[11.5px] font-medium text-white"><Truck className="h-3.5 w-3.5" /> {t("Kirim", "Send")}</button>}
        </motion.div>
      ))}
      <p className="mt-1 text-center text-[11.5px] text-muted">{t("Kirim ke #1, lalu lihat peringkat bergeser ke desa berikutnya.", "Send to #1 and watch the ranking move to the next village.")}</p>
    </div>
  );
}

function SosDemo() {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xs rounded-2xl bg-surface p-4 text-left ring-1 ring-line">
            <p className="flex items-center gap-2 font-display text-[16px] font-semibold text-leaf"><CheckCircle2 className="h-5 w-5" /> {t("SOS terkirim", "SOS sent")}</p>
            <ul className="mt-2 space-y-1 text-[12.5px] text-muted">
              <li>📍 −8,163 · 113,004 (Sumberwuluh)</li>
              <li>👨‍👩‍👧 {t("4 orang · 1 lansia", "4 people · 1 elderly")}</li>
              <li>➜ BPBD Lumajang + 2 {t("kontak darurat", "emergency contacts")}</li>
            </ul>
            <button onClick={() => setSent(false)} className="mt-3 text-[12px] font-medium text-maroon">{t("Ulangi", "Reset")}</button>
          </motion.div>
        ) : (
          <motion.div key="hold" exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-3">
            <span className="relative flex h-24 w-24 items-center justify-center">
              <span className="pulse-ring absolute inset-0 rounded-full bg-crimson/30" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-crimson text-white shadow-lg shadow-crimson/40"><Siren className="h-8 w-8" /></span>
            </span>
            <HoldButton onConfirm={() => window.setTimeout(() => setSent(true), 300)} duration={1500} className="w-56 !bg-crimson" icon={<Siren className="h-4 w-4" />} label={t("Tahan 3 detik untuk SOS", "Hold for SOS")} holdLabel={t("Terus tahan…", "Keep holding…")} doneLabel={t("Terkirim", "Sent")} />
            <p className="max-w-xs text-[11.5px] text-muted">{t("Harus ditahan, supaya tidak terkirim tanpa sengaja.", "It must be held, so it never fires by accident.")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NudgeDemo() {
  const { t } = useT();
  const [on, setOn] = useState(true);
  const days = [t("H-5", "D-5"), t("H-4", "D-4"), t("H-3", "D-3"), t("H-2", "D-2"), t("H-1", "D-1")];
  const spike = [5, 6, 8, 18, 92];
  const staggered = [26, 25, 24, 22, 21];
  const vals = on ? staggered : spike;
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <FluidTabs label={t("Skenario", "Scenario")} value={on ? "on" : "off"} onChange={(v) => setOn(v === "on")} className="w-fit rounded-full bg-sand-2 p-1" itemClassName="rounded-full px-3 py-1.5 text-[12px] font-medium" options={[{ value: "off", label: t("Semua diberi tahu sekaligus", "Everyone at once") }, { value: "on", label: t("Bertahap per kohort", "Staggered cohorts") }]} />
      <div className="flex h-36 items-end gap-3">
        {vals.map((v, k) => (
          <div key={k} className="flex flex-1 flex-col items-center gap-1">
            <motion.div className={cn("w-full rounded-t-lg", v > 60 ? "bg-crimson" : "bg-maroon")} animate={{ height: `${v}%` }} transition={{ type: "spring", stiffness: 160, damping: 20 }} />
            <span className="text-[10.5px] text-muted">{days[k]}</span>
          </div>
        ))}
      </div>
      <p className={cn("rounded-xl px-3 py-2 text-center text-[12.5px] font-medium", on ? "bg-[#e6f2e7] text-[#2e7d32]" : "bg-[#f8dedc] text-[#b51a14]")}>
        {on ? t("Belanja tersebar 5 hari, stok sempat diisi ulang, harga tetap wajar.", "Buying spreads over 5 days, shops restock, prices stay fair.") : t("Semua belanja di hari terakhir: rak kosong, harga meledak.", "Everyone buys on the last day: empty shelves, prices spike.")}
      </p>
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
            <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-cream p-6 ring-1 ring-line">
              <div className="grid-bg-light pointer-events-none absolute inset-0 opacity-70" />
              <p className="label relative mb-3 !text-[9.5px] text-muted">{t("Coba langsung", "Try it")} ↓</p>
              <div className="relative h-[calc(100%-1.5rem)]">{f.demo}</div>
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
