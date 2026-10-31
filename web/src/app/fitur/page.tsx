import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { FeaturesPage } from "@/components/pages/features";

export const metadata: Metadata = {
  title: "Fitur",
  description: "Prakiraan eskalasi satelit, peta bahaya berlapis, filter hoaks, pantau harga HET, Indeks Prioritas Bantuan, dan solusi untuk Pemda, desa, apotek, logistik, pertanian dan pariwisata.",
};

export default function Page() {
  return (
    <PageShell>
      <FeaturesPage />
    </PageShell>
  );
}
