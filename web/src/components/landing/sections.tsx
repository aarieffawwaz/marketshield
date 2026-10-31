"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, BellRing, Database, Download, Filter, Globe2, Monitor, Radar, Scale, ShieldCheck, Smartphone, Sparkles, Store, Timer } from "lucide-react";
import { Reveal } from "./reveal";
import { Phone } from "@/components/ui/phone";
import { APK, LEVELS, type Level } from "@/lib/data";
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

export function Pipeline() {
  const { t } = useT();
  const steps = [
    { icon: Globe2, h: "Google Earth Engine", p: t("8 dataset publik: Sentinel-1/2/5P, FIRMS, MODIS, GPM, GFS, WorldPop", "8 public datasets: Sentinel-1/2/5P, FIRMS, MODIS, GPM, GFS, WorldPop") },
    { icon: Database, h: t("Pipeline fitur", "Feature pipeline"), p: t("Python + earthengine-api terjadwal tiap 6 jam, agregasi per gunung & per desa", "Python + earthengine-api every 6 hours, aggregated per volcano & village") },
    { icon: Sparkles, h: t("Mesin risiko", "Risk engine"), p: t("XGBoost memprediksi kenaikan level 7 hari, SHAP menjelaskan faktor utamanya", "XGBoost predicts 7-day level rises; SHAP explains the top drivers") },
    { icon: Filter, h: "IndoBERT", p: t("Klasifikasi pesan: sinyal, hoaks, panik, dengan cek silang satelit", "Message classes: signal, hoax, panic, with satellite cross-checks") },
    { icon: Smartphone, h: t("Aplikasi & console", "App & console"), p: t("Flutter untuk warga, web console untuk BPBD, posko dan donatur", "Flutter for residents, web console for BPBD, aid posts and donors") },
  ];
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
        <div className="relative mt-10 grid gap-3 md:grid-cols-5">
          <div className="pointer-events-none absolute inset-x-6 top-[3.1rem] hidden h-px bg-gradient-to-r from-maroon/10 via-maroon/40 to-maroon/10 md:block" aria-hidden />
          {steps.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.07}>
              <div className="card relative h-full p-5">
                <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-maroon font-mono text-[11px] font-semibold text-white ring-4 ring-surface">0{i + 1}</span>
                <s.icon className="mt-4 h-6 w-6 text-maroon" />
                <h3 className="mt-4 font-display text-[16px] font-semibold text-wine">{s.h}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-6 grid gap-4 rounded-2xl bg-plum p-6 text-bone sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="label text-ember">{t("Indeks Prioritas Bantuan", "Aid Priority Index")}</p>
              <p className="mt-3 font-mono text-[15px] leading-relaxed sm:text-[17px]">
                Priority = Σ(pop<sub>exposed</sub> × w<sub>hazard</sub>) × vulnerability ÷ (aid<sub>received</sub> + 1)
              </p>
              <p className="mt-3 max-w-2xl text-[13.5px] text-bone/60">
                {t("Populasi terpapar dari WorldPop di dalam zona KRB, abu dan lahar. Kerentanan dari tutupan lahan dan jarak ke posko terdekat.", "Exposed population from WorldPop inside KRB, ash and lahar zones. Vulnerability from land cover and distance to the nearest aid post.")}
              </p>
            </div>
            <Link href="/app?tab=aid" className="inline-flex items-center gap-2 self-start rounded-full btn-shine shine-bone bg-bone px-5 py-3 text-[14px] font-medium text-night">
              {t("Lihat peringkat desa", "See village ranking")} <ArrowUpRight className="h-4 w-4" />
            </Link>
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
