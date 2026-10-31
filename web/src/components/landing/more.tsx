"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, Pill, Sprout, User } from "lucide-react";
import { Reveal } from "./reveal";
import { FluidTabs } from "@/components/ui/interactions";
import { PhoneShot } from "@/components/ui/phone";
import { POSTS } from "@/lib/blog";
import { Rolling, Stagger, staggerItem } from "@/components/ui/rolling";
import { StoreBadges } from "@/components/ui/store-badges";
import { APK } from "@/lib/data";
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

export function Numbers() {
  const { t } = useT();
  const items = [
    { v: "127", l: t("gunung api aktif tercakup satu katalog", "active volcanoes in one catalog") },
    { v: "8", l: t("dataset satelit publik", "public satellite datasets") },
    { v: "6 jam", l: t("siklus pembaruan fitur risiko", "risk feature refresh cycle") },
    { v: APK.size, l: t("ukuran APK untuk sinyal lemah", "APK size for weak signal") },
    { v: "0", l: t("sensor lapangan yang perlu dirawat", "field sensors to maintain") },
  ];
  return (
    <section className="border-y border-line bg-surface">
      <Stagger className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-4 sm:px-6 md:grid-cols-5 md:divide-x">
        {items.map((i, k) => (
          <motion.div key={i.l} variants={staggerItem} className="px-2 py-8 md:px-6">
            <p className="font-display text-[34px] font-semibold tracking-tight text-wine"><Rolling value={i.v} delay={k * 0.1} /></p>
            <p className="mt-1 text-[13px] leading-snug text-muted">{i.l}</p>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}

export function UseCases() {
  const { t } = useT();
  const cases = [
    { key: "warga", icon: User, stats: [["1", t("langkah berikutnya, selalu jelas", "clear next step")], ["2 dtk", t("cek pesan berantai", "to check a message")], ["0", t("biaya untuk warga", "cost for residents")]] as [string, string][], label: t("Warga", "Residents"), who: "Bu Sari, Candipuro", q: t("“Saya bahaya tidak, beli apa, ke mana, pesan itu benar tidak?”", "“Am I in danger, what do I buy, where do I go, is that message true?”"), pts: [t("Beranda menunjukkan satu langkah berikutnya", "Home shows one next step"), t("Cek pesan WhatsApp dalam 2 detik", "Check a WhatsApp message in 2 seconds"), t("Rute bebas lahar ke shelter yang masih muat", "Lahar-free route to a shelter with room")], shot: "05_home3a" },
    { key: "petani", icon: Sprout, stats: [["72 j", t("prakiraan arah abu", "ash forecast")], ["Rp", t("estimasi aset terpapar", "exposed assets")], ["3", t("protokol per level", "protocols per level")]] as [string, string][], label: t("Petani", "Farmers"), who: "Pak Darto, Cangkringan", q: t("“Panen lebih awal? Pindahkan sapi? Tutup palung?”", "“Harvest early? Move the cows? Cover troughs?”"), pts: [t("Arah abu dari angin GFS untuk 72 jam", "Ash direction from GFS wind for 72 h"), t("Estimasi aset terpapar dalam Rupiah", "Exposed assets in Rupiah"), t("Checklist dengan tenggat sesuai jendela aksi", "Checklist with action-window deadlines")], shot: "17_sector" },
    { key: "apotek", icon: Pill, stats: [["HET", t("patokan harga resmi", "official price cap")], ["4", t("outlet stok terverifikasi", "verified outlets")], ["5", t("desa prioritas", "priority villages")]] as [string, string][], label: t("Apotek", "Pharmacies"), who: t("Apotek di Pasirian", "A pharmacy in Pasirian"), q: t("“Buktikan harga saya wajar, kirim bantuan ke yang butuh.”", "“Prove my prices are fair, send aid where it's needed.”"), pts: [t("Lencana harga wajar sesuai HET", "Fair-price badge against the cap"), t("Stok terlihat warga, antrean lebih tenang", "Stock visible to residents, calmer queues"), t("Lima desa prioritas dan kebutuhannya", "Top five priority villages and needs")], shot: "13_het" },
    { key: "bpbd", icon: Building2, stats: [["3D", t("peta satelit & simulasi", "satellite map & sim")], ["6 j", t("siklus data satelit", "satellite data cycle")], ["⌘K", t("perintah cepat", "quick commands")]] as [string, string][], label: "BPBD", who: t("Pusdalops kabupaten", "District ops centre"), q: t("“Verifikasi laporan, perbarui posko, lihat desa prioritas.”", "“Verify reports, update posts, see priority villages.”"), pts: [t("Peta 3D dengan lapisan satelit", "3D map with satellite layers"), t("Catat kiriman, peringkat ikut bergeser", "Log deliveries, ranking shifts"), t("Siaran bertahap tanpa memicu panic buying", "Staggered broadcasts without panic buying")], shot: "16_aid_a" },
  ];
  const [k, setK] = useState("warga");
  const c = cases.find((x) => x.key === k)!;
  return (
    <section className="tex-topo-b tex-glow bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center text-center">
          <Kicker n="—">{t("Untuk siapa", "Who it's for")}</Kicker>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">{t("Satu sumber kebenaran, langkah berbeda untuk tiap peran.", "One source of truth, different steps for every role.")}</h2>
        </Reveal>
        <div className="mt-8 flex justify-center">
          <FluidTabs label={t("Peran", "Role")} value={k} onChange={setK} className="max-w-full flex-wrap justify-center gap-0.5 rounded-[1.6rem] bg-sand-2 p-1 sm:gap-1 sm:rounded-full" itemClassName="rounded-full px-2.5 py-2 text-[13px] font-medium sm:px-4 sm:text-[13.5px]" options={cases.map((x) => ({ value: x.key, label: <span className="flex items-center gap-1.5"><x.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />{x.label}</span> }))} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }} className="card mt-6 grid overflow-hidden md:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <p className="label text-maroon/60">{c.who}</p>
              <p className="mt-3 font-display text-[22px] font-medium leading-snug text-wine sm:text-[24px]">{c.q}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-1">
                {c.pts.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px]"><Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf" /> {p}</li>
                ))}
              </ul>
              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-line pt-6">
                {c.stats.map(([v, l]) => (
                  <div key={l}>
                    <p className="font-display text-[22px] font-semibold tracking-tight text-wine">{v}</p>
                    <p className="text-[12px] leading-snug text-muted">{l}</p>
                  </div>
                ))}
              </div>
              <Link href="/fitur" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-maroon">{t("Lihat semua fitur", "See all features")} <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="tex-topo relative hidden items-center justify-center bg-gradient-to-br from-peach/70 to-sand px-8 py-10 md:flex">
              <PhoneShot src={c.shot} sizes="250px" className="w-[250px]" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export function PricingTeaser() {
  const { t } = useT();
  const tiers = [
    { n: t("Warga", "Residents"), p: t("Gratis", "Free"), s: t("selamanya", "forever") },
    { n: t("Desa & Posko", "Village & Post"), p: "Rp124rb", s: t("/desa/bulan", "/village/mo") },
    { n: t("Pemda & BPBD", "District & BPBD"), p: "Rp10,4jt", s: t("/kabupaten/bulan", "/district/mo"), hi: true },
    { n: t("Sektor", "Sector"), p: t("Kustom", "Custom"), s: "API & webhook" },
  ];
  return (
    <section className="bg-sand py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <Kicker n="08">{t("Harga", "Pricing")}</Kicker>
          <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">{t("Keselamatan warga tidak pernah berbayar.", "Resident safety is never paywalled.")}</h2>
          <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-muted">{t("Pemda, desa dan sektor usaha membiayai alat kerja mereka. Warga mendapat aplikasi lengkap tanpa biaya.", "Districts, villages and businesses fund their tools. Residents get the full app at no cost.")}</p>
          <Link href="/harga" className="mt-7 inline-flex items-center gap-2 rounded-full btn-shine shine-maroon bg-maroon px-5 py-3 text-[14px] font-medium text-white">{t("Lihat semua paket", "See all plans")} <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-3">
          {tiers.map((x, i) => (
            <Reveal key={x.n} delay={i * 0.05}>
              <Link href="/harga" className={cn("block rounded-2xl p-5 transition hover:-translate-y-0.5", x.hi ? "bg-plum text-bone" : "card")}>
                <p className={cn("text-[13px]", x.hi ? "text-bone/60" : "text-muted")}>{x.n}</p>
                <p className="mt-2 font-display text-[26px] font-semibold tracking-tight">{x.p}</p>
                <p className={cn("text-[12px]", x.hi ? "text-bone/50" : "text-muted")}>{x.s}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogTeaser() {
  const { t } = useT();
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Kicker n="09">{t("Dari blog", "From the blog")}</Kicker>
            <h2 className="mt-6 font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold tracking-[-0.03em] text-wine">{t("Riset & kesiapsiagaan", "Research & preparedness")}</h2>
          </div>
          <Link href="/blog" className="hidden items-center gap-1.5 text-[14px] font-medium text-maroon sm:inline-flex">{t("Semua artikel", "All articles")} <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {POSTS.slice(0, 3).map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Link href={`/blog/${p.slug}`} className="card group block h-full overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={p.cover} alt="" fill sizes="(min-width:768px) 400px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="label !text-[10px] text-maroon/60">{p.cat} · {p.read} min</p>
                  <h3 className="mt-2 font-display text-[17px] font-semibold leading-snug text-wine">{p.title}</h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useT();
  const qs = [
    { q: t("Apakah MarketShield menggantikan informasi PVMBG?", "Does MarketShield replace PVMBG information?"), a: t("Tidak. Level resmi selalu dari PVMBG. Kami menambahkan prakiraan satelit, filter hoaks, harga dan prioritas bantuan agar warga dan petugas bisa bersiap lebih awal.", "No. Official levels always come from PVMBG. We add satellite forecasts, hoax filtering, prices and aid priority so people can prepare earlier.") },
    { q: t("Seberapa akurat prakiraannya?", "How accurate are the forecasts?"), a: t("Prakiraan bersifat probabilistik dan selalu disertai faktor penyebab serta waktu akuisisi data. Akurasi terus divalidasi terhadap riwayat perubahan level dan masukan lapangan.", "Forecasts are probabilistic and always show their drivers and acquisition times. Accuracy is continuously validated against level history and field feedback.") },
    { q: t("Kenapa tanpa sensor di lapangan?", "Why no field sensors?"), a: t("Sensor perlu dipasang, dirawat dan sering rusak saat erupsi. Data satelit publik mencakup semua gunung sekaligus dan tetap tersedia saat akses darat terputus.", "Sensors need installing and upkeep and often fail during eruptions. Public satellite data covers every volcano at once and stays available when roads are cut.") },
    { q: t("Apakah data pribadi saya aman?", "Is my personal data safe?"), a: t("Kami hanya mengumpulkan data yang diperlukan, tidak menjual data, dan mengikuti UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.", "We collect only what's needed, never sell data, and follow Indonesia's Personal Data Protection Law No. 27/2022.") },
    { q: t("Bisakah dipakai untuk gunung selain Semeru?", "Does it work beyond Semeru?"), a: t("Pipeline satelit berjalan untuk semua gunung api aktif. Layanan lengkap dengan data posko dan desa dibuka per kabupaten bersama BPBD setempat.", "The satellite pipeline runs for every active volcano. Full service with post and village data opens district by district with local BPBD.") },
    { q: t("Seberapa cepat data satelit diperbarui?", "How fresh is the satellite data?"), a: t("Fitur risiko dihitung ulang tiap 6 jam. Sentinel-5P dan MODIS harian, FIRMS dalam hitungan jam, GPM tiap 30 menit, GFS tiap 6 jam, dan radar Sentinel-1 tiap 6–12 hari. Setiap angka menampilkan waktu akuisisinya.", "Risk features are recomputed every 6 hours. Sentinel-5P and MODIS are daily, FIRMS within hours, GPM every 30 minutes, GFS every 6 hours and Sentinel-1 radar every 6–12 days. Every value shows its acquisition time.") },
    { q: t("Apakah aplikasi tetap jalan saat sinyal hilang?", "Does the app work without signal?"), a: t("Ya untuk hal paling penting. Peta terakhir, rute evakuasi, Kit Siaga dan nomor darurat disimpan di ponsel. Pembaruan level butuh koneksi, dan aplikasi selalu menunjukkan kapan data terakhir diterima.", "Yes for the essentials. The last map, evacuation routes, go-kit and emergency numbers are cached. Level updates need a connection, and the app always shows when data was last received.") },
    { q: t("Bagaimana cara kerja SOS?", "How does SOS work?"), a: t("Tahan tombol 3 detik. Lokasi dan jumlah anggota rumah tangga dikirim ke kontak darurat dan BPBD setempat. Tanpa data, aplikasi menyiapkan SMS cadangan. Tetap hubungi 112 dalam keadaan darurat.", "Hold the button for 3 seconds. Location and household size go to emergency contacts and local BPBD. Without data, an SMS fallback is prepared. Always call 112 in an emergency.") },
    { q: t("Bagaimana MarketShield mencegah panic buying?", "How does MarketShield prevent panic buying?"), a: t("Pengingat belanja dikirim bergiliran per kelompok warga, maksimal sekali sehari, dengan patokan HET dan daftar outlet yang stoknya terverifikasi. Permintaan tersebar sehingga toko sempat mengisi ulang.", "Shopping reminders go out to resident groups in turn, at most once a day, with the price cap and outlets with verified stock. Demand spreads out so shops can restock.") },
    { q: t("Siapa yang menentukan HET?", "Who sets the price cap?"), a: t("HET mengikuti ketetapan pemerintah atau instansi terkait di masing-masing daerah. MarketShield hanya membandingkan harga pasar dengan acuan itu dan menandai penyimpangan.", "The cap follows the figure set by government or the relevant agency in each region. MarketShield only compares market prices with it and flags deviations.") },
    { q: t("Bagaimana hoaks dideteksi?", "How are hoaxes detected?"), a: t("Model IndoBERT memberi label pada pesan dan menyorot kata pemicunya. Klaim lokasi lahar atau abu dicocokkan dengan radar Sentinel-1 dan arah angin. Label terverifikasi hanya diberikan jika ada sumber resmi, tiga laporan konsisten, atau kecocokan satelit.", "An IndoBERT model labels the message and highlights trigger words. Lahar or ash location claims are matched with Sentinel-1 radar and wind. Verified is only given with an official source, three consistent reports, or a satellite match.") },
    { q: t("Apakah warga harus membayar?", "Do residents pay?"), a: t("Tidak. Aplikasi warga gratis selamanya. Biaya ditanggung paket Pemda, desa dan sektor usaha yang memakai console dan API.", "No. The resident app is free forever. Costs are covered by district, village and business plans using the console and API.") },
    { q: t("Bagaimana BPBD atau desa mulai memakai?", "How can a BPBD or village start?"), a: t("Ajukan uji coba 30 hari di halaman Kemitraan. Kami menyiapkan wilayah, akun operator dan pelatihan singkat untuk Pusdalops atau posko.", "Request a 30-day pilot on the Partnerships page. We set up the area, operator accounts and a short training for the ops centre or aid post.") },
    { q: t("Apakah tersedia di iPhone?", "Is it on iPhone?"), a: t("Saat ini tersedia sebagai APK Android dan versi web yang bisa dibuka dari browser apa pun, termasuk iPhone. Versi iOS native ada di peta jalan.", "Right now it ships as an Android APK and a web version that opens in any browser, including iPhone. A native iOS app is on the roadmap.") },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-cream pb-16 sm:pb-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Kicker n="10">FAQ</Kicker>
          <h2 className="mt-6 font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold tracking-[-0.03em] text-wine">{t("Pertanyaan yang sering muncul", "Frequently asked")}</h2>
          <Link href="/bantuan" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-maroon">{t("Pusat bantuan", "Help centre")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <Stagger className="divide-y divide-line border-y border-line" gap={0.05}>
          {qs.map((x, i) => (
            <motion.div variants={staggerItem} key={x.q}>
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-[17px] font-medium text-wine">
                {x.q}
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-line transition", open === i && "rotate-180 bg-maroon text-white ring-maroon")}><ChevronDown className="h-4 w-4" /></span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="pb-5 pr-14 text-[15px] leading-relaxed text-muted">{x.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { t } = useT();
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="noise relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-night px-6 py-16 text-center text-bone sm:px-12 sm:py-20">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(234,106,31,0.35),transparent_70%)]" />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{t("Bersiap sebelum level naik.", "Get ready before the level rises.")}</h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] text-bone/65">{t("Pasang aplikasinya untuk keluarga Anda, atau mulai uji coba 30 hari untuk kabupaten Anda.", "Install the app for your family, or start a 30-day pilot for your district.")}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/download" className="rounded-full btn-shine shine-bone bg-bone px-6 py-3 text-[14px] font-medium text-night">{t("Unduh APK gratis", "Download the free APK")}</Link>
            <Link href="/kemitraan" className="rounded-full px-6 py-3 text-[14px] text-bone ring-1 ring-white/25 hover:bg-white/5">{t("Ajukan uji coba instansi", "Request an agency pilot")}</Link>
          </div>
          <StoreBadges dark apk={false} className="mt-6 justify-center" />
        </div>
      </div>
    </section>
  );
}
