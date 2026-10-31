"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { BrandIcon } from "@/components/ui/brand-icons";
import { STORES } from "@/lib/site";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

function Badge({ icon, top, name, soon, dark }: { icon: React.ReactNode; top: string; name: string; soon?: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-12 items-center gap-2.5 rounded-xl px-3.5 pr-4 ring-1 transition",
        dark ? "bg-white/[0.06] text-bone ring-white/15" : "bg-night text-bone ring-night",
        soon && "cursor-not-allowed opacity-80",
      )}
      aria-disabled={soon ? true : undefined}
      title={soon}
    >
      {icon}
      <span className="flex flex-col leading-none">
        <span className="text-[9.5px] uppercase tracking-[0.08em] text-bone/60">{top}</span>
        <span className="mt-1 text-[15px] font-semibold tracking-tight">{name}</span>
      </span>
      {soon && <span className="absolute -right-2 -top-2 rounded-full bg-ember px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow">{soon}</span>}
    </span>
  );
}

/** App Store / Google Play (coming soon) + direct APK. */
export function StoreBadges({ dark, apk = true, className }: { dark?: boolean; apk?: boolean; className?: string }) {
  const { t } = useT();
  const soon = t("Segera", "Soon");
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Badge dark={dark} icon={<BrandIcon name="apple" className="h-6 w-6" />} top={STORES.appStore.live ? t("Unduh di", "Download on the") : t("Segera di", "Coming to the")} name="App Store" soon={STORES.appStore.live ? undefined : soon} />
      <Badge dark={dark} icon={<BrandIcon name="googleplay" className="h-5 w-5" />} top={STORES.playStore.live ? t("Dapatkan di", "Get it on") : t("Segera di", "Coming to")} name="Google Play" soon={STORES.playStore.live ? undefined : soon} />
      {apk && (
        <Link href="/download" className={cn("inline-flex h-12 items-center gap-2 rounded-xl px-4 text-[13.5px] font-medium ring-1 transition", dark ? "text-bone ring-white/25 hover:bg-white/10" : "text-wine ring-line-strong hover:bg-sand")}>
          <Download className="h-4 w-4" /> {t("Unduh APK sekarang", "Get the APK now")}
        </Link>
      )}
    </div>
  );
}
