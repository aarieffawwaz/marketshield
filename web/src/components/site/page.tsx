import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "./header";
import { SiteFooter } from "./footer";
import { cn } from "@/lib/utils";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader solid />
      <main className="min-h-screen overflow-x-clip bg-cream pt-16">{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHero({ kicker, title, sub, crumbs, children, className }: { kicker: string; title: React.ReactNode; sub?: React.ReactNode; crumbs?: { href?: string; label: string }[]; children?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("noise relative overflow-hidden bg-night text-bone", className)}>
      <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_0%,rgba(123,30,38,0.55),transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-[12.5px] text-bone/50">
            <Link href="/" className="hover:text-bone">MarketShield</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" />
                {c.href ? <Link href={c.href} className="hover:text-bone">{c.label}</Link> : <span className="text-bone/80">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <p className="label text-ember">{kicker}</p>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.1rem,5vw,3.9rem)] font-semibold leading-[1.04] tracking-[-0.035em]">{title}</h1>
        {sub && <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-bone/65 sm:text-[17px]">{sub}</p>}
        {children}
      </div>
    </section>
  );
}
