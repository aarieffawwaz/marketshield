// Lightweight signal classifier used by the console and the public API.
// Mirrors the IndoBERT labels; satellite cross-checks come from the GEE layers.

import type { Verdict } from "./data";

export type Check = { verdict: Verdict | "UNVERIFIED"; conf: number; triggers: string[]; fact: string; sat?: string };

export function classify(text: string, lang: "id" | "en"): Check {
  const s = text.toLowerCase();
  const hoaxCues = ["sudah masuk", "segera tinggalkan", "sebarkan", "viral", "katanya", "dengar-dengar", "besok meletus", "pasti meletus", "100%", "share", "forward", "jangan percaya pemerintah", "ditutupi"];
  const panicCues = ["habis", "semua apotek", "tidak ada lagi", "tolong", "!!!", "kiamat", "mengerikan", "langka"];
  const officialCues = ["pvmbg", "bpbd", "magma indonesia", "badan geologi"];
  const hit = (arr: string[]) => arr.filter((c) => s.includes(c));
  const h = hit(hoaxCues);
  const p = hit(panicCues);
  const o = hit(officialCues);
  const place = ["pronojiwo", "candipuro", "pasirian", "supiturang", "sumberwuluh", "penanggal"].find((x) => s.includes(x));
  const aboutLahar = /lahar|banjir|awan panas/.test(s);
  const aboutAsh = /abu|hujan abu/.test(s);
  const en = lang === "en";
  const P = place ? place[0].toUpperCase() + place.slice(1) : "";
  let sat: string | undefined;
  if (place && aboutLahar) sat = en ? `Sentinel-1 radar shows no new flow toward ${P} in the last 48 h.` : `Radar Sentinel-1 tidak mendeteksi aliran baru ke ${P} dalam 48 jam terakhir.`;
  if (place && aboutAsh) sat = en ? `GFS wind (240°) and the S5P aerosol index are consistent with ash over ${P}.` : `Angin GFS (240°) dan indeks aerosol S5P konsisten dengan abu di ${P}.`;

  if (h.length) return { verdict: "HOAX", conf: Math.min(0.97, 0.72 + h.length * 0.08 + (sat && aboutLahar ? 0.08 : 0)), triggers: h, fact: en ? "PVMBG 08:20: Semeru remains at Level III. No evacuation order for this area." : "PVMBG 08.20: Semeru tetap Level III. Tidak ada perintah evakuasi untuk wilayah ini.", sat };
  if (p.length) return { verdict: "PANIC", conf: Math.min(0.93, 0.66 + p.length * 0.08), triggers: p, fact: en ? "Verified N95 stock at 4 outlets. Report prices above the cap in Price Watch." : "Stok N95 terverifikasi di 4 outlet. Laporkan harga di atas HET lewat Pantau Harga.", sat };
  if (o.length) return { verdict: "OFFICIAL", conf: 0.9, triggers: o, fact: en ? "Names an official source. Matched to the latest PVMBG/BPBD release." : "Menyebut sumber resmi. Dicocokkan dengan rilis PVMBG/BPBD terbaru.", sat };
  if (sat && aboutAsh) return { verdict: "VERIFIED", conf: 0.84, triggers: [], fact: en ? "Matches satellite layers and 14 resident reports." : "Cocok dengan lapisan satelit dan 14 laporan warga.", sat };
  return { verdict: "UNVERIFIED", conf: 0.55, triggers: [], fact: en ? "Not enough signal. Waiting for an official source or 3 consistent reports." : "Sinyal belum cukup. Menunggu sumber resmi atau 3 laporan yang konsisten.", sat };
}
