"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BellRing, Building2, Check, ChevronDown, CreditCard, FileText, GraduationCap, Landmark, Lock, Minus, Receipt, ShieldCheck, Tent, Truck, User, WifiOff } from "lucide-react";
import { PageHero } from "@/components/site/page";
import { FluidTabs, RulerPicker } from "@/components/ui/interactions";
import { Stagger, staggerItem } from "@/components/ui/rolling";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

type Cycle = "month" | "year";
type Key = "warga" | "desa" | "pemda" | "sektor";
const idr = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");
const short = (n: number) => (n >= 1e9 ? `Rp${(n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M` : n >= 1e6 ? `Rp${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt` : idr(n));

const PRICE = { desa: { month: 149000, year: 124000 }, pemda: { month: 12500000, year: 10400000 } };
/** Assumption for the estimator only: average residents per village in the Semeru KRB. Labelled on screen. */
const RESIDENTS_PER_VILLAGE = 3000;

export function PricingPage() {
  const { t } = useT();
  const [cycle, setCycle] = useState<Cycle>("year");
  const [pick, setPick] = useState<Key | null>(null);

  const plans: { key: Key; featured?: boolean; name: string; price: number | null; monthly?: number; unit: string; who: string; cta: { href: string; label: string }; note?: string; feats: string[] }[] = [
    {
      key: "warga",
      name: t("Warga", "Residents"),
      price: 0,
      unit: t("selamanya", "forever"),
      who: t("Setiap orang yang tinggal atau bekerja di sekitar gunung api", "Anyone living or working near a volcano"),
      cta: { href: "/download", label: t("Unduh aplikasi", "Get the app") },
      note: t("Android sekarang · iOS & Play Store segera", "Android now · iOS & Play Store soon"),
      feats: [t("Beranda adaptif level I–IV", "Adaptive home for levels I–IV"), t("Peta bahaya & rute evakuasi", "Hazard map & evacuation routes"), t("Cek pesan hoaks", "Hoax message check"), t("Kit Siaga & patokan HET", "Go-kit & price cap anchor"), t("SOS tahan 3 detik", "Hold-3-seconds SOS"), t("Mode offline", "Offline mode")],
    },
    {
      key: "desa",
      name: t("Desa & Posko", "Village & Post"),
      price: PRICE.desa[cycle],
      monthly: PRICE.desa.month,
      unit: t("per desa / bulan", "per village / month"),
      who: t("Pemerintah desa, posko relawan, dan puskesmas", "Village offices, volunteer posts and clinics"),
      cta: { href: "/bantuan#kontak", label: t("Mulai uji coba 30 hari", "Start 30-day trial") },
      note: t("Gratis jika desa termasuk paket Pemda", "Free when included in a district plan"),
      feats: [t("Semua fitur Warga", "Everything in Residents"), t("Kelola stok & kebutuhan posko", "Manage post stock & needs"), t("Status posko real-time ke warga", "Live post status to residents"), t("Siaran ke warga desa", "Broadcast to village residents"), t("3 akun operator", "3 operator seats")],
    },
    {
      key: "pemda",
      featured: true,
      name: t("Pemda & BPBD", "District & BPBD"),
      price: PRICE.pemda[cycle],
      monthly: PRICE.pemda.month,
      unit: t("per kabupaten / bulan", "per district / month"),
      who: t("BPBD kabupaten/kota dan Pusdalops", "District disaster agencies and ops centres"),
      cta: { href: "/bantuan#kontak", label: t("Minta penawaran resmi", "Request a formal quote") },
      note: t("Termasuk semua desa & posko di wilayah", "Includes every village & post in the district"),
      feats: [t("Web console lengkap", "Full web console"), t("Hingga 5 gunung api dipantau", "Up to 5 monitored volcanoes"), t("Indeks Prioritas Bantuan per desa", "Per-village Aid Priority Index"), t("Siaran bertahap per kohort, tanpa batas", "Unlimited staggered broadcasts"), t("Pantau harga HET & laporan penimbunan", "Price cap watch & gouging reports"), t("Ekspor laporan PDF/CSV", "PDF/CSV report export"), t("25 akun operator + SSO", "25 operator seats + SSO"), t("Pelatihan Pusdalops & SLA 99,5%", "Ops training & 99.5% SLA")],
    },
    {
      key: "sektor",
      name: t("Sektor & Enterprise", "Sector & Enterprise"),
      price: null,
      unit: t("harga kustom", "custom pricing"),
      who: t("Logistik, asuransi, ritel modern, perkebunan, telco", "Logistics, insurance, retail, plantations, telcos"),
      cta: { href: "/kemitraan", label: t("Hubungi tim kemitraan", "Talk to partnerships") },
      feats: [t("API & webhook data satelit", "Satellite data API & webhooks"), t("Pemantauan aset tanpa batas", "Unlimited asset monitoring"), t("Estimasi aset terpapar (Rp)", "Exposed-asset estimates (Rp)"), t("Integrasi ke sistem internal", "Integration with internal systems"), t("Manajer akun khusus", "Dedicated account manager")],
    },
  ];

  const personas: { k: Key; i: typeof User; l: string }[] = [
    { k: "warga", i: User, l: t("Saya warga", "I'm a resident") },
    { k: "desa", i: Tent, l: t("Saya kelola desa/posko", "I run a village/post") },
    { k: "pemda", i: Building2, l: t("Saya di BPBD/Pemda", "I'm at BPBD/district") },
    { k: "sektor", i: Truck, l: t("Saya dari perusahaan", "I'm from a company") },
  ];

  const groups: { h: string; rows: { f: string; v: (boolean | string)[] }[] }[] = [
    {
      h: t("Peringatan & data", "Alerts & data"),
      rows: [
        { f: t("Peringatan level PVMBG", "PVMBG level alerts"), v: [true, true, true, true] },
        { f: t("Prakiraan satelit & jendela aksi", "Satellite forecast & action window"), v: [true, true, true, true] },
        { f: t("Cek hoaks (IndoBERT)", "Hoax check (IndoBERT)"), v: [true, true, true, true] },
        { f: t("Pantau harga HET", "Price cap watch"), v: [t("Lihat", "View"), t("Lihat", "View"), t("Lihat & tindak", "View & act"), true] },
      ],
    },
    {
      h: t("Operasional", "Operations"),
      rows: [
        { f: t("Kelola posko & stok", "Post & stock management"), v: [false, true, true, t("Opsional", "Optional")] },
        { f: "Web console", v: [false, t("Terbatas", "Limited"), true, true] },
        { f: t("Indeks Prioritas Bantuan", "Aid Priority Index"), v: [false, false, true, true] },
        { f: t("Siaran peringatan", "Alert broadcasts"), v: [false, t("Tingkat desa", "Village"), t("Tanpa batas", "Unlimited"), t("Tanpa batas", "Unlimited")] },
        { f: t("Akun operator", "Operator seats"), v: ["–", "3", "25", t("Tanpa batas", "Unlimited")] },
      ],
    },
    {
      h: t("Integrasi & keamanan", "Integration & security"),
      rows: [
        { f: "API & webhook", v: [false, false, t("10.000 panggilan/bln", "10,000 calls/mo"), t("Kustom", "Custom")] },
        { f: "SSO / SAML", v: [false, false, true, true] },
        { f: t("Log audit", "Audit log"), v: [false, false, t("90 hari", "90 days"), t("1 tahun", "1 year")] },
      ],
    },
    {
      h: t("Dukungan", "Support"),
      rows: [
        { f: "SLA", v: ["–", "–", "99,5%", "99,9%"] },
        { f: t("Kanal dukungan", "Support channel"), v: [t("Pusat bantuan", "Help centre"), "Email", t("Email + WhatsApp 24/7 saat Siaga", "Email + 24/7 WhatsApp on Watch"), t("Manajer akun", "Account manager")] },
        { f: t("Pelatihan", "Training"), v: [false, t("Video", "Video"), t("Tatap muka Pusdalops", "On-site ops training"), t("Kustom", "Custom")] },
      ],
    },
  ];

  const faqs = [
    { q: t("Apakah aplikasi warga benar-benar gratis?", "Is the resident app really free?"), a: t("Ya. Fitur keselamatan tidak pernah dikunci di balik pembayaran. Biaya ditanggung oleh paket Pemda, Desa dan Sektor.", "Yes. Safety features are never paywalled. Costs are covered by district, village and sector plans.") },
    { q: t("Bagaimana instansi pemerintah membeli?", "How do government agencies buy?"), a: t("Kami menyediakan penawaran resmi, kontrak tahunan dan dokumen pendukung pengadaan barang/jasa pemerintah. Pembayaran tahunan dapat dibagi per termin.", "We provide formal quotes, annual contracts and procurement documentation. Annual payments can be split into instalments.") },
    { q: t("Kapan paket Desa lebih hemat dibanding paket Pemda?", "When is the Village plan cheaper than the District plan?"), a: t("Gunakan kalkulator di atas. Dengan harga tahunan, paket Pemda lebih hemat mulai sekitar 84 desa, dan sudah termasuk web console penuh serta SLA.", "Use the calculator above. On annual pricing, the District plan becomes cheaper from about 84 villages, and includes the full console and SLA.") },
    { q: t("Apakah harga sudah termasuk pajak?", "Do prices include tax?"), a: t("Belum. Harga belum termasuk PPN. Faktur pajak diterbitkan untuk setiap tagihan.", "No. Prices exclude VAT. A tax invoice is issued with every bill.") },
    { q: t("Bisakah berhenti kapan saja?", "Can we cancel any time?"), a: t("Paket bulanan dapat dihentikan sebelum periode berikutnya. Paket tahunan berlaku hingga akhir masa kontrak.", "Monthly plans can be cancelled before the next period. Annual plans run to the end of the contract.") },
    { q: t("Apa yang terjadi pada data kami jika berhenti?", "What happens to our data if we leave?"), a: t("Anda dapat mengekspor seluruh data dalam 30 hari. Setelah itu data operasional dihapus sesuai Kebijakan Privasi.", "You can export all data within 30 days. Operational data is then deleted per our Privacy Policy.") },
    { q: t("Apakah ada harga khusus untuk NGO atau kampus?", "Are there discounts for NGOs or universities?"), a: t("Ya, lewat Program Relawan & Kampus di bawah. Paket Desa gratis untuk Kampung Siaga Bencana, NGO kebencanaan dan riset kampus.", "Yes, via the Volunteer & Campus Programme below. The Village plan is free for disaster-ready villages, disaster NGOs and campus research.") },
  ];
  const [open, setOpen] = useState<number | null>(0);
  const [mPlan, setMPlan] = useState(2);

  // Estimator
  const [villages, setVillages] = useState(40);
  const desaYear = villages * PRICE.desa.year * 12;
  const pemdaYear = PRICE.pemda.year * 12;
  const best: Key = desaYear <= pemdaYear ? "desa" : "pemda";
  const bestCost = Math.min(desaYear, pemdaYear);
  const perResident = bestCost / (villages * RESIDENTS_PER_VILLAGE);
  const max = Math.max(desaYear, pemdaYear);

  return (
    <>
      <PageHero kicker={t("Harga", "Pricing")} title={t("Gratis untuk warga. Berkelanjutan untuk semua.", "Free for residents. Sustainable for everyone.")} sub={t("Keselamatan warga tidak pernah berbayar. Pemda, desa dan sektor usaha membayar alat kerja yang mereka gunakan.", "Resident safety is never paid. Districts, villages and businesses pay for the tools they use.")} crumbs={[{ label: t("Harga", "Pricing") }]}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <FluidTabs
            label={t("Periode tagihan", "Billing period")}
            value={cycle}
            onChange={setCycle}
            className="rounded-full bg-white/10 p-1"
            itemClassName="rounded-full px-4 py-2 text-[13px] font-medium"
            pillClassName="bg-bone"
            activeClassName="text-night"
            idleClassName="text-bone/70 hover:text-bone"
            options={[
              { value: "month", label: t("Bulanan", "Monthly") },
              { value: "year", label: t("Tahunan", "Annual") },
            ]}
          />
          <span className="rounded-full bg-ember/20 px-2.5 py-1 text-[12px] font-medium text-[#ffb27a]">{t("Tahunan = gratis 2 bulan", "Annual = 2 months free")}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={t("Pilih peran Anda", "Choose your role")}>
          {personas.map((p) => (
            <button key={p.k} onClick={() => setPick(pick === p.k ? null : p.k)} aria-pressed={pick === p.k} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] ring-1 transition", pick === p.k ? "bg-bone text-night ring-bone" : "text-bone/70 ring-white/15 hover:text-bone")}>
              <p.i className="h-3.5 w-3.5" /> {p.l}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const save = p.price && p.monthly && cycle === "year" ? (p.monthly - p.price) * 12 : 0;
            const dim = pick && pick !== p.key;
            return (
              <motion.div key={p.key} variants={staggerItem} animate={{ opacity: dim ? 0.55 : 1, scale: pick === p.key ? 1.015 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className={cn("relative flex flex-col rounded-3xl p-6", p.featured ? "bg-plum text-bone shadow-2xl shadow-wine/30" : "card", pick === p.key && "ring-2 ring-ember")}>
                {p.featured && <span className="label absolute -top-3 left-6 rounded-full bg-ember px-2.5 py-1 !text-[9.5px] text-white shadow-lg">{t("Paling dipilih", "Most chosen")}</span>}
                {pick === p.key && <span className="label absolute -top-3 right-6 rounded-full bg-bone px-2.5 py-1 !text-[9.5px] text-night shadow-lg ring-1 ring-line">{t("Cocok untuk Anda", "Fits you")}</span>}
                <h2 className={cn("font-display text-[19px] font-semibold", p.featured ? "text-bone" : "text-wine")}>{p.name}</h2>
                <p className={cn("mt-1 min-h-[40px] text-[13px]", p.featured ? "text-bone/60" : "text-muted")}>{p.who}</p>
                <div className="mt-5 h-[84px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={`${p.key}-${cycle}`} initial={{ y: 10, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -10, opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.2 }}>
                      <p className="font-display text-[30px] font-semibold tabular tracking-tight">{p.price === null ? t("Kustom", "Custom") : p.price === 0 ? t("Gratis", "Free") : idr(p.price)}</p>
                      <p className={cn("text-[12.5px]", p.featured ? "text-bone/55" : "text-muted")}>{save > 0 && <span className="mr-1 tabular line-through opacity-70">{short(p.monthly!)}</span>}{p.unit}{p.price ? (cycle === "year" ? t(", ditagih tahunan", ", billed yearly") : t(", ditagih bulanan", ", billed monthly")) : ""}</p>
                      {save > 0 && <p className={cn("mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11.5px] font-medium", p.featured ? "bg-ember/25 text-[#ffcfa8]" : "bg-leaf/12 text-leaf")}>{t("Hemat", "Save")} {short(save)}{t("/tahun", "/year")}</p>}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Link href={p.cta.href} className={cn("mt-5 rounded-xl py-2.5 text-center text-[13.5px] font-medium transition", p.featured ? "btn-shine shine-bone bg-bone text-night hover:bg-white" : "btn-shine shine-maroon bg-maroon text-white hover:bg-maroon-deep")}>{p.cta.label}</Link>
                {p.note && <p className={cn("mt-3 text-[12px]", p.featured ? "text-[#ffb27a]" : "text-leaf")}>{p.note}</p>}
                <ul className="mt-5 space-y-2.5 border-t pt-5 text-[13.5px]" style={{ borderColor: p.featured ? "rgba(255,255,255,.12)" : "var(--color-line)" }}>
                  {p.feats.map((f) => (
                    <li key={f} className="flex gap-2"><Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.featured ? "text-ember" : "text-leaf")} /> {f}</li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </Stagger>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-sand px-5 py-3.5 text-[13px] text-ink/80">
          <span className="label text-muted">{t("Di semua paket", "In every plan")}</span>
          {[
            { i: BellRing, l: t("Peringatan resmi PVMBG", "Official PVMBG alerts") },
            { i: WifiOff, l: t("Mode offline", "Offline mode") },
            { i: ShieldCheck, l: t("Cek hoaks", "Hoax check") },
            { i: Lock, l: t("HTTPS & data minimal", "HTTPS & minimal data") },
          ].map((x) => <span key={x.l} className="inline-flex items-center gap-1.5"><x.i className="h-4 w-4 text-maroon" /> {x.l}</span>)}
        </div>
        <p className="mt-3 text-[12.5px] text-muted">{t("Harga dalam Rupiah dan belum termasuk PPN. Add-on API: Rp75.000 per 1.000 panggilan di atas kuota.", "Prices in Rupiah, excluding VAT. API add-on: Rp75,000 per 1,000 calls above quota.")}</p>
      </section>

      {/* Estimator */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="card grid gap-10 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="label text-maroon">{t("Kalkulator", "Calculator")}</p>
            <h2 className="mt-3 font-display text-[26px] font-semibold tracking-tight text-wine">{t("Paket mana yang lebih hemat untuk wilayah Anda?", "Which plan is cheaper for your area?")}</h2>
            <p className="mt-2 text-[14px] text-muted">{t("Geser jumlah desa di zona rawan. Harga tahunan, belum PPN.", "Slide the number of villages in the hazard zone. Annual pricing, excl. VAT.")}</p>
            <div className="mt-6">
              <RulerPicker value={villages} onChange={setVillages} min={10} max={250} step={10} label={t("Desa di zona rawan", "Villages in hazard zone")} format={(v) => `${v} ${t("desa", "villages")}`} />
            </div>
            <p className="mt-6 text-[12px] text-muted">{t(`Asumsi: rata-rata ${RESIDENTS_PER_VILLAGE.toLocaleString("id-ID")} warga per desa, hanya untuk ilustrasi.`, `Assumption: ${RESIDENTS_PER_VILLAGE.toLocaleString("en-US")} residents per village on average, illustrative only.`)}</p>
          </div>
          <div className="flex flex-col justify-center gap-4">
            {([["desa", t("Desa & Posko × ", "Village & Post × ") + villages, desaYear], ["pemda", t("Pemda & BPBD (1 kabupaten)", "District & BPBD (1 district)"), pemdaYear]] as const).map(([k, l, v]) => (
              <div key={k}>
                <div className="flex items-baseline justify-between text-[13.5px]">
                  <span className={cn("flex items-center gap-2", best === k ? "font-semibold text-wine" : "text-muted")}>{l} {best === k && <span className="rounded-full bg-leaf/12 px-2 py-0.5 text-[11px] font-medium text-leaf">{t("Lebih hemat", "Cheaper")}</span>}</span>
                  <span className="font-display font-semibold tabular text-wine">{short(v)}<span className="text-[12px] font-normal text-muted">{t("/thn", "/yr")}</span></span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-sand">
                  <motion.div className={cn("h-full rounded-full", best === k ? "bg-maroon" : "bg-plum/30")} animate={{ width: `${(v / max) * 100}%` }} transition={{ type: "spring", stiffness: 160, damping: 22 }} />
                </div>
              </div>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-sand p-4">
                <p className="text-[12px] text-muted">{t("Biaya per warga / tahun", "Cost per resident / year")}</p>
                <p className="mt-1 font-display text-[22px] font-semibold tabular text-wine">{idr(perResident)}</p>
              </div>
              <div className="rounded-2xl bg-sand p-4">
                <p className="text-[12px] text-muted">{t("Selisih", "Difference")}</p>
                <p className="mt-1 font-display text-[22px] font-semibold tabular text-wine">{short(Math.abs(desaYear - pemdaYear))}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-[28px] font-semibold tracking-tight text-wine">{t("Bandingkan paket", "Compare plans")}</h2>

        {/* mobile: one plan at a time */}
        <div className="mt-6 md:hidden">
          <FluidTabs
            label={t("Pilih paket", "Pick a plan")}
            value={mPlan}
            onChange={setMPlan}
            className="grid grid-cols-4 rounded-xl bg-sand p-1"
            itemClassName="rounded-lg px-1 py-2 text-[11.5px] font-medium"
            pillClassName="bg-paper shadow-sm"
            activeClassName="text-wine"
            idleClassName="text-muted"
            options={plans.map((p, i) => ({ value: i, label: p.name.split(" ")[0] }))}
          />
          <div className="card mt-3 divide-y divide-line">
            {groups.map((g) => (
              <div key={g.h} className="px-4 py-3">
                <p className="label py-1 text-muted">{g.h}</p>
                {g.rows.map((r) => {
                  const v = r.v[mPlan];
                  return (
                    <div key={r.f} className="flex items-center justify-between gap-4 py-2 text-[13.5px]">
                      <span className="text-ink">{r.f}</span>
                      {v === true ? <Check className="h-4 w-4 shrink-0 text-leaf" /> : v === false ? <Minus className="h-4 w-4 shrink-0 text-line-strong" /> : <span className="text-right text-muted">{v}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* desktop table with sticky plan header */}
        <div className="card mt-6 hidden md:block">
          <table className="w-full text-[13.5px]">
            <thead className="sticky top-16 z-10">
              <tr className="border-b border-line bg-paper/95 backdrop-blur">
                <th className="w-[28%] rounded-tl-3xl p-4 text-left font-medium text-muted">{t("Fitur", "Feature")}</th>
                {plans.map((p, i) => (
                  <th key={p.key} className={cn("p-4 text-left align-top", i === 3 && "rounded-tr-3xl", p.featured && "bg-peach/30")}>
                    <span className={cn("block font-display text-[15px] font-semibold", p.featured ? "text-maroon" : "text-wine")}>{p.name}</span>
                    <span className="block text-[12px] font-normal tabular text-muted">{p.price === null ? t("Kustom", "Custom") : p.price === 0 ? t("Gratis", "Free") : `${short(p.price)}${t("/bln", "/mo")}`}</span>
                    <Link href={p.cta.href} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-maroon hover:underline">{p.cta.label.split(" ").slice(0, 2).join(" ")} <ArrowRight className="h-3 w-3" /></Link>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.h}>
                <tr>
                  <td colSpan={5} className="bg-sand/60 px-4 pb-2 pt-5 font-display text-[13.5px] font-semibold text-wine">{g.h}</td>
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.f} className="border-b border-line/70 transition hover:bg-sand/40">
                    <td className="p-4 text-ink">{r.f}</td>
                    {r.v.map((v, i) => (
                      <td key={i} className={cn("p-4", i === 2 && "bg-peach/20")}>
                        {v === true ? <Check className="h-4 w-4 text-leaf" aria-label={t("Ya", "Yes")} /> : v === false ? <Minus className="h-4 w-4 text-line-strong" aria-label={t("Tidak", "No")} /> : <span className="text-muted">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      {/* Programme */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="tex-topo relative grid gap-6 overflow-hidden rounded-3xl bg-sand p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-maroon text-white"><GraduationCap className="h-7 w-7" /></span>
          <div>
            <p className="font-display text-[20px] font-semibold tracking-tight text-wine">{t("Program Relawan & Kampus", "Volunteer & Campus Programme")}</p>
            <p className="mt-1 max-w-2xl text-[14px] text-muted">{t("Paket Desa & Posko gratis untuk Kampung Siaga Bencana, NGO kebencanaan, dan riset kampus. Cukup ceritakan wilayah dan kegiatan Anda.", "The Village & Post plan is free for disaster-ready villages, disaster NGOs and campus research. Just tell us about your area and work.")}</p>
          </div>
          <Link href="/bantuan#kontak" className="btn-shine shine-maroon inline-flex items-center justify-center gap-2 rounded-xl bg-maroon px-5 py-3 text-[14px] font-medium text-white">{t("Ajukan", "Apply")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-[28px] font-semibold tracking-tight text-wine">{t("Tagihan & pembayaran", "Billing & payment")}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { i: Landmark, h: t("Transfer & virtual account", "Bank transfer & VA"), p: t("Semua bank nasional", "All national banks") },
                { i: CreditCard, h: t("Kartu kredit/debit", "Credit/debit card"), p: t("Untuk paket bulanan", "For monthly plans") },
                { i: Receipt, h: t("Faktur pajak", "Tax invoices"), p: t("Terbit otomatis tiap tagihan", "Issued with every bill") },
                { i: FileText, h: t("Kontrak instansi", "Agency contracts"), p: t("Penawaran resmi & termin", "Formal quotes & instalments") },
              ].map((b) => (
                <div key={b.h} className="card p-4">
                  <b.i className="h-5 w-5 text-maroon" />
                  <p className="mt-3 text-[14px] font-semibold text-wine">{b.h}</p>
                  <p className="text-[12.5px] text-muted">{b.p}</p>
                </div>
              ))}
            </div>
            <Link href="/keamanan" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-maroon hover:underline"><ShieldCheck className="h-4 w-4" /> {t("Keamanan & kepatuhan", "Security & compliance")}</Link>
          </div>
          <div>
            <h2 className="font-display text-[28px] font-semibold tracking-tight text-wine">{t("Pertanyaan soal harga", "Pricing questions")}</h2>
            <ul className="mt-6 space-y-2">
              {faqs.map((f, i) => (
                <li key={f.q} className="card overflow-hidden">
                  <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 p-4 text-left text-[14.5px] font-medium text-wine">
                    {f.q}
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open === i && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 text-[13.5px] leading-relaxed text-muted">
                        <span className="block pb-4">{f.a}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </>
  );
}
