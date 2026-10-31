"use client";

// Small interaction patterns used across the site: fluid tabs, hold-to-confirm,
// timed undo, chromatic "thinking" text, ruler picker, copy confirmation and status picker.

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;

/* ---------- Fluid tabs: a pill that glides to the active option ---------- */

export function FluidTabs<T extends string | number>({
  options,
  value,
  onChange,
  className,
  itemClassName,
  pillClassName,
  pillStyle,
  activeClassName = "text-white",
  idleClassName = "text-muted hover:text-ink",
  label,
  ...rest
}: {
  "data-tour"?: string;
  options: { value: T; label: React.ReactNode; style?: React.CSSProperties }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  itemClassName?: string;
  pillClassName?: string;
  pillStyle?: (v: T) => React.CSSProperties | undefined;
  activeClassName?: string;
  idleClassName?: string;
  label?: string;
}) {
  const id = useId();
  return (
    <div className={cn("relative flex", className)} role="tablist" aria-label={label} {...rest}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn("relative z-0 transition-colors duration-200", itemClassName, active ? activeClassName : idleClassName)}
          >
            {active && <motion.span layoutId={`pill-${id}`} transition={spring} className={cn("absolute inset-0 -z-10 rounded-full bg-maroon", pillClassName)} style={pillStyle?.(o.value)} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Hold to confirm: fill while pressed, morph to success ---------- */

export function HoldButton({
  onConfirm,
  label,
  holdLabel,
  doneLabel,
  duration = 1200,
  disabled,
  className,
  icon,
}: {
  onConfirm: () => void;
  label: string;
  holdLabel: string;
  doneLabel: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "holding" | "done">("idle");
  const raf = useRef(0);
  const start = useRef(0);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    if (state !== "done") {
      setState("idle");
      setProgress(0);
    }
  };
  const begin = () => {
    if (disabled || state === "done") return;
    setState("holding");
    start.current = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start.current) / duration);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else {
        setState("done");
        onConfirm();
        window.setTimeout(() => {
          setState("idle");
          setProgress(0);
        }, 1800);
      }
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && begin()}
      onKeyUp={stop}
      className={cn(
        "btn-shine relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-xl py-2.5 text-[13px] font-medium text-white transition disabled:opacity-40",
        state === "done" ? "bg-leaf" : "shine-maroon bg-maroon",
        className,
      )}
      aria-label={label}
    >
      <span className="absolute inset-y-0 left-0 -z-10 bg-crimson" style={{ width: `${progress * 100}%` }} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={state} initial={{ y: 12, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -12, opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.18 }} className="inline-flex items-center gap-2">
          {state === "done" ? <Check className="h-4 w-4" /> : icon}
          {state === "done" ? doneLabel : state === "holding" ? holdLabel : label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* ---------- Timed undo toast with a countdown ring ---------- */

export function UndoToast({ message, undoLabel, seconds = 5, onUndo, onDone }: { message: string; undoLabel: string; seconds?: number; onUndo: () => void; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const iv = window.setInterval(() => setLeft((l) => l - 0.1), 100);
    return () => window.clearInterval(iv);
  }, []);
  useEffect(() => {
    if (left <= 0) onDone();
  }, [left, onDone]);
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <motion.div layout initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={spring} className="flex items-center gap-3 rounded-2xl bg-night py-2.5 pl-3 pr-2.5 text-[13px] text-bone shadow-2xl" role="status">
      <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
        <circle cx="12" cy="12" r={r} stroke="rgba(255,255,255,.15)" strokeWidth="2.5" fill="none" />
        <circle cx="12" cy="12" r={r} stroke="#ea6a1f" strokeWidth="2.5" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, left) / seconds)} strokeLinecap="round" />
      </svg>
      <span>{message}</span>
      <button onClick={onUndo} className="ml-1 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-medium hover:bg-white/20">
        <RotateCcw className="h-3.5 w-3.5" /> {undoLabel}
      </button>
    </motion.div>
  );
}

/* ---------- Chromatic thinking text ---------- */

export function ChromaticText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn("animate-[chroma_1.6s_linear_infinite] bg-[length:200%_100%] bg-clip-text font-medium text-transparent", className)}
      style={{ backgroundImage: "linear-gradient(90deg,#7b1e26,#ea6a1f,#e0a100,#2f5d8a,#7b1e26)" }}
    >
      {children}
    </span>
  );
}

/* ---------- Ruler picker: drag or click ticks to pick a value ---------- */

export function RulerPicker({ value, onChange, min, max, step, format, label }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number; format: (v: number) => string; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const ticks = Math.round((max - min) / step);
  const pick = (clientX: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    onChange(min + Math.round((t * (max - min)) / step) * step);
  };
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-muted">{label}</span>
        <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-[15px] font-semibold tabular text-wine">{format(value)}</motion.span>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          pick(e.clientX);
        }}
        onPointerMove={(e) => e.buttons && pick(e.clientX)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onChange(Math.min(max, value + step));
          if (e.key === "ArrowLeft") onChange(Math.max(min, value - step));
        }}
        className="relative mt-2 h-9 cursor-ew-resize touch-none rounded-lg bg-sand outline-none ring-maroon/40 focus-visible:ring-2"
      >
        <div className="absolute inset-x-2 bottom-1 top-1 flex items-end justify-between">
          {Array.from({ length: ticks * 4 + 1 }).map((_, i) => (
            <span key={i} className={cn("w-px bg-plum/25", i % 4 === 0 ? "h-4 bg-plum/45" : "h-2")} />
          ))}
        </div>
        <motion.div className="absolute bottom-0 top-0 w-0.5 rounded-full bg-crimson" animate={{ left: `calc(0.5rem + (100% - 1rem) * ${pct / 100})` }} transition={spring}>
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-crimson" />
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Copy with confirmation morph ---------- */

export function CopyButton({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {}
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
      className={cn("inline-flex h-7 items-center gap-1.5 overflow-hidden rounded-lg px-2.5 text-[11.5px] font-medium ring-1 transition-colors", done ? "bg-leaf text-white ring-leaf" : "bg-surface text-maroon ring-line hover:bg-sand")}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={String(done)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className="inline-flex items-center gap-1.5">
          {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {done ? doneLabel : label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* ---------- Status picker: compact popover with a sliding highlight ---------- */

export function StatusPicker<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string; color: string; soft: string }[]; onChange: (v: T) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = options.find((o) => o.value === value)!;
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: cur.soft, color: cur.color }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: cur.color }} />
        {cur.label}
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={spring} className="absolute right-0 top-8 z-20 w-36 origin-top-right rounded-xl bg-surface p-1 shadow-xl ring-1 ring-line">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="relative flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px]"
                >
                  {o.value === value && <motion.span layoutId="status-hl" className="absolute inset-0 -z-0 rounded-lg" style={{ background: o.soft }} transition={spring} />}
                  <span className="relative h-2 w-2 rounded-full" style={{ background: o.color }} />
                  <span className="relative">{o.label}</span>
                  {o.value === value && <Check className="relative ml-auto h-3.5 w-3.5" style={{ color: o.color }} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
