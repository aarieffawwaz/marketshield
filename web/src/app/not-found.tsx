import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, PageShell } from "@/components/site/page";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <PageShell>
      <PageHero kicker="404" title="Halaman ini tidak ditemukan." sub="Tautannya mungkin salah ketik atau halamannya sudah dipindah. Coba mulai lagi dari salah satu tujuan di bawah.">
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-shine shine-bone inline-flex items-center gap-2 rounded-full bg-bone px-5 py-3 text-[14px] font-medium text-night">
            Kembali ke beranda <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/app" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] text-bone ring-1 ring-white/20 transition hover:bg-white/5">Buka Web Console</Link>
          <Link href="/docs" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] text-bone ring-1 ring-white/20 transition hover:bg-white/5">Dokumentasi</Link>
        </div>
      </PageHero>
    </PageShell>
  );
}
