"use client";

import { useState } from "react";
import type { Level } from "@/lib/data";
import { useT } from "@/lib/store";
import { cn } from "@/lib/utils";

export type LayerKey = "krb" | "ash" | "lahar" | "rain" | "hot" | "pop" | "route" | "posko";

export const LAYERS: { key: LayerKey; id: string; en: string; src: string; fresh: { id: string; en: string } }[] = [
  { key: "krb", id: "Zona KRB I/II/III", en: "KRB zones I/II/III", src: "PVMBG × GLO30", fresh: { id: "statis", en: "static" } },
  { key: "ash", id: "Sebaran abu", en: "Ash drift", src: "NOAA/GFS0P25", fresh: { id: "3 jam lalu", en: "3 h ago" } },
  { key: "lahar", id: "Aliran lahar (radar)", en: "Lahar flow (radar)", src: "COPERNICUS/S1_GRD", fresh: { id: "2 hari lalu", en: "2 days ago" } },
  { key: "rain", id: "Risiko lahar hujan", en: "Rain-lahar risk", src: "GPM IMERG V07", fresh: { id: "3 jam lalu", en: "3 h ago" } },
  { key: "hot", id: "Titik panas", en: "Hotspots", src: "FIRMS", fresh: { id: "6 jam lalu", en: "6 h ago" } },
  { key: "pop", id: "Kepadatan penduduk", en: "Population", src: "WorldPop 100 m", fresh: { id: "2025", en: "2025" } },
  { key: "route", id: "Rute evakuasi", en: "Evacuation route", src: "MarketShield", fresh: { id: "langsung", en: "live" } },
  { key: "posko", id: "Posko & shelter", en: "Aid posts & shelters", src: "BPBD", fresh: { id: "12 mnt lalu", en: "12 min ago" } },
];

const C = { x: 300, y: 200 };

export const MAP_VILLAGES = [
  { name: "Supiturang", x: 250, y: 360 },
  { name: "Oro-oro Ombo", x: 200, y: 330 },
  { name: "Tamanayu", x: 150, y: 380 },
  { name: "Sidomulyo", x: 210, y: 430 },
  { name: "Sumberwuluh", x: 430, y: 330 },
  { name: "Penanggal", x: 500, y: 250 },
  { name: "Sumbermujur", x: 560, y: 300 },
  { name: "Jugosari", x: 520, y: 400 },
];

const POSTS = [
  { name: "Balai Desa Sumbermujur", x: 600, y: 320, status: "open" },
  { name: "Lapangan Candipuro", x: 640, y: 380, status: "open" },
  { name: "SDN Penanggal 02", x: 540, y: 220, status: "full" },
  { name: "Puskesmas Pasirian", x: 690, y: 470, status: "open" },
];

function ring(r: number, squash = 0.78, wobble = 0.08) {
  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const k = 1 + wobble * Math.sin(a * 3 + 1) + wobble * 0.6 * Math.cos(a * 5);
    // stretch southeast, along the main lahar channel
    const se = 1 + 0.35 * Math.max(0, Math.cos(a - 0.7));
    pts.push(`${(C.x + Math.cos(a) * r * k * se).toFixed(1)},${(C.y + Math.sin(a) * r * k * se * squash).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function HazardMap({ level, layers, selected, onSelect, className, horizon = 0 }: { level: Level; layers: Set<LayerKey>; selected?: string; onSelect?: (v: string) => void; className?: string; horizon?: number }) {
  const { t } = useT();
  const [hover, setHover] = useState<string | null>(null);
  const ashLen = [0, 120, 200, 280, 360][level] * (1 + horizon / 72);
  const hotN = [0, 2, 4, 7, 10][level];
  const on = (k: LayerKey) => layers.has(k);

  return (
    <svg viewBox="0 0 800 540" className={cn("h-full w-full", className)} role="img" aria-label={t("Peta bahaya Semeru", "Semeru hazard map")}>
      <defs>
        <radialGradient id="relief" cx="37%" cy="37%" r="60%">
          <stop offset="0" stopColor="#d9c7b8" />
          <stop offset="0.35" stopColor="#e9ddd0" />
          <stop offset="1" stopColor="#f4eee6" />
        </radialGradient>
        <linearGradient id="ash" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b5d58" stopOpacity="0.55" />
          <stop offset="1" stopColor="#6b5d58" stopOpacity="0" />
        </linearGradient>
        <pattern id="pop" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.6" fill="#7b1e26" opacity="0.35" />
        </pattern>
        <filter id="soft">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="800" height="540" fill="url(#relief)" />
      {/* contour lines */}
      {[40, 70, 100, 135, 175, 220, 270, 330].map((r, i) => (
        <polygon key={r} points={ring(r, 0.8, 0.05 + i * 0.006)} fill="none" stroke="#7b1e26" strokeOpacity={0.07 + (i % 3 === 0 ? 0.05 : 0)} strokeWidth={i % 3 === 0 ? 1.2 : 0.7} />
      ))}
      {/* rivers */}
      <path d="M300 200 C 340 250, 380 300, 430 340 S 520 430, 600 500" fill="none" stroke="#8fb3d6" strokeWidth="3" strokeOpacity="0.6" />
      <path d="M300 200 C 280 260, 260 320, 240 380 S 220 470, 190 530" fill="none" stroke="#8fb3d6" strokeWidth="2.4" strokeOpacity="0.5" />
      {/* roads */}
      <path d="M40 460 C 200 440, 330 470, 470 440 S 700 420, 790 380" fill="none" stroke="#fff" strokeWidth="5" />
      <path d="M40 460 C 200 440, 330 470, 470 440 S 700 420, 790 380" fill="none" stroke="#c9b6a8" strokeWidth="1" strokeDasharray="6 6" />
      <path d="M470 440 C 520 360, 600 300, 790 230" fill="none" stroke="#fff" strokeWidth="4" />

      {on("pop") && (
        <g>
          <ellipse cx="560" cy="330" rx="120" ry="70" fill="url(#pop)" />
          <ellipse cx="200" cy="390" rx="90" ry="60" fill="url(#pop)" />
          <ellipse cx="660" cy="450" rx="80" ry="40" fill="url(#pop)" />
        </g>
      )}

      {on("krb") && (
        <g>
          <polygon points={ring(230)} fill="#e0a100" fillOpacity="0.1" stroke="#e0a100" strokeWidth="1.5" strokeDasharray="6 4" />
          <polygon points={ring(150)} fill="#ea6a1f" fillOpacity="0.13" stroke="#ea6a1f" strokeWidth="1.5" strokeDasharray="6 4" />
          <polygon points={ring(75)} fill="#b51a14" fillOpacity="0.18" stroke="#b51a14" strokeWidth="1.8" />
          <text x={C.x + 60} y={C.y - 52} className="fill-crimson font-mono text-[10px]">KRB III</text>
          <text x={C.x + 128} y={C.y - 100} className="fill-ember font-mono text-[10px]">KRB II</text>
          <text x={C.x + 205} y={C.y - 150} className="fill-amber font-mono text-[10px]">KRB I</text>
        </g>
      )}

      {on("ash") && ashLen > 0 && (
        <g transform={`translate(${C.x} ${C.y}) rotate(150)`} style={{ transition: "all .4s" }}>
          <path d={`M0 0 L ${ashLen} ${-ashLen * 0.28} Q ${ashLen * 1.08} 0 ${ashLen} ${ashLen * 0.28} Z`} fill="url(#ash)" filter="url(#soft)" />
          <path d={`M0 0 L ${ashLen} ${-ashLen * 0.28} M0 0 L ${ashLen} ${ashLen * 0.28}`} stroke="#6b5d58" strokeOpacity="0.35" strokeDasharray="3 5" />
        </g>
      )}

      {on("rain") && level >= 2 && (
        <g>
          <path d="M300 200 C 340 250, 380 300, 430 340 S 520 430, 600 500" fill="none" stroke="#2f5d8a" strokeWidth="16" strokeOpacity="0.14" strokeLinecap="round" />
          <path d="M300 200 C 280 260, 260 320, 240 380" fill="none" stroke="#2f5d8a" strokeWidth="12" strokeOpacity="0.12" strokeLinecap="round" />
        </g>
      )}

      {on("lahar") && level >= 2 && (
        <g>
          <path d={level >= 3 ? "M300 200 C 340 250, 380 300, 430 340 S 490 395, 520 420" : "M300 200 C 330 240, 360 280, 390 305"} fill="none" stroke="#7a3b16" strokeWidth="7" strokeOpacity="0.75" strokeLinecap="round" />
          {level >= 3 && <path d="M300 200 C 285 250, 272 290, 262 330" fill="none" stroke="#7a3b16" strokeWidth="5" strokeOpacity="0.6" strokeLinecap="round" />}
          <text x="268" y="300" className="fill-[#7a3b16] font-mono text-[10px]">Besuk Kobokan</text>
        </g>
      )}

      {on("route") && (
        <g>
          <path d="M470 320 C 500 300, 530 296, 560 300 S 590 316, 600 320" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M470 320 C 500 300, 530 296, 560 300 S 590 316, 600 320" fill="none" stroke="#2e7d32" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 7" />
          <circle cx="470" cy="320" r="6" fill="#2f5d8a" stroke="#fff" strokeWidth="2" />
          <text x="452" y="342" className="fill-sat font-mono text-[10px]">{t("Anda", "You")}</text>
          <text x="505" y="288" className="fill-leaf font-mono text-[10px]">{t("Koridor AB · aman", "Corridor AB · clear")}</text>
        </g>
      )}

      {on("hot") &&
        Array.from({ length: hotN }).map((_, i) => {
          const a = i * 2.4;
          const r = 10 + (i % 4) * 7;
          return <circle key={i} cx={C.x + Math.cos(a) * r} cy={C.y + Math.sin(a) * r * 0.8} r="3.2" fill="#ff5a1f" stroke="#fff" strokeWidth="0.8" />;
        })}

      {/* villages */}
      {MAP_VILLAGES.map((v) => {
        const active = selected === v.name || hover === v.name;
        return (
          <g key={v.name} className="cursor-pointer" onClick={() => onSelect?.(v.name)} onMouseEnter={() => setHover(v.name)} onMouseLeave={() => setHover(null)}>
            <circle cx={v.x} cy={v.y} r={active ? 7 : 5} fill={active ? "#7b1e26" : "#fff"} stroke="#7b1e26" strokeWidth="2" />
            <text x={v.x + 10} y={v.y + 4} className={cn("font-sans text-[11px]", active ? "fill-wine font-semibold" : "fill-[#5a4a47]")}>{v.name}</text>
          </g>
        );
      })}

      {on("posko") &&
        POSTS.map((p) => (
          <g key={p.name}>
            <rect x={p.x - 7} y={p.y - 7} width="14" height="14" rx="3" fill={p.status === "full" ? "#ea6a1f" : "#2e7d32"} stroke="#fff" strokeWidth="1.5" />
            <path d={`M${p.x - 3} ${p.y} h6 M${p.x} ${p.y - 3} v6`} stroke="#fff" strokeWidth="1.6" />
          </g>
        ))}

      {/* volcano */}
      <g>
        <circle cx={C.x} cy={C.y} r="22" fill="#b51a14" opacity="0.15" className="pulse-ring" style={{ transformOrigin: `${C.x}px ${C.y}px` }} />
        <path d={`M${C.x - 14} ${C.y + 9} L${C.x - 3} ${C.y - 9} h6 L${C.x + 14} ${C.y + 9} Z`} fill="#350915" />
        <path d={`M${C.x - 3} ${C.y - 9} h6 l-1.5 4 h-3 Z`} fill="#ea6a1f" />
        <text x={C.x - 26} y={C.y + 28} className="fill-wine font-display text-[13px] font-semibold">Semeru</text>
      </g>

      {/* compass + scale */}
      <g transform="translate(748 48)">
        <circle r="18" fill="#fff" fillOpacity="0.8" stroke="#ddc0bf" />
        <path d="M0 -12 L4 2 L0 -1 L-4 2 Z" fill="#7b1e26" />
        <text y="-22" textAnchor="middle" className="fill-wine font-mono text-[9px]">N</text>
      </g>
      <g transform="translate(40 510)">
        <rect width="80" height="4" fill="#350915" />
        <rect width="40" height="4" fill="#fff" stroke="#350915" strokeWidth="0.5" />
        <text y="-6" className="fill-wine font-mono text-[9px]">5 km</text>
      </g>
    </svg>
  );
}
