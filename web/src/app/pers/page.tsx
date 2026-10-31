import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { PressPage } from "@/components/pages/company";

export const metadata: Metadata = { title: "Pers & media", description: "Kit media MarketShield: deskripsi, fakta, logo, warna dan tangkapan layar." };

export default function Page() {
  return (
    <PageShell>
      <PressPage />
    </PageShell>
  );
}
