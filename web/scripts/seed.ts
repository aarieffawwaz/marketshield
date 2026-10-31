/**
 * Seeds Firestore with the bundled demo data. Idempotent: documents are keyed by slug and merged.
 * Usage: FIREBASE_SERVICE_ACCOUNT="$(cat key.json)" npm run seed
 */
import { Timestamp } from "firebase-admin/firestore";
import { ALERTS, FEED, ITEMS, POSKO, VILLAGES } from "../src/lib/data";
import { VOLCANOES } from "../src/lib/geo";
import { db } from "../src/lib/server/firebase";
import { slug } from "../src/lib/server/repo";

async function main() {
  const store = db();
  if (!store) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  const now = Timestamp.now();
  const minutesAgo = (m: number) => Timestamp.fromMillis(now.toMillis() - m * 60_000);
  const batch = store.batch();
  let n = 0;
  const put = (col: string, id: string, data: object) => { batch.set(store.collection(col).doc(id), data, { merge: true }); n++; };

  for (const v of VOLCANOES) put("volcanoes", slug(v.name), { name: v.name, lat: v.lat, lon: v.lon, level: v.name === "Semeru" ? 3 : null, levelSource: "PVMBG", monitored: true, updatedAt: now });
  for (const v of VILLAGES) put("villages", slug(v.desa), { volcanoId: "semeru", name: v.desa, district: v.kec, exposed: v.exposed, layer: v.layer, vulnerability: v.vuln, aidReceived: v.aid, needs: v.needs, updatedAt: now });
  for (const p of POSKO) put("posko", slug(p.name), { volcanoId: "semeru", name: p.name, kind: p.kind, status: p.status, capacity: p.capacity, filled: p.filled, has: p.has, needs: p.needs, km: p.km, updatedLabel: p.updated, updatedAt: now });
  for (const i of ITEMS) put("prices", slug(i.name.en), { region: "Kab. Lumajang", name: i.name, unit: i.unit, het: i.het, marketAvg: i.market, verifiedOutlets: i.stock, updatedAt: now });
  ALERTS.forEach((a, i) => put("alerts", `seed-${i}`, { volcanoId: "semeru", kind: a.kind, text: a.text, timeLabel: a.time, createdAt: minutesAgo(20 + i * 20) }));
  FEED.forEach((f, i) => put("intel", `seed-${i}`, { verdict: f.verdict, head: f.head, ctx: f.ctx, confidence: f.conf, sources: f.sources, timeLabel: f.time, createdAt: minutesAgo(15 + i * 30) }));

  await batch.commit();
  console.log(`seeded ${n} documents`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
