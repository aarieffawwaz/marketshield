/**
 * Publishes the risk engine's latest forecast per volcano to volcanoes/{id}.forecast.
 * Usage: FIREBASE_SERVICE_ACCOUNT="$(cat key.json)" npx tsx scripts/publish-forecast.ts ../ml/results/risk_latest.json
 */
import { readFileSync } from "node:fs";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../src/lib/server/firebase";
import { slug } from "../src/lib/server/repo";

type Row = { volcano: string; week: string; p: number; top: string[] };

async function main() {
  const store = db();
  if (!store) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  const rows: Row[] = JSON.parse(readFileSync(process.argv[2] ?? "../ml/results/risk_latest.json", "utf8"));
  const batch = store.batch();
  for (const r of rows) {
    batch.set(store.collection("volcanoes").doc(slug(r.volcano)), {
      name: r.volcano,
      forecast: { p_escalation_7d: r.p, window_days: 7, shap_top3: r.top, model: "xgboost-thermal-v1", target: "thermal activity (NASA FIRMS) within 5 km in the next 7 days", features_week: r.week },
      forecastUpdatedAt: Timestamp.now(),
      // fields written by an earlier notebook that duplicate `level`
      status_level: FieldValue.delete(),
      status_updated_at: FieldValue.delete(),
    }, { merge: true });
  }
  await batch.commit();
  console.log(`published ${rows.length} forecasts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
