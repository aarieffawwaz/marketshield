"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/brand";
import { BrandIcon } from "@/components/ui/brand-icons";
import { StoreBadges } from "@/components/ui/store-badges";
import { LangToggle } from "@/components/ui/lang-toggle";
import { SOCIALS } from "@/lib/site";
import { useT } from "@/lib/store";

/** Live ping of our own API so the footer status dot is real, not decorative */
function useApiStatus() {
  const [s, setS] = useState<"checking" | "ok" | "down">("checking");
  useEffect(() => {
    const ctl = new AbortController();
    fetch("/api/v1/volcanoes", { signal: ctl.signal, cache: "no-store" })
      .then((r) => setS(r.ok ? "ok" : "down"))
      .catch((e) => { if (e.name !== "AbortError") setS("down"); });
    return () => ctl.abort();
  }, []);
  return s;
}

export function SiteFooter() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const status = useApiStatus();
  const cols = [
    {
      h: t("Produk", "Product"),
      links: [
        ["/fitur", t("Fitur", "Features")],
        ["/mobile", t("Aplikasi warga", "Resident app")],
        ["/app", "Web console"],
        ["/download", t("Unduh APK", "Download APK")],
        ["/harga", t("Harga", "Pricing")],
      ],
    },
    {
      h: t("Solusi", "Solutions"),
      links: [
        ["/fitur#pemda", t("Pemda & BPBD", "Local gov & BPBD")],
        ["/fitur#desa", t("Desa & posko", "Villages & posts")],
        ["/fitur#apotek", t("Apotek & distributor", "Pharmacies")],
        ["/fitur#logistik", t("Logistik", "Logistics")],
        ["/fitur#pertanian", t("Pertanian", "Farming")],
      ],
    },
    {
      h: t("Sumber daya", "Resources"),
      links: [
        ["/docs", t("Dokumentasi", "Docs")],
        ["/docs#api", "API"],
        ["/blog", "Blog"],
        ["/bantuan", t("Pusat bantuan", "Help centre")],
        ["/changelog", t("Catatan rilis", "Changelog")],
      ],
    },
    {
      h: t("Perusahaan", "Company"),
      links: [
        ["/tentang", t("Tentang kami", "About us")],
        ["/tentang#karier", t("Karier & relawan", "Careers & volunteers")],
        ["/pers", t("Pers & media", "Press & media")],
        ["/kemitraan", t("Kemitraan", "Partnerships")],
        ["/bantuan#kontak", t("Kontak", "Contact")],
      ],
    },
    {
      h: t("Kepercayaan", "Trust"),
      links: [
        ["/keamanan", t("Keamanan & kepatuhan", "Security & compliance")],
        ["/status", t("Status sistem", "System status")],
        ["/privasi", t("Kebijakan privasi", "Privacy policy")],
        ["/syarat", t("Syarat & ketentuan", "Terms of service")],
        ["/privasi#cookie", t("Cookie", "Cookies")],
        ["/kredit", t("Kredit foto & data", "Photo & data credits")],
      ],
    },
  ];
  return (
    <footer className="bg-night text-bone">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-[22px] font-semibold tracking-tight">{t("Siaga sebelum abu turun.", "Ready before the ash falls.")}</p>
            <p className="mt-1 text-[13.5px] text-bone/55">{t("Gratis untuk warga. Android tersedia sekarang, iOS & Play Store menyusul.", "Free for residents. Android available now, iOS & Play Store coming.")}</p>
          </div>
          <StoreBadges dark />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2.4fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-bone/55">
              {t("Peringatan dini erupsi berbasis satelit untuk warga, pasar dan posko di sekitar gunung api aktif Indonesia.", "Satellite-based eruption early warning for residents, markets and aid posts around Indonesia's active volcanoes.")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (/\S+@\S+\.\S+/.test(email)) setSent(true);
              }}
              className="mt-6 max-w-sm"
            >
              <p className="text-[13px] font-medium">{t("Buletin bulanan", "Monthly bulletin")}</p>
              <p className="mt-1 text-[12.5px] text-bone/50">{t("Ringkasan aktivitas gunung api dan pembaruan produk.", "Volcano activity digest and product updates.")}</p>
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.p key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-[13px] text-bone ring-1 ring-white/10">
                    <Check className="h-4 w-4 text-ember" /> {t("Terima kasih! Cek kotak masuk untuk konfirmasi.", "Thanks! Check your inbox to confirm.")}
                  </motion.p>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0, y: -6 }} className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 p-1 ring-1 ring-white/10 focus-within:ring-ember/60">
                    <Mail className="ml-2 h-4 w-4 text-bone/40" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@instansi.go.id" className="min-w-0 flex-1 bg-transparent py-2 text-[13px] outline-none placeholder:text-bone/30" aria-label="Email" />
                    <button className="inline-flex items-center gap-1 rounded-lg btn-shine shine-bone bg-bone px-3 py-2 text-[12.5px] font-medium text-night">{t("Daftar", "Subscribe")} <ArrowRight className="h-3.5 w-3.5" /></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            <div className="mt-7">
              <p className="text-[13px] font-medium">{t("Ikuti kami", "Follow us")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SOCIALS.map((so) => (
                  <li key={so.name}>
                    {so.href ? (
                      <a href={so.href} target="_blank" rel="noreferrer" aria-label={`${so.label} ${so.handle}`} title={`${so.label} · ${so.handle}`} className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-bone/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-bone">
                        <BrandIcon name={so.name} className="h-4 w-4" />
                      </a>
                    ) : (
                      <span aria-label={`${so.label} (${t("segera", "soon")})`} title={`${so.label} · ${so.handle} · ${t("segera aktif", "coming soon")}`} className="grid h-9 w-9 cursor-default place-items-center rounded-full bg-white/5 text-bone/35 ring-1 ring-white/10">
                        <BrandIcon name={so.name} className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {cols.map((c) => (
              <div key={c.h}>
                <p className="label text-bone/40">{c.h}</p>
                <ul className="mt-4 space-y-2.5 text-[13.5px] text-bone/70">
                  {c.links.map(([href, label]) => (
                    <li key={href + label}><Link href={href} className="transition hover:text-bone">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
          <Link href="/status" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[12px] text-bone/70 ring-1 ring-white/10 transition hover:text-bone">
            <span className={`h-2 w-2 rounded-full ${status === "ok" ? "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/70" : status === "down" ? "bg-ember" : "animate-pulse bg-bone/40"}`} />
            {status === "ok" ? t("API berjalan normal", "API operational") : status === "down" ? t("Gangguan terdeteksi", "Issue detected") : t("Memeriksa status…", "Checking status…")}
          </Link>
          {[t("Selaras UU PDP 27/2022", "Aligned with PDP Law 27/2022"), t("Data level dari PVMBG", "Levels from PVMBG"), "HTTPS · HSTS"].map((b) => (
            <Link key={b} href="/keamanan" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-bone/55 ring-1 ring-white/10 transition hover:text-bone">
              <ShieldCheck className="h-3.5 w-3.5 text-ember" /> {b}
            </Link>
          ))}
          <div className="ml-auto"><LangToggle dark /></div>
        </div>
        <div className="mt-6 grid gap-4 text-[12px] text-bone/40 lg:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <p>© 2026 MarketShield · BRAIN – Ayam Jago · BINUS University · INCEPTION 2026</p>
            <p>
              {t("Model 3D", "3D models")}: <a href="https://huggingface.co/datasets/nvidia/simready-assets" className="underline decoration-white/20 hover:text-bone/70">NVIDIA SimReady Assets</a> (<a href="/models/LICENSE-nvidia-simready.txt" className="underline decoration-white/20 hover:text-bone/70">CC BY 4.0</a>) · {t("Peta", "Map data")}: Natural Earth · {t("Data satelit", "Satellite data")}: Google Earth Engine
            </p>
          </div>
          <p className="max-w-md lg:text-right">{t("Status level mengikuti PVMBG. Prakiraan MarketShield melengkapi, tidak menggantikan, informasi resmi.", "Levels follow PVMBG. MarketShield forecasts complement, never replace, official information.")}</p>
        </div>
      </div>
    </footer>
  );
}
