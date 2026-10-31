import { PageHero, PageShell } from "@/components/site/page";
import { DocsNav } from "./docs-nav";

export function LegalLayout({ title, kicker, updated, toc, children }: { title: string; kicker: string; updated: string; toc: { id: string; label: string }[]; children: React.ReactNode }) {
  return (
    <PageShell>
      <PageHero kicker={kicker} title={title} sub={`Berlaku sejak ${updated}`} crumbs={[{ label: kicker }]} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[240px_1fr]">
        <DocsNav groups={[{ title: "Isi", items: toc }]} />
        <article className="prose-ms max-w-3xl">{children}</article>
      </div>
    </PageShell>
  );
}
