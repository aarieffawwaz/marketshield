import type { Metadata } from "next";
import { DownloadPage } from "@/components/download";

export const metadata: Metadata = {
  title: "Unduh APK",
  description: "Unduh aplikasi MarketShield untuk Android.",
};

export default function Page() {
  return <DownloadPage />;
}
