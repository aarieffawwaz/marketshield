import { getAlerts } from "@/lib/server/repo";
import { json } from "../_shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const { source, data } = await getAlerts();
  return json({ source, data: data.map((a) => ({ id: a.id, kind: a.kind, text: a.text, created_at: a.createdAt })) }, 200, 30);
}
