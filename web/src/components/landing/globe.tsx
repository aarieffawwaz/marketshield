"use client";

import { useT } from "@/lib/store";
import { Reveal } from "./reveal";
import { useInView } from "@/lib/use-in-view";
import dynamic from "next/dynamic";

const RealMap = dynamic(() => import("@/components/map/real-map").then((m) => m.RealMap), { ssr: false });

export function GlobeSection() {
  const { t } = useT();
  const [mapRef, mapSeen] = useInView<HTMLDivElement>();
  const cadence = [
    { k: "Sentinel-1", v: t("6–12 hari", "6–12 days"), d: t("Radar, tembus awan & abu", "Radar, sees through cloud & ash") },
    { k: "Sentinel-5P", v: t("Harian", "Daily"), d: t("Gas SO₂ & aerosol", "SO₂ & aerosol") },
    { k: "MODIS / FIRMS", v: t("Beberapa jam", "Hours"), d: t("Panas & titik api", "Heat & hotspots") },
    { k: "GPM IMERG", v: t("30 menit", "30 min"), d: t("Curah hujan", "Rainfall") },
    { k: "GFS", v: t("Tiap 6 jam", "Every 6 h"), d: t("Angin & arah abu", "Wind & ash drift") },
  ];
  return (
    <section id="cakupan" className="noise relative overflow-hidden bg-night py-24 text-bone sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <p className="label flex items-center gap-3 text-bone/50"><span className="flex items-center gap-1.5 text-ember"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />LIVE</span><span className="h-px w-8 bg-white/20" />{t("Peta & simulasi", "Map & simulation")}</p>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              {t("127 gunung api aktif. Satu katalog satelit.", "127 active volcanoes. One satellite catalog.")}
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-md text-[15.5px] leading-relaxed text-bone/65">
              {t("Peta sungguhan dengan citra Sentinel-2 dan elevasi medan asli. Simulasi erupsi Semeru langsung diputar: lihat awan panas, sebaran abu sampai Bali, AQI tiap kota, dan bedanya kalau warga diperingatkan lebih awal.", "A real map with Sentinel-2 imagery and true terrain. A Semeru eruption simulation plays right away: watch pyroclastic flows, ash drifting to Bali, city AQI, and what changes when people are warned early.")}
            </p>
          </Reveal>
        </div>
        <div ref={mapRef} className="relative mt-10 h-[560px] overflow-hidden rounded-[28px] ring-1 ring-white/10 sm:h-[640px]">
          {mapSeen ? <RealMap className="h-full w-full" autoSim /> : <div className="h-full w-full bg-night" />}
        </div>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-5">
          {cadence.map((c) => (
            <li key={c.k} className="bg-night px-4 py-3">
              <p className="font-mono text-[11.5px] text-sat-bright">{c.k}</p>
              <p className="mt-1 font-display text-[16px] font-medium">{c.v}</p>
              <p className="text-[12px] text-bone/50">{c.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
