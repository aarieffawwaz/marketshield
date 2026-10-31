import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { SecurityPage } from "@/components/pages/company";

export const metadata: Metadata = { title: "Keamanan & kepatuhan", description: "Status kepatuhan UU PDP, OWASP, WCAG dan peta jalan sertifikasi MarketShield." };

export default function Page() {
  return (
    <PageShell>
      <SecurityPage />
    </PageShell>
  );
}
