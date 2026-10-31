import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { PartnersPage } from "@/components/pages/partners";

export const metadata: Metadata = { title: "Kemitraan", description: "Program kemitraan MarketShield untuk pemerintah daerah, NGO, ritel, telco, asuransi dan kampus." };

export default function Page() {
  return (
    <PageShell>
      <PartnersPage />
    </PageShell>
  );
}
