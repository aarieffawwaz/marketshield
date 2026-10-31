import { classify } from "@/lib/classify";
import { logSignal } from "@/lib/server/repo";
import { json } from "../../_shared";

/** CORS preflight so browsers on other origins (e.g. the Flutter web build) can POST JSON */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } });
}

export async function POST(req: Request) {
  let body: { text?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: { code: "invalid_json", message: "Body must be JSON: { \"text\": string, \"lang\"?: \"id\" | \"en\" }" } }, 400);
  }
  if (typeof body.text !== "string" || !body.text.trim() || body.text.length > 2000) return json({ error: { code: "invalid_text", message: "text must be a non-empty string up to 2000 characters" } }, 422);
  const lang = body.lang === "en" ? "en" : "id";
  const r = classify(body.text, lang);
  await logSignal({ label: r.verdict, confidence: Number(r.conf.toFixed(2)), triggers: r.triggers, lang, length: body.text.length, model: "rules-v1" });
  return json({ label: r.verdict, confidence: Number(r.conf.toFixed(2)), triggers: r.triggers, satellite_check: r.sat ?? null, nearest_fact: r.fact }, 200, 0);
}
