"use client";

import Image from "next/image";
import Link from "next/link";
import { StoreBadges } from "@/components/ui/store-badges";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, ChevronDown, Cpu, Download, Languages, MonitorSmartphone, ShieldCheck, Smartphone, WifiOff } from "lucide-react";
import { PageShell } from "@/components/site/page";
import { CopyButton } from "@/components/ui/interactions";
import { APK } from "@/lib/data";
import { useLatestRelease } from "@/lib/release";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

const SHOTS = [
  { s: "05_home3a", id: "Beranda adaptif", en: "Adaptive home" },
  { s: "07_map2", id: "Peta bahaya", en: "Hazard map" },
  { s: "08_volc", id: "Detail gunung", en: "Volcano detail" },
  { s: "11_intel", id: "Cek hoaks", en: "Hoax check" },
  { s: "13_het", id: "Harga HET", en: "Price cap" },
  { s: "16_aid_a", id: "Prioritas bantuan", en: "Aid priority" },
];

function PhoneShot({ src, className }: { src: string; className?: string }) {
  return (
    <div className={cn("rounded-[2.2rem] bg-[#141012] p-[9px] shadow-2xl ring-1 ring-white/10", className)}>
      <div className="relative aspect-[1080/2424] overflow-hidden rounded-[1.7rem] bg-[#fff8f3]">
        <Image src={`/screens/${src}.webp`} alt="" fill sizes="280px" className="object-cover object-top" />
      </div>
    </div>
  );
}

export function DownloadPage() {
  const { t, tx } = useT();
  const [open, setOpen] = useState<number | null>(0);
  const rel = useLatestRelease();
  const steps = [
    { h: t("Unduh APK", "Download the APK"), p: t("Ketuk tombol unduh di ponsel Android. Ukurannya sekitar 20 MB.", "Tap download on your Android phone. It's about 20 MB.") },
    { h: t("Izinkan pemasangan", "Allow the install"), p: t("Jika diminta, aktifkan “Instal aplikasi tidak dikenal” untuk browser Anda.", "If asked, enable “Install unknown apps” for your browser.") },
    { h: t("Buka & pilih bahasa", "Open & pick a language"), p: t("Pilih bahasa dan peran. Beranda langsung menyesuaikan level gunung terdekat.", "Pick a language and role. Home adapts to the nearest volcano's level.") },
  ];
  const faqs = [
    { q: t("Apakah APK ini aman?", "Is this APK safe?"), a: t("APK dibangun langsung dari kode MarketShield. Cocokkan SHA-256 di bawah dengan file yang Anda unduh untuk memastikan file tidak diubah.", "The APK is built straight from the MarketShield source. Match the SHA-256 below with your download to make sure it wasn't altered.") },
    { q: t("Kenapa tidak lewat Play Store?", "Why not the Play Store?"), a: t("Rilis Play Store sedang disiapkan. Untuk sementara APK langsung memudahkan uji coba di lapangan.", "A Play Store release is being prepared. Meanwhile, the direct APK makes field pilots easy.") },
    { q: t("Ponsel saya iPhone", "I have an iPhone"), a: t("Buka versi web dari Safari. Semua fitur warga bisa dipakai dari browser.", "Open the web version in Safari. Every resident feature works in the browser.") },
  ];
  return (
    <PageShell>
      <section className="noise relative overflow-hidden bg-night text-bone">
        <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_75%_45%,rgba(123,30,38,0.6),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="label flex items-center gap-2 text-ember"><Smartphone className="h-3.5 w-3.5" /> Android · v{rel.version}</p>
            <h1 className="mt-4 font-display text-[clamp(2.2rem,5.4vw,4rem)] font-semibold leading-[1.03] tracking-[-0.035em]">{t("Peringatan dini erupsi, di saku Anda.", "Eruption early warning, in your pocket.")}</h1>
            <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-bone/65">{t("Ringan untuk sinyal lemah di lereng gunung. Bahasa Indonesia & Inggris. Gratis untuk warga, tanpa iklan.", "Light enough for weak signal on the slopes. Indonesian & English. Free for residents, no ads.")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={rel.arm64.url} className="btn-shine shine-bone group inline-flex items-center gap-3 rounded-2xl bg-bone py-3 pl-3 pr-5 text-night">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon text-white"><Download className="h-5 w-5" /></span>
                <span className="text-left leading-tight"><span className="block text-[15px] font-semibold">{t("Unduh APK", "Download APK")}</span><span className="block text-[12px] text-night/60">arm64 · {rel.arm64.size}</span></span>
              </a>
              <Link href="/mobile" className="inline-flex items-center gap-2 rounded-2xl px-5 py-4 text-[14px] text-bone ring-1 ring-white/20 transition hover:bg-white/5"><MonitorSmartphone className="h-4 w-4" /> {t("Coba di browser", "Try in the browser")}</Link>
            </div>
            <StoreBadges dark apk={false} className="mt-5" />
            <a href={rel.armv7.url} className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-bone/55 underline decoration-white/20 underline-offset-4 hover:text-bone"><Cpu className="h-3.5 w-3.5" /> {t("Ponsel lama 32-bit (armeabi-v7a", "Older 32-bit phones (armeabi-v7a")} · {rel.armv7.size})</a>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              {[[Smartphone, APK.minAndroid], [WifiOff, t("Bisa offline", "Works offline")], [Languages, "ID · EN"]].map(([I, l]) => {
                const Icon = I as typeof Smartphone;
                return <div key={l as string} className="flex items-center gap-2 bg-night/70 px-4 py-3 text-[12.5px] text-bone/75"><Icon className="h-4 w-4 text-ember" /> {l as string}</div>;
              })}
            </div>
          </div>
          <div className="relative mx-auto flex h-[520px] w-full max-w-[460px] items-center justify-center">
            <motion.div initial={{ opacity: 0, x: -30, rotate: -8 }} animate={{ opacity: 1, x: 0, rotate: -8 }} transition={{ duration: 0.8, delay: 0.15 }} className="absolute left-0 top-16 w-[190px] opacity-80"><PhoneShot src="07_map2" /></motion.div>
            <motion.div initial={{ opacity: 0, x: 30, rotate: 8 }} animate={{ opacity: 1, x: 0, rotate: 8 }} transition={{ duration: 0.8, delay: 0.25 }} className="absolute right-0 top-16 w-[190px] opacity-80"><PhoneShot src="11_intel" /></motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-[230px]"><PhoneShot src="05_home3a" /></motion.div>
            <div className="absolute -bottom-2 right-2 z-20 hidden items-center gap-3 rounded-2xl bg-bone p-3 text-night shadow-2xl sm:flex">
              <span className="rounded-lg bg-white p-1"><Image src="/qr-download.svg" alt={t("Kode QR unduh APK", "QR code to download the APK")} width={72} height={72} unoptimized /></span>
              <span className="max-w-[120px] text-[12px] leading-snug"><b>{t("Pindai di HP", "Scan on your phone")}</b><br />{t("untuk langsung unduh", "to download right away")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="tex-dots bg-cream py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="label text-maroon/70">{t("Cara memasang", "How to install")}</p>
            <h2 className="mt-3 font-display text-[30px] font-semibold tracking-tight text-wine">{t("Tiga langkah, dua menit.", "Three steps, two minutes.")}</h2>
            <ol className="relative mt-8 space-y-6 border-l border-line-strong pl-8">
              {steps.map((s, i) => (
                <li key={s.h} className="relative">
                  <span className="absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full bg-maroon font-mono text-[12px] font-semibold text-white ring-4 ring-cream">{i + 1}</span>
                  <p className="font-display text-[17px] font-semibold text-wine">{s.h}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{s.p}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <div className="glass-card p-5">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-wine"><ShieldCheck className="h-4 w-4 text-leaf" /> {t("Verifikasi file (SHA-256)", "Verify the file (SHA-256)")}</p>
              {[["arm64-v8a", rel.arm64.sha], ["armeabi-v7a", rel.armv7.sha]].map(([k, v]) => (
                <div key={k} className="mt-3 flex items-center gap-3 rounded-xl bg-sand p-3">
                  <div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium text-muted">{k}</p><p className="truncate font-mono text-[11.5px] text-ink">{v}</p></div>
                  <CopyButton text={v} label={t("Salin", "Copy")} doneLabel={t("Tersalin", "Copied")} />
                </div>
              ))}
            </div>
            <ul className="space-y-2">
              {faqs.map((f, i) => (
                <li key={f.q} className="card overflow-hidden">
                  <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-3 p-4 text-left text-[14.5px] font-medium text-wine">
                    <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-maroon" /> {f.q}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open === i && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.p initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden px-4 text-[13.5px] leading-relaxed text-muted"><span className="block pb-4">{f.a}</span></motion.p>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="tex-topo-b bg-sand py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="label text-maroon/70">{t("Di dalam aplikasi", "Inside the app")}</p>
          <h2 className="mt-3 font-display text-[30px] font-semibold tracking-tight text-wine">{t("Semua yang perlu warga, dalam satu aplikasi.", "Everything residents need, in one app.")}</h2>
          <div className="mt-10 flex snap-x gap-6 overflow-x-auto pb-6 [scrollbar-width:thin]">
            {SHOTS.map((x, i) => (
              <motion.figure key={x.s} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="w-[220px] shrink-0 snap-start">
                <PhoneShot src={x.s} />
                <figcaption className="mt-4 text-center text-[13.5px] font-medium text-wine">{tx({ id: x.id, en: x.en })}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
