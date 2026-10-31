import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { PricingPage } from "@/components/pages/pricing";

export const metadata: Metadata = {
  title: "Harga",
  description: "Paket MarketShield: gratis untuk warga, paket Desa & Posko, Pemda & BPBD, dan Sektor & Enterprise.",
};

export default function Page() {
  return (
    <PageShell>
      <PricingPage />
    </PageShell>
  );
}
