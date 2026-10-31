import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { HelpPage } from "@/components/pages/help";

export const metadata: Metadata = { title: "Pusat bantuan", description: "Panduan memakai aplikasi warga dan web console MarketShield, serta kontak dukungan." };

export default function Page() {
  return (
    <PageShell>
      <HelpPage />
    </PageShell>
  );
}
