import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-8 w-8", className)} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#7B1E26" />
      <path d="M32 12 50 19v13c0 11-7.6 18.6-18 21-10.4-2.4-18-10-18-21V19z" fill="#fff" opacity=".95" />
      <path d="M20 40 28 28l5 6 4-5 7 11z" fill="#B51A14" />
      <circle cx="37" cy="23" r="3" fill="#EA6A1F" />
    </svg>
  );
}

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark />
      <span className={cn("font-display text-[17px] font-semibold tracking-tight", dark ? "text-bone" : "text-wine")}>MarketShield</span>
    </span>
  );
}
