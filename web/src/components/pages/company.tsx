"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, Bug, CircleDashed, Clock, Download, FileLock2, KeyRound, Lock, Map as MapIcon, Megaphone, RefreshCw, Satellite, Server, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageHero } from "@/components/site/page";
import { Mark } from "@/components/ui/brand";
import { BrandIcon } from "@/components/ui/brand-icons";
import { CopyButton } from "@/components/ui/interactions";
import { Stagger, staggerItem } from "@/components/ui/rolling";
import { StoreBadges } from "@/components/ui/store-badges";
import { VOLCANOES } from "@/lib/geo";
import { SOCIALS } from "@/lib/site";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="font-display text-[28px] font-semibold tracking-tight text-wine">{children}</h2>;

/* ───────────────────────────── /tentang ───────────────────────────── */

export function AboutPage() {
  const { t } = useT();
  const values = [
    { i: ShieldCheck, h: t("Keselamatan tidak berbayar", "Safety is never paywalled"), p: t("Fitur yang menyelamatkan nyawa selalu gratis untuk warga.", "Life-saving features are always free for residents.") },
    { i: BadgeCheck, h: t("Resmi lebih dulu", "Official first"), p: t("Level dan perintah evakuasi mengikuti PVMBG & BPBD. Kami melengkapi, bukan menggantikan.", "Levels and evacuation orders follow PVMBG & BPBD. We complement, never replace.") },
    { i: Satellite, h: t("Terbuka soal data", "Open about data"), p: t("Setiap angka punya sumber dan tingkat keyakinan yang bisa diperiksa.", "Every number has a source and confidence you can inspect.") },
    { i: Users, h: t("Dirancang bersama warga", "Built with residents"), p: t("Bahasa sederhana, sinyal lemah, HP murah: itu kondisi lapangan sebenarnya.", "Plain language, weak signal, low-end phones: that is the real field.") },
  ];
  const roles = [
    { h: t("Produk & desain", "Product & design"), p: t("Riset pengguna, alur evakuasi, web console", "User research, evacuation flows, web console") },
    { h: t("Data & geospasial", "Data & geospatial"), p: t("Pipeline Google Earth Engine, peta KRB", "Google Earth Engine pipeline, hazard maps") },
    { h: t("Machine learning", "Machine learning"), p: t("Model risiko & deteksi hoaks", "Risk model & hoax detection") },
    { h: t("Mobile & web", "Mobile & web"), p: "Flutter, Next.js, MapLibre" },
  ];
  const milestones = [
    { d: t("Okt 2026", "Oct 2026"), h: t("Proposal konsep INCEPTION 2026", "INCEPTION 2026 concept proposal") },
    { d: t("Okt 2026", "Oct 2026"), h: t("Prototipe aplikasi warga & web console", "Resident app & web console prototype") },
    { d: t("31 Okt 2026", "31 Oct 2026"), h: t("Rilis APK 1.0.0 & simulasi erupsi 3D", "APK 1.0.0 & 3D eruption simulation") },
    { d: t("Berikutnya", "Next"), h: t("Uji coba bersama satu desa di lereng Semeru", "Pilot with one village on Semeru's slopes"), next: true },
  ];
  return (
    <>
      <PageHero kicker={t("Tentang kami", "About us")} title={t("Kami membangun jendela waktu sebelum abu turun.", "We build the window of time before the ash falls.")} sub={t("MarketShield lahir dari pertanyaan sederhana: kalau satelit bisa melihat tanda-tanda gunung api lebih awal, kenapa warga dan pasar baru bereaksi setelah harga masker naik?", "MarketShield started with a simple question: if satellites can see a volcano's signs early, why do residents and markets react only after mask prices spike?")} crumbs={[{ label: t("Tentang", "About") }]} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="label text-maroon">{t("Misi", "Mission")}</p>
            <p className="mt-4 font-display text-[26px] font-semibold leading-snug tracking-tight text-wine">{t("Mengubah sinyal satelit menjadi tindakan yang tepat waktu bagi warga, posko dan pasar di sekitar gunung api aktif Indonesia.", "Turn satellite signals into timely action for residents, aid posts and markets around Indonesia's active volcanoes.")}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">{t(`Saat ini kami memetakan ${VOLCANOES.length} gunung api, dengan Semeru sebagai area uji pertama.`, `We currently map ${VOLCANOES.length} volcanoes, with Semeru as the first test area.`)}</p>
          </div>
          <Stagger className="grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <motion.div key={v.h} variants={staggerItem} className="card p-5">
                <v.i className="h-5 w-5 text-maroon" />
                <p className="mt-3 text-[15px] font-semibold text-wine">{v.h}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{v.p}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="tex-topo bg-sand py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <H2>{t("Tim BRAIN – Ayam Jago", "Team BRAIN – Ayam Jago")}</H2>
            <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted">{t("Mahasiswa BINUS University yang membangun MarketShield untuk kompetisi INCEPTION 2026. Kami bekerja lintas disiplin:", "BINUS University students building MarketShield for INCEPTION 2026. We work across disciplines:")}</p>
            <Stagger className="mt-6 grid gap-3 sm:grid-cols-2">
              {roles.map((r) => (
                <motion.div key={r.h} variants={staggerItem} className="glass-card rounded-2xl p-4">
                  <p className="text-[14px] font-semibold text-wine">{r.h}</p>
                  <p className="mt-1 text-[12.5px] text-muted">{r.p}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
          <div>
            <H2>{t("Perjalanan", "Milestones")}</H2>
            <ol className="relative mt-6 space-y-5 border-l border-line-strong pl-6">
              {milestones.map((m) => (
                <li key={m.h} className="relative">
                  <span className={cn("absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-sand", m.next ? "border-2 border-maroon bg-sand" : "bg-maroon")} />
                  <p className="label text-muted">{m.d}</p>
                  <p className={cn("mt-1 text-[15px] font-medium", m.next ? "text-muted" : "text-wine")}>{m.h}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="karier" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="card grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="label text-maroon">{t("Karier & relawan", "Careers & volunteers")}</p>
            <h2 className="mt-3 font-display text-[26px] font-semibold tracking-tight text-wine">{t("Belum ada lowongan berbayar. Relawan selalu kami sambut.", "No paid openings yet. Volunteers always welcome.")}</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{t("Kami mencari relawan desa, penerjemah bahasa daerah (Jawa, Madura, Tengger), dan kontributor data harga pasar. Ceritakan keahlianmu.", "We are looking for village volunteers, local-language translators (Javanese, Madurese, Tengger) and market-price contributors. Tell us what you do.")}</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <Link href="/bantuan#kontak" className="btn-shine shine-maroon inline-flex items-center gap-2 rounded-xl bg-maroon px-5 py-3 text-[14px] font-medium text-white">{t("Daftar jadi relawan", "Volunteer with us")} <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/kemitraan" className="text-[13.5px] text-maroon underline-offset-4 hover:underline">{t("Atau jadi mitra institusi", "Or partner as an institution")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────────── /pers ───────────────────────────── */

const PALETTE = [
  { n: "Maroon", hex: "#7B1E26" },
  { n: "Crimson", hex: "#B51A14" },
  { n: "Ember", hex: "#EA6A1F" },
  { n: "Night", hex: "#1A0F12" },
  { n: "Bone", hex: "#F4EDE4" },
];

export function PressPage() {
  const { t } = useT();
  const boiler = t(
    "MarketShield adalah sistem peringatan dini berbasis satelit yang membantu warga, posko dan pasar di sekitar gunung api aktif Indonesia bersiap sebelum erupsi. Dengan menggabungkan data Google Earth Engine, status resmi PVMBG dan pemantauan harga kebutuhan pokok, MarketShield memberi jendela waktu untuk evakuasi, menyiapkan stok posko, dan mencegah lonjakan harga masker serta air bersih. Aplikasi warga gratis; Pemda dan sektor usaha menggunakan web console berbayar. MarketShield dikembangkan oleh tim BRAIN – Ayam Jago dari BINUS University.",
    "MarketShield is a satellite-based early-warning system that helps residents, aid posts and markets around Indonesia's active volcanoes prepare before an eruption. By combining Google Earth Engine data, official PVMBG status and staple-price monitoring, MarketShield creates a window to evacuate, stock aid posts and prevent spikes in mask and clean-water prices. The resident app is free; local governments and businesses use a paid web console. MarketShield is built by team BRAIN – Ayam Jago from BINUS University.",
  );
  const facts = [
    { k: t("Didirikan", "Founded"), v: "2026" },
    { k: t("Asal", "Based in"), v: "Jakarta, Indonesia" },
    { k: t("Gunung api di peta", "Volcanoes mapped"), v: String(VOLCANOES.length) },
    { k: t("Platform", "Platforms"), v: "Android · Web · API" },
    { k: t("Kategori", "Category"), v: t("Teknologi kebencanaan", "Disaster tech") },
    { k: t("Kompetisi", "Competition"), v: "INCEPTION 2026" },
  ];
  const shots = ["04_home_en", "07_map2", "11_intel", "15_posko"];
  return (
    <>
      <PageHero kicker={t("Pers & media", "Press & media")} title={t("Kit media MarketShield", "MarketShield media kit")} sub={t("Semua yang Anda perlukan untuk menulis tentang kami: deskripsi singkat, fakta, logo, warna dan tangkapan layar.", "Everything you need to write about us: boilerplate, facts, logo, colours and screenshots.")} crumbs={[{ label: t("Pers", "Press") }]}>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/brand/marketshield-mark-1024.png" download="marketshield-logo.png" className="btn-shine shine-bone inline-flex items-center gap-2 rounded-xl bg-bone px-4 py-2.5 text-[13.5px] font-medium text-night"><Download className="h-4 w-4" /> {t("Unduh logo (PNG)", "Download logo (PNG)")}</a>
          <Link href="/bantuan#kontak" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] text-bone ring-1 ring-white/25 hover:bg-white/10"><Megaphone className="h-4 w-4" /> {t("Hubungi tim media", "Contact media team")}</Link>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center justify-between gap-4">
            <H2>{t("Deskripsi singkat", "Boilerplate")}</H2>
            <CopyButton text={boiler} label={t("Salin", "Copy")} doneLabel={t("Tersalin", "Copied")} />
          </div>
          <p className="card mt-5 p-6 text-[15px] leading-relaxed text-ink">{boiler}</p>
          <div className="mt-8">
            <p className="label text-muted">{t("Penulisan nama", "Naming")}</p>
            <ul className="mt-3 space-y-2 text-[14px] text-ink">
              <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf" /> <span><b>MarketShield</b> {t("— satu kata, M dan S kapital.", "— one word, capital M and S.")}</span></li>
              <li className="flex gap-2"><CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-crimson" /> <span className="text-muted line-through">Market Shield, Marketshield, MARKETSHIELD</span></li>
            </ul>
          </div>
        </div>
        <div>
          <H2>{t("Fakta singkat", "Fact sheet")}</H2>
          <dl className="card mt-5 divide-y divide-line">
            {facts.map((f) => (
              <div key={f.k} className="flex items-center justify-between gap-4 px-5 py-3.5 text-[14px]">
                <dt className="text-muted">{f.k}</dt>
                <dd className="text-right font-medium text-wine">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <H2>{t("Logo & warna", "Logo & colours")}</H2>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
            <div className="card grid h-44 place-items-center"><Mark className="h-20 w-20" /></div>
            <div className="grid h-44 place-items-center rounded-3xl bg-night"><Mark className="h-20 w-20" /></div>
            <div className="grid grid-cols-5 gap-2">
              {PALETTE.map((c) => (
                <div key={c.hex} className="flex flex-col overflow-hidden rounded-2xl ring-1 ring-line">
                  <div className="min-h-[110px] flex-1" style={{ background: c.hex }} />
                  <div className="bg-paper px-2 py-2">
                    <p className="text-[12px] font-semibold text-wine">{c.n}</p>
                    <p className="font-mono text-[10.5px] text-muted">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[12.5px] text-muted">{t("Jangan ubah proporsi, warna, atau menambahkan efek pada logo. Beri ruang kosong minimal setinggi perisai di sekelilingnya.", "Don't stretch, recolour or add effects to the logo. Keep clear space at least the shield's height around it.")}</p>

          <h3 className="mt-14 font-display text-[22px] font-semibold tracking-tight text-wine">{t("Tangkapan layar", "Screenshots")}</h3>
          <Stagger className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {shots.map((s) => (
              <motion.a key={s} variants={staggerItem} href={`/screens/${s}.webp`} download className="group block overflow-hidden rounded-[28px] bg-night p-2 ring-1 ring-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/screens/${s}.webp`} alt="" loading="lazy" className="aspect-[9/19.5] w-full rounded-[22px] object-cover object-top transition group-hover:scale-[1.02]" />
              </motion.a>
            ))}
          </Stagger>
          <p className="mt-3 text-[12.5px] text-muted">{t("Klik untuk mengunduh. Foto gunung api di situs ini berlisensi terpisah, lihat", "Click to download. Volcano photos on this site are separately licensed, see")} <Link href="/kredit" className="text-maroon underline">{t("kredit", "credits")}</Link>.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <H2>{t("Kanal resmi", "Official channels")}</H2>
            <p className="mt-3 text-[14.5px] text-muted">{t("Hanya akun di bawah ini yang mewakili MarketShield. Akun bertanda \"segera\" belum aktif.", "Only the accounts below represent MarketShield. Accounts marked \"soon\" are not live yet.")}</p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SOCIALS.map((so) => (
              <li key={so.name} className="card flex items-center gap-3 px-4 py-3">
                <BrandIcon name={so.name} className="h-4 w-4 text-wine" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-wine">{so.label}</span>
                  <span className="block truncate text-[12px] text-muted">{so.handle}</span>
                </span>
                {so.href ? <a href={so.href} target="_blank" rel="noreferrer" className="text-[12px] text-maroon hover:underline">{t("Buka", "Open")}</a> : <span className="rounded-full bg-sand px-2 py-0.5 text-[10.5px] text-muted">{t("segera", "soon")}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────────── /keamanan ───────────────────────────── */

type Cert = { n: string; d: string; s: "self" | "plan"; note: string };

export function SecurityPage() {
  const { t } = useT();
  const certs: Cert[] = [
    { n: "UU PDP No. 27/2022", d: t("Pelindungan Data Pribadi", "Personal Data Protection Law"), s: "self", note: t("Swa-penilaian: minimisasi data, dasar pemrosesan & hak subjek data tercantum di Kebijakan Privasi.", "Self-assessed: data minimisation, lawful basis and data-subject rights in our Privacy Policy.") },
    { n: "PP 71/2019 · PSE", d: t("Pendaftaran Penyelenggara Sistem Elektronik", "Electronic System Operator registration"), s: "plan", note: t("Didaftarkan sebelum rilis publik di Play Store.", "To be registered before the public Play Store release.") },
    { n: "OWASP ASVS L1", d: t("Standar verifikasi keamanan aplikasi", "Application security verification"), s: "self", note: t("Swa-uji untuk web console & API.", "Self-tested for the web console & API.") },
    { n: "WCAG 2.2 AA", d: t("Aksesibilitas", "Accessibility"), s: "self", note: t("Target. Kontras, fokus keyboard & label ARIA sudah diterapkan; audit penuh belum.", "Target. Contrast, keyboard focus & ARIA labels applied; full audit pending.") },
    { n: "ISO/IEC 27001:2022", d: t("Sistem manajemen keamanan informasi", "Information security management"), s: "plan", note: t("Peta jalan setelah fase uji coba Pemda.", "Roadmap after the district pilot phase.") },
    { n: t("Tanpa pelacak iklan", "No ad trackers"), d: t("Analitik & pihak ketiga", "Analytics & third parties"), s: "self", note: t("Situs dan aplikasi tidak memasang piksel iklan atau analitik pihak ketiga.", "The site and app ship no ad pixels or third-party analytics.") },
  ];
  const stat = {
    self: { l: t("Swa-nilai", "Self-assessed"), c: "text-[#9a5b00] bg-[#f5b544]/15" },
    plan: { l: t("Peta jalan", "Roadmap"), c: "text-muted bg-sand" },
  };
  const practices = [
    { i: Lock, h: t("Terenkripsi saat transit", "Encrypted in transit"), p: t("Semua lalu lintas melalui HTTPS (TLS 1.2+), HSTS aktif di hosting.", "All traffic over HTTPS (TLS 1.2+) with HSTS at the host.") },
    { i: FileLock2, h: t("Data seminimal mungkin", "Minimal data"), p: t("Aplikasi warga bisa dipakai tanpa akun. Lokasi hanya dipakai untuk menghitung zona & rute.", "The resident app works without an account. Location is only used to compute zones & routes.") },
    { i: KeyRound, h: t("Akses berbasis peran", "Role-based access"), p: t("Operator BPBD, posko dan donatur hanya melihat data sesuai perannya.", "BPBD, post and donor operators only see data for their role.") },
    { i: Server, h: t("Infrastruktur tepercaya", "Trusted infrastructure"), p: t("Di-hosting di Vercel; data satelit diproses di Google Earth Engine.", "Hosted on Vercel; satellite data processed on Google Earth Engine.") },
  ];
  return (
    <>
      <PageHero kicker={t("Keamanan & kepatuhan", "Security & compliance")} title={t("Jujur soal apa yang sudah dan belum.", "Honest about what's done and what isn't.")} sub={t("Kami masih tahap prototipe. Halaman ini membedakan swa-penilaian dan yang masih di peta jalan.", "We are still a prototype. This page separates self-assessment from roadmap items.")} crumbs={[{ label: t("Keamanan", "Security") }]} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <H2>{t("Standar & regulasi", "Standards & regulation")}</H2>
        <Stagger className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {certs.map((c) => (
            <motion.div key={c.n} variants={staggerItem} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[17px] font-semibold text-wine">{c.n}</p>
                  <p className="text-[12.5px] text-muted">{c.d}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", stat[c.s].c)}>{stat[c.s].l}</span>
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink/80">{c.note}</p>
            </motion.div>
          ))}
        </Stagger>
        <p className="mt-4 max-w-3xl text-[12.5px] text-muted">{t("Belum ada sertifikasi pihak ketiga atas nama MarketShield. Penyedia infrastruktur kami memiliki sertifikasinya sendiri (lihat halaman kepatuhan Vercel dan Google Cloud); itu bukan sertifikasi MarketShield.", "MarketShield holds no third-party certification yet. Our infrastructure providers hold their own (see Vercel's and Google Cloud's compliance pages); those are not MarketShield certifications.")}</p>
      </section>

      <section className="tex-topo bg-sand py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <H2>{t("Praktik keamanan", "Security practices")}</H2>
          <Stagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {practices.map((p) => (
              <motion.div key={p.h} variants={staggerItem} className="glass-card rounded-2xl p-5">
                <p.i className="h-5 w-5 text-maroon" />
                <p className="mt-3 text-[15px] font-semibold text-wine">{p.h}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{p.p}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="laporkan" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="card grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="label flex items-center gap-2 text-maroon"><Bug className="h-4 w-4" /> {t("Pengungkapan bertanggung jawab", "Responsible disclosure")}</p>
            <h2 className="mt-3 font-display text-[24px] font-semibold tracking-tight text-wine">{t("Menemukan celah keamanan?", "Found a vulnerability?")}</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{t("Laporkan secara privat melalui GitHub Security Advisory. Mohon jangan mengakses data orang lain atau mengganggu layanan saat pengujian. Kami membalas dalam 3 hari kerja.", "Report privately via GitHub Security Advisory. Please don't access other people's data or disrupt the service while testing. We reply within 3 business days.")}</p>
          </div>
          <a href="https://github.com/aarieffawwaz/marketshield/security/advisories/new" target="_blank" rel="noreferrer" className="btn-shine shine-maroon inline-flex items-center justify-center gap-2 rounded-xl bg-maroon px-5 py-3 text-[14px] font-medium text-white lg:justify-self-end">
            <BrandIcon name="github" className="h-4 w-4" /> {t("Kirim laporan privat", "Send a private report")}
          </a>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────────── /status ───────────────────────────── */

type Probe = { key: string; group: "api" | "map"; label: string; url: string; kind: "fetch" | "img" };
type Result = { ok: boolean; ms: number };

const PROBES: Probe[] = [
  { key: "volc", group: "api", label: "GET /api/v1/volcanoes", url: "/api/v1/volcanoes", kind: "fetch" },
  { key: "risk", group: "api", label: "GET /api/v1/volcanoes/semeru/risk", url: "/api/v1/volcanoes/semeru/risk", kind: "fetch" },
  { key: "vill", group: "api", label: "GET /api/v1/villages/priority", url: "/api/v1/villages/priority", kind: "fetch" },
  { key: "price", group: "api", label: "GET /api/v1/prices", url: "/api/v1/prices", kind: "fetch" },
  { key: "sat", group: "map", label: "Sentinel-2 cloudless · EOX", url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/6/33/53.jpg", kind: "img" },
  { key: "dem", group: "map", label: "Terrarium DEM · AWS", url: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/6/53/33.png", kind: "img" },
  { key: "base", group: "map", label: "Dark Gray Canvas · Esri", url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/6/33/53", kind: "img" },
];
const BARS = 30;

function probe(c: Probe): Promise<Result> {
  const t0 = performance.now();
  const done = (ok: boolean) => ({ ok, ms: Math.round(performance.now() - t0) });
  if (c.kind === "fetch") return fetch(c.url, { cache: "no-store" }).then((r) => done(r.ok)).catch(() => done(false));
  return new Promise((res) => {
    const img = new Image();
    const timer = setTimeout(() => res(done(false)), 8000);
    img.onload = () => { clearTimeout(timer); res(done(true)); };
    img.onerror = () => { clearTimeout(timer); res(done(false)); };
    img.src = `${c.url}?_=${Date.now()}`;
  });
}

export function StatusPage() {
  const { t } = useT();
  const [hist, setHist] = useState<Record<string, Result[]>>({});
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const run = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const res = await Promise.all(PROBES.map(probe));
    setHist((h) => {
      const n = { ...h };
      PROBES.forEach((c, i) => { n[c.key] = [...(h[c.key] ?? []), res[i]].slice(-BARS); });
      return n;
    });
    busyRef.current = false;
    setBusy(false);
  }, []);
  useEffect(() => {
    const first = setTimeout(run, 0);
    const id = setInterval(run, 30000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [run]);

  const latest = PROBES.map((c) => hist[c.key]?.at(-1)).filter((r): r is Result => !!r);
  const down = latest.filter((r) => !r.ok).length;
  const overall = latest.length < PROBES.length ? "checking" : down === 0 ? "ok" : down <= 2 ? "partial" : "down";
  const banner = {
    checking: { c: "bg-sand text-muted", l: t("Memeriksa layanan…", "Checking services…") },
    ok: { c: "bg-leaf/12 text-leaf", l: t("Semua sistem berjalan normal", "All systems operational") },
    partial: { c: "bg-[#f5b544]/15 text-[#9a5b00]", l: t("Sebagian layanan terganggu", "Partial disruption") },
    down: { c: "bg-crimson/10 text-crimson", l: t("Gangguan besar", "Major outage") },
  }[overall];

  const group = (g: Probe["group"], title: string, Icon: typeof Server) => (
    <div className="card overflow-hidden">
      <p className="flex items-center gap-2 border-b border-line px-5 py-3.5 text-[14px] font-semibold text-wine"><Icon className="h-4 w-4 text-maroon" /> {title}</p>
      <ul className="divide-y divide-line">
        {PROBES.filter((c) => c.group === g).map((c) => {
          const h = hist[c.key] ?? [];
          const r = h.at(-1);
          return (
            <li key={c.key} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <p className="truncate font-mono text-[12.5px] text-ink">{c.label}</p>
                <div className="mt-2 flex h-6 items-end gap-[3px]" aria-hidden>
                  {Array.from({ length: BARS }, (_, i) => {
                    const x = h[i - (BARS - h.length)];
                    return <span key={i} className={cn("w-[5px] rounded-sm", !x ? "h-2 bg-line" : x.ok ? "bg-leaf/70" : "bg-crimson")} style={x ? { height: `${Math.max(25, Math.min(100, x.ms / 12))}%` } : undefined} />;
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3 text-[12.5px] sm:justify-end">
                <span className="tabular text-muted">{r ? `${r.ms} ms` : "—"}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", !r ? "bg-sand text-muted" : r.ok ? "bg-leaf/12 text-leaf" : "bg-crimson/10 text-crimson")}>{!r ? "…" : r.ok ? t("Normal", "Up") : t("Gagal", "Down")}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      <PageHero kicker={t("Status sistem", "System status")} title={t("Status layanan, diperiksa langsung dari browser Anda.", "Service status, checked live from your browser.")} sub={t("Halaman ini benar-benar memanggil API dan server peta setiap 30 detik. Tidak ada angka uptime karangan.", "This page really calls our API and map servers every 30 seconds. No made-up uptime numbers.")} crumbs={[{ label: "Status" }]} />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4", banner.c)}>
          <p className="flex items-center gap-2 text-[15px] font-semibold"><span className={cn("h-2.5 w-2.5 rounded-full bg-current", overall === "checking" && "animate-pulse")} /> {banner.l}</p>
          <button onClick={run} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-paper/70 px-3 py-1.5 text-[12.5px] text-wine ring-1 ring-line disabled:opacity-60">
            <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} /> {t("Periksa ulang", "Re-check")}
          </button>
        </div>
        <div className="mt-6 grid gap-5">
          {group("api", "MarketShield API", Server)}
          {group("map", t("Penyedia peta (pihak ketiga)", "Map providers (third party)"), MapIcon)}
        </div>
        <p className="mt-3 text-[12px] text-muted">{t("Tinggi batang = waktu respons. Riwayat hanya untuk sesi ini.", "Bar height = response time. History covers this session only.")}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-wine"><Clock className="h-4 w-4 text-maroon" /> {t("Riwayat insiden", "Incident history")}</p>
            <p className="mt-2 text-[13.5px] text-muted">{t("Belum ada insiden tercatat sejak rilis 1.0.0.", "No incidents recorded since release 1.0.0.")}</p>
          </div>
          <div className="card p-5">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-wine"><Sparkles className="h-4 w-4 text-maroon" /> {t("Catatan", "Note")}</p>
            <p className="mt-2 text-[13.5px] text-muted">{t("Status level gunung api berasal dari PVMBG. Jika MarketShield tidak dapat diakses, ikuti magma.esdm.go.id dan arahan BPBD.", "Volcano levels come from PVMBG. If MarketShield is unreachable, follow magma.esdm.go.id and BPBD instructions.")}</p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────────── /changelog ───────────────────────────── */

export function ChangelogPage() {
  const { t } = useT();
  const releases: { v: string; d: string; tag?: string; groups: { h: string; items: string[] }[] }[] = [
    {
      v: "1.0.0",
      d: t("31 Oktober 2026", "31 October 2026"),
      tag: t("Terbaru", "Latest"),
      groups: [
        { h: t("Aplikasi warga", "Resident app"), items: [t("Peta asli (topo & satelit) menggantikan gambar statis", "Real topo & satellite map replaces static images"), t("APK arm64 & armv7 dengan checksum SHA-256", "arm64 & armv7 APKs with SHA-256 checksums"), t("Foto berlisensi terbuka menggantikan ilustrasi AI", "Openly licensed photos replace AI illustrations")] },
        { h: "Web console", items: [t("Tur pengenalan interaktif untuk operator baru", "Interactive onboarding tour for new operators"), t("Simulasi erupsi 3D: kolom abu, lontaran, awan panas", "3D eruption simulation: ash column, ejecta, pyroclastic flow"), t("Dampak regional per kota: AQI, harga N95 & air, bandara", "Regional per-city impact: AQI, N95 & water prices, airports")] },
        { h: t("Situs", "Website"), items: [t("Halaman unduh, harga, pers, keamanan & status", "Download, pricing, press, security & status pages"), t("Mode gelap dan Bahasa Inggris", "Dark mode and English")] },
      ],
    },
    {
      v: "0.1.0",
      d: t("Oktober 2026", "October 2026"),
      groups: [{ h: t("Prototipe", "Prototype"), items: [t("Proposal konsep INCEPTION 2026", "INCEPTION 2026 concept proposal"), t("Desain awal aplikasi warga & web console", "First resident app & console designs")] }],
    },
  ];
  return (
    <>
      <PageHero kicker={t("Catatan rilis", "Changelog")} title={t("Apa yang baru di MarketShield", "What's new in MarketShield")} crumbs={[{ label: t("Catatan rilis", "Changelog") }]}>
        <StoreBadges dark className="mt-8" />
      </PageHero>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ol className="space-y-14">
          {releases.map((r) => (
            <li key={r.v} className="grid gap-6 sm:grid-cols-[160px_1fr]">
              <div className="sm:sticky sm:top-24 sm:self-start">
                <p className="font-display text-[26px] font-semibold tracking-tight text-wine">v{r.v}</p>
                <p className="text-[13px] text-muted">{r.d}</p>
                {r.tag && <span className="mt-2 inline-block rounded-full bg-ember/15 px-2 py-0.5 text-[11px] font-medium text-[#b4500f]">{r.tag}</span>}
              </div>
              <div className="space-y-4">
                {r.groups.map((g) => (
                  <div key={g.h} className="card p-5">
                    <p className="text-[14px] font-semibold text-wine">{g.h}</p>
                    <ul className="mt-3 space-y-2 text-[14px] text-ink/85">
                      {g.items.map((i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" /> {i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
