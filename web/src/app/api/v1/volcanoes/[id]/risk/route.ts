import { DRIVERS, LEVELS, indicators, riskSeries } from "@/lib/data";
import { getForecast } from "@/lib/server/repo";
import { json, parseLevel } from "../../../_shared";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (id !== "semeru") return json({ error: { code: "not_found", message: "Detailed risk is available for semeru in this region." } }, 404);
  const level = parseLevel(new URL(req.url).searchParams.get("level"));
  const L = LEVELS[level];
  const model = await getForecast("semeru");
  return json({
    model: model && { probability_7d: model.p, window_days: model.windowDays, top_drivers: model.drivers, name: model.model, updated_at: model.updatedAt },
    volcano: "semeru",
    official_level: { value: level, name: L.name.id, source: "PVMBG" },
    escalation_probability_7d: L.prob,
    action_window: L.eaw,
    drivers: DRIVERS.map((d) => d.en),
    indicators: indicators(level).map((i) => ({ key: i.key, dataset: i.dataset, value: i.value, trend: i.trend, acquired: i.acquired.en })),
    history: riskSeries(level).map((r) => ({ day: r.day, probability: r.p / 100 })),
  });
}
