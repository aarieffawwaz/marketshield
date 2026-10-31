import { getVolcanoes } from "@/lib/server/repo";
import { json } from "../_shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const { source, data } = await getVolcanoes();
  return json({ source, data: data.map((v) => ({ id: v.id, name: v.name, lat: v.lat, lon: v.lon, level: v.level, monitored: v.monitored, updated_at: v.updatedAt })) });
}
