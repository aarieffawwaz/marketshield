"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Map as MLMap, Marker, StyleSpecification } from "maplibre-gl";
import { ChevronUp, Clapperboard, Flame, Globe2, Layers, Mountain, Pause, Play, RotateCcw, RotateCw, Satellite, Map as MapIcon, Wind, X } from "lucide-react";
import { CITIES, EVENTS, PARAMS, SEMERU as SEMERU_LL, aqiBand, channelLngLat, cityImpacts, hasVillages, plumeState, regionalPlume, ringLabelPoint, rings, setOrigin, simulate, type CityImpact, type Scenario } from "./simulation";
import { createEruptionLayer, type EruptionState } from "./eruption-layer";
import { VOLCANOES } from "@/lib/geo";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

// Free, keyless sources: Sentinel-2 cloudless (EOX), Esri canvas basemaps, AWS Terrain Tiles (terrarium DEM)
const SAT = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/{z}/{y}/{x}.jpg";
const DEM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const esri = (k: string) => [`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${k}/MapServer/tile/{z}/{y}/{x}`];

const SEMERU: [number, number] = [112.922, -8.108];
const HOME = { center: [117.5, -2.4] as [number, number], zoom: 3.4, pitch: 0, bearing: 0 };

// Approximate positions for the Semeru study area
const VILLAGES = [
  { name: "Supiturang", c: [112.947, -8.203] },
  { name: "Oro-oro Ombo", c: [112.905, -8.222] },
  { name: "Sumberwuluh", c: [113.003, -8.168] },
  { name: "Penanggal", c: [113.04, -8.142] },
  { name: "Sumbermujur", c: [113.062, -8.158] },
  { name: "Jugosari", c: [113.05, -8.222] },
];
const POSTS = [
  { name: "Balai Desa Sumbermujur", c: [113.07, -8.162], full: false },
  { name: "Lapangan Candipuro", c: [113.085, -8.19], full: false },
  { name: "SDN Penanggal 02", c: [113.045, -8.135], full: true },
];
const LAHAR = [[112.922, -8.108], [112.938, -8.125], [112.955, -8.142], [112.975, -8.162], [112.995, -8.182], [113.012, -8.203], [113.03, -8.226]];

function ring(lon: number, lat: number, km: number, stretch = 0) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    // stretch toward the southeast, along the main lahar channel
    const k = km * (1 + stretch * Math.max(0, Math.cos(a + Math.PI / 4)));
    pts.push([lon + (k * Math.cos(a)) / (111.32 * Math.cos((lat * Math.PI) / 180)), lat + (k * Math.sin(a)) / 110.57]);
  }
  return pts;
}

function plume(lon: number, lat: number, km: number, bearing: number) {
  const pts: [number, number][] = [[lon, lat]];
  for (let d = -20; d <= 20; d += 4) {
    const b = ((bearing + d) * Math.PI) / 180;
    const r = km * (1 - Math.abs(d) / 60);
    pts.push([lon + (r * Math.sin(b)) / (111.32 * Math.cos((lat * Math.PI) / 180)), lat + (r * Math.cos(b)) / 110.57]);
  }
  pts.push([lon, lat]);
  return pts;
}

// Distance (km) from a point to the lahar polyline, flat-earth approximation
function distToLahar(lon: number, lat: number) {
  const kx = 111.32 * Math.cos((lat * Math.PI) / 180);
  const ky = 110.57;
  let best = Infinity;
  for (let i = 0; i < LAHAR.length - 1; i++) {
    const [ax, ay] = [LAHAR[i][0] * kx, LAHAR[i][1] * ky];
    const [bx, by] = [LAHAR[i + 1][0] * kx, LAHAR[i + 1][1] * ky];
    const [px, py] = [lon * kx, lat * ky];
    const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    best = Math.min(best, Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay))));
  }
  return best;
}

/** Hexagon grid around a volcano scored like the Aid Priority Index: distance, ash cone and (at Semeru) lahar proximity */
function hexGrid(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: VOLCANOES.flatMap((v) => hexAround([v.lon, v.lat], v.name === "Semeru").features) };
}

function hexAround([cx, cy]: [number, number], semeru: boolean) {
  const r = 0.9; // km, hex circumradius
  const kx = 111.32 * Math.cos((cy * Math.PI) / 180);
  const ky = 110.57;
  const features: GeoJSON.Feature[] = [];
  const w = Math.sqrt(3) * r;
  for (let row = -14; row <= 14; row++) {
    for (let col = -14; col <= 14; col++) {
      const x = col * w + (row % 2 ? w / 2 : 0);
      const y = row * 1.5 * r;
      const d = Math.hypot(x, y);
      if (d > (semeru ? 22 : 14) || d < 3.2) continue;
      const lon = cx + x / kx;
      const lat = cy + y / ky;
      const bearing = (Math.atan2(x, y) * 180) / Math.PI;
      const inAsh = Math.abs(((bearing - 240 + 540) % 360) - 180) < 24 ? 1 : 0;
      const lahar = semeru ? Math.exp(-distToLahar(lon, lat) / 1.6) : 0;
      const score = Math.min(1, 0.85 * Math.exp(-d / 7) + 0.35 * inAsh * Math.exp(-d / 18) + 0.55 * lahar);
      if (score < 0.12) continue;
      const ring: [number, number][] = [];
      for (let k = 0; k <= 6; k++) {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        ring.push([lon + (r * 0.92 * Math.cos(a)) / kx, lat + (r * 0.92 * Math.sin(a)) / ky]);
      }
      features.push({ type: "Feature", properties: { s: Math.round(score * 100) / 100 }, geometry: { type: "Polygon", coordinates: [ring] } });
    }
  }
  return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
}

function style(): StyleSpecification {
  return {
    version: 8,
    projection: { type: "globe" },
    sources: {
      sat: { type: "raster", tiles: [SAT], tileSize: 256, maxzoom: 14, attribution: '<a href="https://s2maps.eu">Sentinel-2 cloudless</a> by EOX (Copernicus Sentinel data 2023)' },
      dark: { type: "raster", tiles: esri("World_Dark_Gray_Base"), tileSize: 256, maxzoom: 16, attribution: "Esri, HERE, Garmin, © OpenStreetMap" },
      labels: { type: "raster", tiles: esri("World_Dark_Gray_Reference"), tileSize: 256, maxzoom: 16 },
      dem: { type: "raster-dem", tiles: [DEM], encoding: "terrarium", tileSize: 256, maxzoom: 14, attribution: "Terrain Tiles (AWS)" },
      hs: { type: "raster-dem", tiles: [DEM], encoding: "terrarium", tileSize: 256, maxzoom: 14 },
      krb: { type: "geojson", data: { type: "FeatureCollection", features: VOLCANOES.flatMap((v) => {
        const semeru = v.name === "Semeru";
        return (semeru ? [13, 8, 5] : [8, 5, 3]).map((km, i) => ({ type: "Feature" as const, properties: { z: 3 - i }, geometry: { type: "Polygon" as const, coordinates: [ring(v.lon, v.lat, km, semeru ? 0.35 : 0.12)] } }));
      }) } },
      ash: { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [plume(...SEMERU, 26, 240)] } } },
      lahar: { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: LAHAR } } },
      ash24: { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [plume(...SEMERU, 42, 236)] } } },
      hex: { type: "geojson", data: hexGrid() },
      "sim-region": { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      "sim-rings": { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      "sim-col": { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      "sim-pdc": { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      "sim-ash": { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      "sim-lahar": { type: "geojson", data: { type: "FeatureCollection", features: [] } },
      "sim-vill": { type: "geojson", data: { type: "FeatureCollection", features: [] } },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0d0507" } },
      { id: "sat", type: "raster", source: "sat", paint: { "raster-saturation": -0.15, "raster-contrast": 0.08 } },
      { id: "dark", type: "raster", source: "dark", layout: { visibility: "none" } },
      { id: "hill", type: "hillshade", source: "hs", minzoom: 6.5, paint: { "hillshade-exaggeration": 0.4, "hillshade-shadow-color": "#1a0a0d", "hillshade-highlight-color": "#fff4ec" } },
      { id: "labels", type: "raster", source: "labels", minzoom: 4, paint: { "raster-opacity": 0.85 } },
      { id: "krb-fill", type: "fill", source: "krb", minzoom: 8, paint: { "fill-color": ["match", ["get", "z"], 3, "#b51a14", 2, "#ea6a1f", "#e0a100"], "fill-opacity": 0.14 } },
      { id: "krb-line", type: "line", source: "krb", minzoom: 8, paint: { "line-color": ["match", ["get", "z"], 3, "#ff5a4f", 2, "#ff9a5a", "#f5c84a"], "line-width": 2, "line-dasharray": [2, 1.5] } },
      { id: "ash24", type: "fill", source: "ash24", minzoom: 8, paint: { "fill-color": "#b8a59d", "fill-opacity": 0.12 } },
      { id: "ash", type: "fill", source: "ash", minzoom: 8, paint: { "fill-color": "#8a7a74", "fill-opacity": 0.38 } },
      { id: "hex", type: "fill-extrusion", source: "hex", minzoom: 8, paint: {
        "fill-extrusion-color": ["interpolate", ["linear"], ["get", "s"], 0.1, "#f5c84a", 0.4, "#ea6a1f", 0.7, "#d1301f", 1, "#7b1e26"],
        "fill-extrusion-height": ["*", ["get", "s"], 900],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.62,
      } },
      { id: "lahar-glow", type: "line", source: "lahar", minzoom: 8, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ff7a2f", "line-width": ["interpolate", ["linear"], ["zoom"], 9, 8, 14, 22], "line-blur": 8, "line-opacity": 0.45 } },
      { id: "lahar", type: "line", source: "lahar", minzoom: 8, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#c2611f", "line-width": ["interpolate", ["linear"], ["zoom"], 9, 3, 14, 9] } },
      { id: "sim-region", type: "fill", source: "sim-region", paint: { "fill-color": "#8a7a74", "fill-opacity": ["match", ["get", "band"], 0, 0.42, 1, 0.26, 0.14] } },
      { id: "sim-rings", type: "line", source: "sim-rings", paint: { "line-color": "#ffffff", "line-width": 1.2, "line-opacity": 0.7, "line-dasharray": [3, 3] } },
      { id: "sim-ash", type: "fill", source: "sim-ash", paint: { "fill-color": "#9a8d88", "fill-opacity": 0.45 } },
      { id: "sim-lahar", type: "fill", source: "sim-lahar", paint: { "fill-color": "#6b3414", "fill-opacity": 0.85 } },
      { id: "sim-pdc-glow", type: "line", source: "sim-pdc", paint: { "line-color": "#ffb27a", "line-width": 10, "line-blur": 10, "line-opacity": 0.8 } },
      { id: "sim-pdc", type: "fill", source: "sim-pdc", paint: { "fill-color": "#ff5a1f", "fill-opacity": 0.32 } },
      { id: "sim-vill", type: "circle", source: "sim-vill", paint: {
        "circle-radius": 8,
        "circle-color": ["match", ["get", "status"], "hit", "#d1301f", "ash", "#9a8d88", "evac", "#3d7fc4", "#2e7d32"],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2.5,
      } },
      { id: "sim-col", type: "fill-extrusion", source: "sim-col", paint: {
        "fill-extrusion-color": ["case", ["<", ["get", "shade"], 0], "#ff6a1f", ["interpolate", ["linear"], ["get", "shade"], 0, "#5b4d48", 2.5, "#9b8d86", 6, "#e9e2de"]],
        "fill-extrusion-base": ["get", "base"],
        "fill-extrusion-height": ["get", "top"],
        "fill-extrusion-opacity": 0.82,
        "fill-extrusion-vertical-gradient": true,
      } },
      { id: "lahar-flow", type: "line", source: "lahar", minzoom: 8, layout: { "line-cap": "butt", "line-join": "round" }, paint: { "line-color": "#ffd2a8", "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1.5, 14, 4], "line-dasharray": [0, 4, 3] } },
    ],
    sky: { "sky-color": "#1a0a0d", "horizon-color": "#b8461c", "fog-color": "#0d0507", "sky-horizon-blend": 0.6, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.4, "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 6, 0.8, 9, 0] },
  };
}

function dot(name: string, main: boolean) {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", name);
  el.className = "ms-vdot";
  el.innerHTML = `<span class="ms-vdot-ring${main ? " main" : ""}"></span><span class="ms-vdot-core${main ? " main" : ""}"></span><span class="ms-vdot-label">${name}</span>`;
  return el;
}

function pin(name: string, kind: "village" | "post" | "full") {
  const el = document.createElement("div");
  el.className = `ms-pin ms-pin-${kind}`;
  el.innerHTML = `<span class="ms-pin-dot"></span><span class="ms-pin-label">${name}</span>`;
  return el;
}

export function RealMap({ start = "indonesia", className, autoSim }: { start?: "indonesia" | "semeru"; className?: string; autoSim?: boolean }) {
  const { t } = useT();
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [base, setBase] = useState<"sat" | "dark">("sat");
  const [terrain, setTerrain] = useState(true);
  const [focus, setFocus] = useState<string | null>(start === "semeru" ? "Semeru" : null);
  const [ready, setReady] = useState(false);
  const [spin, setSpin] = useState(start === "indonesia");
  const [overlays, setOverlays] = useState({ krb: true, ash: true, lahar: true, places: true, hex: true });
  const [hud, setHud] = useState({ lon: start === "semeru" ? SEMERU[0] : HOME.center[0], lat: start === "semeru" ? SEMERU[1] : HOME.center[1], elev: null as number | null, zoom: start === "semeru" ? 11.6 : HOME.zoom, pitch: start === "semeru" ? 68 : 0 });
  const [touring, setTouring] = useState(false);
  const [sim, setSim] = useState(false);
  const [simT, setSimT] = useState(-72);
  const [playing, setPlaying] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("large");
  const [wind, setWind] = useState(100);
  const [early, setEarly] = useState(true);
  const [speed, setSpeed] = useState(6);
  const [view, setView] = useState<"local" | "region">("local");
  const simCenter = useRef<[number, number]>(SEMERU_LL);
  const eruption = useRef<EruptionState>({ active: false, origin: SEMERU_LL, colKm: 0, pdcKm: 0, wind: 100, channel: [] });
  const simMarkers = useRef<{ rings: Marker[]; cities: Map<string, Marker> }>({ rings: [], cities: new Map() });
  const localMarkers = useRef<Marker[]>([]);
  const spinRef = useRef(spin);
  useEffect(() => {
    spinRef.current = spin;
  }, [spin]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let map: MLMap | undefined;
    let disposed = false;
    let raf = 0;
    import("maplibre-gl").then((maplibregl) => {
      if (disposed) return;
      // The bundler can't see MapLibre's worker file, so it is served from /public
      maplibregl.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
      map = new maplibregl.Map({
        container: el,
        style: style(),
        center: start === "semeru" ? SEMERU : HOME.center,
        zoom: start === "semeru" ? 11.6 : HOME.zoom,
        pitch: start === "semeru" ? 68 : 0,
        bearing: start === "semeru" ? -25 : 0,
        maxPitch: 80,
        attributionControl: { compact: true, customAttribution: "MarketShield" },
        cooperativeGestures: start === "indonesia",
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showZoom: true }), "bottom-right");
      // Set up as soon as the style is parsed; "load" waits for every tile and can take seconds at high zoom
      let setupDone = false;
      const setup = () => {
        if (disposed || !map || setupDone) return;
        setupDone = true;
        map.setTerrain({ source: "dem", exaggeration: 1.5 });
        el.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
        map.addLayer(createEruptionLayer(map, maplibregl.MercatorCoordinate, () => eruption.current));
        setReady(true);
        VOLCANOES.forEach((v) => {
          const marker = new maplibregl.Marker({ element: dot(v.name, v.name === "Semeru"), anchor: "center" }).setLngLat([v.lon, v.lat]).addTo(map!);
          marker.getElement().addEventListener("click", (e) => {
            e.stopPropagation();
            setSpin(false);
            setFocus(v.name);
            map!.flyTo({ center: [v.lon, v.lat], zoom: 11.8, pitch: 70, bearing: -25, duration: 4200, essential: true });
          });
        });
        const add = (c: number[], el: HTMLElement) => localMarkers.current.push(new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(c as [number, number]).addTo(map!));
        VILLAGES.forEach((v) => add(v.c, pin(v.name, "village")));
        POSTS.forEach((p) => add(p.c, pin(p.name, p.full ? "full" : "post")));
        const zoomVis = () => {
          const show = map!.getZoom() > 9.3;
          localMarkers.current.forEach((m) => (m.getElement().style.display = show ? "" : "none"));
        };
        zoomVis();
        map.on("zoom", zoomVis);
      };
      map.once("style.load", setup);
      map.once("load", setup);
      if (map.isStyleLoaded()) setup();
      ["mousedown", "touchstart", "wheel"].forEach((ev) => map!.on(ev as "mousedown", () => setSpin(false)));
      let hudT = 0;
      const updHud = (lngLat?: { lng: number; lat: number }) => {
        const now = performance.now();
        if (now - hudT < 60 || !map) return;
        hudT = now;
        const c = lngLat ?? map.getCenter();
        const elev = map.getZoom() > 7 ? map.queryTerrainElevation([c.lng, c.lat]) : null;
        setHud({ lon: c.lng, lat: c.lat, elev: elev == null ? null : Math.round(elev / 1.5), zoom: map.getZoom(), pitch: map.getPitch() });
      };
      map.on("mousemove", (e) => updHud(e.lngLat));
      map.on("move", () => updHud());
      // gentle rotation: globe spins, zoomed-in terrain orbits
      const DASH: number[][] = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]];
      let dashStep = -1;
      let grow = 0;
      let swayT = 0;
      let last = performance.now();
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = (now - last) / 1000;
        last = now;
        if (!map) return;
        if (map.isStyleLoaded() && map.getZoom() > 7.5) {
          const step = Math.floor(now / 90) % DASH.length;
          if (step !== dashStep) {
            dashStep = step;
            map.setPaintProperty("lahar-flow", "line-dasharray", DASH[step]);
          }
          map.setPaintProperty("ash", "fill-opacity", 0.3 + 0.12 * Math.sin(now / 700));
          if (grow < 1) {
            grow = Math.min(1, grow + dt * 0.6);
            const e = 1 - Math.pow(1 - grow, 3);
            map.setPaintProperty("hex", "fill-extrusion-height", ["*", ["get", "s"], 900 * e]);
          }
        } else if (grow > 0 && map.getZoom() < 6) grow = 0;
        if (!spinRef.current || map.isMoving()) return;
        if (map.getZoom() < 6) {
          // sway around the archipelago instead of spinning away from it
          swayT += dt;
          map.setCenter([HOME.center[0] + 16 * Math.sin(swayT * 0.12), HOME.center[1] + 3 * Math.sin(swayT * 0.07)]);
        } else map.setBearing(map.getBearing() + dt * 3);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      localMarkers.current = [];
      map?.remove();
      mapRef.current = null;
    };
  }, [start]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty("sat", "visibility", base === "sat" ? "visible" : "none");
    map.setLayoutProperty("dark", "visibility", base === "dark" ? "visible" : "none");
  }, [base, ready]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setTerrain(terrain ? { source: "dem", exaggeration: 1.5 } : null);
    map.setLayoutProperty("hill", "visibility", terrain ? "visible" : "none");
  }, [terrain, ready]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const vis = (on: boolean) => (on ? "visible" : "none");
    map.setLayoutProperty("krb-fill", "visibility", vis(overlays.krb));
    map.setLayoutProperty("krb-line", "visibility", vis(overlays.krb));
    map.setLayoutProperty("ash", "visibility", vis(overlays.ash));
    map.setLayoutProperty("lahar", "visibility", vis(overlays.lahar));
    map.setLayoutProperty("lahar-glow", "visibility", vis(overlays.lahar));
    map.setLayoutProperty("lahar-flow", "visibility", vis(overlays.lahar));
    map.setLayoutProperty("ash24", "visibility", vis(overlays.ash));
    map.setLayoutProperty("hex", "visibility", vis(overlays.hex));
    localMarkers.current.forEach((m) => m.getElement().classList.toggle("ms-hidden", !overlays.places));
  }, [overlays, ready]);

  const frame = sim ? simulate(simT, scenario, wind, early) : null;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const empty = { type: "FeatureCollection", features: [] } as GeoJSON.FeatureCollection;
    const f = sim ? simulate(simT, scenario, wind, early) : null;
    (["col", "pdc", "ash", "lahar", "vill"] as const).forEach((k) => {
      const src = map.getSource(`sim-${k}`) as { setData?: (d: GeoJSON.FeatureCollection) => void } | undefined;
      const key = k === "col" ? "column" : k === "vill" ? "villages" : k;
      src?.setData?.(f ? (f[key as keyof typeof f] as GeoJSON.FeatureCollection) : empty);
    });
    const ps = plumeState(simT, scenario);
    eruption.current = { active: sim, origin: simCenter.current, colKm: ps.colKm, pdcKm: ps.pdcKm, wind, channel: sim ? channelLngLat() : [] };
    if (map.getLayer("sim-col")) map.setLayoutProperty("sim-col", "visibility", "none");
    map.triggerRepaint();
    (map.getSource("sim-region") as { setData?: (d: GeoJSON.FeatureCollection) => void } | undefined)?.setData?.(sim ? regionalPlume(simT, scenario, wind) : empty);
    (map.getSource("sim-rings") as { setData?: (d: GeoJSON.FeatureCollection) => void } | undefined)?.setData?.(sim ? rings() : empty);
  }, [sim, simT, scenario, wind, early, ready]);

  // HTML markers for ring labels and city AQI badges
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const store = simMarkers.current;
    if (!sim) {
      store.rings.forEach((m) => m.remove());
      store.cities.forEach((m) => m.remove());
      store.rings = [];
      store.cities.clear();
      return;
    }
    import("maplibre-gl").then((maplibregl) => {
      store.rings.forEach((m) => m.remove());
      store.rings = [];
      if (!store.rings.length) {
        store.rings = [5, 10, 15, 25].map((km) => {
          const el = document.createElement("div");
          el.className = "ms-ring-label";
          el.textContent = `${km} km`;
          return new maplibregl.Marker({ element: el }).setLngLat(ringLabelPoint(km)).addTo(map);
        });
      }
      if (!store.cities.size) {
        CITIES.forEach((c) => {
          const el = document.createElement("div");
          el.className = "ms-city";
          store.cities.set(c.name, new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(c.c).addTo(map));
        });
      }
    });
  }, [sim, ready, focus]);

  const impacts = sim ? cityImpacts(simT, scenario, wind, early) : [];
  useEffect(() => {
    simMarkers.current.cities.forEach((m, name) => {
      const ci = impacts.find((x) => x.city.name === name);
      if (!ci) return;
      const b = aqiBand(ci.aqi);
      const el = m.getElement();
      el.innerHTML = `<span class="ms-city-aqi" style="background:${b.color}">${ci.aqi}</span><span class="ms-city-name">${name}${ci.airport === "closed" ? " ✈︎✕" : ""}</span><span class="ms-city-dot"></span>`;
    });
  });

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setSimT((t) => {
        const next = t + dt * speed;
        if (next >= 72) {
          setPlaying(false);
          return 72;
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  const startSim = () => {
    const v = VOLCANOES.find((x) => x.name === focus) ?? VOLCANOES.find((x) => x.name === "Semeru")!;
    setOrigin([v.lon, v.lat]);
    simCenter.current = [v.lon, v.lat];
    setSpin(false);
    setFocus(v.name);
    setOverlays((o) => ({ ...o, hex: false, ash: false }));
    setSimT(-72);
    mapRef.current?.setProjection({ type: "mercator" });
    setSim(true);
    setPlaying(true);
    mapRef.current?.flyTo({ center: [v.lon + 0.05, v.lat - 0.06], zoom: 10.9, pitch: 62, bearing: -35, duration: 3500 });
  };
  // Landing page: start the eruption simulation as soon as the map is ready
  const autoRef = useRef(false);
  const startRef = useRef(startSim);
  useEffect(() => {
    startRef.current = startSim;
  });
  useEffect(() => {
    if (!autoSim || !ready || autoRef.current) return;
    autoRef.current = true;
    const id = window.setTimeout(() => startRef.current(), 900);
    return () => window.clearTimeout(id);
  }, [autoSim, ready]);

  const goView = (v: "local" | "region") => {
    setView(v);
    const [lon, lat] = simCenter.current;
    mapRef.current?.flyTo(v === "region" ? { center: [lon + 0.7, lat - 1.1], zoom: 5.6, pitch: 30, bearing: 0, duration: 3000 } : { center: [lon + 0.05, lat - 0.06], zoom: 10.9, pitch: 62, bearing: -35, duration: 3000 });
  };
  const stopSim = () => {
    mapRef.current?.setProjection({ type: "globe" });
    setView("local");
    setPlaying(false);
    setSim(false);
    setOverlays((o) => ({ ...o, hex: true, ash: true }));
  };

  const home = () => {
    setFocus(null);
    mapRef.current?.flyTo({ ...HOME, duration: 3200 });
  };
  const toSemeru = () => {
    setSpin(false);
    setFocus("Semeru");
    mapRef.current?.flyTo({ center: SEMERU, zoom: 11.8, pitch: 70, bearing: -25, duration: 4200 });
  };
  const tour = async () => {
    const map = mapRef.current;
    if (!map || touring) return;
    setSpin(false);
    setTouring(true);
    const stops: { name: string; c: [number, number]; z: number; b: number }[] = [
      { name: "Merapi", c: [110.446, -7.54], z: 11.6, b: 30 },
      { name: "Bromo", c: [112.95, -7.942], z: 12, b: -40 },
      { name: "Semeru", c: SEMERU, z: 11.8, b: -25 },
    ];
    for (const st of stops) {
      setFocus(st.name);
      map.flyTo({ center: st.c, zoom: st.z, pitch: 72, bearing: st.b, duration: 5200, curve: 1.6, essential: true });
      await new Promise<void>((r) => map.once("moveend", () => r()));
      if (st.name !== "Semeru") {
        map.easeTo({ bearing: st.b + 50, duration: 3000, easing: (x) => x });
        await new Promise<void>((r) => map.once("moveend", () => r()));
      }
    }
    setTouring(false);
    setSpin(true);
  };

  // Phones: icon-only 40px targets with the label kept for screen readers; desktop unchanged
  const chip = (on: boolean) => cn("rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition max-sm:flex max-sm:h-10 max-sm:min-w-10 max-sm:items-center max-sm:justify-center max-sm:whitespace-nowrap max-sm:px-2", on ? "bg-bone text-night" : "text-bone/70 hover:text-bone");
  const ico = "inline h-3.5 w-3.5 sm:mr-1 max-sm:h-4 max-sm:w-4";

  return (
    <div className={cn("ms-map relative overflow-hidden", sim && "ms-sim", className)}>
      {/* Phones: map controls move under the top bar so they never meet the bottom sheet */}
      <style>{`@media (max-width:639.98px){.ms-map .maplibregl-ctrl-bottom-right{top:calc(max(12px,env(safe-area-inset-top)) + 56px);bottom:auto}.ms-map .maplibregl-ctrl-bottom-right .maplibregl-ctrl{margin:0 12px 8px 0}.ms-map .maplibregl-ctrl-group button{width:40px;height:40px}}`}</style>
      <div ref={host} className="!absolute inset-0 h-full w-full" />
      <div className={cn("pointer-events-none absolute inset-0 grid place-items-center bg-night transition-opacity duration-700", ready ? "opacity-0" : "opacity-100")} aria-hidden><Globe2 className="h-8 w-8 animate-pulse text-bone/30" /></div>

      <div className="pointer-events-none absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] flex items-start justify-between gap-2 max-sm:flex-nowrap sm:flex-wrap">
        <div className="pointer-events-auto flex gap-1 rounded-xl bg-night/75 p-1 ring-1 ring-white/10 backdrop-blur-md">
          <button onClick={() => setBase("sat")} className={chip(base === "sat")}><Satellite className={ico} /><span className="max-sm:sr-only">{t("Satelit", "Satellite")}</span></button>
          <button onClick={() => setBase("dark")} className={chip(base === "dark")}><MapIcon className={ico} /><span className="max-sm:sr-only">{t("Peta", "Map")}</span></button>
          <button onClick={() => setTerrain(!terrain)} className={chip(terrain)}><Mountain className={ico} /><span className="max-sm:sr-only">3D</span></button>
        </div>
        <div className="pointer-events-auto flex gap-1 rounded-xl bg-night/75 p-1 ring-1 ring-white/10 backdrop-blur-md">
          <button data-tour="sim" onClick={sim ? stopSim : startSim} className={cn(chip(sim), !sim && "text-[#ffb27a]")}><Flame className={cn(ico, !sim && "max-sm:mr-1")} /><span className={cn(sim && "max-sm:sr-only")}><span className="sm:hidden">{t("Simulasi", "Simulate")}</span><span className="max-sm:hidden">{t("Simulasi erupsi", "Eruption sim")}</span></span></button>
          <button onClick={tour} disabled={touring || sim} className={cn(chip(touring), "disabled:opacity-40", sim && "max-sm:hidden")}><Clapperboard className={ico} /><span className="max-sm:sr-only">{touring ? t("Tur berjalan…", "Touring…") : t("Tur sinematik", "Cinematic tour")}</span></button>
          <button onClick={focus ? home : toSemeru} className={chip(false)}>{focus ? <><Globe2 className={ico} /><span className="max-sm:sr-only">Indonesia</span></> : <><Mountain className={ico} /><span className="max-sm:sr-only">{t("Terbang ke Semeru", "Fly to Semeru")}</span></>}</button>
          <button onClick={() => setSpin(!spin)} className={cn(chip(spin), "max-sm:hidden")} aria-label={t("Putar otomatis", "Auto-rotate")}><RotateCw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* HUD: corner brackets, live readout */}
      <div className="pointer-events-none absolute inset-3 hidden sm:block" aria-hidden>
        {["left-0 top-12 border-l-2 border-t-2", "right-0 top-12 border-r-2 border-t-2"].map((c) => (
          <span key={c} className={cn("absolute h-5 w-5 border-ember/70", c)} />
        ))}
      </div>
      <div className={cn("pointer-events-none absolute bottom-3 left-3 hidden rounded-lg bg-night/70 px-3 py-1.5 font-mono text-[10.5px] tabular text-bone/80 ring-1 ring-white/10 backdrop-blur md:block", (sim || focus) && "md:hidden")}>
        <span className="mr-2 inline-flex items-center gap-1 text-ember"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />LIVE</span>
        {Math.abs(hud.lat).toFixed(3)}°{hud.lat < 0 ? "S" : "N"} {hud.lon.toFixed(3)}°E
        {hud.elev != null && <span className="ml-2 text-bone">▲ {hud.elev.toLocaleString("id-ID")} m</span>}
        <span className="ml-2 text-bone/50">z{hud.zoom.toFixed(1)} · {Math.round(hud.pitch)}°</span>
      </div>
      <AnimatePresence>
        {!sim && focus === "Semeru" && overlays.hex && hud.zoom > 8 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="absolute right-3 top-16 hidden w-[170px] rounded-xl bg-night/75 p-3 text-bone ring-1 ring-white/10 backdrop-blur-md sm:block">
            <p className="text-[11px] font-medium">{t("Indeks paparan / heksagon", "Exposure index / hexagon")}</p>
            <div className="mt-2 h-2 rounded-full" style={{ background: "linear-gradient(90deg,#f5c84a,#ea6a1f,#d1301f,#7b1e26)" }} />
            <div className="mt-1 flex justify-between font-mono text-[9.5px] text-bone/50"><span>{t("rendah", "low")}</span><span>{t("tinggi", "high")}</span></div>
            <p className="mt-2 text-[10px] leading-snug text-bone/50">{t("Tinggi kolom = jarak kawah × arah abu × alur lahar", "Column height = crater distance × ash direction × lahar channel")}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{sim && frame && <SimPanel t={simT} setT={(v) => { setPlaying(false); setSimT(v); }} playing={playing} setPlaying={setPlaying} scenario={scenario} setScenario={setScenario} wind={wind} setWind={setWind} early={early} setEarly={setEarly} speed={speed} setSpeed={setSpeed} frame={frame} close={stopSim} view={view} goView={goView} impacts={impacts} />}</AnimatePresence>
      <AnimatePresence>
        {focus && !sim && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-10 left-3 w-[250px] rounded-2xl bg-night/80 p-4 text-bone ring-1 ring-white/10 backdrop-blur-md">
            <p className="label !text-[9.5px] text-ember">{t("Gunung api", "Volcano")}</p>
            <p className="mt-1 font-display text-[20px] font-semibold">{focus}</p>
            {focus === "Semeru" ? (
              <>
                <p className="text-[12px] text-bone/60">3.676 mdpl · Lumajang</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-[#ea6a1f] px-2 py-0.5 text-[10.5px] font-semibold text-white">Level III · Siaga</span>
                  <span className="font-mono text-[11px] text-bone/70">71% · 7 {t("hari", "days")}</span>
                </div>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="mb-1.5 flex items-center gap-1 text-[11px] text-bone/50"><Layers className="h-3 w-3" /> {t("Lapisan", "Layers")}</p>
                  <div className="flex flex-wrap gap-1">
                    {([
                      ["krb", "KRB"],
                      ["ash", t("Abu", "Ash")],
                      ["lahar", "Lahar"],
                      ["hex", t("Heksagon 3D", "3D hexagons")],
                      ["places", t("Desa & posko", "Villages & posts")],
                    ] as const).map(([k, l]) => (
                      <button key={k} onClick={() => setOverlays((o) => ({ ...o, [k]: !o[k] }))} className={cn("rounded-md px-2 py-1 text-[11px] ring-1 transition", overlays[k] ? "bg-white/15 text-bone ring-white/20" : "text-bone/45 ring-white/10")}>{l}</button>
                    ))}
                  </div>
                </div>
                <button onClick={startSim} className="btn-shine shine-crimson mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-crimson py-2 text-[12px] font-semibold text-white"><Play className="h-3.5 w-3.5" /> {t("Simulasikan erupsi", "Simulate an eruption")}</button>
              </>
            ) : (
              <>
                <p className="text-[12px] text-bone/60">{t("Dipantau lewat satelit. Zona & heksagon di sini adalah model umum; data desa & posko dibuka per kabupaten.", "Monitored by satellite. Zones & hexagons here are a generic model; village & post data opens per district.")}</p>
                <button onClick={startSim} className="btn-shine shine-crimson mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-crimson py-2 text-[12px] font-semibold text-white"><Play className="h-3.5 w-3.5" /> {t("Simulasikan erupsi", "Simulate an eruption")}</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Eruption simulation overlay ---------- */

const fmtT = (t: number, id: boolean) => {
  const h = Math.round(t);
  if (Math.abs(t) < 0.5) return id ? "ERUPSI" : "ERUPTION";
  const unit = id ? "j" : "h";
  return `T${h < 0 ? "−" : "+"}${Math.abs(h) >= 24 && Math.abs(h) % 24 === 0 ? `${Math.abs(h) / 24}${id ? " hari" : " d"}` : `${Math.abs(h)} ${unit}`}`;
};

function SimPanel(p: {
  t: number; setT: (v: number) => void; playing: boolean; setPlaying: (v: boolean) => void;
  scenario: Scenario; setScenario: (s: Scenario) => void; wind: number; setWind: (v: number) => void;
  early: boolean; setEarly: (v: boolean) => void; speed: number; setSpeed: (v: number) => void;
  frame: ReturnType<typeof simulate>; close: () => void;
  view: "local" | "region"; goView: (v: "local" | "region") => void; impacts: CityImpact[];
}) {
  const { t, tx, lang } = useT();
  const id = lang === "id";
  const st = p.frame.stats;
  const lvColor = ["#2E7D32", "#E0A100", "#EA6A1F", "#B51A14"][p.frame.level - 1];
  const events = EVENTS.filter((e) => e.t <= p.t && (!e.early || p.early)).slice(-4).reverse();
  const pct = (v: number) => ((v + 72) / 144) * 100;
  const n = (v: number) => v.toLocaleString("id-ID");
  return (
    <>
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="absolute left-3 top-16 w-[250px] rounded-2xl bg-night/85 p-4 text-bone ring-1 ring-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <p className="label !text-[9.5px] text-ember">{t("Simulasi · ilustrasi", "Simulation · illustrative")}</p>
          <button onClick={p.close} className="rounded p-0.5 text-bone/50 hover:text-bone" aria-label={t("Tutup simulasi", "Close simulation")}><X className="h-3.5 w-3.5" /></button>
        </div>
        <p className="mt-1 font-display text-[26px] font-semibold tabular">{fmtT(p.t, id)}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white" style={{ background: lvColor }}>Level {["I", "II", "III", "IV"][p.frame.level - 1]}</span>
          <div className="flex rounded-md bg-white/5 p-0.5 text-[10.5px]">
            {(["local", "region"] as const).map((v) => (
              <button key={v} onClick={() => p.goView(v)} className={cn("rounded px-2 py-0.5", p.view === v ? "bg-bone text-night" : "text-bone/60")}>{v === "local" ? t("Lokal", "Local") : t("Regional", "Regional")}</button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex rounded-lg bg-white/5 p-0.5 text-[11px]">
          {[true, false].map((v) => (
            <button key={String(v)} onClick={() => p.setEarly(v)} className={cn("flex-1 rounded-md px-2 py-1.5 font-medium transition", p.early === v ? (v ? "bg-leaf text-white" : "bg-crimson text-white") : "text-bone/60")}>{v ? t("Dengan MarketShield", "With MarketShield") : t("Tanpa peringatan", "No early warning")}</button>
          ))}
        </div>
        {!hasVillages() && <p className="mt-2 rounded-lg bg-white/5 px-2 py-1.5 text-[10.5px] leading-snug text-bone/55">{t("Data desa belum tersedia untuk gunung ini; dampak kota & abu tetap dihitung.", "No village data for this volcano yet; city & ash impacts are still modelled.")}</p>}
        <dl className="mt-3 space-y-2 text-[12px]">
          <div className="flex justify-between"><dt className="text-bone/55">{t("Waktu bersiap", "Time to prepare")}</dt><dd className="font-mono tabular">{p.early ? t("± 3 hari", "≈ 3 days") : t("< 1 jam", "< 1 h")}</dd></div>
          <div className="flex justify-between"><dt className="text-bone/55">{t("Dievakuasi", "Evacuated")}</dt><dd className="font-mono tabular text-[#8fc0f0]">{n(st.evacuated)} / {n(st.exposed)}</dd></div>
          <div className="flex justify-between"><dt className="text-bone/55">{t("Terjebak aliran", "Caught by flows")}</dt><dd className={cn("font-mono tabular", st.hit ? "text-[#ff7a6e]" : "text-bone")}>{n(st.hit)}</dd></div>
          <div className="flex justify-between"><dt className="text-bone/55">{t("Terpapar abu", "Under ashfall")}</dt><dd className="font-mono tabular">{n(st.ashed)}</dd></div>
          <div className="flex justify-between"><dt className="text-bone/55">{t("Harga N95", "N95 price")}</dt><dd className={cn("font-mono tabular", st.n95 > 20000 ? "text-[#ff7a6e]" : "text-[#79d07d]")}>Rp{n(st.n95)}</dd></div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/10 pt-2 text-[10.5px] text-bone/60">
          {[["#2e7d32", t("Aman", "Safe")], ["#9a8d88", t("Abu", "Ash")], ["#3d7fc4", t("Dievakuasi", "Evacuated")], ["#d1301f", t("Terdampak", "Hit")]].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full ring-1 ring-white" style={{ background: c }} />{l}</span>
          ))}
        </div>
      </motion.div>

      {p.view === "region" ? (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="absolute right-3 top-16 hidden max-h-[calc(100%-15.5rem)] w-[330px] overflow-y-auto rounded-2xl bg-night/85 p-3 text-bone ring-1 ring-white/10 backdrop-blur-md md:block">
          <p className="label mb-2 !text-[9.5px] text-bone/50">{t("Dampak per kota", "Impact by city")}</p>
          <table className="w-full text-[11px]">
            <thead><tr className="text-left text-bone/45"><th className="pb-1 font-normal">{t("Kota", "City")}</th><th className="pb-1 font-normal">{t("Abu tiba", "Ash ETA")}</th><th className="pb-1 font-normal">AQI</th><th className="pb-1 font-normal">N95</th></tr></thead>
            <tbody>
              {[...p.impacts].sort((a, b) => b.aqi - a.aqi).map((c) => {
                const band = aqiBand(c.aqi);
                return (
                  <tr key={c.city.name} className="border-t border-white/5">
                    <td className="py-1.5 pr-1"><span className="block font-medium">{c.city.name}</span><span className="text-[10px] text-bone/45">{c.km} km · {c.city.region}{c.airport ? ` · ✈ ${c.city.airport} ${c.airport === "closed" ? t("tutup", "closed") : c.airport === "watch" ? t("waspada", "watch") : "ok"}` : ""}</span></td>
                    <td className="py-1.5 font-mono text-bone/70">{c.arrival == null ? "—" : `T+${c.arrival}${t("j", "h")}`}</td>
                    <td className="py-1.5"><span className="rounded px-1.5 py-0.5 font-mono font-semibold text-white" style={{ background: band.color }} title={tx(band.label)}>{c.aqi}</span></td>
                    <td className={cn("py-1.5 font-mono", c.n95 > 20000 ? "text-[#ff7a6e]" : "text-[#79d07d]")}>{Math.round(c.n95 / 1000)}rb</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] leading-snug text-bone/45">{t("AQI dari estimasi PM2.5 (skala US EPA). Ilustrasi model dispersi, bukan data pengukuran.", "AQI from estimated PM2.5 (US EPA scale). Illustrative dispersion model, not measured data.")}</p>
        </motion.div>
      ) : (
      <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="absolute right-3 top-16 hidden w-[260px] rounded-2xl bg-night/85 p-3 text-bone ring-1 ring-white/10 backdrop-blur-md md:block">
        <p className="label mb-2 !text-[9.5px] text-bone/50">{t("Log kejadian", "Event log")}</p>
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {events.map((e) => (
              <motion.li layout key={e.t + e.text.id} initial={{ opacity: 0, y: -8, backgroundColor: "rgba(234,106,31,0.35)" }} animate={{ opacity: 1, y: 0, backgroundColor: "rgba(255,255,255,0.03)" }} transition={{ duration: 0.6 }} className="rounded-lg px-2 py-1.5">
                <p className="font-mono text-[10px] text-ember">{fmtT(e.t, id)}{e.early ? " · MarketShield" : ""}</p>
                <p className="text-[11.5px] leading-snug">{tx(e.text)}</p>
              </motion.li>
            ))}
          </AnimatePresence>
          {!events.length && <li className="text-[11.5px] text-bone/45">{t("Tekan putar untuk memulai.", "Press play to begin.")}</li>}
        </ul>
      </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="absolute inset-x-3 bottom-10 rounded-2xl bg-night/85 p-3 text-bone ring-1 ring-white/10 backdrop-blur-md sm:left-[268px] md:right-[276px]">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => (p.t >= 72 ? (p.setT(-72), p.setPlaying(true)) : p.setPlaying(!p.playing))} className="btn-shine shine-crimson flex h-9 w-9 items-center justify-center rounded-full bg-crimson text-white" aria-label={p.playing ? "Pause" : "Play"}>
            {p.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={() => p.setT(-72)} className="flex h-9 w-9 items-center justify-center rounded-full text-bone/60 ring-1 ring-white/10 hover:text-bone" aria-label={t("Ulang", "Restart")}><RotateCcw className="h-4 w-4" /></button>
          <div className="flex rounded-lg bg-white/5 p-0.5">
            {(Object.keys(PARAMS) as Scenario[]).map((k) => (
              <button key={k} onClick={() => p.setScenario(k)} className={cn("rounded-md px-2 py-1 text-[11px] transition", p.scenario === k ? "bg-bone text-night" : "text-bone/60 hover:text-bone")}>{tx(PARAMS[k].label)}</button>
            ))}
          </div>
          <div className="ml-auto flex rounded-lg bg-white/5 p-0.5 text-[10.5px]">
            {[[100, t("Musim hujan → timur", "Wet season → east")], [265, t("Kemarau → barat", "Dry season → west")]].map(([deg, l]) => (
              <button key={deg} onClick={() => p.setWind(deg as number)} className={cn("rounded-md px-2 py-1", p.wind === deg ? "bg-white/15 text-bone" : "text-bone/50 hover:text-bone")}>{l}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[11px] text-bone/60">
            <Wind className="h-3.5 w-3.5" style={{ transform: `rotate(${p.wind - 90}deg)` }} />
            <input type="range" min={0} max={359} value={p.wind} onChange={(e) => p.setWind(Number(e.target.value))} className="w-20 accent-[#ea6a1f]" aria-label={t("Arah angin", "Wind direction")} />
            <span className="w-8 font-mono tabular">{p.wind}°</span>
          </label>
          <div className="flex rounded-lg bg-white/5 p-0.5 text-[11px]">
            {[3, 6, 12].map((v) => (
              <button key={v} onClick={() => p.setSpeed(v)} className={cn("rounded-md px-2 py-1 font-mono", p.speed === v ? "bg-white/15 text-bone" : "text-bone/50")}>{v / 3}×</button>
            ))}
          </div>
        </div>
        <div className="relative mt-3 h-8">
          <div className="absolute inset-x-0 top-3.5 h-1 rounded-full bg-white/10" />
          <div className="absolute left-0 top-3.5 h-1 rounded-full bg-gradient-to-r from-[#e0a100] via-[#ea6a1f] to-[#d1301f]" style={{ width: `${pct(p.t)}%` }} />
          <div className="absolute top-1 h-6 w-px bg-white/60" style={{ left: "50%" }} />
          {EVENTS.filter((e) => !e.early || p.early).map((e) => (
            <span key={e.t + e.text.id} className={cn("absolute top-2.5 h-3 w-1 -translate-x-1/2 rounded-full", e.t <= p.t ? "bg-ember" : "bg-white/25")} style={{ left: `${pct(e.t)}%` }} title={tx(e.text)} />
          ))}
          <input type="range" min={-72} max={72} step={0.25} value={p.t} onChange={(e) => p.setT(Number(e.target.value))} className="absolute inset-0 w-full cursor-pointer opacity-0" aria-label={t("Waktu simulasi", "Simulation time")} />
          <span className="pointer-events-none absolute top-0 h-8 w-0.5 -translate-x-1/2 rounded bg-bone shadow-[0_0_10px_#fff]" style={{ left: `${pct(p.t)}%` }} />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-bone/45"><span>T−3 {t("hari", "d")}</span><span>{t("Erupsi", "Eruption")}</span><span>T+3 {t("hari", "d")}</span></div>
      </motion.div>
    </>
  );
}
