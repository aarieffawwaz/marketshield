import { getPosko } from "@/lib/server/repo";
import { json } from "../_shared";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const volcano = new URL(req.url).searchParams.get("volcano") ?? "semeru";
  const { source, data } = await getPosko(volcano);
  return json({ source, volcano, data: data.map((p) => ({ id: p.id, name: p.name, kind: p.kind.en, status: p.status, capacity: p.capacity, filled: p.filled, has: p.has.en, needs: p.needs.en, updated_at: p.updatedAt })) }, 200, 30);
}
