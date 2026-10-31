"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Download } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { useT } from "@/lib/store";

/** "Show QR" disclosure: the APK pill expands into a scannable card */
export function QrButton() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] text-bone/80 ring-1 ring-white/15 transition hover:bg-white/5">
        <Download className="h-3.5 w-3.5" /> APK
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -10, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.6, y: -10, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="absolute right-0 top-12 w-60 origin-top-right rounded-2xl btn-shine shine-bone bg-bone p-4 text-night shadow-2xl"
          >
            <div className="rounded-xl bg-white p-2">
              <Image src="/qr-download.svg" alt={t("Kode QR unduh APK", "QR code to download the APK")} width={208} height={208} unoptimized className="h-auto w-full" />
            </div>
            <p className="mt-3 text-[13px] font-medium">{t("Pindai dengan Android", "Scan with Android")}</p>
            <Link href="/download" className="mt-2 inline-flex text-[12.5px] font-medium text-maroon">{t("Atau buka halaman unduh →", "Or open the download page →")}</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Nav({ solid }: { solid?: boolean }) {
  return <SiteHeader solid={solid} />;
}
