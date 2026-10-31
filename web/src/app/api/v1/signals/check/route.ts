import { classify } from "@/lib/classify";
import { json } from "../../_shared";

export async function POST(req: Request) {
  let body: { text?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: { code: "invalid_json", message: "Body must be JSON: { \"text\": string, \"lang\"?: \"id\" | \"en\" }" } }, 400);
  }
  if (typeof body.text !== "string" || !body.text.trim() || body.text.length > 2000) return json({ error: { code: "invalid_text", message: "text must be a non-empty string up to 2000 characters" } }, 422);
  const r = classify(body.text, body.lang === "en" ? "en" : "id");
  return json({ label: r.verdict, confidence: Number(r.conf.toFixed(2)), triggers: r.triggers, satellite_check: r.sat ?? null, nearest_fact: r.fact });
}
