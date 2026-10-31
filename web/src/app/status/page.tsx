import type { Metadata } from "next";
import { PageShell } from "@/components/site/page";
import { StatusPage } from "@/components/pages/company";

export const metadata: Metadata = { title: "Status sistem", description: "Status langsung API dan penyedia peta MarketShield." };

export default function Page() {
  return (
    <PageShell>
      <StatusPage />
    </PageShell>
  );
}
