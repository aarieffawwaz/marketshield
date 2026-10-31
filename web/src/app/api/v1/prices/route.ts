import { ITEMS, deviation } from "@/lib/data";
import { json } from "../_shared";

export function GET() {
  return json({ region: "Kab. Lumajang", currency: "IDR", data: ITEMS.map((i) => ({ item: i.name.en, unit: i.unit.en, het: i.het, market_avg: i.market, deviation: Number(deviation(i).toFixed(3)), verified_outlets: i.stock, flagged: deviation(i) > 0.3 })) });
}
