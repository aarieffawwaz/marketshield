import { VILLAGES, priority } from "@/lib/data";
import { json, parseLevel } from "../../_shared";

export function GET(req: Request) {
  const level = parseLevel(new URL(req.url).searchParams.get("level"));
  const rows = VILLAGES.map((v) => ({ village: v.desa, district: v.kec, exposed_population: v.exposed, driving_layer: v.layer, vulnerability: v.vuln, aid_received: v.aid, needs: v.needs.en, score: Math.round(priority(v, level)) })).sort((a, b) => b.score - a.score);
  return json({ volcano: "semeru", level, data: rows.map((r, i) => ({ rank: i + 1, ...r })) });
}
