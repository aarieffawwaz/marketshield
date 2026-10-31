import { priority } from "@/lib/data";
import { getVillages } from "@/lib/server/repo";
import { json, parseLevel } from "../../_shared";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const level = parseLevel(q.get("level"));
  const volcano = q.get("volcano") ?? "semeru";
  const { source, data } = await getVillages(volcano);
  const rows = data
    .map((v) => ({ id: v.id, village: v.desa, district: v.kec, exposed_population: v.exposed, driving_layer: v.layer, vulnerability: v.vuln, aid_received: v.aid, needs: v.needs.en, score: Math.round(priority(v, level)) }))
    .sort((a, b) => b.score - a.score);
  return json({ source, volcano, level, data: rows.map((r, i) => ({ rank: i + 1, ...r })) });
}
