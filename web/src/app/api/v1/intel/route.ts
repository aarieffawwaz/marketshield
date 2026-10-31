import { getIntel } from "@/lib/server/repo";
import { json } from "../_shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const { source, data } = await getIntel();
  return json({ source, data: data.map((f) => ({ id: f.id, verdict: f.verdict, head: f.head, context: f.ctx, confidence: f.confidence, sources: f.sources, created_at: f.createdAt })) }, 200, 30);
}
