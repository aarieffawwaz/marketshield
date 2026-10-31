"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useT } from "@/lib/store";

const SECTIONS = [
  { id: "cakupan", label: { id: "Peta & simulasi", en: "Map & simulation" } },
  { id: "cara-kerja", label: { id: "Cara kerja", en: "How it works" } },
  { id: "level", label: { id: "Level siaga", en: "Alert levels" } },
  { id: "kit", label: { id: "Kit Siaga", en: "Go-kit" } },
  { id: "satelit", label: { id: "Satelit & AI", en: "Satellites & AI" } },
  { id: "produk", label: { id: "Produk", en: "Product" } },
];

/** Floating island that names the current section and shows reading progress */
export function ScrollIsland() {
  const { tx } = useT();
  const [current, setCurrent] = useState<number>(-1);
  const [progress, setProgress] = useState(0);
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    const on = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let idx = -1;
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= y) idx = i;
      });
      setCurrent(idx);
      const foot = document.querySelector("footer");
      setAtFooter(!!foot && foot.getBoundingClientRect().top < window.innerHeight - 80);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <AnimatePresence>
      {current >= 0 && !atFooter && SECTIONS[current].id !== "cakupan" && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2"
        >
          <motion.div layout className="flex items-center gap-3 rounded-full bg-night/90 py-2 pl-2.5 pr-2 text-bone shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
            <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90">
              <circle cx="11" cy="11" r={r} stroke="rgba(255,255,255,.15)" strokeWidth="2.5" fill="none" />
              <circle cx="11" cy="11" r={r} stroke="#ea6a1f" strokeWidth="2.5" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} strokeLinecap="round" />
            </svg>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={current} initial={{ y: 14, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -14, opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.22 }} className="whitespace-nowrap text-[13px] font-medium">
                {tx(SECTIONS[current].label)}
              </motion.span>
            </AnimatePresence>
            <span className="font-mono text-[11px] tabular text-bone/45">{String(current + 1).padStart(2, "0")}/{String(SECTIONS.length).padStart(2, "0")}</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Top">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
