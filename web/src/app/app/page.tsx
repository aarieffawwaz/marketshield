import type { Metadata } from "next";
import { Suspense } from "react";
import { Console } from "@/components/webapp/console";

export const metadata: Metadata = {
  title: "Web console",
  description: "Console MarketShield untuk BPBD, posko dan donatur: peta bahaya, indikator satelit, prioritas bantuan, harga HET dan filter hoaks.",
};

export default function AppPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <Console />
    </Suspense>
  );
}
