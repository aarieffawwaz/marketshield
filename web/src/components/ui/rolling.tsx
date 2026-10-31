"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

/** Odometer-style number: each digit rolls up into place when it scrolls into view */
export function Rolling({ value, className, delay = 0 }: { value: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const chars = value.split("");
  let digitIdx = 0;
  return (
    <span ref={ref} className={cn("inline-flex overflow-hidden tabular", className)} aria-label={value}>
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} aria-hidden>{ch}</span>;
        const d = Number(ch);
        const k = digitIdx++;
        return (
          <span key={i} className="relative inline-block h-[1em] overflow-hidden leading-none" aria-hidden>
            <span className="invisible">0</span>
            <motion.span
              className="absolute left-0 top-0 flex flex-col"
              initial={{ y: "0%" }}
              animate={{ y: seen ? `-${(d + 10) * 10 / 2}%` : "0%" }}
              transition={{ duration: 1.3, delay: delay + k * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {Array.from({ length: 20 }, (_, n) => (
                <span key={n} className="block h-[1em] leading-none">{n % 10}</span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/** Children fade up one after another when the group scrolls into view */
export function Stagger({ children, className, gap = 0.07 }: { children: React.ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] } },
} as const;
