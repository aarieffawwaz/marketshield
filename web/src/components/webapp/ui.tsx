"use client";

import { cn } from "@/lib/utils";
import { LEVELS, type Level } from "@/lib/data";

export function Card({ children, className, title, action, sub, ...rest }: { children: React.ReactNode; className?: string; title?: React.ReactNode; action?: React.ReactNode; sub?: React.ReactNode; "data-tour"?: string }) {
  return (
    <section className={cn("card p-5", className)} {...rest}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-[15px] font-semibold text-wine">{title}</h2>}
            {sub && <p className="mt-0.5 text-[12px] text-muted">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function SatTag({ children }: { children: React.ReactNode }) {
  return <span className="label inline-flex items-center gap-1 rounded-md bg-[#e1eaf3] px-1.5 py-0.5 !text-[9.5px] !tracking-[0.08em] text-sat">{children}</span>;
}

export function LevelChip({ level, label }: { level: Level; label: string }) {
  const L = LEVELS[level];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: L.soft, color: L.color }}>
      <span className="h-2 w-2 rounded-full" style={{ background: L.color }} />
      Level {L.roman} · {label}
    </span>
  );
}

export function Badge({ color, soft, children }: { color: string; soft: string; children: React.ReactNode }) {
  return (
    <span className="label inline-flex items-center rounded-md px-2 py-0.5 !text-[10px] !tracking-[0.06em] font-semibold" style={{ background: soft, color }}>
      {children}
    </span>
  );
}

export function Bar({ value, color = "#7b1e26", className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sand-2", className)}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(2, Math.min(100, value * 100))}%`, background: color }} />
    </div>
  );
}
