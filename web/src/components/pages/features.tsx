"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, Building2, CircleDollarSign, Filter, HandHeart, Map, Mountain, Pill, Radar, Radio, ShieldAlert, Siren, Smartphone, Sprout, Tent, Truck, WifiOff } from "lucide-react";
import { PageHero } from "@/components/site/page";
import { Reveal } from "@/components/landing/reveal";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

export function FeaturesPage() {
  const { t } = useT();
  const core = [
    { i: Radar, h: t("Prakiraan eskalasi 7 hari", "7-day escalation forecast"), p: t("XGBoost membaca deret waktu satelit dan memberi peluang kenaikan level, lengkap dengan tiga faktor utama (SHAP).", "XGBoost reads satellite time series and outputs the probability of a level rise, with its top three drivers (SHAP).") },
    { i: Map, h: t("Peta bahaya berlapis", "Layered hazard map"), p: t("KRB, sebaran abu dari angin GFS, aliran lahar dari radar Sentinel-1, hujan IMERG, titik panas FIRMS, populasi WorldPop. 2D dan 3D.", "KRB, ash drift from GFS wind, lahar flows from Sentinel-1 radar, IMERG rain, FIRMS hotspots, WorldPop population. 2D and 3D.") },
    { i: Filter, h: t("Filter sinyal hoaks", "Signal filter"), p: t("IndoBERT memberi label hoaks, panik atau terverifikasi. Klaim lokasi dicek silang ke lapisan satelit. Tidak pernah terverifikasi dari model saja.", "IndoBERT labels hoax, panic or verified. Location claims are cross-checked with satellite layers. Never verified by the model alone.") },
    { i: CircleDollarSign, h: t("Pantau harga HET", "Price cap watch"), p: t("Deviasi harga pasar terhadap HET dihitung per outlet. Anomali ditandai otomatis dan dapat dilaporkan ke Satgas.", "Market deviation from the cap is computed per outlet. Anomalies are flagged and can be reported to the task force.") },
    { i: HandHeart, h: t("Indeks Prioritas Bantuan", "Aid Priority Index"), p: t("Desa diurutkan dari populasi terpapar × bahaya × kerentanan, dibagi bantuan yang sudah diterima.", "Villages ranked by exposed population × hazard × vulnerability, divided by aid already received.") },
    { i: Bell, h: t("Nudge bertahap anti panik", "Staggered anti-panic nudges"), p: t("Pengingat belanja kit dikirim per kohort, maksimal sekali sehari, dengan patokan harga wajar.", "Kit reminders go out per cohort, at most once a day, with a fair-price anchor.") },
    { i: Siren, h: t("SOS & evakuasi", "SOS & evacuation"), p: t("Rute bebas lahar ke shelter terdekat, panduan langkah demi langkah, dan SOS yang harus ditahan 3 detik.", "Lahar-free routes to the nearest shelter, step-by-step guidance and an SOS you hold for 3 seconds.") },
    { i: WifiOff, h: t("Tetap jalan saat sinyal hilang", "Works when signal drops"), p: t("Lapisan peta terakhir dan panduan evakuasi disimpan di ponsel. APK kecil, ±19 MB.", "Last map layers and evacuation guides are cached on the phone. Small APK, ≈19 MB.") },
  ];
  const solutions = [
    { id: "pemda", i: Building2, h: t("Pemda & BPBD", "Local government & BPBD"), img: "/img/map_hazard.webp", pts: [t("Console Pusdalops dengan status satelit real-time", "Ops-centre console with live satellite status"), t("Siaran peringatan bertahap per wilayah", "Staggered area broadcasts"), t("Peringkat desa untuk distribusi bantuan", "Village ranking for aid distribution"), t("Laporan dampak untuk rapat koordinasi", "Impact reports for coordination meetings")] },
    { id: "desa", i: Tent, h: t("Desa & posko", "Villages & aid posts"), img: "/img/posko_scene.webp", pts: [t("Status posko buka/penuh/tutup terlihat warga", "Open/full/closed status visible to residents"), t("Daftar kebutuhan yang selalu terbaru", "Always-current needs list"), t("Arahkan pengungsi ke posko yang masih muat", "Route evacuees to posts with room")] },
    { id: "apotek", i: Pill, h: t("Apotek & distributor", "Pharmacies & distributors"), img: "/img/kit_med.webp", pts: [t("Lencana outlet terverifikasi harga wajar", "Verified fair-price outlet badge"), t("Stok terlihat warga, mengurangi panic buying", "Stock visible to residents, less panic buying"), t("Data kebutuhan per desa untuk donasi", "Per-village needs for donations")] },
    { id: "logistik", i: Truck, h: t("Logistik", "Logistics"), img: "/img/bridge.webp", pts: [t("Status koridor: buka, abu, risiko lahar", "Corridor status: open, ash, lahar risk"), t("Saran rute ulang & depot cadangan", "Reroute & backup depot suggestions"), t("Webhook ke sistem dispatch", "Webhooks into dispatch systems")] },
    { id: "pertanian", i: Sprout, h: t("Pertanian & peternakan", "Farming & livestock"), img: "/img/semeru_calm.webp", pts: [t("Kapan panen lebih awal", "When to harvest early"), t("Tutup palung pakan sebelum abu turun", "Cover feed troughs before ashfall"), t("Estimasi aset terpapar dalam Rupiah", "Exposed assets in Rupiah")] },
    { id: "pariwisata", i: Mountain, h: t("Pariwisata", "Tourism"), img: "/img/mahameru.webp", pts: [t("Zona wisata yang ditutup", "Closed tourism zones"), t("Skrip informasi untuk tamu", "Guest information scripts"), t("Tetap beroperasi di zona hijau", "Keep operating in green zones")] },
  ];
  return (
    <>
      <PageHero kicker={t("Fitur", "Features")} title={t("Semua yang dibutuhkan dari orbit sampai posko.", "Everything from orbit to the aid post.")} sub={t("Satu data satelit, tiga pintu masuk: aplikasi warga, web console, dan API untuk sektor usaha.", "One satellite dataset, three ways in: resident app, web console and an API for businesses.")} crumbs={[{ label: t("Fitur", "Features") }]}>
        <div className="mt-8 flex flex-wrap gap-2">
          {solutions.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-2 text-[13px] text-bone/80 ring-1 ring-white/10 transition hover:bg-white/10">
              <s.i className="h-4 w-4 text-ember" /> {s.h}
            </a>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold tracking-tight text-wine">{t("Kemampuan inti", "Core capabilities")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {core.map((c, i) => (
            <Reveal key={c.h} delay={(i % 4) * 0.05}>
              <div className="card group h-full p-5 transition hover:-translate-y-1 hover:shadow-xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peach text-maroon transition group-hover:bg-maroon group-hover:text-white"><c.i className="h-5 w-5" /></span>
                <h3 className="mt-4 font-display text-[16px] font-semibold text-wine">{c.h}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{c.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-night py-20 text-bone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              { i: Smartphone, h: t("Aplikasi warga", "Resident app"), p: t("Flutter, Android 7+, ID/EN. 19 layar: onboarding, beranda adaptif, peta, evakuasi, SOS, cek hoaks, HET, Kit Siaga, posko, peringatan sektor, profil.", "Flutter, Android 7+, ID/EN. 19 screens: onboarding, adaptive home, map, evacuation, SOS, hoax check, price cap, go-kit, posts, sector alerts, profile."), href: "/mobile", shots: ["05_home3a", "09_evac", "12_result_a"] },
              { i: Radio, h: "Web console", p: t("Ringkasan satelit, peta 2D/3D, prioritas bantuan dengan catat kiriman, pantau harga, antrean cek hoaks, status posko dan siaran.", "Satellite overview, 2D/3D map, aid priority with delivery logging, price watch, hoax queue, post status and broadcasts."), href: "/app", shots: [] },
              { i: ShieldAlert, h: "API & webhook", p: t("REST JSON untuk indikator gunung, peluang eskalasi, prioritas desa dan cek pesan. Webhook saat level atau ambang berubah.", "REST JSON for volcano indicators, escalation odds, village priority and message checks. Webhooks when levels or thresholds change."), href: "/docs#api", shots: [] },
            ].map((s) => (
              <Link key={s.h} href={s.href} className="group rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:bg-white/[0.07]">
                <s.i className="h-6 w-6 text-ember" />
                <h3 className="mt-4 font-display text-[20px] font-semibold">{s.h}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-bone/60">{s.p}</p>
                {s.shots.length > 0 && (
                  <div className="mt-5 flex gap-2">
                    {s.shots.map((sh) => (
                      <div key={sh} className="relative aspect-[1080/2424] w-1/3 overflow-hidden rounded-xl ring-1 ring-white/10">
                        <Image src={`/screens/${sh}.webp`} alt="" fill sizes="120px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-bone/80 group-hover:text-bone">{t("Lihat", "Open")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-20 px-4 py-24 sm:px-6">
        <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold tracking-tight text-wine">{t("Solusi per peran", "Solutions by role")}</h2>
        {solutions.map((s, i) => (
          <Reveal key={s.id}>
            <div id={s.id} className={cn("grid scroll-mt-24 items-center gap-10 lg:grid-cols-2", i % 2 && "lg:[&>*:first-child]:order-2")}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-line">
                <Image src={s.img} alt="" fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-plum/50 to-transparent" />
              </div>
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl btn-shine shine-maroon bg-maroon text-white"><s.i className="h-5 w-5" /></span>
                <h3 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-wine">{s.h}</h3>
                <ul className="mt-5 space-y-3">
                  {s.pts.map((p) => (
                    <li key={p} className="flex gap-3 text-[15px] text-ink"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" /> {p}</li>
                  ))}
                </ul>
                <div className="mt-7 flex gap-3">
                  <Link href="/harga" className="rounded-full btn-shine shine-maroon bg-maroon px-4 py-2.5 text-[13px] font-medium text-white">{t("Lihat harga", "See pricing")}</Link>
                  <Link href="/bantuan#kontak" className="rounded-full px-4 py-2.5 text-[13px] font-medium text-maroon ring-1 ring-line">{t("Jadwalkan pertemuan", "Book a meeting")}</Link>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    </>
  );
}
