import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero, PageShell } from "@/components/site/page";
import { POSTS } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog", description: "Riset satelit, pasar darurat dan kesiapsiagaan gunung api dari tim MarketShield." };

export default function BlogPage() {
  const [lead, ...rest] = POSTS;
  return (
    <PageShell>
      <PageHero kicker="Blog" title="Catatan dari orbit dan lapangan" sub="Riset satelit, pasar saat bencana, dan cara kami membangun MarketShield." crumbs={[{ label: "Blog" }]} />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Link href={`/blog/${lead.slug}`} className="card group grid overflow-hidden lg:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-[16/9] lg:aspect-auto">
            <Image src={lead.cover} alt="" fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center p-8">
            <p className="label text-maroon/60">{lead.cat} · {lead.date}</p>
            <h2 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-wine">{lead.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{lead.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-maroon">Baca · {lead.read} menit <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
          </div>
        </Link>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card group overflow-hidden">
              <div className="relative aspect-[16/10]">
                <Image src={p.cover} alt="" fill sizes="(min-width:768px) 400px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="label !text-[10px] text-maroon/60">{p.cat} · {p.date}</p>
                <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug text-wine">{p.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
