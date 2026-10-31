"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { preload } from "react-dom";
import { ArrowLeft, ArrowRight, Backpack, Download, ExternalLink, Hand, Map as MapIcon, MessageSquareWarning, RotateCcw, SlidersHorizontal, Tent } from "lucide-react";
import { Logo } from "@/components/ui/brand";
import { LangToggle, ThemeToggle } from "@/components/ui/lang-toggle";
import { APK } from "@/lib/data";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

// The Flutter app is laid out at a real phone size and the whole device is scaled,
// so the UI never squeezes into a narrow frame.
const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 15;
const FRAME_W = SCREEN_W + BEZEL * 2;
const FRAME_H = SCREEN_H + BEZEL * 2;

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
function useViewport() {
  const key = useSyncExternalStore(subscribe, () => `${window.innerWidth}x${window.innerHeight}`, () => "0x0");
  const [w, h] = key.split("x").map(Number);
  return { w, h };
}

function StatusBar() {
  return (
    <div className="flex h-[46px] items-end justify-between bg-[#fff8f3] px-7 pb-2 text-[14px] font-semibold text-[#1d1b18]" aria-hidden>
      <span className="tabular">9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .6 10.4 10.4 0 0 0 .8 3.5L2 4.8a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.3A6.6 6.6 0 0 0 8 4.2c-1.8 0-3.5.7-4.7 1.8l1.3 1.3C5.5 6.5 6.7 6 8 6Zm0 3.6c-.5 0-1 .2-1.3.6L8 11.5l1.3-1.3c-.3-.4-.8-.6-1.3-.6Z" /></svg>
        <svg width="25" height="12" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" /><path d="M24.5 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2Z" fill="currentColor" opacity="0.5" /></svg>
      </span>
    </div>
  );
}

function Device({ scale, reloadKey, frameRef }: { scale: number; reloadKey: number; frameRef: React.RefObject<HTMLIFrameElement | null> }) {
  return (
    <div className="relative shrink-0" style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
      <div className="absolute left-0 top-0 origin-top-left rounded-[60px] bg-[#141012] shadow-[0_50px_100px_-30px_rgba(53,9,21,0.55)] ring-1 ring-black/10" style={{ width: FRAME_W, height: FRAME_H, padding: BEZEL, transform: `scale(${scale})` }}>
        <span className="absolute -left-[3px] top-[170px] h-16 w-[3px] rounded-l bg-[#2a2124]" aria-hidden />
        <span className="absolute -left-[3px] top-[250px] h-16 w-[3px] rounded-l bg-[#2a2124]" aria-hidden />
        <span className="absolute -right-[3px] top-[210px] h-24 w-[3px] rounded-r bg-[#2a2124]" aria-hidden />
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[48px] bg-[#fff8f3]">
          <div className="pointer-events-none absolute left-1/2 top-[11px] z-10 h-[32px] w-[118px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
          <StatusBar />
          <iframe ref={frameRef} key={reloadKey} src="/mobile-app/index.html" title="MarketShield" className="w-full flex-1 border-0" allow="geolocation; clipboard-write" />
          <div className="flex h-[22px] items-center justify-center bg-[#fff8f3]" aria-hidden><span className="h-[5px] w-[130px] rounded-full bg-[#1d1b18]/80" /></div>
        </div>
      </div>
    </div>
  );
}

export function MobileStage() {
  const { t } = useT();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState<string | null>(null);
  // Start the heavy Flutter downloads alongside the page itself
  preload("/mobile-app/main.dart.js", { as: "script" });
  preload("/mobile-app/canvaskit/chromium/canvaskit.wasm", { as: "fetch", crossOrigin: "anonymous" });
  const jump = (screen: string) => {
    setActive(screen);
    frameRef.current?.contentWindow?.postMessage(`ms:${screen}`, window.location.origin);
  };
  const { w, h } = useViewport();
  const [reloadKey, setReloadKey] = useState(0);
  if (w === 0) return <div className="fixed inset-0 bg-cream" />;

  const phone = w < 640;
  if (phone)
    return (
      <>
        <h1 className="sr-only">{t("Aplikasi warga MarketShield", "MarketShield resident app")}</h1>
        <iframe src="/mobile-app/index.html" title="MarketShield" className="fixed inset-0 h-[100dvh] w-full border-0 bg-[#fff8f3]" allow="geolocation; clipboard-write" />
      </>
    );

  const wide = w >= 980;
  const scale = Math.max(0.42, Math.min(1, (h - 48 - (wide ? 0 : 72)) / FRAME_H, (w - 32 - (wide ? 400 : 0)) / FRAME_W));
  const tips = [
    { s: "profile", i: SlidersHorizontal, h: t("Ganti level gunung", "Change the volcano level"), p: t("Mode Simulasi di Profil, lalu lihat beranda berubah", "Simulation Mode in Profile, then watch home change") },
    { s: "intel", i: MessageSquareWarning, h: t("Cek pesan berantai", "Check a chain message"), p: t("Tempel pesan, lihat label & cek satelit", "Paste a message, see label & satellite check") },
    { s: "map", i: MapIcon, h: t("Peta bahaya", "Hazard map"), p: t("Lapisan KRB, abu dan lahar dari satelit", "KRB, ash and lahar layers from satellites") },
    { s: "kit", i: Backpack, h: "Kit Siaga", p: t("Daftar belanja dengan patokan HET", "Shopping list with price-cap anchors") },
    { s: "posko", i: Tent, h: t("Posko terdekat", "Nearest aid post"), p: t("Status buka/penuh & kebutuhan", "Open/full status & needs") },
    { s: "sos", i: Hand, h: t("Coba SOS", "Try SOS"), p: t("Tahan tombol 3 detik", "Hold the button for 3 seconds") },
  ];

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_64%_48%,var(--t-peach),transparent_60%)]" aria-hidden />
      <div className="grid-bg-light pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_64%_48%,black,transparent_70%)]" aria-hidden />
      {!wide && (
        <header className="relative flex h-[72px] shrink-0 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3"><ArrowLeft className="h-5 w-5 text-muted" /><Logo /></Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setReloadKey((k) => k + 1)} className="rounded-full p-2.5 text-muted hover:bg-sand" aria-label={t("Muat ulang aplikasi", "Restart app")}><RotateCcw className="h-4 w-4" /></button>
            <LangToggle />
          </div>
        </header>
      )}
      <main className={cn("relative flex min-h-0 flex-1 items-center justify-center", wide ? "gap-16 px-8" : "px-4 pb-5")}>
        {wide && (
          <aside className="max-h-[calc(100dvh-40px)] w-[320px] shrink-0 overflow-y-auto py-2 [scrollbar-width:none]">
            <Logo />
            <h1 className="mt-6 font-display text-[30px] font-semibold leading-tight tracking-tight text-wine">{t("Aplikasi warga", "Resident app")}</h1>
            <p className="mt-1 text-[14px] font-medium text-muted">Android · Web</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
              {t("Langkah berikutnya selalu satu ketukan. Coba langsung di sini: ketuk, geser dan gulir seperti di HP.", "The next step is always one tap away. Try it right here: tap, swipe and scroll like on a phone.")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-[13px] font-medium text-wine ring-1 ring-line hover:bg-sand"><ArrowLeft className="h-4 w-4" /> {t("Kembali ke situs", "Back to website")}</Link>
              <Link href="/app" className="btn-shine shine-maroon inline-flex items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-[13px] font-medium text-white">{t("Buka web console", "Open web console")} <ExternalLink className="h-4 w-4" /></Link>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <LangToggle />
              <ThemeToggle />
              <button onClick={() => setReloadKey((k) => k + 1)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] text-muted ring-1 ring-line hover:bg-surface"><RotateCcw className="h-3.5 w-3.5" /> {t("Muat ulang", "Restart")}</button>
            </div>
            <div className="mt-6 border-t border-line pt-4">
              <p className="label text-maroon/60">{t("Lompat ke", "Jump to")}</p>
              <ul className="mt-2 space-y-0.5">
                {tips.map((x) => (
                  <li key={x.s}>
                    <button onClick={() => jump(x.s)} className={cn("group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface", active === x.s && "bg-surface ring-1 ring-line")}>
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition", active === x.s ? "bg-maroon text-white" : "bg-peach text-maroon")}><x.i className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-semibold text-wine">{x.h}</span><span className="block truncate text-[12px] text-muted">{x.p}</span></span>
                      <ArrowRight className="h-4 w-4 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-surface p-3 ring-1 ring-line">
              <Image src="/qr-download.svg" alt={t("Kode QR unduh APK", "QR code to download the APK")} width={84} height={84} unoptimized className="rounded-lg" />
              <div>
                <p className="text-[13.5px] font-semibold text-wine">{t("Pasang di Android", "Install on Android")}</p>
                <p className="text-[12px] text-muted">APK · {APK.size}</p>
                <Link href="/download" className="btn-shine shine-maroon mt-2 inline-flex items-center gap-1.5 rounded-full bg-maroon px-3 py-1.5 text-[12px] font-medium text-white"><Download className="h-3.5 w-3.5" /> {t("Unduh", "Download")}</Link>
              </div>
            </div>
          </aside>
        )}
        <Device scale={scale} reloadKey={reloadKey} frameRef={frameRef} />
      </main>
    </div>
  );
}
