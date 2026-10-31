"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Play, BookOpen, Building2, ChevronDown, Code2, Download, HeartHandshake, LifeBuoy, Menu, Monitor, Newspaper, Pill, Smartphone, Sprout, Tent, Truck, Mountain, X, Layers, Users, Megaphone, ShieldCheck, Activity } from "lucide-react";
import { Logo } from "@/components/ui/brand";
import Image from "next/image";
import { LangToggle, ThemeToggle } from "@/components/ui/lang-toggle";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

type Item = { href: string; icon: typeof Monitor; title: string; desc: string };

export function SiteHeader({ solid }: { solid?: boolean }) {
  const { t } = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const groups: { key: string; label: string; items: Item[]; wide?: boolean }[] = [
    {
      key: "produk",
      label: t("Produk", "Product"),
      items: [
        { href: "/mobile", icon: Smartphone, title: t("Aplikasi warga", "Resident app"), desc: t("Beranda adaptif, evakuasi, cek hoaks", "Adaptive home, evacuation, hoax check") },
        { href: "/app", icon: Monitor, title: "Web console", desc: t("Untuk BPBD, posko dan donatur", "For BPBD, aid posts and donors") },
        { href: "/docs#api", icon: Code2, title: t("API data satelit", "Satellite data API"), desc: t("Indikator GEE per gunung & desa", "GEE indicators per volcano & village") },
        { href: "/fitur", icon: Layers, title: t("Semua fitur", "All features"), desc: t("Daftar lengkap kemampuan", "Full capability list") },
      ],
    },
    {
      key: "solusi",
      label: t("Solusi", "Solutions"),
      wide: true,
      items: [
        { href: "/fitur#pemda", icon: Building2, title: t("Pemda & BPBD", "Local gov & BPBD"), desc: t("Pusdalops, siaran, prioritas bantuan", "Ops centre, broadcasts, aid priority") },
        { href: "/fitur#desa", icon: Tent, title: t("Desa & posko", "Villages & aid posts"), desc: t("Stok posko dan kebutuhan warga", "Post stock and resident needs") },
        { href: "/fitur#apotek", icon: Pill, title: t("Apotek & distributor", "Pharmacies & distributors"), desc: t("Bukti harga wajar sesuai HET", "Proof of fair pricing") },
        { href: "/fitur#logistik", icon: Truck, title: t("Logistik", "Logistics"), desc: t("Status koridor & depot cadangan", "Corridor status & backup depots") },
        { href: "/fitur#pertanian", icon: Sprout, title: t("Pertanian & peternakan", "Farming & livestock"), desc: t("Panen dini, lindungi ternak", "Early harvest, protect livestock") },
        { href: "/fitur#pariwisata", icon: Mountain, title: t("Pariwisata", "Tourism"), desc: t("Zona tutup & skrip tamu", "Closed zones & guest scripts") },
      ],
    },
    {
      key: "sumber",
      label: t("Sumber daya", "Resources"),
      items: [
        { href: "/docs", icon: BookOpen, title: t("Dokumentasi", "Documentation"), desc: t("Konsep, data, API & webhook", "Concepts, data, API & webhooks") },
        { href: "/blog", icon: Newspaper, title: "Blog", desc: t("Riset satelit & kesiapsiagaan", "Satellite research & preparedness") },
        { href: "/bantuan", icon: LifeBuoy, title: t("Pusat bantuan", "Help centre"), desc: t("Panduan & kontak dukungan", "Guides & support contact") },
        { href: "/kemitraan", icon: HeartHandshake, title: t("Kemitraan", "Partnerships"), desc: t("Pemda, NGO, ritel, telco", "Gov, NGOs, retail, telcos") },
        { href: "/tentang", icon: Users, title: t("Tentang kami", "About us"), desc: t("Misi, tim & karier", "Mission, team & careers") },
        { href: "/pers", icon: Megaphone, title: t("Pers & media", "Press & media"), desc: t("Kit media, logo & fakta", "Media kit, logo & facts") },
        { href: "/keamanan", icon: ShieldCheck, title: t("Keamanan", "Security"), desc: t("Kepatuhan & pelaporan celah", "Compliance & disclosure") },
        { href: "/status", icon: Activity, title: t("Status sistem", "System status"), desc: t("Cek langsung API & peta", "Live API & map checks") },
      ],
    },
  ];

  const dark = solid || scrolled || open || menu;
  const enter = (k: string) => {
    window.clearTimeout(closeTimer.current);
    setMenu(k);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setMenu(null), 120);
  };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-colors duration-300", dark ? "bg-night/90 backdrop-blur-xl" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="MarketShield">
          <Logo dark />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={leave}>
          {groups.map((g) => (
            <div key={g.key} className="relative" onMouseEnter={() => enter(g.key)}>
              <button onClick={() => setMenu(menu === g.key ? null : g.key)} aria-expanded={menu === g.key} className={cn("flex items-center gap-1 rounded-full px-3 py-2 text-[13px] transition", menu === g.key ? "text-bone" : "text-bone/70 hover:text-bone")}>
                {g.label} <ChevronDown className={cn("h-3.5 w-3.5 transition", menu === g.key && "rotate-180")} />
              </button>
              <AnimatePresence>
                {menu === g.key && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className={cn("absolute left-1/2 top-11 -translate-x-1/2 rounded-2xl bg-surface p-2 text-ink shadow-2xl ring-1 ring-black/5", g.wide ? "grid w-[560px] grid-cols-2" : "w-[320px]")}
                  >
                    {g.items.map((it) => (
                      <Link key={it.href} href={it.href} onClick={() => setMenu(null)} className="flex gap-3 rounded-xl p-3 transition hover:bg-sand">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-peach/70 text-maroon">
                          <it.icon className="h-4.5 w-4.5" />
                        </span>
                        <span>
                          <span className="block text-[13.5px] font-semibold text-wine">{it.title}</span>
                          <span className="block text-[12px] leading-snug text-muted">{it.desc}</span>
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <Link href="/harga" className="rounded-full px-3 py-2 text-[13px] text-bone/70 transition hover:text-bone">{t("Harga", "Pricing")}</Link>
          <Link href="/kemitraan" className="rounded-full px-3 py-2 text-[13px] text-bone/70 transition hover:text-bone">{t("Kemitraan", "Partners")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle dark />
          <ThemeToggle dark />
          <TryApp />
          <button className="rounded-full p-2 text-bone lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/10 lg:hidden">
            <div className="max-h-[75vh] overflow-y-auto px-4 pb-6 pt-2">
              {groups.map((g) => (
                <div key={g.key} className="border-b border-white/10 py-3">
                  <p className="label text-bone/40">{g.label}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {g.items.map((it) => (
                      <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg py-2 text-[14px] text-bone/85">
                        <it.icon className="h-4 w-4 text-ember" /> {it.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-4 py-3 text-[14px] text-bone/85">
                <Link href="/harga" onClick={() => setOpen(false)}>{t("Harga", "Pricing")}</Link>
                <Link href="/kemitraan" onClick={() => setOpen(false)}>{t("Kemitraan", "Partners")}</Link>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/app" className="rounded-full btn-shine shine-bone bg-bone py-3 text-center text-sm font-medium text-night">Web console</Link>
                <Link href="/download" className="rounded-full py-3 text-center text-sm text-bone ring-1 ring-white/20">{t("Unduh APK", "Get the APK")}</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** "Try the app" chooser: web console, resident app in the browser, or the Android APK */
function TryApp() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);
  const items = [
    { href: "/app", icon: Monitor, h: "Web console", p: t("BPBD, posko & donatur", "BPBD, aid posts & donors") },
    { href: "/mobile", icon: Smartphone, h: t("Aplikasi warga", "Resident app"), p: t("Langsung di browser", "Right in your browser") },
    { href: "/download", icon: Download, h: t("Unduh APK", "Download APK"), p: "Android · 20,8 MB" },
  ];
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" className="btn-shine shine-bone inline-flex items-center gap-2 rounded-full bg-bone py-2 pl-2 pr-3 text-[13px] font-medium text-night transition hover:bg-white">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-white"><Play className="h-2.5 w-2.5 translate-x-px fill-current" /></span>
        {t("Coba aplikasi", "Try the app")} <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="absolute right-0 top-12 w-[320px] origin-top-right rounded-3xl bg-surface p-2 text-ink shadow-2xl ring-1 ring-black/5"
          >
            {items.map((it, i) => (
              <motion.div key={it.href} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                <Link href={it.href} onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-sand">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peach text-maroon transition group-hover:bg-maroon group-hover:text-white"><it.icon className="h-[18px] w-[18px]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-wine">{it.h}</span>
                    <span className="block text-[12px] text-muted">{it.p}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-maroon" />
                </Link>
              </motion.div>
            ))}
            <div className="mx-1 mt-1 flex items-center gap-3 rounded-2xl bg-sand p-3">
              <span className="rounded-lg bg-white p-1"><Image src="/qr-download.svg" alt={t("Kode QR unduh APK", "QR code to download the APK")} width={64} height={64} unoptimized /></span>
              <span className="text-[12px] leading-snug text-muted">{t("Pindai dengan HP Android untuk langsung mengunduh APK.", "Scan with an Android phone to grab the APK.")}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
