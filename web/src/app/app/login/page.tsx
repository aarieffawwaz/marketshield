import type { Metadata } from "next";
import { LoginScreen } from "@/components/webapp/login";

export const metadata: Metadata = { title: "Masuk", description: "Masuk ke web console MarketShield." };

export default function Page() {
  return <LoginScreen />;
}
