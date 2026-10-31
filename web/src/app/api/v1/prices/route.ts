import { getPrices, priceView } from "@/lib/server/repo";
import { json } from "../_shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const { source, data } = await getPrices();
  return json({ source, region: data[0]?.region ?? "Kab. Lumajang", currency: "IDR", data: data.map(priceView) });
}
