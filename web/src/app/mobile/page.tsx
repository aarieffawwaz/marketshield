import type { Metadata, Viewport } from "next";
import { MobileStage } from "@/components/mobile-stage";

export const metadata: Metadata = {
  title: "Aplikasi warga",
  description: "Aplikasi MarketShield untuk warga di sekitar gunung api: beranda adaptif, peta bahaya, evakuasi, cek hoaks, Kit Siaga dan posko.",
  appleWebApp: { capable: true, title: "MarketShield", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff8f3",
};

export default function MobilePage() {
  return <MobileStage />;
}
