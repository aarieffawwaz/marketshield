"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MLMap, StyleSpecification } from "maplibre-gl";
import { useApp, useT } from "@/lib/store";
import { cn } from "@/lib/utils";

/*
 * Small, non-interactive evacuation map for the Journey "T 0" card.
 * Positions are approximate and illustrative (Candipuro, Lumajang; Besuk Kobokan channel),
 * matching the demo data used elsewhere on the site, not surveyed routes.
 */

const SEMERU: [number, number] = [112.922, -8.108];
const HOME: [number, number] = [113.012, -8.172]; // Sumberwuluh
const SHELTER: [number, number] = [113.048, -8.163]; // Balai Desa Sumbermujur
const BRIDGE: [number, number] = [113.026, -8.1752];
const CHANNEL: [number, number][] = [SEMERU, [112.945, -8.122], [112.968, -8.138], [112.99, -8.152], [113.008, -8.162], [113.021, -8.17], [113.027, -8.177], [113.033, -8.19], [113.039, -8.208], [113.044, -8.228]];
const ROUTE: [number, number][] = [HOME, [113.018, -8.1745], BRIDGE, [113.033, -8.1735], [113.04, -8.1685], SHELTER];
const BOUNDS: [[number, number], [number, number]] = [[112.982, -8.196], [113.064, -8.138]];

const esri = (path: string) => [`https://server.arcgisonline.com/ArcGIS/rest/services/${path}/MapServer/tile/{z}/{y}/{x}`];

/** KRB III-style hazard ring around the summit, stretched down the main lahar channel (southeast) */
function hazardRing(km: number, stretch: number) {
  const [lon, lat] = SEMERU;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const k = km * (1 + stretch * Math.max(0, Math.cos(a + Math.PI / 4)));
    pts.push([lon + (k * Math.cos(a)) / (111.32 * Math.cos((lat * Math.PI) / 180)), lat + (k * Math.sin(a)) / 110.57]);
  }
  return pts;
}

const line = (coordinates: [number, number][]): GeoJSON.Feature => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });

function style(): StyleSpecification {
  return {
    version: 8,
    sources: {
      light: { type: "raster", tiles: esri("Canvas/World_Light_Gray_Base"), tileSize: 256, maxzoom: 16, attribution: "Esri, HERE, Garmin, © OpenStreetMap" },
      dark: { type: "raster", tiles: esri("Canvas/World_Dark_Gray_Base"), tileSize: 256, maxzoom: 16 },
      hs: { type: "raster", tiles: esri("Elevation/World_Hillshade"), tileSize: 256, maxzoom: 16 },
      hsDark: { type: "raster", tiles: esri("Elevation/World_Hillshade_Dark"), tileSize: 256, maxzoom: 16 },
      krb: { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [hazardRing(6, 0.5)] } } },
      channel: { type: "geojson", data: line(CHANNEL) },
      route: { type: "geojson", data: line(ROUTE.slice(0, 1).concat(ROUTE.slice(0, 1))) },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#f3ede8" } },
      { id: "light", type: "raster", source: "light" },
      { id: "dark", type: "raster", source: "dark", layout: { visibility: "none" } },
      { id: "hs", type: "raster", source: "hs", paint: { "raster-opacity": 0.38 } },
      { id: "hsDark", type: "raster", source: "hsDark", layout: { visibility: "none" }, paint: { "raster-opacity": 0.5 } },
      { id: "krb-fill", type: "fill", source: "krb", paint: { "fill-color": "#d1301f", "fill-opacity": 0.14 } },
      { id: "krb-line", type: "line", source: "krb", paint: { "line-color": "#b51a14", "line-width": 1.4, "line-dasharray": [3, 2], "line-opacity": 0.7 } },
      { id: "channel-glow", type: "line", source: "channel", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#a0522d", "line-width": 9, "line-opacity": 0.22 } },
      { id: "channel", type: "line", source: "channel", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#7a3b16", "line-width": 2.2, "line-dasharray": [2, 1.6] } },
      { id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 8 } },
      { id: "route", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#2e7d32", "line-width": 4.5 } },
    ],
  };
}

/** Partial polyline up to fraction t of its length */
function slice(pts: [number, number][], t: number): [number, number][] {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let left = seg.reduce((a, b) => a + b, 0) * t;
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) {
      out.push(pts[i + 1]);
      left -= seg[i];
      continue;
    }
    const f = left / seg[i];
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
    break;
  }
  return out.length > 1 ? out : [pts[0], pts[0]];
}

// Marker elements; class names live in this file so Tailwind generates them
function el(html: string, className: string) {
  const d = document.createElement("div");
  d.className = className;
  d.innerHTML = html;
  d.setAttribute("aria-hidden", "true");
  return d;
}
const chip = "whitespace-nowrap rounded-md bg-white/95 px-1.5 py-[3px] text-[10.5px] font-semibold leading-none shadow-[0_1px_4px_rgba(53,9,21,0.18)] ring-1 ring-black/5 dark:bg-[#1a0e11]/95 dark:ring-white/10";

export function EvacMap({ className }: { className?: string }) {
  const { t } = useT();
  const theme = useApp((s) => s.theme);
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const labels: Record<string, string> = { home: t("Anda · Sumberwuluh", "You · Sumberwuluh"), shelter: t("Balai Desa Sumbermujur", "Sumbermujur village hall"), bridge: t("Jembatan aman", "Safe bridge"),  };
  const labelKey = JSON.stringify(labels);

  // Only fetch MapLibre and tiles once the card is near the viewport
  useEffect(() => {
    const node = host.current;
    if (!node || inView) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setInView(true), { rootMargin: "240px 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    const node = host.current;
    if (!inView || !node) return;
    let disposed = false;
    let raf = 0;
    let map: MLMap | undefined;
    import("maplibre-gl").then((maplibregl) => {
      if (disposed) return;
      maplibregl.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
      map = new maplibregl.Map({
        container: node,
        style: style(),
        bounds: BOUNDS,
        fitBoundsOptions: { padding: { top: 14, bottom: 14, left: 10, right: 10 } },
        interactive: false,
        attributionControl: { compact: true },
        fadeDuration: 0,
      });
      mapRef.current = map;
      const add = (c: [number, number], e: HTMLElement, anchor: "center" | "bottom" | "left" | "right" | "top" | "bottom-left" | "bottom-right" | "top-left" | "top-right" = "center", offset: [number, number] = [0, 0]) =>
        new maplibregl.Marker({ element: e, anchor, offset }).setLngLat(c).addTo(map!);
      add(BRIDGE, el(`<span class="flex flex-col items-center"><span class="h-2 w-2 rounded-full border-2 border-white bg-[#5a4a47]"></span><span class="${chip} mt-1 text-[#5a4a47] dark:text-[#d6c8c3]" data-l="bridge"></span></span>`, ""), "top", [0, -4]);
      add(HOME, el(`<span class="flex items-center gap-1.5"><span class="relative flex h-3.5 w-3.5"><span class="absolute inset-0 animate-ping rounded-full bg-[#2f5d8a]/40"></span><span class="relative h-3.5 w-3.5 rounded-full border-[2.5px] border-white bg-[#2f5d8a] shadow"></span></span></span>`, ""));
      add(HOME, el(`<span class="${chip} text-[#2f5d8a] dark:text-[#93bde8]" data-l="home"></span>`, ""), "bottom", [0, -12]);
      add(SHELTER, el(`<span class="flex h-5 w-5 items-center justify-center rounded-md border-2 border-white bg-[#2e7d32] shadow"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg></span>`, ""));
      add(SHELTER, el(`<span class="${chip} text-[#2e7d32] dark:text-[#79d07d]" data-l="shelter"></span>`, ""), "bottom-right", [10, -14]);
      map.once("load", () => {
        if (disposed || !map) return;
        setReady(true);
        node.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
        const src = map.getSource("route") as import("maplibre-gl").GeoJSONSource;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) return src.setData(line(ROUTE));
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / 1600);
          src.setData(line(slice(ROUTE, 1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      });
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      map?.remove();
      mapRef.current = null;
    };
  }, [inView]);

  // Marker labels follow the site language
  useEffect(() => {
    if (!ready) return;
    const l = JSON.parse(labelKey) as Record<string, string>;
    host.current?.querySelectorAll<HTMLElement>("[data-l]").forEach((n) => (n.textContent = l[n.dataset.l ?? ""] ?? ""));
  }, [labelKey, ready]);

  // Swap base tiles with the site theme
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const dark = theme === "dark";
    map.setLayoutProperty("light", "visibility", dark ? "none" : "visible");
    map.setLayoutProperty("hs", "visibility", dark ? "none" : "visible");
    map.setLayoutProperty("dark", "visibility", dark ? "visible" : "none");
    map.setLayoutProperty("hsDark", "visibility", dark ? "visible" : "none");
    map.setPaintProperty("bg", "background-color", dark ? "#1a1416" : "#f3ede8");
    map.setPaintProperty("route-casing", "line-color", dark ? "#0d0507" : "#ffffff");
  }, [theme, ready]);

  return (
    <div className={cn("evac-map relative overflow-hidden bg-sand-2", className)} role="img" aria-label={t("Peta rute evakuasi dari Sumberwuluh ke Balai Desa Sumbermujur melewati jembatan aman, menghindari alur lahar Besuk Kobokan", "Evacuation route map from Sumberwuluh to Sumbermujur village hall via a safe bridge, avoiding the Besuk Kobokan lahar channel")}>
      <div ref={host} className={cn("absolute inset-0 transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")} />
      <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-[3px] text-[10px] font-semibold leading-none text-[#7b1e26] shadow-sm ring-1 ring-black/5 dark:bg-[#1a0e11]/90 dark:text-[#f0a3a8] dark:ring-white/10" aria-hidden>
        <svg width="10" height="8" viewBox="0 0 16 12"><path d="M8 1 15 11H1z" fill="currentColor" /></svg>Semeru · ±12 km ↖
      </span>
      <div className="pointer-events-none absolute bottom-2 left-2 flex max-w-[calc(100%-3rem)] flex-wrap items-center gap-x-2.5 gap-y-1 rounded-md bg-white/90 px-2 py-1 text-[9.5px] font-medium leading-none text-[#3f3230] shadow-sm ring-1 ring-black/5 dark:bg-[#1a0e11]/90 dark:text-[#d6c8c3] dark:ring-white/10" aria-hidden>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-[2px] border border-dashed border-[#b51a14] bg-[#d1301f]/20" />KRB III</span>
        <span className="flex items-center gap-1"><span className="w-3.5 border-t-2 border-dashed border-[#7a3b16] dark:border-[#e3a37a]" />{t("Lahar Besuk Kobokan", "Besuk Kobokan lahar")}</span>
        <span className="flex items-center gap-1"><span className="h-[3px] w-3.5 rounded-full bg-[#2e7d32]" />{t("Rute aman", "Safe route")}</span>
      </div>
      {!ready && <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,transparent_30%,color-mix(in_srgb,var(--t-surface)_60%,transparent)_50%,transparent_70%)]" aria-hidden />}
    </div>
  );
}
