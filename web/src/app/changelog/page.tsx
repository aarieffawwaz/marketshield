import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { ChangelogPage } from "@/components/pages/company";

export const metadata: Metadata = { title: "Catatan rilis", description: "Riwayat rilis aplikasi warga, web console dan situs MarketShield." };

export default function Page() {
  return (
    <PageShell>
      <ChangelogPage />
    </PageShell>
  );
}
