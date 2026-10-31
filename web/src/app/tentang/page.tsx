import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { AboutPage } from "@/components/pages/company";

export const metadata: Metadata = { title: "Tentang kami", description: "Misi, nilai, tim dan perjalanan MarketShield." };

export default function Page() {
  return (
    <PageShell>
      <AboutPage />
    </PageShell>
  );
}
