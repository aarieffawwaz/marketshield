import Image from "next/image";
import { cn } from "@/lib/utils";

/** MarketShield logo mark (shield + volcano). Size it with h-/w- classes; it is square. */
export function Mark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/marketshield-mark-512.png"
      alt=""
      aria-hidden
      width={96}
      height={96}
      draggable={false}
      className={cn("h-9 w-9 shrink-0 select-none object-contain", className)}
    />
  );
}

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark />
      <span className={cn("font-display text-[17px] font-semibold tracking-tight", dark ? "text-bone" : "text-wine")}>MarketShield</span>
    </span>
  );
}
