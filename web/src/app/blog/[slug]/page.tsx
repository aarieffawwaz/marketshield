import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/site/page";
import { POSTS } from "@/lib/blog";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((x) => x.slug === slug);
  if (!post) notFound();
  const more = POSTS.filter((p) => p.slug !== slug).slice(0, 2);
  return (
    <PageShell>
      <article>
        <header className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-maroon"><ArrowLeft className="h-4 w-4" /> Blog</Link>
          <p className="label mt-8 text-maroon/60">{post.cat} · {post.date} · {post.read} menit baca</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-wine">{post.title}</h1>
          <p className="mt-4 text-[18px] leading-relaxed text-muted">{post.excerpt}</p>
          <p className="mt-6 text-[13px] text-muted">Tim MarketShield</p>
        </header>
        <div className="relative mx-auto mt-10 aspect-[16/8] max-w-5xl overflow-hidden sm:rounded-3xl">
          <Image src={post.cover} alt="" fill priority sizes="(min-width:1024px) 1024px, 100vw" className="object-cover" />
        </div>
        <div className="prose-ms mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {post.body.map((b, i) =>
            b[0] === "h2" ? <h2 key={i}>{b[1]}</h2> : b[0] === "quote" ? <blockquote key={i}>{b[1]}</blockquote> : b[0] === "ul" ? <ul key={i}>{b[1].map((x) => <li key={x}>{x}</li>)}</ul> : <p key={i}>{b[1]}</p>,
          )}
        </div>
      </article>
      <section className="border-t border-line bg-sand py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="label text-maroon/60">Baca juga</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {more.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="card p-5 transition hover:-translate-y-0.5">
                <p className="label !text-[10px] text-maroon/60">{p.cat}</p>
                <p className="mt-2 font-display text-[18px] font-semibold text-wine">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
