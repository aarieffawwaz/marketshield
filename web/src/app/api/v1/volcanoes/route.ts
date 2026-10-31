import { VOLCANOES } from "@/lib/geo";
import { json } from "../_shared";

export function GET() {
  return json({
    data: VOLCANOES.map((v) => ({ id: v.name.toLowerCase().replace(/\s+/g, "-"), name: v.name, lat: v.lat, lon: v.lon, monitored: true })),
  });
}
